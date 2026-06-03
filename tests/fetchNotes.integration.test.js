// @vitest-environment jsdom
/**
 * Example 4 — Integration-style test with a mock FHIR client
 *
 * Exercises fetchNotes() without Epic: stub client.request() to return
 * fixture Bundles and Binary HTML, same hook the real app uses after SMART OAuth.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fetchNotes from '@/data/fetchNotes.js';
import {
    buildDocumentSearchUrl,
    LOINC_CODES_CORE,
    LOINC_CODE_PROGRESS_NOTE,
} from '@/data/fhir/documentReferenceSearch.js';
import { bundleWithEntries, createMockFhirClient } from './helpers/mockFhirClient.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/fhir');
const progressEntries = JSON.parse(readFileSync(join(fixturesDir, 'progress-note-entries.json'), 'utf8'));

const PATIENT_ID = 'test-patient';
const CORE_SEARCH = buildDocumentSearchUrl(PATIENT_ID, LOINC_CODES_CORE, { category: 'clinical-note' });
const PROGRESS_SEARCH = buildDocumentSearchUrl(PATIENT_ID, [LOINC_CODE_PROGRESS_NOTE]);

describe('fetchNotes (mock FHIR client)', () => {
    it('returns one progress note after client-side filter and Binary fetch', async () => {
        const client = createMockFhirClient({
            handlers: {
                [CORE_SEARCH]: () => bundleWithEntries([]),
                [PROGRESS_SEARCH]: () => bundleWithEntries(progressEntries),
                Binary: () => '<p>hypotonia; developmental delay</p>',
            },
        });

        const { notesList, totalNotes } = await fetchNotes(client, PATIENT_ID);

        expect(totalNotes).toBe(1);
        expect(notesList).toHaveLength(1);
        expect(notesList[0].id).toBe('progress-1');
        expect(notesList[0].isProgressNote).toBe(true);
        expect(notesList[0].text).toContain('hypotonia');
    });
});
