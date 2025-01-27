class ChartItem {
    constructor(phenotypeData, notesPresentIn = []) {
        if (!phenotypeData) {
            return;
        }

        this.hpoId = phenotypeData['HPO ID'] || phenotypeData.term_id;
        if (!this.hpoId) {
            return;
        }

        this.phenotypeName = phenotypeData['Phenotype name'] || phenotypeData.name;
        if (this.phenotypeName === undefined) {
            return;
        }

        this.numOccurrences = parseInt(phenotypeData['No. occurrences']) || 0;

        this.earliness = [];
        if (
            phenotypeData['Earliness (lower = earlier)'] !== undefined &&
            !Array.isArray(phenotypeData['Earliness (lower = earlier)'])
        ) {
            this.earliness.push(phenotypeData['Earliness (lower = earlier)']);
        } else if (phenotypeData['Earliness (lower = earlier)'] !== undefined) {
            this.earliness = this.earliness.concat(phenotypeData['Earliness (lower = earlier)']);
        }

        this.exampleSentences = [];
        if (
            phenotypeData['Example sentence'] !== undefined &&
            !Array.isArray(phenotypeData['Example sentence']) &&
            typeof phenotypeData['Example sentence'] === 'string' &&
            phenotypeData['Example sentence'].length > 2
        ) {
            //If the example sentence is a string, add it to the example sentence array
            this.exampleSentences.push([phenotypeData['Example sentence'], 1]);
        } else if (phenotypeData['Example sentence'] !== undefined && Array.isArray(phenotypeData['Example sentence'])) {
            for (let example of phenotypeData['Example sentence']) {
                //If the example sentence is an array, add each element to the example sentence array as long as it is a string
                if (typeof example === 'string' && example.length > 2) {
                    this.exampleSentences.push([example, 1]);
                }
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
    getExampleSentences() {
        return this.exampleSentences || [];
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
        numOccurrences = parseInt(numOccurrences);
        this.numOccurrences += numOccurrences;
    }
    setEarliness(earliness) {
        this.earliness = earliness;
    }
    addToEarliness(earliness) {
        this.earliness.push(earliness);
    }
    setExampleSentences(exampleSentence) {
        this.exampleSentences = [exampleSentence, 1];
    }
    addToExampleSentences(exampleSentence) {
        if (Array.isArray(exampleSentence)) {
            this.exampleSentences.push(exampleSentence);
            return;
        } else {
            let newExample = [exampleSentence, 1];
            this.exampleSentences.push(newExample);
        }
    }
    addToNotesPresentIn(note) {
        this.notesPresentIn.push(note);
    }
    addToTimesSeen(index) {
        this.exampleSentences[index][1] += 1;
    }
}
export default ChartItem;
