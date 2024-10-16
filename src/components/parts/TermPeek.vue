<template>
    <div id="term-peek-div" :class="{ visible: hpoItemObj }">
        <div class="full-note-overlay" v-if="fullNoteShown && noteSelected">
            <div @click="closeAndResetNote" class="close-note-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>close note inspection</title>
                    <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
                </svg>
            </div>
            <h3 class="header-white note-title">{{ noteSelected.getTitle() }}</h3>
            <div id="note-html-container" v-if="currentHighlightedHtml" v-html="currentHighlightedHtml"></div>
        </div>

        <div class="sub-container">
            <h3 class="header-white">Note Contexts Found</h3>
            <div v-if="hpoItemObj" v-for="exampleS in hpoItemObj.getExampleSentence()">"... {{ exampleS[0] }}..." <span class="seen-tag">Seen: <b>{{ exampleS[1] }}</b><i>x</i></span></div>
        </div>

        <div class="sub-container">
            <h3 class="header-white">Notes Found In</h3>
            <div class="note-title-row" v-if="hpoItemObj" v-for="noteTIDPair in hpoItemObj.getNotesPresentIn()">
                <div class="exp-btn">
                    <svg @click="showFullTermContext(noteTIDPair[1])" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>show full note</title>
                        <path d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" />
                    </svg>
                </div> 
                <span>{{ noteTIDPair[0] }}</span>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        name: 'TermPeek',
        props: {
            hpoItemObj: Object,
            notesList: Array,
        },
        data () {
            return {
                fullNoteShown: false,
                noteSelected: null,
                currentHighlightedHtml: null,
            }
        },
        methods: {
            showFullTermContext(tid) {
                let selectedNote;
                selectedNote = this.notesList.find(note => note.getId() == tid);
                this.noteSelected = selectedNote;
                this.fullNoteShown = true;

                // Highlight the contexts in the note
                this.currentHighlightedHtml = this.highlightContexts(selectedNote);

                // Ensure DOM updates are complete before scrolling
                this.$nextTick(() => {
                    let firstHighlight = document.getElementById('first-context-highlight');
                    if (firstHighlight) {
                        let scrollableParent = document.querySelector('.full-note-overlay');
                        if (scrollableParent) {
                            //account for the sticky header
                            let header = document.querySelector('.header-white');
                            let headerHeight = header ? header.clientHeight : 0;
                            scrollableParent.scrollTop = firstHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;
                        }
                    }

                    let noteHTMLParent = document.getElementById('note-html-container');
                    //set the z index of all content to be below the header
                    noteHTMLParent.style.zIndex = 1;
                });
            },
            closeAndResetNote() {
                this.fullNoteShown = false;
                this.noteSelected = null;
                this.currentHighlightedHtml = null;
            },
            highlightContexts(note) {
                // Get the HTML content of the note and parse it into a DOM structure
                let parser = new DOMParser();
                let doc = parser.parseFromString(note.getHtml(), 'text/html');

                let isFirstHighlight = true;

                //get example sentances and make them all lowercase
                let contexts = this.hpoItemObj.getExampleSentence().map(s => s[0].toLowerCase());
                let term = this.hpoItemObj.getPhenotypeName().toLowerCase(); // Convert term to lowercase

                // Function to highlight text within the innerText of elements
                function highlightInnerText(element) {
                    let innerText = element.innerText.toLowerCase(); // Get the innerText for case-insensitive matching
                    let originalInnerText = element.innerText; // Get the original innerText
                    let highlightedText = "";
                    let lastIndex = 0;

                    for (let context of contexts) {
                        // Adjust the threshold as needed (e.g., 15% of the context's length)
                        let threshold = Math.floor(context.length * 0.15);

                        for (let i = 0; i <= innerText.length - context.length; i++) {
                            let substring = innerText.substring(i, i + context.length);

                            // Calculate the Levenshtein distance between the term and the substring
                            let distance = this.getLevenshteinDistance(context, substring);

                            if (distance <= threshold) {
                                // If within the threshold, wrap the original substring in a highlight span
                                if (isFirstHighlight) {
                                    isFirstHighlight = false;
                                    highlightedText += originalInnerText.substring(lastIndex, i) + `<span id="first-context-highlight" class="highlighted-context">${originalInnerText.substring(i, i + context.length)}</span>`;
                                } else {
                                    highlightedText += originalInnerText.substring(lastIndex, i) + `<span class="highlighted-context">${originalInnerText.substring(i, i + context.length)}</span>`;
                                    lastIndex = i + context.length;
                                }
                                // Move the loop index to skip over the matched substring
                                i = lastIndex - 1;
                            }
                        }
                    }

                    //also highlight the term if there is a good levenshtein distance
                    let termThreshold = Math.floor(term.length * 0.2);
                    for (let i = 0; i <= innerText.length - term.length; i++) {
                        let substring = innerText.substring(i, i + term.length);

                        // Calculate the Levenshtein distance between the term and the substring
                        let distance = this.getLevenshteinDistance(term, substring);

                        if (distance <= termThreshold) {
                            // If within the threshold, wrap the original substring in a highlight span
                            if (isFirstHighlight) {
                                isFirstHighlight = false;
                                highlightedText += originalInnerText.substring(lastIndex, i) + `<span id="first-context-highlight" class="highlighted-context">${originalInnerText.substring(i, i + term.length)}</span>`;
                            } else {
                                highlightedText += originalInnerText.substring(lastIndex, i) + `<span class="highlighted-context-term">${originalInnerText.substring(i, i + term.length)}</span>`;
                                lastIndex = i + term.length;
                            }
                            // Move the loop index to skip over the matched substring
                            i = lastIndex - 1;
                        }
                    }

                    // Append any remaining part of the original innerText
                    highlightedText += originalInnerText.substring(lastIndex);

                    // Replace the element's HTML if highlighting was applied
                    if (highlightedText !== originalInnerText) {
                        element.innerHTML = highlightedText;
                    }
                }

                // Iterate over all elements and apply the highlight to their innerText
                doc.body.querySelectorAll('*').forEach(element => {
                    if (element.childElementCount === 0 && element.innerText.trim() !== '') {
                        highlightInnerText.call(this, element);
                    }
                });

                //if first highlight is still true, then we didn't find any highlights just add a note to the top of the html that says no highlights found
                if (isFirstHighlight) {
                    doc.body.innerHTML = `<div class="no-context-alert">Could not parse the reference within this note.</div>` + doc.body.innerHTML;
                }

                // Return the updated HTML as a string
                return doc.body.innerHTML;
            },
            getLevenshteinDistance(a, b) {
                //Commonly use NLP algorithm to find the distance between two strings
                const matrix = [];

                for (let i = 0; i <= b.length; i++) {
                    matrix[i] = [i];
                }
                for (let j = 0; j <= a.length; j++) {
                    matrix[0][j] = j;
                }

                // Fill in the matrix
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                            matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                            matrix[i][j] = Math.min(
                                matrix[i - 1][j - 1] + 1, // substitution
                                matrix[i][j - 1] + 1,     // insertion
                                matrix[i - 1][j] + 1      // deletion
                            );
                        }
                    }
                }

                return matrix[b.length][a.length];
            },
        },
        computed: {
        },
        watch: {
            hpoItemObj: function (newVal, oldVal) {
                this.closeAndResetNote();
            }
        }
    }
</script>

<style>
    #term-peek-div {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 0px;
        background-color: white;
        border-radius: 3px;
        margin-left: 0px;
        font-style: italic;
        padding: 0px 5px 5px 5px;
        transition: all 0.45s ease-in-out;
        overflow: hidden;
        color: rgb(72, 71, 71);
    }

    .seen-tag {
        font-size: 10pt;
        color: #0B4B99;
        margin-left: 5px;
    }

    .seen-tag > b {
        font-weight: bold;
        font-size: larger;
    }

    .seen-tag > i {
        color: gray;
    }

    .no-context-alert {
        font-size: 10pt;
        color: red;
        margin-left: 5px;
    }

    .header-white {
        background-color: white;
    }

    #term-peek-div.visible {
        width: 60%;
        margin-left: 5px;
        overflow-y: auto;
    }

    #term-peek-div > .sub-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        overflow-y: auto;
        height: 50%;
    }

    #term-peek-div h3 {
        font-size: 12pt;
        padding-top: 10px;
        width: 100%;
        text-align: center;
        position: sticky;
        top: 0;
        margin-top: 0px;
        background-color: white;
    }

    #term-peek-div h3.note-title {
        z-index: 2;
        font-size: 1.1em;
    }

    #term-peek-div > .sub-container > div {
        text-align: center;
        border-bottom: 1px solid rgb(209, 209, 209);
        padding-bottom: 5px;
        padding-top: 5px;
        margin-left: 5px;
        margin-right: 5px;
    }

    .note-title-row {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .exp-btn {
        cursor: pointer;
        margin-right: 5px;
        height: 25px;
        width: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
    }

    .exp-btn > svg {
        height: 20px;
        width: 20px;
        fill: #0B4B99;
    }

    .exp-btn:hover {
        background-color: #e2e2e2;
    }

    .full-note-overlay {
        align-items: flex-start;
        background-color: white;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        overflow-x: auto;
        overflow-y: auto;
        position: absolute;
        width: 99%;
        height: 99%;
        z-index: 2;
    }

    .full-note-overlay * {
        max-width: 100%;
        max-height: 100%;
        box-sizing: border-box;
        overflow-wrap: break-word; /* Ensure long words break instead of overflowing */
    }

    .close-note-overlay {
        position: sticky;
        top: 0;
        z-index: 3;
        width: 25px;
        height: 25px;
        align-self: flex-end;
        border-radius: 5px;
        margin-top: 2px;
        margin-right: 2px;
        background-color: white;
    }

    .close-note-overlay > svg {
        fill: #0B4B99;
        cursor: pointer;
    }

    .close-note-overlay:hover {
        background-color: #e2e2e2;
    }

    .highlighted-context {
        background-color: #fff19583;
        border-radius: 3px;
        padding: 1px 0px;
        margin: 0px;
    }

    .highlighted-context-term {
        background-color: #0088ff81;
        border-radius: 3px;
        padding: 1px 0px;
        margin: 0px;
    }

</style>