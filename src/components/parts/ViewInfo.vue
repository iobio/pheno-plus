<template>
    <div v-if="note" id="view-info" class="sub-container">
        <textarea
            @change="textChanged"
            @input="textChanged"
            id="note-info" 
            type="text" 
            v-model="textInputText" readonly="true"></textarea>
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
    #note-info {
        width: 100%;
        height: 100%;
        resize: none;
        overflow: auto;
        font-size: 1em;
        font-family: 'Open Sans', sans-serif;

        border: rgb(215, 215, 215) 1px solid;
        border-radius: 3px;
        padding: .5em; 
        background-color: white;
    }

    #note-info-p {
        width: 100%;
        height: 100%;
        font-size: 1em;
        margin-top: 0%;

        border: rgb(215, 215, 215) 1px solid;
        border-radius: 3px;
        padding: .5em; 
        background-color: white;
    }

</style>