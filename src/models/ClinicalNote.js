class ClinicalNote {
    constructor(id, date, encounterId, binaryUrl, text=null, title=null, html=null) {
        this.id = id;
        this.date = date;
        this.encounterId = encounterId;
        this.binaryUrl = binaryUrl;
        this.text = text;
        this.title = title;
        this.html = html;
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
    setTitle(title) {
        this.title = title;
    }
    setHtml(html) {
        this.html = html;
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
    getTitle() {
        return this.title;
    }
    getHtml() {
        return this.html;
    }

}
export default ClinicalNote;