<template>
    <div id="item-selector">
        <SelectItem 
        v-for="item in encountersList"
        :encounter="item"
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
</style>