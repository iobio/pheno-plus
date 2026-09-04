import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { findMockNoteRecord, parseMockNotesFile } from '@/data/mockNotes.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures');

export function loadMockNotesFixture() {
    return parseMockNotesFile(JSON.parse(readFileSync(join(fixturesDir, 'mock-notes.json'), 'utf8')));
}

export function mockNoteRecordById(id) {
    const data = loadMockNotesFixture();
    const record = findMockNoteRecord(data, id);
    if (!record) {
        throw new Error(`mock-notes.json has no note with id: ${id}`);
    }
    return record;
}
