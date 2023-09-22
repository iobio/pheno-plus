
export default async function fetchFromGru(data) {
    var chpcGruURL = 'https://mosaic.chpc.utah.edu/gru/api/v1/';

    let phenotypeExData = await fetchFromPhenotypeExtractor(chpcGruURL, data);
    let clinPhenData = await fetchFromClinPhen(chpcGruURL, data);

    return {phenotypeExData: phenotypeExData, clinPhenData: clinPhenData}
}

async function fetchFromPhenotypeExtractor(gruBaseUrl, data) {

    return fetch(gruBaseUrl + 'phenotypeExtractor?notes=' + data)
    .then(response => response.text())
    .then((data) => {
        return data;
    });
}

async function fetchFromClinPhen(gruBaseUrl, data) {
    var theText = '';

    return fetch(gruBaseUrl + 'clinphen?notes=' + data)
    .then(response => response.text())
    .then((data) => {
        theText = data;
        //split the text on the new lines to get the rows
        var theTextArray = theText.split('\n');
        //first part is the header row
        var headerRow = theTextArray[0];
        //remove the header row from the array
        theTextArray.shift();
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

}