/**
 * This function will 
 * 1. Fetch all the notes from the database
 * 2. Fetch the text content of each note and create a ClinicalNote object for each note
 * 3. Return an array of ClinicalNote objects
 * 4. The function will return an array of ClinicalNote objects and the number of notes generated
 */

import ClinicalNote from '@/models/ClinicalNote';

async function fetchNotes(client, patientId) {
    const noteSearchData = await client.request("/DocumentReference?patient=" + patientId + "&category=clinical-note");

    if (!noteSearchData.entry || !noteSearchData.entry.length) {
        throw new Error("No notes found for the selected patient");
    }

    const notes = noteSearchData.entry;

    var notesList = [];
    var notesNum = noteSearchData.total;

    for (let note in notes) {
        let noteId = note.id;
        let noteDate = note.date;
        let noteUrlBinary = note.content[0].attachment.url;
        let noteEncounterId = note.context.encounter[0].reference;

        let noteContent = await client.request(noteUrlBinary);
        let noteText = atob(noteContent.data);

        let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText);
        notesList.push(noteObj);
    }
    return {notesList: notesList, notesNum: notesNum};
}