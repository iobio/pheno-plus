/**
 * Example 1 — Unit test (simplest layer)
 *
 * Tests pure functions with no Epic, no OAuth, no Vue.
 * Pattern: arrange inputs → call function → assert output.
 */
import { describe, expect, it } from 'vitest';
import {
    buildDocumentSearchUrl,
    LOINC_CODES_CORE,
    LOINC_CODE_PROGRESS_NOTE,
} from '@/data/fhir/documentReferenceSearch.js';

describe('buildDocumentSearchUrl', () => {
    it('builds core clinical-note search with encoded LOINC type tokens', () => {
        const url = buildDocumentSearchUrl('patient-123', LOINC_CODES_CORE, {
            category: 'clinical-note',
        });

        expect(url).toContain('/DocumentReference?patient=patient-123');
        expect(url).toContain('docstatus=preliminary,final,amended');
        expect(url).toContain('category=clinical-note');
        // LOINC pipe is URL-encoded as %7C
        expect(url).toContain('type=');
        expect(url).toContain(encodeURIComponent('http://loinc.org|18842-5'));
        expect(url).toContain(encodeURIComponent('http://loinc.org|11488-4'));
    });

    it('builds progress-note search without category', () => {
        const url = buildDocumentSearchUrl('patient-123', [LOINC_CODE_PROGRESS_NOTE]);

        expect(url).toContain('/DocumentReference?patient=patient-123');
        expect(url).not.toContain('category=');
        expect(url).toContain(encodeURIComponent('http://loinc.org|11506-3'));
    });
});
