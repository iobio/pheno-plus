<template>
    <div id="term-peek-div" :class="{ visible: hpoItemObj }">
        <div class="sub-container">
            <h3>Note Contexts Found</h3>
            <div v-if="hpoItemObj" v-for="exampleS in hpoItemObj.getExampleSentence()">"... {{ exampleS }}..."</div>
        </div>

        <div class="sub-container">
            <h3>Notes Found In</h3>
            <div v-if="hpoItemObj" v-for="noteTitle in hpoItemObj.getNotesPresentIn()">{{ noteTitle }}</div>
        </div>
    </div>

</template>

<script>
    export default {
        name: 'TermPeek',
        props: {
            hpoItemObj: Object,
        },
        data () {
            return {
            }
        },
    }
</script>

<style>
    #term-peek-div {
        display: flex;
        flex-direction: column;
        width: 0px;
        background-color: white;
        border-radius: 3px;
        margin-left: 0px;
        font-style: italic;
        padding: 0px 5px 5px 5px;
        transition: all 0.45s ease-in-out;
        overflow: hidden;
        color: rgb(72, 71, 71);
    }
    #term-peek-div.visible {
        width: 60%;
        margin-left: 5px;
        overflow-y: auto;
    }

    #term-peek-div > .sub-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        box-sizing: border-box;
        overflow-y: auto;
        height: 50%;
    }

    #term-peek-div h3 {
        font-size: 12pt;
        padding-top: 10px;
        width: 100%;
        text-align: center;
        position: sticky;
        top: 0;
        margin-top: 0px;
        background-color: inherit;
    }

    #term-peek-div > .sub-container > div {
        text-align: center;
        border-bottom: 1px solid rgb(209, 209, 209);
        padding-bottom: 5px;
        padding-top: 5px;
        margin-left: 5px;
        margin-right: 5px;
    }


</style>