<template>
    <div class="hpo-row-container">
        <span>Unknown</span>
        <span>{{ hpoItemObj.phenotypeName }}</span>
        <span>{{ hpoItemObj.hpoId }}</span>
        <span>Unknown</span>
        <span><input type="radio"></span>
        <span><input type="radio"></span>
        <span><input type="checkbox" name="" id=""></span>
    </div>
</template>

<script>
    export default {
        name: 'HpoTermRow',
        props: {
            hpoItemObj: Object,
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

<style lang="css" scoped>
    .hpo-row-container {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1.5fr 1fr 1fr .5fr .5fr .5fr;
        justify-items: center;

        padding: .25em;
    }
</style>