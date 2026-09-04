export const MOCK_NOTES_COLLECTIONS = {
    SYNTHETIC_BABY_ELLISON: 'synthetic-notes-baby-ellison',
    BENCHMARK_HPO_RAG: 'benchmark-hpo-rag',
    TEST: 'test',
};

/** Collections loaded in dev when USE_DUMMY_NOTES is true (Baby Ellison demo). */
export const DEFAULT_MOCK_NOTE_COLLECTIONS = [
    MOCK_NOTES_COLLECTIONS.SYNTHETIC_BABY_ELLISON,
];

export function resolveMockNotesOverride(deploymentConfig = {}) {
    if (!deploymentConfig.bypassFHIR) {
        return null;
    }

    return {
        useMockNotes: true,
        collections: deploymentConfig.mockNotesCollections ?? DEFAULT_MOCK_NOTE_COLLECTIONS,
    };
}

export function parseMockNotesFile(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('mock-notes.json must be a JSON object of note collections');
    }
    return data;
}

export function flattenMockNotesRecords(data, collectionKeys = DEFAULT_MOCK_NOTE_COLLECTIONS) {
    parseMockNotesFile(data);

    return collectionKeys.flatMap((key) => {
        if (!(key in data)) {
            throw new Error(`mock-notes.json missing collection: ${key}`);
        }
        const notes = data[key];
        if (!Array.isArray(notes)) {
            throw new Error(`mock-notes.json: "${key}" must be an array`);
        }
        return notes;
    });
}

export function findMockNoteRecord(data, id, collectionKeys = Object.keys(parseMockNotesFile(data))) {
    return flattenMockNotesRecords(data, collectionKeys).find((record) => record.id === id) ?? null;
}
