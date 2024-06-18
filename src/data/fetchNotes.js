import ClinicalNote from '@/models/ClinicalNote';

export default async function fetchNotes(client, patientId) {
    /**
     * This function will 
     * 1. Fetch all the notes from the database
     * 2. Fetch the text content of each note and create a ClinicalNote object for each note
     * 3. Return an array of ClinicalNote objects
     * 4. The function will return an array of ClinicalNote objects and the number of notes generated
     */

    let docSearchUrl = "/DocumentReference?patient=" + patientId + "&docstatus=preliminary,final,amended&type=http://loinc.org|18842-5,http://loinc.org|11488-4,http://loinc.org|34117-2";

    let notes = null;
    try {
        notes = await fetchEntries(client, docSearchUrl);
    } catch (error) {
        //no notes found
        console.error("Error fetching notes");
    }

    var notesList = [];
    let totalNotes = 0;
    //Check to make sure the noteSearchData is not null and that there are entries
    if (notes) {

        let skippedNotesCode = 0;
        let skippedNotesLoinc = 0;
        let skippedNotesNurse = 0;

        totalNotes = notes.length;
        outer: for (let note of notes) {
            console.log(note);
            // Get the code of the note
            let noteCode = note.resource && note.resource.category && note.resource.category[0] && note.resource.category[0].coding && note.resource.category[0].coding[0] && note.resource.category[0].coding[0].code || null;
            let codingArray = note.resource && note.resource.type && note.resource.type.coding || null;
            let isLoinc = false;

            if (codingArray) {
                for (let coding of codingArray) {
                    if (coding.system == "http://loinc.org") {
                        isLoinc = true;
                        break;
                    }
                }
            }

            if (!isLoinc) {
                skippedNotesLoinc++;
                continue; // Skip this note if it is not a LOINC code
            }

            // Only pull notes with the code "clinical-note" can be changed if there are other types that should be pulled
            if (noteCode == null || noteCode != "clinical-note") {
                skippedNotesCode++;
                continue; // Skip this note if it is not a clinical note
            }

            let customExts = note.resource && note.resource.context && note.resource.context.extension || null;
            if (customExts == null) {
                //it is okay to just proccess this note
            } else {
            // Check if the note is authored by a nurse or if we can see that info at all
                for (let ext of customExts) {
                    let url = ext.url;
                    let urlEnd = url.split('/').pop();
                    if (urlEnd == "clinical-note-author-provider-type") {
                        let valueCodeableConcept = ext.valueCodeableConcept;
                        let text = valueCodeableConcept.text || null;
                        let value = valueCodeableConcept.value || null;

                        if ((text && (text.toLowerCase() == "rn" || text.toLowerCase() == "registered nurse")) ||
                            (value && (value.toLowerCase() =="rn" || value.toLowerCase() == "registered nurse"))) {
                                skippedNotesNurse++;
                                continue outer; // Skip to the next note
                        }
                    }
                }
            }
            // Get the id of the note
            let noteId = note.resource && note.resource.id || null;            
            // Get the date of the note
            let noteDate = note.resource && note.resource.date || null;
            // Get the url of the note for the binary lookup
            let noteUrlBinary = note.resource && note.resource.content && note.resource.content[0] && note.resource.content[0].attachment && note.resource.content[0].attachment.url || null;
            // Get the encounter id of the note
            let noteEncounterId = note.resource && note.resource.context && note.resource.context.encounter && note.resource.context.encounter[0] && note.resource.context.encounter[0].reference || null;

            // Build the components of the note title
            let author = note.resource && note.resource.author && note.resource.author[0] && note.resource.author[0].display || null;
            let type = note.resource && note.resource.type && note.resource.type.text || null;

            let encounterLink = note.resource && note.resource.context && note.resource.context && note.resource.context.encounter && note.resource.context.encounter[0] && note.resource.context.encounter[0].reference || null;

            //try to get the encounter from the encounter link
            let encounter = null;
            let context = 'No context';
            try {
                encounter = await client.request(encounterLink);
                console.log(encounter);
            } catch (error) {
                //If there is an dont do anything
            }

            let titleDate = noteDate.slice(0, 10);

            // Build the note title
            if (type && author && titleDate) {
                // If all the components are present then build the note title
                var noteTitle = `${type}: ${author} (${context}) [${titleDate}]`;
            } else {
                // If any of the components are missing then set the note title to null
                var noteTitle = 'No title.';
            }

            let noteContent = null
            let noteText = 'None pulled';

            try {
                //Try to get the text content of the note from the binary url
                noteContent = await client.request(String(noteUrlBinary));
                //If there is no error then pull the text content from the note (the note is in html format originally)
                noteText = pullTextContent(noteContent);
            } catch (error) {
                //If there is an error then skip this note
                continue;
            }

            // Create a new ClinicalNote object and add it to the notesList
            let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText, noteTitle, noteContent);
            notesList.push(noteObj);
        }
    }
    return {notesList: notesList, totalNotes: totalNotes};
}

// Function to repeatedly fetch the next page of notes and concatenate the entry arrays
async function fetchEntries(client, url) {
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
                return noteEnteries;
            }
        } catch (error) {
            noNext = true;
            return noteEnteries;
        }

        noteEnteries = noteEnteries.concat(noteSearchData.entry);

        let links = noteSearchData.link || [];
        for (let link of links) {
            if (link.relation == "next") {
                // If there is a next page of notes, then we need to fetch that page as well
                followUrl = link.url;
                break;
            } else {
                noNext = true;
            }
        }
    }
    return noteEnteries;
}

function pullTextContent(html) {
    var parser = new DOMParser(); //Use the DOMParser to parse the html because the source is the trusted FHIR server

    var doc = parser.parseFromString(html, 'text/html');
    var text = doc.body.textContent || "";

    // Clean up the text remove number and special characters
    var textClean = text.replace(/[0-9\[\]\*\ã\<\>\,\-]+/g, '');
    textClean = textClean.replace(/[‚Äî‚Ä¢¬∞\/]+/g, '');
    textClean = textClean.replace(/[|]/g, ''); // No improvement from keeping
    textClean = textClean.replace(/°F/g, ''); 
    textClean = textClean.replace(/°C/g, ''); 
    textClean = textClean.replace(/\( ?\)/g, '');

    // Characters that explicitly cause issues with sending via URL
    textClean = textClean.replace(/\?/g, '');
    textClean = textClean.replace(/\!/g, '');
    textClean = textClean.replace(/\%/g, '');
    textClean = textClean.replace(/\#/g, '');
    textClean = textClean.replace(/\=/g, '');
    textClean = textClean.replace(/\&/g, '');
    textClean = textClean.replace(/\@/g, '');
    textClean = textClean.replace(/[\'\"]+/g, '');

    // Standardize whitespace
    textClean = textClean.replace(/\u200B/g, ''); // Zero-width space
    textClean = textClean.replace(/[\n\t\s]+/g, ' '); // Collapse whitespace

    return textClean;
}