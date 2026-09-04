// @vitest-environment jsdom
/**
 * Ensures ClinPhen "No. occurrences" matches the number of highlighted text blocks
 * the app finds when using the same example sentence(s) stored on the note.
 *
 * Cases use mock ClinPhen responses from fixtures/clinphen-mock-responses.json
 * plus dummy note HTML run through the same text-extraction pipeline as the app (_pullTextContent).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { clinicalNoteFromRecord } from '@/data/fetchNotes.js';
import { parseClinPhenTsv } from '@/data/fetchFromGru.js';
import { buildHighlightedNote } from '@/utils/noteHighlighting.js';
import { mockNoteRecordById } from './helpers/mockNotes.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');
const clinphenCases = JSON.parse(readFileSync(join(fixturesDir, 'clinphen-mock-responses.json'), 'utf8'));

function noteFromFixture(id) {
    return clinicalNoteFromRecord(mockNoteRecordById(id));
}

function attachClinPhenContexts(note, hpoId, clinPhenTerm) {
    for (const sentence of clinPhenTerm['Example sentence']) {
        note.addContext(hpoId, sentence.trim().toLowerCase());
    }
}

function hpoItemFromClinPhenTerm(note, hpoId, clinPhenTerm) {
    return {
        getHpoId: () => hpoId,
        getPhenotypeName: () => clinPhenTerm['Phenotype name'],
        getNotesPresentIn: () => [[note.getTitle(), note.getId()]],
    };
}

function highlightBlocksForTerm(note, hpoItem) {
    const { snippets } = buildHighlightedNote(note, hpoItem);
    return snippets;
}

function logAlignmentReport({ noteId, hpoId, clinPhenTerm, clinphenOccurrences, snippets }) {
    const aligned = snippets.length === clinphenOccurrences ? '✓ aligned' : '✗ mismatch';

    console.log(`\n[clinphen alignment] ${noteId} — ${hpoId} (${aligned})`);
    console.log(`  phenotype:    ${clinPhenTerm['Phenotype name']}`);
    console.log(`  example:      ${clinPhenTerm['Example sentence'].join(' | ')}`);
    console.log(`  clinphen occ: ${clinphenOccurrences}`);
    console.log(`  highlight blocks: ${snippets.length}`);
    snippets.forEach((snippet, index) => {
        const preview = snippet.length > 120 ? `${snippet.slice(0, 120)}…` : snippet;
        console.log(`    block ${index + 1}: ${preview}`);
    });
    console.log('  (uses mock ClinPhen response fixture — no live API call in this test)');
}

describe('ClinPhen occurrences vs highlight blocks', () => {
    it.each(clinphenCases)('$noteId — $hpoId', ({ noteId, hpoId, clinphenTsv }) => {
        const note = noteFromFixture(noteId);
        const clinPhenData = parseClinPhenTsv(clinphenTsv);
        const clinPhenTerm = clinPhenData[hpoId];

        expect(clinPhenTerm).toBeDefined();

        attachClinPhenContexts(note, hpoId, clinPhenTerm);
        const hpoItem = hpoItemFromClinPhenTerm(note, hpoId, clinPhenTerm);

        const clinphenOccurrences = parseInt(clinPhenTerm['No. occurrences'], 10);
        const snippets = highlightBlocksForTerm(note, hpoItem);

        logAlignmentReport({ noteId, hpoId, clinPhenTerm, clinphenOccurrences, snippets });

        expect(snippets.length).toBe(clinphenOccurrences);
    });
});
