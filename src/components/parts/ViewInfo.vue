<template>
    <div v-if="encounter" id="view-info" class="sub-container">
        <div id="encounter-info">
            <p>{{ "Encounter Type: " + encounter.type }}</p>
            <p>{{ "Encounter Reason: " + encounter.reason }}</p>
            <p>{{ "Encounter Start: " + encounter.start }}</p>
            <p>{{ "Encounter End: " + encounter.end }}</p>
        </div>
    </div>

    <div class="sub-container" v-if="!encounter" id="view-info">
        <p>No encounter selected.</p>
    </div>

</template>

<script>
    export default {
        name: 'ViewInfo',
        props: {
            encounter: Object,
        },
        data () {
            return {
            }
        }, 
        async mounted () {
        },
        methods: {
        }
    }

</script>

<style scoped lang="css">

</style>