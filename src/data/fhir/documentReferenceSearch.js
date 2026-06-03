/** LOINC and search helpers for DocumentReference (Epic FHIR). */

export const LOINC_SYSTEM = 'http://loinc.org';

export const LOINC_CODES_CORE = [
    '18842-5', // Discharge Summary
    '11488-4', // Consult Note
    '34117-2', // History and Physical Note
];

export const DOC_STATUS_CODES = ['preliminary', 'final', 'amended'];

export const LOINC_CODE_PROGRESS_NOTE = '11506-3';

export function tokenSearchParam(system, code) {
    return encodeURIComponent(`${system}|${code}`);
}

/**
 * Build a relative FHIR search URL for DocumentReference (used with client.request GET).
 */
export function buildDocumentSearchUrl(patientId, loincCodes, { category = null } = {}) {
    const typeParam = loincCodes.map((code) => tokenSearchParam(LOINC_SYSTEM, code)).join(',');
    let url =
        '/DocumentReference?patient=' +
        patientId +
        '&docstatus=' +
        DOC_STATUS_CODES.join(',') +
        '&type=' +
        typeParam;

    if (category) {
        url += '&category=' + encodeURIComponent(category);
    }

    return url;
}
