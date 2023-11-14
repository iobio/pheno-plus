class ChartItem{
    constructor(ClinPhenResult) {
        this.hpoId = ClinPhenResult["HPO ID"];
        this.phenotypeName = ClinPhenResult["Phenotype name"];
        this.numOccurrences = parseInt(ClinPhenResult["No. occurrences"]);
        this.earliness = []
        if (!Array.isArray(ClinPhenResult["Earliness (lower = earlier)"])) {
            this.earliness.push(ClinPhenResult["Earliness (lower = earlier)"]);
        } else {
            this.earliness = this.earliness.concat(ClinPhenResult["Earliness (lower = earlier)"]);
        }
        this.exampleSentence = []
        if (!Array.isArray(ClinPhenResult["Example sentence"])) {
            this.exampleSentence.push(ClinPhenResult["Example sentence"]);
        } else {
            this.exampleSentence = this.exampleSentence.concat(ClinPhenResult["Example sentence"]);
        }

        // These are the default values for the other chart elements
        this.severity = 'unknown';
        this.inheritance = 'unknown';
        this.mother = false;
        this.father = false;
        this.use = true;
    }

    //Getters
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
    getSeverity() {
        return this.severity;
    }
    getInheritance() {
        return this.inheritance;
    }
    getMother() {
        return this.mother;
    }
    getFather() {
        return this.father;
    }
    getUse() {
        return this.use;
    }

    //Setters
    setUse(use) {
        this.use = use;
    }
    setSeverity(severity) {
        this.severity = severity;
    }
    setInheritance(inheritance) {
        this.inheritance = inheritance;
    }
    setMother(mother) {
        this.mother = mother;
    }
    setFather(father) {
        this.father = father;
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
    addToNumOccurrences(numOccurrences) {
        numOccurrences = parseInt(numOccurrences)
        this.numOccurrences += numOccurrences;
    }
    setEarliness(earliness) {
        this.earliness = earliness;
    }
    addToEarliness(earliness) {
        this.earliness.push(earliness);
    }
    setExampleSentence(exampleSentence) {
        this.exampleSentence = exampleSentence;
    }
    addToExampleSentence(exampleSentence) {
        this.exampleSentence.push(exampleSentence);
    }
}
export default ChartItem;