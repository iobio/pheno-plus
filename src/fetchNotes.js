/**
 * This function will 
 * 1. Fetch all the notes from the database
 * 2. Fetch the text content of each note and create a ClinicalNote object for each note
 * 3. Return an array of ClinicalNote objects
 * 4. The function will return an array of ClinicalNote objects and the number of notes generated
 */

import ClinicalNote from '@/models/ClinicalNote';

async function fetchNotes(client, patientId) {
    let noteSearchData;
    try {
        noteSearchData = await client.request("/DocumentReference?patient=" + patientId);
    } catch (error) {
        console.error("Error fetching note search data:", error);
        // Return early with empty result if the initial request fails
        return {notesList: [], notesNum: 0, justSearchData: null};
    }

    var notesList = [];
    var notesNum = 0;
    var notes = {};

    if (noteSearchData != null && noteSearchData.entry && noteSearchData.entry.length) {
        notes = noteSearchData.entry;

        for (let note of notes) {
            let noteId = note.id || null;
            let noteDate = note.date || null;
            let noteUrlBinary = note.content && note.content[0] && note.content[0].attachment && note.content[0].attachment.url || null;
            let noteEncounterId = note.context && note.context.encounter && note.context.encounter[0] && note.context.encounter[0].reference || null;

            let noteContent;
            try {
                noteContent = await client.request(noteUrlBinary);
            } catch (error) {
                console.error(`Error fetching note content for note ${noteId}:`, error);
                continue;  // Skip to the next note
            }

            let noteText;
            try {
                noteText = atob(noteContent.data);
            } catch (error) {
                console.error(`Error decoding note content for note ${noteId}:`, error);
                continue;  // Skip to the next note
            }

            let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText);
            notesList.push(noteObj);
        }

        if ('total' in noteSearchData) {
            notesNum = noteSearchData.total;
        }
    }

    return {notesList: notesList, notesNum: notesNum, justSearchData: noteSearchData};
}

export default fetchNotes;