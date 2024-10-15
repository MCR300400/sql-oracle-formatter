<template>
  <div>
    <h3>Tabella con i Dati estratti con la query</h3>

    <!-- Filtro di ricerca -->
    <div class="search-filter">
      <label for="searchColumn">Seleziona colonna:</label>
      <select v-model="localSelectedColumn" id="searchColumn" @change="updateSelectedColumn">
        <option disabled value="">Scegli una colonna</option>
        <option v-for="(value, key) in bodyData[0]" :key="key" :value="key">{{ key }}</option>
      </select>

      <input type="text" v-model="localSearchValue" placeholder="Cerca valore..." @input="updateSearchValue" />
    </div>

    <div class="table-container">
      <table>
        <thead>
        <tr>
          <!-- Mostra i nomi delle colonne -->
          <th v-for="(value, key) in bodyData[0]" :key="key">{{ key }}</th>
        </tr>
        </thead>
        <tbody>
        <!-- Mostra solo le prime 100 righe -->
        <tr v-for="(row, rowIndex) in paginatedData" :key="rowIndex">
          <td v-for="(value, key) in row" :key="key">{{ value }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginazione -->
    <div v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPageSub === 1">Precedente</button>
      <span>Pagina {{ currentPageSub }} di {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPageSub === totalPages">Successiva</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    bodyData: {
      type: Array,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      default: 100,
    },
    searchValue: {
      type: String,
      default: '',
    },
    selectedColumn: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      localSearchValue: this.searchValue,
      localSelectedColumn: this.selectedColumn,
      currentPageSub: this.currentPage,
    };
  },
  method: {
    filterData() {
      this.currentPageSub = 1; // Resetta la pagina quando si applica un filtro
    },
    nextPage() {
      if (this.currentPageSub < this.totalPages) {
        this.currentPageSub++;
      }
    },
    prevPage() {
      if (this.currentPageSub > 1) {
        this.currentPageSub--;
      }
    },
  },

  computed: {
    filteredData() {
      if (this.localSearchValue && this.localSelectedColumn) {
        return this.bodyData.filter(row =>
            String(row[this.localSelectedColumn])
                .toLowerCase()
                .includes(this.localSearchValue.toLowerCase())
        );
      }
      return this.bodyData;
    },

    paginatedData() {
      const start = (this.currentPageSub - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
  },
  methods: {
    nextPage() {
      if (this.currentPageSub < this.totalPages) {
        this.$emit('update-page', this.currentPageSub + 1);
      }
    },
    prevPage() {
      if (this.currentPageSub > 1) {
        this.$emit('update-page', this.currentPageSub - 1);
      }
    },
    updateSearchValue() {
      this.$emit('update-search-value', this.localSearchValue);
    },
    updateSelectedColumn() {
      this.$emit('update-selected-column', this.localSelectedColumn);
    },
  },
};
</script>

<style scoped>
/* Styles for DataTable.vue */
.table-container {
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
