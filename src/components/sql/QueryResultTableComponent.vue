<template>
  <div>
    <h3>Risultati della Query</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in results" :key="result.id">
          <td>{{ result.id }}</td>
          <td>{{ result.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'QueryResultTableComponent',
  props: {
    results: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
</style>
