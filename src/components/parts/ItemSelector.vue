<template>
    <div id="item-selector">
        <SelectItem 
        class="list-item" 
        v-for="item in encountersList"
        :encounter="item"
        :color="item.reason !== 'No reason found.' ? true : false"
        :selectedEncounter="selectedEncounter"
        :alreadyProcessed="alreadyProcessed"
        @click="selectEncounter">
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
            encountersList: Array,
            selectedEncounter: Object,
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
            selectEncounter (encounter) {
                this.$emit('selectEncounter', encounter)
            }
        },
    }

</script>

<style scoped lang="css">
    #item-selector {
        overflow-y: scroll;
        background-color: white;
    }

    .list-item {
        margin-bottom: 0px;
        margin-top: 0px;
        padding: .5em;
        border-bottom: 1px solid #ccc;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .list-item:hover {
        background-color: #e1e1e1;
    }

</style>