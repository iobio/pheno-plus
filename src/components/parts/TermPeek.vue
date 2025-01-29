<template>
    <div id="term-peek-div" :class="{ visible: hpoItemObj }">
        <div class="full-note-overlay" v-if="fullNoteShown && noteSelected">
            <div @click="closeAndResetNote" class="close-note-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>close note inspection</title>
                    <path
                        d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"
                    />
                </svg>
            </div>
            <div v-if="alertShown" class="no-context-alert">Pheno+ was not able to highlight the reference within this note.</div>
            <h3 class="header-white note-title">
                {{ noteSelected.getTitle() }}
                <div id="scroll-btn-wrapper" v-if="lenOfIndexes > 0" @click="incrementScrollIndex()">
                    <div>{{ scrolledIndex + 1 }} / {{ lenOfIndexes }}</div>
                    <div id="next-highlight">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>next</title>
                            <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
                        </svg>
                    </div>
                </div>
            </h3>
            <div id="note-html-container" v-if="currentHighlightedHtml" v-html="currentHighlightedHtml"></div>
        </div>

        <div class="sub-container">
            <h3 class="header-white">Notes With Term</h3>
            <div class="note-title-row" v-if="hpoItemObj" v-for="noteTIDPair in hpoItemObj.getNotesPresentIn()">
                <div class="exp-btn">
                    <svg @click="showFullTermContext(noteTIDPair[1])" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>show full note</title>
                        <path
                            d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"
                        />
                    </svg>
                </div>
                <span>{{ noteTIDPair[0] }}</span>
            </div>
        </div>

        <div class="sub-container">
            <h3 class="header-white">Context Snips</h3>
            <div v-for="exampleS in exampleSentences">
                <span class="seen-tag"
                    ><b>{{ exampleS[1] }}</b> copies</span
                >
                {{ exampleS[0] }}
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
    data() {
        return {
            fullNoteShown: false,
            noteSelected: null,
            currentHighlightedHtml: null,
            alertShown: false,
            scrolledIndex: 0,
            lenOfIndexes: 0,
        };
    },
    methods: {
        incrementScrollIndex() {
            if (this.scrolledIndex < this.lenOfIndexes - 1) {
                this.scrolledIndex++;
            } else {
                this.scrolledIndex = 0;
            }
        },
        showFullTermContext(tid) {
            let selectedNote;
            selectedNote = this.notesList.find((note) => note.getId() == tid);
            this.noteSelected = selectedNote;
            this.fullNoteShown = true;

            // Highlight the contexts in the note
            this.currentHighlightedHtml = this.highlightContexts(selectedNote);
            if (!this.currentHighlightedHtml) {
                this.alertShown = true;
                this.currentHighlightedHtml = selectedNote.getHtml();
            }

            // Ensure DOM updates are complete before scrolling
            this.$nextTick(() => {
                let firstHighlight = document.getElementById('context-highlight-0');
                if (firstHighlight) {
                    let scrollableParent = document.querySelector('.full-note-overlay');
                    if (scrollableParent) {
                        //account for the sticky header
                        let header = document.querySelector('.header-white');
                        let headerHeight = header ? header.clientHeight : 0;
                        scrollableParent.scrollTop = firstHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;

                        //also add the scrolled class to the first highlight
                        firstHighlight.classList.add('scrolled');
                    }
                }

                let noteHTMLParent = document.getElementById('note-html-container');
                //set the z index of all content to be below the header
                noteHTMLParent.style.zIndex = 1;

                //for sanity just remove all images from the note
                noteHTMLParent.querySelectorAll('img').forEach((img) => img.remove());
            });
        },
        closeAndResetNote() {
            this.fullNoteShown = false;
            this.noteSelected = null;
            this.currentHighlightedHtml = null;
            this.scrolledIndex = 0;
            this.lenOfIndexes = 0;
        },
        highlightContexts(note) {
            // Parse the HTML content of the note into a DOM structure
            let parser = new DOMParser();
            let doc = parser.parseFromString(note.getHtml(), 'text/html');

            // Use Array.from to convert the NodeList to an array and reverse it
            // This allows you replace the innermost tables first
            Array.from(doc.querySelectorAll('table'))
                .reverse()
                .forEach((table) => {
                    let tableDiv = document.createElement('div');
                    tableDiv.classList.add('table-div');

                    // Process all rows and cells within this table
                    table.querySelectorAll('tr').forEach((row) => {
                        let rowDiv = document.createElement('div');
                        rowDiv.classList.add('table-row');
                        row.querySelectorAll('td, th').forEach((cell) => {
                            let cellDiv = document.createElement('div');
                            cellDiv.innerHTML = cell.innerHTML; // Copy cell content
                            rowDiv.appendChild(cellDiv);
                        });
                        tableDiv.appendChild(rowDiv);
                    });

                    // Replace the original table with the new div
                    table.replaceWith(tableDiv);
                });

            let isFirstHighlight = true;
            let scrollIndex = 0;

            //get example sentances and make them all lowercase
            let contexts = this.hpoItemObj.getExampleSentences().map((s) => s[0].toLowerCase());
            let term = this.hpoItemObj.getPhenotypeName().toLowerCase(); // Convert term to lowercase

            // Function to highlight text within the innerText of elements
            function highlightInnerText(element) {
                let innerText = element.innerText.toLowerCase(); // Get the innerText for case-insensitive matching
                let originalInnerText = element.innerText; // Get the original innerText
                let highlightedText = '';

                //if the innerText is two letters shorter than the term then don't try to match just ignore
                if (innerText.length < term.length - 1) {
                    return;
                }

                let lastIndex = 0; // Track the last index of the original innerText that was copied to the highlightedText

                //FIRST: We go through the whole context first
                for (let context of contexts) {
                    // Adjust the threshold as needed (e.g., 15% of the context's length)
                    let threshold = Math.floor(context.length * 0.15);

                    let i = 0;
                    while (i <= innerText.length - (context.length - 1)) {
                        //If a context is too short then don't try to match it
                        if (context.length < term.length - 1) {
                            continue;
                        }

                        let substring = innerText.substring(i, i + context.length);

                        // Calculate the Levenshtein distance between the term and the substring
                        let distance = this.getLevenshteinDistance(context, substring);

                        if (distance <= threshold) {
                            // If within the threshold, wrap the original substring in a highlight span
                            isFirstHighlight = false;

                            highlightedText +=
                                originalInnerText.substring(lastIndex, i) +
                                `<span id="context-highlight-${scrollIndex}" class="highlighted-context">${originalInnerText.substring(
                                    i,
                                    i + context.length,
                                )}</span>`;

                            let end = i + context.length;
                            // Update the lastIndex to the end of the matched substring, the highlight is only the size of the context
                            lastIndex = end;

                            // Move the loop index to skip over the matched substring
                            i = lastIndex;
                            scrollIndex++;

                            // Break out of the loop to avoid matching the same context multiple times
                            break;
                        } else {
                            i++;
                        }
                    }

                    if (!isFirstHighlight) {
                        break;
                    }
                }

                //If we didn't highlight a context then we can try to highlight the term
                if (isFirstHighlight) {
                    let termThreshold = Math.floor(term.length * 0.1);
                    let i = 0;
                    while (i <= innerText.length - (term.length - 1)) {
                        let substring = innerText.substring(i, i + term.length);

                        // Calculate the Levenshtein distance between the term and the substring
                        let distance = this.getLevenshteinDistance(term, substring);

                        if (distance <= termThreshold) {
                            // If within the threshold, wrap the original substring in a highlight span
                            isFirstHighlight = false;

                            highlightedText +=
                                originalInnerText.substring(lastIndex, i) +
                                `<span id="context-highlight-${scrollIndex}" class="highlighted-context-term">${originalInnerText.substring(
                                    i,
                                    i + term.length,
                                )}</span>`;

                            let end = i + term.length;
                            lastIndex = end;

                            // Move the loop index to skip over the matched substring
                            i = lastIndex;
                            scrollIndex++;

                            // Break out of the loop to avoid matching the same context multiple times
                            break;
                        } else {
                            i++;
                        }
                    }
                }

                if (isFirstHighlight) {
                    // If no highlights were applied, append the original innerText
                    highlightedText = originalInnerText;
                    this.alertShown = true;
                } else {
                    // Append any remaining part of the original innerText
                    highlightedText += originalInnerText.substring(lastIndex);
                    this.alertShown = false;
                }

                element.innerHTML = highlightedText;
            }

            // Iterate over all elements and apply the highlight to their innerText
            doc.body.querySelectorAll('*').forEach((element) => {
                if (element.childElementCount === 0 && element.innerText.trim() !== '') {
                    highlightInnerText.call(this, element);
                } else if (element.childElementCount > 0) {
                    element.childNodes.forEach((child) => {
                        if (child.nodeType === 3 && child.textContent.trim() !== '') {
                            highlightInnerText.call(this, child);
                        }
                    });
                }
            });

            this.lenOfIndexes = scrollIndex;

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
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1, // deletion
                        );
                    }
                }
            }

            return matrix[b.length][a.length];
        },
    },
    computed: {
        exampleSentences() {
            if (!this.hpoItemObj) {
                return [];
            }
            return this.hpoItemObj.getExampleSentences();
        },
    },
    watch: {
        hpoItemObj: function (newVal, oldVal) {
            this.closeAndResetNote();
        },
        scrolledIndex: function (newVal, oldVal) {
            let scrollHighlight = document.getElementById(`context-highlight-${this.scrolledIndex}`);
            if (scrollHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    //account for the sticky header
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;
                    scrollableParent.scrollTop = scrollHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;

                    //remove the scrolled class from the previous highlight
                    let prevHighlight = document.getElementById(`context-highlight-${oldVal}`);
                    if (prevHighlight) {
                        prevHighlight.classList.remove('scrolled');
                    }

                    //also add the scrolled class to the first highlight
                    scrollHighlight.classList.add('scrolled');
                }
            }
        },
    },
};
</script>

<style>
.table-div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
}

.table-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
}

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

#scroll-btn-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 5px;
    position: absolute;
    right: 2px;
    bottom: -20px;
    background-color: white;
    font-size: 10pt;
    border: 1px solid #0b4b99;
    padding: 2px 5px;
    border-radius: 5px;
}

#next-highlight {
    cursor: pointer;
    margin-left: 5px;
    height: 25px;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;

    background-color: gray;
    border-radius: 5px;
}

#next-highlight:hover {
    background-color: #0b4b99;
}

#next-highlight > svg {
    height: 20px;
    width: 20px;
    fill: white;
}

.seen-tag {
    background-color: aliceblue;
    color: #0b4b99;
    margin-left: 5px;
    margin-right: 5px;
    font-weight: bold;
    font-style: normal;
    padding: 2px 4px;
    border-radius: 5px;
}

.seen-tag > b {
    text-decoration: underline;
}

.seen-tag > i {
    color: gray;
}

.no-context-alert {
    font-size: 12pt;
    font-weight: bold;
    color: red;
    margin-left: 5px;
    padding: 5px 5px;
    position: absolute;
    top: 3px;
    left: 0;
    background-color: rgba(250, 202, 202, 0.4);
    border-radius: 5px;
    z-index: 3;
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

.note-title {
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
    fill: #0b4b99;
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
    fill: #0b4b99;
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
    background-color: #fff19583;
    border-radius: 3px;
    padding: 1px 0px;
    margin: 0px;
}

.highlighted-context-term.scrolled,
.highlighted-context.scrolled {
    background-color: #0088ff81;
    font-weight: bold;
}
</style>
