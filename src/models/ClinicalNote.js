class ClinicalNote {
    constructor(id, date, encounterId, binaryUrl, text=null) {
        this.id = id;
        this.date = date;
        this.encounterId = encounterId;
        this.binaryUrl = binaryUrl;
        this.text = text;
    }

    //setters
    setId(id) {
        this.id = id;
    }
    setDate(date) {
        this.date = date;
    }
    setEncounterId(encounterId) {
        this.encounterId = encounterId;
    }
    setText(text) {
        this.text = text;
    }

    //getters
    getId() {
        return this.id;
    }
    getDate() {
        return this.date;
    }
    getEncounterId() {
        return this.encounterId;
    }
    getText() {
        return this.text;
    }

}
export default ClinicalNote;