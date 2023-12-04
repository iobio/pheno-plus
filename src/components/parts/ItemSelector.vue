<template>
    <div id="item-selector" v-if="notesList.length > 0">
        <div id="item-selector-header">
            <button v-if="allChecked == false" @click="checkAll">Check All</button>
            <button v-else @click="uncheckAll">Uncheck All</button>
        </div>
        <SelectItem 
        v-for="note in notesList"
        :note="note"
        :isChecked="isCheckedMap[note.id]"
        :selectedNote="selectedNote"
        :alreadyProcessed="alreadyProcessed"
        @click="selectNote"
        @toggle-checked="updateIsCheckedMap">
        </SelectItem>
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
            }
        }, 
        async mounted () {
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
    }
    #item-selector-header {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 8px 2px 5px 2px;
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
</style>