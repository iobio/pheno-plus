import ClinicalNote from '@/models/ClinicalNote';

export default async function fetchNotes(client, patientId) {
    /**
     * This function will 
     * 1. Fetch all the notes from the database
     * 2. Fetch the text content of each note and create a ClinicalNote object for each note
     * 3. Return an array of ClinicalNote objects
     * 4. The function will return an array of ClinicalNote objects and the number of notes generated
     */

    let noteSearchData = null;
    
    try { 
        //Try to get notes on a particular patient
        noteSearchData = await client.request("/DocumentReference?patient=" + patientId);
    } catch (error) {
        // Return early with empty result if the initial request fails
        return {notesList: []};
    }

    // Otherwise we will proceed with the data parsing
    var notesList = [];
    var notes = {};

    //Check to make sure the noteSearchData is not null and that there are entries
    if (noteSearchData != null && noteSearchData.entry && noteSearchData.entry.length) {

        //Set the notes to the entry because of how the data is structured entry is the array of DocumentReference objects
        notes = noteSearchData.entry;

        for (let note of notes) {
            // Get the code of the note
            let noteCode = note.resource && note.resource.category && note.resource.category[0] && note.resource.category[0].coding && note.resource.category[0].coding[0] && note.resource.category[0].coding[0].code || null;

            // Only pull notes with the code "clinical-note" can be changed if there are other types that should be pulled
            if (noteCode == null || noteCode != "clinical-note") {
                continue; // Skip this note if it is not a clinical note
            }

            // Get the id of the note
            let noteId = note.resource && note.resource.id || null;            
            // Get the date of the note
            let noteDate = note.resource && note.resource.date || null;
            // Get the url of the note for the binary lookup
            let noteUrlBinary = note.resource && note.resource.content && note.resource.content[0] && note.resource.content[0].attachment && note.resource.content[0].attachment.url || null;
            // Get the encounter id of the note
            let noteEncounterId = note.resource && note.resource.context && note.resource.context.encounter && note.resource.context.encounter[0] && note.resource.context.encounter[0].reference || null;

            // Build the components of the note title
            let type = note.resource && note.resource.type && note.resource.type.text || null;
            let category = note.resource && note.resource.category && note.resource.category[0] && note.resource.category[0].text || null; //not useing right now
            let author = note.resource && note.resource.author && note.resource.author[0] && note.resource.author[0].display || null;
            let titleDate = noteDate.slice(0, 10);

            // Build the note title
            if (type && author && titleDate) {
                // If all the components are present then build the note title
                var noteTitle = `[${titleDate}] ${type} ${author} (${category})`;
            } else {
                // If any of the components are missing then set the note title to null
                var noteTitle = 'No title.';
            }

            let noteContent = null
            let noteText = 'None pulled';

            try {
                //Try to get the text content of the note from the binary url
                noteContent = await client.request(String(noteUrlBinary));
                //If there is no error then pull the text content from the note (the note is in html format originally)
                noteText = pullTextContent(noteContent);
            } catch (error) {
                //If there is an error then skip this note
                continue;
            }

            // Create a new ClinicalNote object and add it to the notesList
            let noteObj = new ClinicalNote(noteId, noteDate, noteEncounterId, noteUrlBinary, noteText, noteTitle);
            notesList.push(noteObj);
        }
    }
    return {notesList: notesList, rawResponse: notes};
}

function pullTextContent(html) {
    var parser = new DOMParser(); //Use the DOMParser to parse the html because the source is the trusted FHIR server

    var doc = parser.parseFromString(html, 'text/html');
    var text = doc.body.textContent || "";

    // Clean up the text remove number and special characters
    var textClean = text.replace(/[0-9\[\]\*\ã\<\>\,\-]+/g, '');
    textClean = textClean.replace(/[‚Äî‚Ä¢¬∞\/]+/g, '');
    textClean = textClean.replace(/[|]/g, ''); // No improvement from keeping
    textClean = textClean.replace(/°F/g, ''); 
    textClean = textClean.replace(/°C/g, ''); 
    textClean = textClean.replace(/\( ?\)/g, '');

    // Characters that explicitly cause issues with sending via URL
    textClean = textClean.replace(/\?/g, '');
    textClean = textClean.replace(/\!/g, '');
    textClean = textClean.replace(/\%/g, '');
    textClean = textClean.replace(/\#/g, '');
    textClean = textClean.replace(/\=/g, '');
    textClean = textClean.replace(/\&/g, '');
    textClean = textClean.replace(/\@/g, '');
    textClean = textClean.replace(/[\'\"]+/g, '');

    // Standardize whitespace
    textClean = textClean.replace(/\u200B/g, ''); // Zero-width space
    textClean = textClean.replace(/[\n\t\s]+/g, ' '); // Collapse whitespace

    return textClean;
}