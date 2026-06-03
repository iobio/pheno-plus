/**
 * Example 2 — Unit test with inline fixtures
 *
 * Simulates FHIR Bundle entries (shapes Epic returns) without calling the network.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { filterProgressNoteEntry } from '@/data/fhir/progressNoteFilter.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/fhir');
const progressEntries = JSON.parse(readFileSync(join(fixturesDir, 'progress-note-entries.json'), 'utf8'));

describe('filterProgressNoteEntry', () => {
    it('keeps Progress Notes and drops Telephone Encounter', () => {
        const kept = progressEntries.filter(filterProgressNoteEntry);

        expect(kept).toHaveLength(1);
        expect(kept[0].resource.id).toBe('progress-1');
        expect(kept[0].resource.type.text).toBe('Progress Notes');
    });

    it('rejects entries without a resource', () => {
        expect(filterProgressNoteEntry({})).toBe(false);
        expect(filterProgressNoteEntry({ resource: null })).toBe(false);
    });
});
