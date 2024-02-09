<template>
    <div id="selector-view-container">
      <div class="content-title-wrapper item-selector">
        <h3>Relevant Notes List ({{ notesNum }})</h3>
        <ItemSelector class="sub-container" 
        :notesList="notesList"
        :selectedNote="selectedNote"
        :alreadyProcessed="notesAlreadyProcessed"
        @selectNote="selectNote">
        </ItemSelector>
      </div>


      <div class="content-title-wrapper view-info">
        <h3>Selected Note Content</h3>
        <ViewInfo
        :note="selectedNote"
        @textChanged="changeTextContent">
        </ViewInfo>
        <button id="process-btn" @click="processText">Process Into HPO Terms</button>
      </div>
    </div>
</template>

<script>
    import ViewInfo from './ViewInfo.vue'
    import ItemSelector from './ItemSelector.vue'

    export default {
        name: 'NoteSelectPane',
        components: {
            ViewInfo,
            ItemSelector,
        },
        props: {
            notesList: Array, 
            selectedNote: Object,
            notesAlreadyProcessed: Array,
        },
        data () {
            return {
            }
        },
        mounted () {
        },
        methods: {
            selectNote (note) {
                this.$emit('selectNote', note)
            },
            changeTextContent (text) {
                this.$emit('textChanged', text)
            },
        },
        computed: {
        },
        watch: {
        }
    }
</script>

<style>

</style>
