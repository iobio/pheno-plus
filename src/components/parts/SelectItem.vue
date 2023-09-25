<template>
    <p 
    :class="{'current-selection' : isSelected}"
    @click="selectEncounter">
    <div class="select-item-span">{{ encounter.id }}</div>
    <span class="already-added-sign" v-if="alreadyProcessed.includes(encounter.id)">
        <img alt="OK" src="../../assets/checkbox.svg" id="check-svg">
        <p class="already-added-tip">Already processed</p>
    </span>
    </p>
</template>

<script>
    export default {
        name: 'SelectItem',
        props: {
            encounter: Object,
            color: Boolean,
            selectedEncounter: Object,
            alreadyProcessed: Array,
        },
        data () {
            return {
                itemEncounter: this.encounter,
            }
        }, 
        async mounted () {
        },
        emits: ['click'],
        methods: {
            selectEncounter () {
                this.$emit('click', this.itemEncounter)
            }
        },
        computed: {
            isSelected() {
                if (this.selectedEncounter === null) {
                    return false;
                } 
                return this.selectedEncounter.id === this.itemEncounter.id;
            }
        }
    }
</script>

<style scoped lang="css">
    .current-selection {
        background-color: #aed5ff;
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
        z-index: 10;
    }
    
</style>