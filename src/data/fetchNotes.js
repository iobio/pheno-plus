import ClinicalNote from '@/models/ClinicalNote';
import { configUrl } from '@/config/configLoader.js';
import {
    DEFAULT_MOCK_NOTE_COLLECTIONS,
    flattenMockNotesRecords,
    parseMockNotesFile,
} from '@/data/mockNotes.js';
import {
    buildDocumentSearchUrl,
    LOINC_CODE_PROGRESS_NOTE,
    LOINC_CODES_CORE,
} from '@/data/fhir/documentReferenceSearch.js';
import { filterProgressNoteEntry } from '@/data/fhir/progressNoteFilter.js';

async function fetchAllDocumentEntries(client, patientId) {
    const [coreNotes, progressNotes] = await Promise.all([
        fetchEntries(client, buildDocumentSearchUrl(patientId, LOINC_CODES_CORE, { category: 'clinical-note' })),
        fetchEntries(
            client,
            buildDocumentSearchUrl(patientId, [LOINC_CODE_PROGRESS_NOTE]),
            filterProgressNoteEntry,
        ),
    ]);

    return [...coreNotes, ...progressNotes];
}

/** Pass as notesOverride to fetchNotes() to load mock notes from fixtures/mock-notes.json (dev only). */
export const USE_DUMMY_NOTES = { useMockNotes: true };

function isMockNotesOverride(notesOverride) {
    return notesOverride === USE_DUMMY_NOTES || notesOverride?.useMockNotes === true;
}

function mockNoteCollectionsFromOverride(notesOverride) {
    if (Array.isArray(notesOverride?.collections) && notesOverride.collections.length > 0) {
        return notesOverride.collections;
    }
    return DEFAULT_MOCK_NOTE_COLLECTIONS;
}

/**
 * Fetch clinical notes for the active patient.
 * @param {object|null} client - FHIR client (required for live fetch)
 * @param {string|null} patientId - FHIR patient id (required for live fetch)
 * @param {Array|boolean|null|undefined} notesOverride -
 *   Pass USE_DUMMY_NOTES (true) for mock notes from mock-notes.json, a ClinicalNote[] to return custom fixtures,
 *   or omit/null for live FHIR fetch.
 */
export default async function fetchNotes(client, patientId, notesOverride) {
    if (isMockNotesOverride(notesOverride)) {
        const mockNotes = await loadMockNotes(mockNoteCollectionsFromOverride(notesOverride));
        return { notesList: mockNotes, totalNotes: mockNotes.length };
    }

    if (Array.isArray(notesOverride)) {
        return { notesList: notesOverride, totalNotes: notesOverride.length };
    }

    /**
     * This function will
     * 1. Fetch all the notes from the database
     * 2. Fetch the text content of each note and create a ClinicalNote object for each note
     * 3. Return an array of ClinicalNote objects
     * 4. The function will return an array of ClinicalNote objects and the number of notes generated
     */

    let notes = null;
    try {
        notes = await fetchAllDocumentEntries(client, patientId);
    } catch (error) {
        //no notes found
        console.error('Error fetching notes');
    }

    const fetchedNotes = [];
    let totalNotes = 0;
    //Check to make sure the noteSearchData is not null and that there are entries
    if (notes) {
        let skippedNotesNurse = 0;

        totalNotes = notes.length;
        outer: for (let note of notes) {
            let customExts = (note.resource && note.resource.context && note.resource.context.extension) || null;
            if (customExts == null) {
                //it is okay to just proccess this note
            } else {
                // Check if the note is authored by a nurse or if we can see that info at all
                for (let ext of customExts) {
                    let url = ext.url;
                    let urlEnd = url.split('/').pop();
                    if (urlEnd == 'clinical-note-author-provider-type') {
                        let valueCodeableConcept = ext.valueCodeableConcept;
                        let text = valueCodeableConcept.text || null;
                        let value = valueCodeableConcept.value || null;

                        if (
                            (text && (text.toLowerCase() == 'rn' || text.toLowerCase() == 'registered nurse')) ||
                            (value && (value.toLowerCase() == 'rn' || value.toLowerCase() == 'registered nurse'))
                        ) {
                            skippedNotesNurse++;
                            continue outer; // Skip to the next note
                        }
                    }
                }
            }

            // Get the id of the note
            let noteId = (note.resource && note.resource.id) || null;
            // Get the date of the note
            let noteDate = (note.resource && note.resource.date) || null;
            // Get the url of the note for the binary lookup
            let noteUrlBinary =
                (note.resource &&
                    note.resource.content &&
                    note.resource.content[0] &&
                    note.resource.content[0].attachment &&
                    note.resource.content[0].attachment.url) ||
                null;
            // Get the encounter id of the note
            let noteEncounterId =
                (note.resource &&
                    note.resource.context &&
                    note.resource.context.encounter &&
                    note.resource.context.encounter[0] &&
                    note.resource.context.encounter[0].reference) ||
                null;

            // Build the components of the note title
            const authorFromReference = getDocumentAuthorFromReference(note.resource);
            let author = authorFromReference || getDocumentAuthorDisplay(note.resource);
            let type = getDocumentTypeText(note.resource);

            // Progress notes (and others) carry author on DocumentReference.author; use display as-is.
            let practitionerRole = null;
            if (!authorFromReference) {
                const practitionerRef = getPractitionerReference(note.resource);
                if (practitionerRef) {
                    const practitionerId = practitionerRef.replace('Practitioner/', '');
                    try {
                        const practitionerSearch = await client.request('/PractitionerRole?practitioner=' + practitionerId);
                        practitionerRole =
                            (practitionerSearch &&
                                practitionerSearch.entry &&
                                practitionerSearch.entry[0] &&
                                practitionerSearch.entry[0].resource &&
                                practitionerSearch.entry[0].resource.specialty &&
                                practitionerSearch.entry[0].resource.specialty[0] &&
                                practitionerSearch.entry[0].resource.specialty[0].text) ||
                            null;
                    } catch (error) {
                        // Role lookup is optional
                    }
                }
            }

            let titleDate = noteDate ? noteDate.slice(0, 10) : null;
            const providerLabel =
                author && practitionerRole ? `${author} (${practitionerRole})` : author || null;
            let noteTitle = buildNoteTitle(type, author, practitionerRole, titleDate);

            let noteContent = null;
            let textNodeMap = null;
            let allText = 'None pulled';
            let updatedHtml = '';

            try {
                //Try to get the text content of the note from the binary url
                noteContent = await client.request(String(noteUrlBinary));
                //If there is no error then pull the text content from the note (the note is in html format originally)
                const pulledItems = _pullTextContent(noteContent);

                updatedHtml = pulledItems.html;
                allText = pulledItems.allText;
                textNodeMap = pulledItems.textNodeMap;
            } catch (error) {
                //If there is an error then skip this note
                continue;
            }

            // Create a new ClinicalNote object and add it to the notesList
            let noteObj = new ClinicalNote(
                noteId,
                noteDate,
                noteEncounterId,
                noteUrlBinary,
                allText,
                noteTitle,
                updatedHtml,
                textNodeMap,
                {},
                isProgressNote(note.resource),
                type,
                providerLabel,
            );
            fetchedNotes.push(noteObj);
        }
    }
    return { notesList: fetchedNotes, totalNotes: totalNotes };
}

// Function to repeatedly fetch the next page of notes and concatenate the entry arrays
/** @param {(entry: object) => boolean} [filterEntry] - Keep entries where this returns true. */
async function fetchEntries(client, url, filterEntry = null) {
    let noNext = false;
    let followUrl = url;
    let noteEnteries = [];

    while (!noNext) {
        let noteSearchData = null;

        try {
            noteSearchData = await client.request(followUrl);
            //make sure that the search data has an entry
            if (!noteSearchData.entry || noteSearchData.entry.length == 0) {
                noNext = true;
                return filterEntry ? noteEnteries.filter(filterEntry) : noteEnteries;
            }
        } catch (error) {
            console.error('DocumentReference search failed:', followUrl, error);
            noNext = true;
            return filterEntry ? noteEnteries.filter(filterEntry) : noteEnteries;
        }

        noteEnteries = noteEnteries.concat(noteSearchData.entry);

        const links = noteSearchData.link || [];
        let hasNext = false;
        for (const link of links) {
            if (link.relation == 'next') {
                followUrl = link.url;
                hasNext = true;
                break;
            }
        }
        if (!hasNext) {
            noNext = true;
        }
    }

    return filterEntry ? noteEnteries.filter(filterEntry) : noteEnteries;
}

const BLOCK_TAGS = new Set([
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'P',
    'LI',
    'DIV',
    'TR',
    'TD',
    'TH',
    'BLOCKQUOTE',
    'SECTION',
    'ARTICLE',
    'UL',
    'OL',
    'DL',
    'DT',
    'DD',
    'PRE',
]);

function _finalizeBlockText(context) {
    if (context.allText.length === 0) {
        return;
    }

    const trimmed = context.allText.trimEnd();
    if (trimmed.length === 0) {
        context.allText = '';
        return;
    }

    const lastChar = trimmed[trimmed.length - 1];
    if (!/[.!?]/.test(lastChar)) {
        context.allText = trimmed + '.';
    } else {
        context.allText = trimmed;
    }
}

function _appendBlockSeparator(context) {
    if (context.allText.length === 0) {
        return;
    }

    _finalizeBlockText(context);

    if (context.allText.endsWith('\n\n')) {
        return;
    }
    if (context.allText.endsWith('\n')) {
        context.allText += '\n';
    } else {
        context.allText += '\n\n';
    }
}

function hasHtmlMarkup(value) {
    return typeof value === 'string' && /<[a-zA-Z]/.test(value);
}

/**
 * Plain-text notes (no tags) parse as a single text node under body. Highlighting
 * then builds an empty CSS path and querySelector throws. Wrap those nodes in <p>
 * so they get the same mapping as FHIR HTML notes.
 */
function wrapBodyTextNodes(doc) {
    const textNodes = Array.from(doc.body.childNodes).filter(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );

    for (const node of textNodes) {
        const blocks = node.textContent.split(/\n\s*\n/);
        const paragraphs = [];

        for (const block of blocks) {
            const trimmed = block.trim();
            if (!trimmed) {
                continue;
            }
            const paragraph = doc.createElement('p');
            paragraph.textContent = trimmed;
            paragraphs.push(paragraph);
        }

        if (paragraphs.length === 0) {
            continue;
        }

        node.replaceWith(...paragraphs);
    }
}

function _pullTextContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    wrapBodyTextNodes(doc);

    let context = {
        allText: '',
        textNodeMap: [],
        doc: doc,
    };

    // Replace tables with divs
    Array.from(context.doc.querySelectorAll('table'))
        .reverse()
        .forEach((table) => {
            let tableDiv = doc.createElement('div');
            tableDiv.classList.add('table-div');

            // Process all rows and cells within this table
            table.querySelectorAll('tr').forEach((row) => {
                let rowDiv = doc.createElement('div');
                rowDiv.classList.add('table-row');
                row.querySelectorAll('td, th').forEach((cell) => {
                    let cellDiv = doc.createElement('div');
                    cellDiv.classList.add('table-cell');
                    cellDiv.innerHTML = cell.innerHTML; // Copy cell content
                    rowDiv.appendChild(cellDiv);
                });
                tableDiv.appendChild(rowDiv);
            });

            // Replace the table with the new div
            table.replaceWith(tableDiv);
        });

    // Start processing from body
    _processNode(doc.body, context);

    return {
        allText: context.allText,
        textNodeMap: context.textNodeMap,
        html: context.doc.body.innerHTML,
    };
}

// Function to recursively process text nodes
function _processNode(node, context) {
    if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) {
            const originalText = node.textContent;
            const cleanedText = _cleanText(originalText);

            if (cleanedText) {
                // Store mapping information
                context.textNodeMap.push({
                    node: node,
                    originalText: originalText,
                    cleanedText: cleanedText,
                    startOffset: context.allText.length,
                    endOffset: context.allText.length + cleanedText.length,
                    parentPath: _getNodePath(node.parentNode, context.doc),
                });

                // Add to combined text
                context.allText += cleanedText + ' '; // Add space between nodes
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style elements
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
            return;
        }

        for (let child of node.childNodes) {
            _processNode(child, context);
        }

        if (BLOCK_TAGS.has(node.tagName)) {
            _appendBlockSeparator(context);
        }
    }
}

// Function to create a DOM path to a node
function _getNodePath(node, doc) {
    let path = [];
    while (node && node !== doc.body) {
        let index = 0;
        let sibling = node;
        while (sibling.previousElementSibling) {
            sibling = sibling.previousElementSibling;
            index++;
        }

        let nodeName = node.nodeName.toLowerCase();
        path.unshift(`${nodeName}[${index}]`);
        node = node.parentNode;
    }
    return path.join(' > ');
}

function _cleanText(text) {
    let cleaned = text;

    cleaned = cleaned.replace(/[\[\]\*\ã\<\>]+/g, '');
    cleaned = cleaned.replace(/[‚Äî‚Ä¢¬∞]+/g, '');
    cleaned = cleaned.replace(/[|]/g, '');
    cleaned = cleaned.replace(/°F/g, '');
    cleaned = cleaned.replace(/°C/g, '');
    cleaned = cleaned.replace(/\( ?\)/g, '');

    // Preserve commas; convert hyphens to spaces (e.g. G-tube -> G tube)
    cleaned = cleaned.replace(/-/g, ' ');
    cleaned = cleaned.replace(/\//g, ' ');

    // Characters that cause issues in URL query strings when not encoded
    cleaned = cleaned.replace(/[\?!\%#\=\&\@\'\"]+/g, '');

    cleaned = cleaned.replace(/\u200B/g, '');
    cleaned = cleaned.replace(/[\n\t\s]+/g, ' ');

    return cleaned.trim();
}

function getTypeCodings(resource) {
    return (resource && resource.type && resource.type.coding) || [];
}

function isProgressNote(resource) {
    return getTypeCodings(resource).some(
        (coding) =>
            coding.code === LOINC_CODE_PROGRESS_NOTE &&
            (coding.system === 'http://loinc.org' || coding.system === 'http%3A//loinc.org'),
    );
}

/**
 * Author on DocumentReference.author when type is Practitioner, e.g.
 * { reference: "Practitioner/…", type: "Practitioner", display: "Courtney Claire MacLean, MD" }
 */
function getDocumentAuthorFromReference(resource) {
    const authors = (resource && resource.author) || [];
    for (const author of authors) {
        const isPractitioner =
            author.type === 'Practitioner' ||
            (author.reference && author.reference.startsWith('Practitioner/'));
        if (isPractitioner && author.display) {
            return author.display;
        }
    }

    return null;
}

/**
 * Author fallback for note types that populate extension-based author fields.
 */
function getDocumentAuthorDisplay(resource) {
    const fromReference = getDocumentAuthorFromReference(resource);
    if (fromReference) {
        return fromReference;
    }

    const extensions = (resource && resource.extension) || [];
    for (const ext of extensions) {
        if (ext.valueReference && ext.valueReference.display) {
            return ext.valueReference.display;
        }
        if (ext.valueHumanName && ext.valueHumanName.text) {
            return ext.valueHumanName.text;
        }
    }

    return null;
}

function getPractitionerReference(resource) {
    const authors = (resource && resource.author) || [];
    for (const author of authors) {
        if (author.reference && author.reference.startsWith('Practitioner/')) {
            return author.reference;
        }
    }

    return null;
}

function getDocumentTypeText(resource) {
    if (resource && resource.type && resource.type.text) {
        return resource.type.text;
    }

    if (isProgressNote(resource)) {
        return 'Progress note';
    }

    const loincCoding = getTypeCodings(resource).find(
        (coding) => coding.system === 'http://loinc.org' || coding.system === 'http%3A//loinc.org',
    );
    return (loincCoding && loincCoding.display) || null;
}

function buildNoteTitle(type, author, practitionerRole, titleDate) {
    if (!author && !type && !titleDate) {
        return 'No title.';
    }

    const authorLabel =
        author && practitionerRole ? `${author} (${practitionerRole})` : author || null;

    const parts = [type, authorLabel, titleDate ? `[${titleDate}]` : null].filter(Boolean);
    return parts.join(': ');
}

async function loadMockNotes(collectionKeys = DEFAULT_MOCK_NOTE_COLLECTIONS) {
    const response = await fetch(configUrl('mock-notes.json'));
    if (!response.ok) {
        throw new Error(`Failed to load mock notes: HTTP ${response.status}`);
    }

    const data = parseMockNotesFile(await response.json());
    const records = flattenMockNotesRecords(data, collectionKeys);

    return records.map(clinicalNoteFromRecord);
}

function parseDisplayTitle(title) {
    if (!title) {
        return { noteType: null, provider: null };
    }

    const dashIdx = title.indexOf(' - ');
    if (dashIdx !== -1) {
        return {
            noteType: title.slice(0, dashIdx).trim(),
            provider: title.slice(dashIdx + 3).trim(),
        };
    }

    const parts = title.split(': ').filter(Boolean);
    if (parts.length >= 2) {
        const provider = parts[1].replace(/\s*\[\d{4}-\d{2}-\d{2}\]$/, '').trim();
        return { noteType: parts[0].trim(), provider };
    }

    return { noteType: title.trim(), provider: null };
}

function clinicalNoteFromRecord(record) {
    const { noteType, provider } =
        record.noteType || record.provider
            ? { noteType: record.noteType ?? null, provider: record.provider ?? null }
            : parseDisplayTitle(record.title);

    let text = record.text ?? null;
    let html = record.html ?? null;
    let htmlMapping = record.htmlMapping ?? null;

    // Text-only fixtures have no markup (or html is a copy of text). Feed that
    // string through the same HTML pipeline so TermPeek can highlight contexts.
    if (!hasHtmlMarkup(html) && (text || html)) {
        html = text || html;
    }

    // Same pipeline as live FHIR notes: text + htmlMapping must be derived together from html
    // so TermPeek can map ClinPhen context offsets back to DOM nodes for highlighting.
    if (html && !htmlMapping) {
        const pulled = _pullTextContent(html);
        text = pulled.allText;
        html = pulled.html;
        htmlMapping = pulled.textNodeMap;
    }

    return new ClinicalNote(
        record.id,
        record.date,
        record.encounterId,
        record.binaryUrl,
        text,
        record.title ?? null,
        html,
        htmlMapping,
        record.contexts ?? {},
        record.isProgressNote ?? false,
        noteType,
        provider,
    );
}

export { _pullTextContent, clinicalNoteFromRecord };
