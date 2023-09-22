<template>
    <div class="hpo-row-container">
        <span><svg style="height: 12px; width: 12px;" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="red" stroke="red"></circle></svg></span>
        <span>{{ hpoItemObj.phenotypeName }}</span>
        <span>{{ hpoItemObj.hpoId }}</span>
        <span>Unknown</span>
        <span><input type="radio"></span>
        <span><input type="radio"></span>
        <span class="delete-btn-span"><img class="delete-btn-img" alt="OK" src="../../assets/backspace.svg"></span>
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
        justify-items: start;
        align-items: center;

        padding: .25em;
    }

    .delete-btn-span {
        display: flex;
        cursor: pointer;
        justify-content: center;
    }
    .delete-btn-img {
        border-radius: 30%;
        padding-right: 2px;
    }
    .delete-btn-img:hover {
        background-color: #e2e2e2;
    }

</style>