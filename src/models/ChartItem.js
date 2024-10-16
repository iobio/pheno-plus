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
            this.exampleSentence.push([phenotypeData["Example sentence"], 1]);
        } else if (phenotypeData["Example sentence"] !== undefined) {
            // If the example sentence is an array, then it is an array of arrays
            for (let i = 0; i < phenotypeData["Example sentence"].length; i++) {
                this.exampleSentence.push([phenotypeData["Example sentence"][i], 1]);
            }
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
        if (Array.isArray(exampleSentence)) {
            this.exampleSentence = this.exampleSentence.concat(exampleSentence);
            return;
        } else {
            exampleSentence = [exampleSentence, 1];
            this.exampleSentence.push(exampleSentence);
        }
    }
    addToNotesPresentIn(note) {
        this.notesPresentIn.push(note);
    }
    addToTimesSeen(index) {
        this.exampleSentence[index][1] += 1;
    }
}
export default ChartItem;