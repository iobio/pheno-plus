<template>
    <div class="li-wrapper">
        <p 
        :class="{'current-selection' : isSelected}"
        @click="selectNote"
        class="list-item">
        <div class="select-item-span">{{ note.title }}</div>
        <span class="already-added-sign" v-if="alreadyProcessed.includes(note.id)">
            <img alt="OK" src="../../assets/checkbox.svg" id="check-svg">
            <p class="already-added-tip">Already processed</p>
        </span>
        </p>
    </div>
</template>

<script>
    export default {
        name: 'SelectItem',
        props: {
            note: Object,
            selectedNote: Object,
            alreadyProcessed: Array,
        },
        data () {
            return {
                itemNote: this.note,
            }
        }, 
        async mounted () {
        },
        emits: ['click'],
        methods: {
            selectNote () {
                this.$emit('click', this.itemNote)
            }
        },
        computed: {
            isSelected() {
                if (this.selectedNote === null) {
                    return false;
                } 
                return this.selectedNote.id === this.itemNote.id;
            }
        }
    }
</script>

<style scoped lang="css">
    .li-wrapper {
        width: 100%;
        padding: 2px;
        margin: 0px;
        height: fit-content;
        border-bottom: #e3e3e3 1px solid;
    }
    .list-item {
        width: 100%;
        margin-bottom: 0px;
        margin-top: 0px;
        padding: .5em;
        border-radius: 3px;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .list-item:hover {
        background-color: #e1e1e1;
    }

    .current-selection {
        background-color: #c2dbf7;
    }

    .select-item-span {
        width: 70%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .already-added-sign {
        background-color: rgba(32, 236, 32, 0.607);
        border-radius: 5px;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .already-added-tip {
        font-size: .5rem;
        margin-top: 0px;
        margin-bottom: 0px;

        padding-left: 3px;
        padding-top: 2px;
        padding-bottom: 2px;

        border-radius: 3px;
        visibility: hidden;
        width: fit-content;

        position: absolute;
        top: 0px;
        left: -45px;
        z-index: 0;

        background-color: rgba(32, 236, 32, 0.6);
    }

    .already-added-sign:hover .already-added-tip {
        visibility: visible;
    }

    #check-svg {
        z-index: 2;
    }
    
</style>