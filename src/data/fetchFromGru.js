
export default async function fetchFromGru(data) {
    var chpcGruURL = 'https://mosaic.chpc.utah.edu/gru/api/v1/';

    let clinPhenData = await fetchFromClinPhen(chpcGruURL, data);

    return {clinPhenData: clinPhenData}
}

async function fetchFromClinPhen(gruBaseUrl, data) {
    var hpoText = '';
    var noteText = data;
    //get the num of chars in the note
    var noteLength = noteText.length;

    if (noteLength > 7000) {
        //batch the note into 7000 char chunks and then send each chunk to clinphen cocatenating the results
        var noteChunks = [];
        var chunkSize = 7000;
        var concatClinPhenResponseArray = [];
        var headerRowArray = [];

        //Break the note text into 7000 char chunks
        for (let i = 0; i < noteLength; i += chunkSize) {
            noteChunks.push(noteText.substring(i, i + chunkSize));
        }

        //Iterate over the chunks and send them to clinphen
        for (let i = 0; i < noteChunks.length; i++) {
            var chunk = noteChunks[i];
            try {
                var clinphenResponse = await fetch(gruBaseUrl + 'clinphen?notes=' + chunk)
                .then(response => response.text())
                .then((data) => {
                    return data;
                });
    
                //split by new line
                var clinphenResponseArray = clinphenResponse.split('\n');
                //take the header row off the first line
                headerRowArray = clinphenResponseArray[0].split('\t');
                //take the title off the first line
                clinphenResponseArray.shift();

                //if nothing is found just return 0
                if (clinphenResponseArray.length == 0) {
                    return 0;
                }

                //concatenate the response array to the main response array
                concatClinPhenResponseArray = concatClinPhenResponseArray.concat(clinphenResponseArray);
            } catch {
                //No results return 0
                return 0;
            }
        }
        //Iterate over the array and split each row on the tabs, then create an object for each row with the header row as the keys
        var theObject = {};
        concatClinPhenResponseArray.forEach((row, index) => {
            var rowArray = row.split('\t');
            var tempObject = {};
            headerRowArray.forEach((header, index) => {
                tempObject[header] = rowArray[index];
            });
            theObject[rowArray[0]] = tempObject;
        });

        //remove any empty objects
        delete theObject[''];

        return theObject;

    } else {
        try {
            return fetch(gruBaseUrl + 'clinphen?notes=' + noteText)
            .then(response => response.text())
            .then((data) => {
                
                hpoText = data;
        
                //split the text on the new lines to get the rows
                var theTextArray = hpoText.split('\n');
        
                //first part is the header row
                var headerRow = theTextArray[0];
        
                //remove the header row from the array
                theTextArray.shift();

                //if nothing is found just return 0
                if (theTextArray.length == 0) {
                    return 0;
                }
        
                //split the header row on the tabs
                var headerRowArray = headerRow.split('\t');
        
                //Iterate over the text array and split each row on the tabs, then create an object for each row with the header row as the keys
                var theObject = {};
                theTextArray.forEach((row, index) => {
                    var rowArray = row.split('\t');
                    var tempObject = {};
                    headerRowArray.forEach((header, index) => {
                        tempObject[header] = rowArray[index];
                    });
                    theObject[rowArray[0]] = tempObject;
                });
        
                //remove any empty objects
                delete theObject[''];
        
                return theObject;
            });
        } catch {
            //No results return 0
            return 0;
        }
    }
}