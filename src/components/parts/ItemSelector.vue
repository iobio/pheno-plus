<template>
    <div id="item-selector">
        <SelectItem 
        v-for="note in notesList"
        :note="note"
        :selectedNote="selectedNote"
        :alreadyProcessed="alreadyProcessed"
        @click="selectNote">
        </SelectItem>
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
</style>