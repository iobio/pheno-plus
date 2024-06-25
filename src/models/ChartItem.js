class ChartItem{
    constructor(phenotypeData, notesPresentIn=[]) {
        if (!phenotypeData) {
            return;
        }

        this.hpoId = phenotypeData["HPO ID"] || phenotypeData.term_id;
        if (this.hpoId === undefined) {
            return;
        }

        this.phenotypeName = phenotypeData["Phenotype name"] || phenotypeData.name;
        if (this.phenotypeName === undefined) {
            return;
        }

        this.numOccurrences = parseInt(phenotypeData["No. occurrences"]) || 0;
        
        this.earliness = []
        if (phenotypeData["Earliness (lower = earlier)"] !== undefined && !Array.isArray(phenotypeData["Earliness (lower = earlier)"])) {
            this.earliness.push(phenotypeData["Earliness (lower = earlier)"]);
        } else if (phenotypeData["Earliness (lower = earlier)"] !== undefined) {
            this.earliness = this.earliness.concat(phenotypeData["Earliness (lower = earlier)"]);
        }

        this.exampleSentence = []
        if (phenotypeData["Example sentence"] !== undefined && !Array.isArray(phenotypeData["Example sentence"])) {
            this.exampleSentence.push(phenotypeData["Example sentence"]);
        } else if (phenotypeData["Example sentence"] !== undefined) {
            this.exampleSentence = this.exampleSentence.concat(phenotypeData["Example sentence"]);
        }

        if (notesPresentIn.length > 0) {
            this.notesPresentIn = notesPresentIn;
        } else {
            this.notesPresentIn = [];
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
    getNotesPresentIn() {
        return this.notesPresentIn;
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
    addToNotesPresentIn(note) {
        this.notesPresentIn.push(note);
    }
}
export default ChartItem;