class ClinPhenResult {
    constructor(clinPhenResultObj) {
        this.hpoId = clinPhenResultObj["HPO ID"];
        this.phenotypeName = clinPhenResultObj["Phenotype name"];
        this.numOccurrences = clinPhenResultObj["No. occurrences"];
        this.earliness = clinPhenResultObj["Earliness (lower = earlier)"];
        this.exampleSentence = clinPhenResultObj["Example sentence"];
    }

    //Getters and Setters
    getHpoId() {
        return this.hpoId;
    }
    getPhenotypeName() {
        return this.phenotypeName;
    }
    getNumOccurrences() {
        return this.numOccurrences;
    }
    getEarliness() {
        return this.earliness;
    }
    getExampleSentence() {
        return this.exampleSentence;
    }
    setHpoId(hpoId) {
        this.hpoId = hpoId;
    }
    setPhenotypeName(phenotypeName) {
        this.phenotypeName = phenotypeName;
    }
    setNumOccurrences(numOccurrences) {
        this.numOccurrences = numOccurrences;
    }
    setEarliness(earliness) {
        this.earliness = earliness;
    }
    setExampleSentence(exampleSentence) {
        this.exampleSentence = exampleSentence;
    }
}

export default ClinPhenResult;