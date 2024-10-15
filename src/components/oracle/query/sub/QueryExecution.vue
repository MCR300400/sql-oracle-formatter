<template>
  <div>
    <!-- Button to execute the query -->
    <button @click="executeQuery" :disabled="!selectedColumns.length">
      Esegui Query
    </button>

    <!-- Display the formatted query if available -->
    <div v-if="query && query.length > 0"> <!-- Added length check -->
      <h3>Query Formata:</h3>
      <p>{{ query }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QueryExecution',
  props: {
    selectedColumns: {
      type: Array,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
  },
  methods: {
    executeQuery() {
      // Emit an event to execute the query in the parent component
      this.$emit('execute-query');
    },
  },
};
</script>

<style scoped>
button {
  padding: 10px;
  margin-top: 10px;
}
</style>
