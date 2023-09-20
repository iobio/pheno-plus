<template>
    <p>An HPO Term Line</p>

</template>

<script>
    export default {
        name: 'HpoTermRow',
        props: {
            term: Object,
        },
        data () {
            return {
                term: this.term,
            }
        }, 
        async mounted () {
        },
        methods: {
        }
    }

</script>

<style>

</style>