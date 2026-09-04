<template>
    <div id="item-selector" v-if="notesList.length > 0">
        <div id="item-selector-header">
            <button v-if="allChecked == false" @click="checkAll">Check All</button>
            <button v-else @click="uncheckAll">Uncheck All</button>
        </div>
        <div class="note-list-header-row">
            <span class="header-checkbox-spacer" aria-hidden="true"></span>
            <div class="note-list-grid note-list-header">
                <span class="col-type">Type</span>
                <span class="col-provider">Provider</span>
                <span class="col-date">Date</span>
            </div>
        </div>
        <SelectItem
            v-for="note in coreNotes"
            :key="note.id"
            :note="note"
            :isChecked="isCheckedMap[note.id]"
            :selectedNote="selectedNote"
            :alreadyProcessed="alreadyProcessed"
            @click="selectNote"
            @toggle-checked="updateIsCheckedMap"
        />
        <div v-if="progressNotes.length > 0" class="note-folder">
            <button
                type="button"
                class="note-folder-header"
                :aria-expanded="progressNotesOpen"
                @click="progressNotesOpen = !progressNotesOpen"
            >
                <span class="note-folder-chevron" :class="{ open: progressNotesOpen }">›</span>
                Progress Notes ({{ progressNotes.length }})
            </button>
            <div v-show="progressNotesOpen" class="note-folder-items">
                <SelectItem
                    v-for="note in progressNotes"
                    :key="note.id"
                    :note="note"
                    :isChecked="isCheckedMap[note.id]"
                    :selectedNote="selectedNote"
                    :alreadyProcessed="alreadyProcessed"
                    @click="selectNote"
                    @toggle-checked="updateIsCheckedMap"
                />
            </div>
        </div>
    </div>
    <div id="item-selector" v-else>
        <p>No notes found in patient chart.</p>
    </div>
</template>

<script>
    import SelectItem from './SelectItem.vue'

    export default {
        name: 'ItemSelector',
        components: {
            SelectItem
        },
        props: {
            notesList: Array,
            selectedNote: Object,
            alreadyProcessed: Array,
            isCheckedMap: Object,
            allChecked: Boolean,
        },
        data () {
            return {
                selected: null,
                progressNotesOpen: false,
            }
        },
        computed: {
            coreNotes() {
                return this.notesList.filter((note) => !note.isProgressNote);
            },
            progressNotes() {
                return this.notesList.filter((note) => note.isProgressNote);
            },
        },
        methods: {
            selectNote (note) {
                this.$emit('selectNote', note)
            },
            updateIsCheckedMap (noteId) {
                this.$emit('updateIsCheckedMap', noteId)
            },
            checkAll() {
                this.$emit('checkAll')
            },
            uncheckAll() {
                this.$emit('uncheckAll')
            }
        },
    }
</script>

<style scoped lang="css">
    #item-selector {
        overflow-y: scroll;
        background-color: white;
        height: 100%;
        width: 100%;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
    }
    #item-selector-header {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 8px 2px 5px 6px;
        margin: 0px;
        height: fit-content;

        position: sticky;
        top: 0;
        background-color: white;
        z-index: 3;
    }
    #item-selector-header button {
        padding: 4px 8px;
        border: none;
        border-radius: 3px;
        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);

        background-color: rgb(0,113,189);
        color: white;

        text-align: center;
    }
    #item-selector-header button:hover {
        background-color: rgb(0,113,189, .8);
    }
    .note-list-header-row {
        display: flex;
        align-items: center;
        padding: 0 2px;
        border-bottom: 1px solid #e0e0e0;
        background-color: #fafafa;
        position: sticky;
        top: 36px;
        z-index: 2;
    }
    .header-checkbox-spacer {
        flex: 0 0 1.5em;
        margin-left: 2px;
    }
    .note-list-grid {
        display: grid;
        grid-template-columns: 132px minmax(0, 1fr) 84px;
        gap: 8px;
        align-items: center;
        flex: 1;
        padding: 4px 0.5em 4px 0;
    }
    .note-list-header {
    font-size: var(--text-sm);
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .note-list-header .col-date {
        text-align: right;
    }
    .note-folder {
        border-top: 1px solid #e0e0e0;
    }
    .note-folder-header {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 8px 10px;
        border: none;
        background-color: #f5f8fc;
        color: #2c3e50;
        font-weight: 600;
        font-size: 0.9em;
        text-align: left;
        cursor: pointer;
        position: sticky;
        top: 68px;
        z-index: 2;
    }
    .note-folder-header:hover {
        background-color: #e8f0fa;
    }
    .note-folder-chevron {
        display: inline-block;
        transition: transform 0.15s ease;
        font-size: var(--text-lg);
        line-height: 1;
    }
    .note-folder-chevron.open {
        transform: rotate(90deg);
    }
    .note-folder-items {
        background-color: #fafbfc;
    }
</style>
