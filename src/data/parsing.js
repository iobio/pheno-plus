/**
 * Seperating the parsing logic into component functions
 */
import { ClinicalNote } from './models';

function highlightInHtml(note, findList, elementsAtATime = 1) {
    /**
     * This should take a note and highlight any text that is in the findList
     *
     * @param {ClinicalNote} note - The note to search
     * @param {Array} findList - List of text to find and highlight
     * @param {Number} elementsAtATime - Number of elements to look at at a time as a sliding window
     *
     * @returns {Object} -  Object with the new highlighted html and a flag for if any were found
     *
     */

    // Parse the HTML content of the note into a DOM structure
    let parser = new DOMParser();
    let doc = parser.parseFromString(note.html, 'text/html');

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

    // Iterate over all elements and apply the highlight to their innerText
    let allElements = doc.body.querySelectorAll('*');

    allElements.forEach((element) => {
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
}

function insertHighlights(contentList, findList) {
    /**
     * This will take a list of text and a list of text to find and highlight
     *
     * @param {Array} contentList - List of text snips to search
     * @param {Array} findList - List of text to find and highlight
     *
     * @returns {Object} - Object with the new highlighted lines in their original order, and a flag for if any were found
     *
     */

    let highlightedList = [];
    let found = false;
    // Convert content to lowercase and join into a single string
    let innerText = contentList
        .map((content) => content.toLowerCase())
        .trim()
        .join('~');

    let lastIndex = 0; // Track the last index of the original innerText that was copied to the highlightedText

    //FIRST: We go through the whole context first
    for (let textToMatch of findList) {
        // Adjust the threshold as needed (e.g., 15% of the context's length)
        let threshold = Math.floor(textToMatch.length * 0.15);

        let i = 0;
        while (i <= innerText.length - (textToMatch.length - 1)) {
            let substring = innerText.substring(i, i + textToMatch.length);

            // Calculate the Levenshtein distance between the term and the substring
            let distance = this.getLevenshteinDistance(textToMatch, substring);

            if (distance <= threshold) {
                // If within the threshold, wrap the original substring in a highlight span
                found = true;
                let originalSubstring = originalInnerText.substring(i, i + textToMatch.length);

                highlightedText +=
                    originalInnerText.substring(lastIndex, i) +
                    `<span id="context-highlight-${scrollIndex}" class="highlighted-context">${originalSubstring}</span>`;

                // Update the lastIndex to the end of the matched substring, the highlight is only the size of the context
                lastIndex = i + textToMatch.length;

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

    if (!found) {
        return { highlightedList: contentList, found: false };
    } else {
        return { highlightedList: highlightedList, found: true };
    }
}

export { highlightInHtml };
