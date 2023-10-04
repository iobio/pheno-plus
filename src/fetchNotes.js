/**
 * This function will 
 * 1. Fetch all the notes from the database
 * 2. Fetch the text content of each note and create a ClinicalNote object for each note
 * 3. Return an array of ClinicalNote objects
 * 4. The function will return an array of ClinicalNote objects and the number of notes generated
 */

import ClinicalNote from '@/models/ClinicalNote';

async function fetchNotes(client, patientId) {
    const noteSearchData = await client.request("/DocumentReference?patient=" + patientId);

    var notesList = [];
    var notesNum = 0;
    var notes = {};

    if (noteSearchData != null && noteSearchData.entry && noteSearchData.entry.length) {
        notes = noteSearchData.entry;

        for (let note of notes) {
            let noteId = note.id;
            let noteDate = note.date;
            let noteUrlBinary = note.content[0].attachment.url;
            let noteEncounterId = note.context.encounter[0].reference;
    
            let noteContent = await client.request(noteUrlBinary);
            let noteText = atob(noteContent.data);
    
            let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText);
            notesList.push(noteObj);
        }

        if ('total' in notes) {
            notesNum = notes.total;
        }
    }

    return {notesList: notesList, notesNum: notesNum, justSearchData: noteSearchData};
}

export default fetchNotes;