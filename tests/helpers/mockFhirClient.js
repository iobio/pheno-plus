/**
 * Minimal FHIR client stub for tests. Implements only what fetchNotes uses:
 * patient.id and request(url) returning Bundles or Binary HTML strings.
 */
export function createMockFhirClient({ patientId = 'test-patient', handlers = {} }) {
    return {
        patient: { id: patientId },
        async request(url) {
            const key = Object.keys(handlers).find((prefix) => String(url).startsWith(prefix));
            if (!key) {
                throw new Error(`Unexpected FHIR request in test: ${url}`);
            }
            return handlers[key](url);
        },
    };
}

/** Bundle with no further pages (fetchEntries stops when there is no "next" link). */
export function bundleWithEntries(entries) {
    return {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: entries,
        link: [],
    };
}
