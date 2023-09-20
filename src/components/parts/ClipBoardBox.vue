<template>
    <div id="clip-board-box-container"></div>
</template>

<script>
    export default {
        name: 'ClipBoardBox',
        props: {
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

<style>
    #clip-board-box-container {
        width: 100%;   
        height: 20%;
        border-radius: 3px;
        padding: 1em;

        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    }
</style>