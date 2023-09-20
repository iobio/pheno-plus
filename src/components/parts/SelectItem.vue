<template>
    <p 
    :class="{'attention': color, 'current-selection' : isSelected}"
    @click="selectEncounter">
    <div class="select-item-span">{{ encounter.id }}</div>
    <span class="already-added-sign" v-if="alreadyProcessed.includes(encounter.id)"><img alt="OK" src="../../assets/checkbox.svg"></span>
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
    .attention {
        color: red;
    }
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
        color: green;
        width: 10%;
    }

</style>