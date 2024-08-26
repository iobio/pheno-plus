<template>
    <div v-if="note" id="view-info" class="sub-container">
        <div v-if="note.html" class="note-info-html" v-html="note.html"></div>
    </div>

    <div class="sub-container" v-if="!note" id="view-info">
        <p id="note-info-p">No note selected.</p>
    </div>

</template>

<script>
    export default {
        name: 'ViewInfo',
        emits: ['textChanged'],
        props: {
            note: Object,
        },
        data () {
            return {
                textInputText: '',
            }
        }, 
        async mounted () {
        },
        methods: {
            textChanged() {
                this.$emit('textChanged', this.textInputText);
            }, 
            setText() {
                if (!this.note) {
                    return;
                }
                this.textInputText = this.note.text 
            }
        },
        computed: {
        }, 
        watch: {
            note: function (newVal, oldVal) {
                this.setText();
                this.textChanged();
            }
        }
    }

</script>

<style scoped lang="css">
    #view-info {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: flex-start;
        overflow: auto;
        padding: .5em; 
        width: 100%;
    }
    .note-info-p {
        width: 100%;
        height: 100%;
        font-size: 1em;
        margin-top: 0%;

        border: rgb(215, 215, 215) 1px solid;
        border-radius: 3px;
        padding: .5em; 
        background-color: white;
    }

    .note-info-html {
        align-items: flex-start;
        background-color: white;
        box-sizing: border-box;
        border-radius: 3px;
        border: rgb(215, 215, 215) 1px solid;
        display: flex;
        flex-direction: column;
        height: 99%;
        justify-content: flex-start;
        overflow-x: auto;
        overflow-y: auto;
        padding: .5em; 
        width: 99%;
    }

    .note-info-html * {
        max-width: 100%;
        max-height: 100%;
        box-sizing: border-box;
        overflow-wrap: break-word; /* Ensure long words break instead of overflowing */
    }

</style>