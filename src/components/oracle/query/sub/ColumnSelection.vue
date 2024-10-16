<template>
  <div>
    <label for="selectedColumns">Seleziona Colonne:</label>
    <div @change="updateQuery">
      <input type="checkbox" id="selectAll" @change="toggleSelectAll" :checked="areAllSelected" />
      <label for="selectAll">Seleziona Tutte</label>
      <div class="checkbox-container">
        <div v-for="column in availableColumns" :key="column" class="checkbox-item">
          <input type="checkbox" :value="column" v-model="localSelectedColumns" :id="column" @change="emitSelection" />
          <label :for="column">{{ column }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColumnSelection',
  props: {
    availableColumns: {
      type: Array,
      required: true,
    },
    selectedColumns: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localSelectedColumns: Array.isArray(this.selectedColumns) ? [...this.selectedColumns] : [],
    };
  },
  computed: {
    areAllSelected() {
      return this.localSelectedColumns.length === this.availableColumns.length;
    },
  },
  methods: {
    toggleSelectAll(event) {
      this.localSelectedColumns = event.target.checked ? [...this.availableColumns] : [];
      this.emitSelection(); // Emit the selection change
    },
    emitSelection() {
      console.log("selectedcolumns e updatequery");
      this.$emit('selectedColumns', this.localSelectedColumns); // Emit the new selection
      this.$emit('updateQuery'); // Emit an event to update the query
    },
  },
  watch: {
    selectedColumns(newVal) {
      this.localSelectedColumns = Array.isArray(newVal) ? [...newVal] : []; // Update local state when the prop changes
    },
  },
};
</script>

<style scoped>
.checkbox-container {
  display: flex;
  flex-wrap: wrap;
}

.checkbox-item {
  flex: 1 1 30%;
  margin-bottom: 5px;
}
</style>
