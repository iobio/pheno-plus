class ClinPhenResult {
    constructor(hpoId, phenotypeName, numOccurrences, earliness, exampleSentence) {
        this.hpoId = hpoId;
        this.phenotypeName = phenotypeName;
        this.numOccurrences = numOccurrences;
        this.earliness = earliness;
        this.exampleSentence = exampleSentence;
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