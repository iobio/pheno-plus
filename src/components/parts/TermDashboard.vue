<template>
    <div id="term-dashboard-container">
        <h4 id="title-row" :class="{ base: baseInformationOnly }">
            <span>HPO Phenotype</span>
            <span>Select</span>
            <span>Occur.</span>
            <span>Preview</span>
            <span id="num-of-terms">{{ sortedHpoList.length }} Terms</span>
        </h4>
        <div v-if="sortedHpoList.length > 0" id="table-container">
            <HpoTermRow
                v-for="hpoPair in sortedHpoList"
                :hpoItemObj="hpoItemsObj[hpoPair[0]]"
                :highlightCount="highlightCountsByHpoId[hpoPair[0]] ?? 0"
                :baseInformationOnly="baseInformationOnly"
                :selectedTerm="selectedTerm"
                @deleteItem="removeItem"
                @updateItem="updateUse"
                @selectTerm="handleTermSelected"
            ></HpoTermRow>
        </div>

        <!-- only if there is no content to be rendered yet -->
        <div v-else id="table-container">
            <span id="no-terms-alt-msg">No terms to show. Process notes to populate terms.</span>
        </div>

        <div id="term-dash-btn-container">
            <div class="type-ahead-group row">
                <label for="search-term">Find Term</label>

                <div class="input-preview-container">
                    <input
                        type="text"
                        id="search-term"
                        placeholder="Search for a term"
                        v-model="searchTerm"
                        @input="searchForTerm(searchTerm)"
                        @focusin="loadSqlDb"
                        autocomplete="off"
                    />
                    <div class="type-ahead-preview" v-if="typeAheadMatches && typeAheadMatches.length > 0">
                        <div v-for="match in typeAheadMatches" :id="match.term_id" @click="setSearchTerm(match)">
                            {{ match.name }}
                        </div>
                    </div>
                </div>

                <button class="blue-button" @click="addSelectedTermToDash">Add Term</button>
            </div>

            <button id="clear-terms-btn" @click="this.$emit('clearTableTerms')">Clear Terms</button>
        </div>
    </div>
</template>

<script>
import HpoTermRow from './HpoTermRow.vue';
import ChartItem from '../../models/ChartItem.js';
import initSqlJs from 'sql.js';
import { countHighlightsForTerm } from '../../utils/noteHighlighting.js';

export default {
    name: 'TermDashboard',
    components: {
        HpoTermRow,
    },
    props: {
        hpoItemsObj: Object,
        sortedHpoList: Array,
        notesList: Array,
        baseInformationOnly: Boolean,
        selectedTerm: Object,
    },
    data() {
        return {
            termDashHpoItemsObj: this.hpoItemsObj,
            searchTerm: '',
            hpoDb: null,
            typeAheadMatches: [],
            selectedSearchTerm: null,
            highlightCountsByHpoId: {},
        };
    },
    mounted() {
        this.refreshHighlightCounts();
    },
    methods: {
        removeItem(id) {
            this.$emit('removeItem', id);
        },
        updateUse(event, item) {
            //if we are going from item.use = true to item.use = false
            if (item.use) {
                this.$emit('updateItem', item);
                this.$emit('sendTerms');
            } else {
                //get the position of this item in the list
                let itemIndex = this.sortedHpoList.findIndex((hpoPair) => hpoPair[0] == item.getHpoId());

                //Grab the hpo-row-container associated with this event
                let hpoRow = event.target.closest('.hpo-row-container');
                let rowHeight = hpoRow.clientHeight;
                //height diff is the number of items AFTER this item in the list but not counting the non 'use' items
                let heightDiff = this.sortedHpoList.filter(
                    (hpoPair, index) => index > itemIndex && this.hpoItemsObj[hpoPair[0]].use,
                ).length;
                let rowsHeight = rowHeight * heightDiff;
                //we are going to translate y to the bottom of the parent container and then remove it
                hpoRow.style.transition = 'transform 0.6s, opacity 0.6s';
                hpoRow.style.transform = 'translateY(' + rowsHeight + 'px)';
                // hpoRow.style.opacity = '.7';
                setTimeout(() => {
                    this.$emit('updateItem', item);
                    this.$emit('sendTerms');

                    //remove the transition and transform
                    hpoRow.style.transition = 'none';
                    hpoRow.style.transform = 'none';
                    // hpoRow.style.opacity = '1';
                }, 590);
            }
        },
        handleTermSelected(term) {
            this.$emit('selectTerm', term);
        },
        async loadSqlDb() {
            const assetBase = import.meta.env.BASE_URL;
            // Load the wasm file
            const SQL = await initSqlJs({
                // the WASM is just in the public folder
                locateFile: (file) => `${assetBase}${file}`,
            });

            // Fetch the db file called mini_hpo.db in the public folder
            const response = await fetch(`${assetBase}mini_hpo.db`);
            const buffer = await response.arrayBuffer();
            this.hpoDb = new SQL.Database(new Uint8Array(buffer));
        },
        setSearchTerm(term) {
            this.searchTerm = term.name;
            this.selectedSearchTerm = term;
            this.typeAheadMatches = [];
        },
        searchForTerm(newVal) {
            if (!newVal) {
                this.typeAheadMatches = [];
                return;
            }
            let matchArrays = this.hpoDb.exec(`SELECT * FROM simple_terms WHERE name LIKE '%${newVal}%'`);
            if (matchArrays && matchArrays[0] && matchArrays[0].values) {
                matchArrays = matchArrays[0].values;
                this.typeAheadMatches = matchArrays.map((match) => {
                    return {
                        name: match[1],
                        term_id: match[0],
                    };
                });
            } else {
                this.typeAheadMatches = ['No matches found.'];
            }
        },
        addSelectedTermToDash() {
            if (this.selectedSearchTerm) {
                let newChartItem = new ChartItem(this.selectedSearchTerm);
                this.$emit('addTerm', newChartItem);
                this.searchTerm = '';
                this.selectedSearchTerm = null;
            }
        },
        refreshHighlightCounts() {
            if (!this.notesList || !this.hpoItemsObj) {
                this.highlightCountsByHpoId = {};
                return;
            }

            const counts = {};
            for (const hpoId in this.hpoItemsObj) {
                counts[hpoId] = countHighlightsForTerm(this.hpoItemsObj[hpoId], this.notesList);
            }
            this.highlightCountsByHpoId = counts;
        },
    },
    watch: {
        hpoItemsObj: {
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.termDashHpoItemsObj = newVal;
                }
                this.refreshHighlightCounts();
            },
            deep: true,
        },
        sortedHpoList: {
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.$emit('sendTerms');
                }
                this.refreshHighlightCounts();
            },
            deep: true,
        },
        notesList: {
            handler: function () {
                this.refreshHighlightCounts();
            },
            deep: true,
        },
    },
};
</script>

<style>
#no-terms-alt-msg {
    padding-top: 10px;
}
#term-dash-btn-container {
    width: 100%;
    display: flex;
    justify-content: space-between;

    margin-top: 10px;
}
.type-ahead-group {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}
/* all the type ahead group children should have a bit of margin around them */
.type-ahead-group > * {
    margin-right: 10px;
}

.type-ahead-group > label {
    margin-right: 10px;
}

.type-ahead-group > div {
    position: relative;
    width: 200px;
}

.type-ahead-group > div > input {
    width: 100%;
    height: 30px;
    border: 1px solid rgb(215, 215, 215);
    border-radius: 3px;
    padding-left: 5px;
}

.blue-button {
    font-size: var(--text-sm);
    height: 30px;
    border: none;
    border-radius: 3px;
    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);

    background-color: rgb(0, 113, 189);
    color: white;

    text-align: center;
    margin-left: 3px;
}
.blue-button:hover {
    background-color: rgb(0, 113, 189, 0.8);
}

.input-preview-container {
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.type-ahead-preview {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 100px;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: rgba(247, 244, 244, 0.9);
    border: 1px solid rgb(215, 215, 215);
    border-top: none;
    border-radius: 0 3px 3px 3px;
    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);
    z-index: 1;
}

.type-ahead-preview > div {
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid rgb(215, 215, 215);
}
.type-ahead-preview > div:last-child {
    border-bottom: none;
}

.type-ahead-preview > div:hover {
    background-color: rgb(0, 113, 189, 0.1);
    cursor: pointer;
}

#send-terms-btn {
    font-size: var(--text-sm);
    height: 30px;
    border: none;
    border-radius: 3px;
    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);

    background-color: rgb(0, 113, 189);
    color: white;

    text-align: center;
}
#send-terms-btn:hover {
    background-color: rgb(0, 113, 189, 0.8);
}
#send-terms-btn:active {
    background-color: rgba(4, 83, 136);
}

#clear-terms-btn {
    font-size: var(--text-sm);
    height: 30px;
    border: none;
    border-radius: 3px;
    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);

    background-color: rgb(0, 113, 189);
    color: white;

    text-align: center;
    margin-left: 3px;
}
#clear-terms-btn:hover {
    background-color: rgb(0, 113, 189, 0.8);
}
#clear-terms-btn:active {
    background-color: rgba(4, 83, 136);
}

#term-dashboard-container {
    background-color: white;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;

    flex-grow: 1;
    height: 100%;
    border-radius: 3px;
    padding: 1em;
    padding-top: 30px;

    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);
}

#table-container {
    width: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: auto;
    flex: 1;
    margin-top: 0px;
    border-radius: 3px;

    border: rgb(215, 215, 215) 1px solid;
}

#title-row {
    width: 100%;
    position: relative;
    display: grid;
    grid-template-columns: 0.55fr 0.15fr 0.10fr 0.15fr;
    justify-items: center;
    align-items: center;
    text-align: center;
    margin-left: 10px;

    margin-top: 15px;
    margin-bottom: 0px;
    color: rgb(0, 113, 189);
    padding-left: 0.25em;
    padding-right: 16px;
}

#num-of-terms {
    position: absolute;
    right: 0;
    top: -25px;
    font-size: var(--text-sm);
    color: rgb(0, 113, 189);
    border-radius: 10px;
    padding: 3px 5px;
    background-color: rgb(247, 244, 244);
}

#title-row > :first-child {
    justify-self: start;
}

#title-row.base {
    grid-template-columns: 0.55fr 0.15fr 0.10fr 0.15fr;
}
</style>
