import ClinicalNote from '@/models/ClinicalNote';

export default async function fetchNotes(client, patientId) {
    /**
     * This function will 
     * 1. Fetch all the notes from the database
     * 2. Fetch the text content of each note and create a ClinicalNote object for each note
     * 3. Return an array of ClinicalNote objects
     * 4. The function will return an array of ClinicalNote objects and the number of notes generated
     */

    let noteSearchData;
    
    try {
        noteSearchData = await client.request("/DocumentReference?patient=" + patientId);
    } catch (error) {
        console.error("Error fetching note search data:", error);
        // Return early with empty result if the initial request fails
        return {notesList: []};
    }

    var notesList = [];
    var notes = {};

    if (noteSearchData != null && noteSearchData.entry && noteSearchData.entry.length) {
        notes = noteSearchData.entry;

        for (let note of notes) {
            let noteCode = note.resource && note.resource.category && note.resource.category[0] && note.resource.category[0].coding && note.resource.category[0].coding[0] && note.resource.category[0].coding[0].code || null;
            
            let noteId = note.resource && note.resource.id || null;
            let noteDate = note.resource && note.resource.date || null;
            let noteUrlBinary = note.resource && note.resource.content && note.resource.content[0] && note.resource.content[0].attachment && note.resource.content[0].attachment.url || null;
            let noteEncounterId = note.resource && note.resource.context && note.resource.context.encounter && note.resource.context.encounter[0] && note.resource.context.encounter[0].reference || null;

            // Only pull notes with the code "clinical-note" can be changed if there are other types that should be pulled
            if (noteCode == null || noteCode != "clinical-note") {
                continue;
            }

            let noteContent = null
            let noteText = 'None pulled';

            try {
                noteContent = await client.request(String(noteUrlBinary));
                noteText = pullTextContent(noteContent);
            } catch (error) {
                continue;
            }

            let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText);
            notesList.push(noteObj);
        }
    }

    return {notesList: notesList};
}

function pullTextContent(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var text = doc.body.textContent || "";

    var textClean = text.replace(/[\n\r]+/g, '\n');
    textClean = textClean.replace(/[ \t\f\v]+/g, ' ');
    textClean = textClean.replace(/[^a-zA-Z0-9\s]/g, '');
    return textClean;
}