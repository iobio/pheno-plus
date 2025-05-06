class ClinicalNote {
    constructor(id, date, encounterId, binaryUrl, text=null, title=null, html=null, htmlMapping=null, contexts={}) {
        this.id = id;
        this.date = date;
        this.encounterId = encounterId;
        this.binaryUrl = binaryUrl;
        this.text = text;
        this.title = title;
        this.html = html;
        this.htmlMapping = htmlMapping;
        this.contexts = contexts;
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
    setHtmlMapping(htmlMapping) {
        this.htmlMapping = htmlMapping;
    }
    setContexts(contexts) {
        this.contexts = contexts;
    }
    addContext(hpoId, context) {
        if (this.contexts.hasOwnProperty(hpoId)) {
            //If the hpoId is already in the contexts, just add the context to the existing array
            this.contexts[hpoId].push(context);
            return;
        }
        this.contexts[hpoId] = [context];
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
    getHtmlMapping() {
        return this.htmlMapping;
    }
    getAllContexts() {
        return this.contexts;
    }
    getContexts(hpoId) {
        //If the hpoId is not in the contexts return null
        if (!this.contexts.hasOwnProperty(hpoId)) {
            return null;
        }
        return this.contexts[hpoId];
    }

}
export default ClinicalNote;