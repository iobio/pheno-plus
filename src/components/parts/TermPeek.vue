<template>
    <div id="term-peek-div" :class="{ visible: hpoItemObj }">
        <h3>Note Context</h3>
        <div v-if="hpoItemObj" v-for="exampleS in hpoItemObj.getExampleSentence()">"... {{ exampleS }}..."</div>
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
        width: 0px;
        background-color: white;
        border-radius: 3px;
        margin-left: 0px;
        font-style: italic;
        padding: 5px;
        transition: all 0.45s ease-in-out;
        overflow: hidden;
        color: rgb(72, 71, 71);
    }
    #term-peek-div.visible {
        width: 20%;
        margin-left: 5px;
    }

    #term-peek-div h3 {
        font-size: 12pt;
        padding-top: 10px;
        width: 100%;
        text-align: center;
    }

    #term-peek-div div {
        text-align: center;
        border-bottom: 1px solid rgb(209, 209, 209);
        padding-bottom: 5px;
        padding-top: 5px;
        margin-left: 5px;
        margin-right: 5px;
    }


</style>