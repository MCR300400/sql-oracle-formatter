<template>
  <div>
    <h2>Costruzione Query</h2>

    <div>
      <label for="queryType">Seleziona Tipo di Query:</label>
      <select v-model="selectedQueryType" id="queryType" @change="resetStorage">
        <option value="select">SELECT</option>
        <option value="update">UPDATE</option>
        <option value="insert">INSERT</option>
        <option value="delete">DELETE</option>
      </select>
    </div>

    <component :is="currentComponent" v-if="currentComponent"></component>
  </div>
</template>

<script>
import DeleteComponent from './query/DeleteComponent.vue';
import InsertComponent from './query/InsertComponent.vue';
import SelectComponent from './query/SelectComponent.vue';
import UpdateComponent from './query/UpdateComponent.vue';

export default {
  name: 'QueryExecutionComponent',
  components: {
    SelectComponent,
    UpdateComponent,
    DeleteComponent,
    InsertComponent,
  },
  data() {
    return {
      selectedQueryType: 'select',
    };
  },
  computed: {
    currentComponent() {
      const componentMap = {
        select: 'SelectComponent',
        update: 'UpdateComponent',
        delete: 'DeleteComponent',
        insert: 'InsertComponent',
      };
      return componentMap[this.selectedQueryType] || null;
    },
  },
  methods: {
    resetStorage() {
      localStorage.removeItem("body");
      localStorage.removeItem("query");
      localStorage.removeItem("availableColumnsJoin");
    }
  }
};
</script>

<style scoped>
/* Stili mantenuti */
.column-selection {
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-container {
  display: flex;
  flex-wrap: wrap;
}

.checkbox-item {
  flex: 1 1 30%;
  margin-bottom: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

button {
  padding: 10px;
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
