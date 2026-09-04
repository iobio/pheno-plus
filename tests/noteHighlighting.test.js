// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { clinicalNoteFromRecord } from '@/data/fetchNotes.js';
import { buildHighlightedNote, countHighlightsForTerm } from '@/utils/noteHighlighting.js';
import { mockNoteRecordById } from './helpers/mockNotes.js';

function noteFromFixture(id) {
    return clinicalNoteFromRecord(mockNoteRecordById(id));
}

const hpoItemStub = {
    getHpoId: () => 'HP:0008619',
    getPhenotypeName: () => 'Bilateral sensorineural hearing impairment',
    getNotesPresentIn: () => [['Discharge Summary', 'demo-ellison-n5-discharge']],
};

describe('buildHighlightedNote repeated matches', () => {
    it('highlights every paragraph that contains the ClinPhen example sentence', () => {
        const note = noteFromFixture('demo-ellison-n5-discharge');
        note.contexts = {
            'HP:0008619': ['bilateral sensorineural hearing loss'],
        };

        const { snippets } = buildHighlightedNote(note, hpoItemStub);

        expect(snippets.length).toBeGreaterThanOrEqual(2);
        expect(snippets.some((s) => s.toLowerCase().includes('audiology reconfirmed'))).toBe(true);
        expect(snippets.some((s) => s.match(/5\.\s*bilateral sensorineural hearing loss/i))).toBe(true);
    });
});

describe('text-only notes', () => {
    it('wraps cs0003 plain text so querySelector does not throw', () => {
        const note = noteFromFixture('cs0003');
        note.contexts = {
            'HP:0000365': ['sensorineural hearing loss'],
        };

        const hpoItem = {
            getHpoId: () => 'HP:0000365',
            getPhenotypeName: () => 'Hearing impairment',
            getNotesPresentIn: () => [[note.getTitle(), note.getId()]],
        };

        expect(note.html).toMatch(/<p>/i);
        expect(note.getHtmlMapping().every((entry) => entry.parentPath)).toBe(true);

        const { snippets, hasHighlights } = buildHighlightedNote(note, hpoItem);
        expect(hasHighlights).toBe(true);
        expect(snippets.some((s) => s.toLowerCase().includes('sensorineural hearing loss'))).toBe(true);
        expect(() => countHighlightsForTerm(hpoItem, [note])).not.toThrow();
    });

    it('builds highlightable HTML from a record that has text but no html field', () => {
        const note = clinicalNoteFromRecord({
            id: 'text-only-1',
            date: '2026-03-02',
            encounterId: 'Encounter/test',
            binaryUrl: 'Binary/test',
            text: 'Exam notable for dysphagia and sensorineural hearing loss.',
            title: 'Text Only Note',
        });

        note.contexts = {
            'HP:0002015': ['dysphagia'],
        };

        const hpoItem = {
            getHpoId: () => 'HP:0002015',
            getPhenotypeName: () => 'Dysphagia',
            getNotesPresentIn: () => [[note.getTitle(), note.getId()]],
        };

        expect(note.html).toMatch(/<p>/i);
        const { snippets } = buildHighlightedNote(note, hpoItem);
        expect(snippets.some((s) => s.toLowerCase().includes('dysphagia'))).toBe(true);
    });
});
