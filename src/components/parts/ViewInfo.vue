<template>
    <div v-if="encounter" id="view-info" class="sub-container">
        <textarea id="encounter-info" type="text" 
            :value="encounterText"></textarea>
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
        },
        computed: {
            encounterText() {
                return this.encounter.type + '\n' + this.encounter.reason + '\n' + this.encounter.start + '\n' + this.encounter.end;
            }
        }
    }

</script>

<style scoped lang="css">
    #encounter-info {
        width: 100%;
        height: 100%;
        border: none;
        resize: none;
        overflow: auto;
        font-size: 1em;
        font-family: 'Open Sans', sans-serif;
    }

</style>