/** Client-side filters for progress-note DocumentReference search results. */

export const PROGRESS_NOTE_TYPES_QUALIFYING = ['progress notes'];

export function noteType(resource) {
    return (resource?.type?.text || '').trim();
}

/**
 * Keep progress-note bundle entries whose type.text matches qualifying patterns.
 * Epic may return other LOINC 11506-3 rows (e.g. Telephone Encounter); drop those here.
 *
 * @param {object} entry - One Bundle.entry from DocumentReference search
 * @returns {boolean}
 */
export function filterProgressNoteEntry(entry) {
    const progressNote = entry?.resource;
    if (!progressNote) {
        return false;
    }

    const typeText = noteType(progressNote).toLowerCase();
    return PROGRESS_NOTE_TYPES_QUALIFYING.some((pattern) => typeText.includes(pattern));
}
