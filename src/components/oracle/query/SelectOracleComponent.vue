<template>
  <div>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne della prima tabella -->
      <ColumnSelection
          :availableColumns="availableColumns"
          :selectedColumns="selectedColumns"
          @selectedColumns="updateSelectedColumns"
          @updateQuery="updateQuery"
      />

      <!-- Selezione LEFT JOIN -->
      <JoinSelection
          :joins="joins"
          :availableColumns="availableColumns"
          :useLeftJoin="useLeftJoin"
          :joinList="joinList"
          :updateQuery="updateQuery"
          :addJoin="addJoin"
          :toggleSelectAllJoin="toggleSelectAllJoin"
          :areAllSelectedJoin="areAllSelectedJoin"
          @update:joins="handleJoinsUpdate"
      />

      <!-- Selezione WHERE -->
      <WhereSelection
          :whereConditions="whereConditions"
          :availableColumns="availableColumns"
          :availableJoinColumns="availableJoinColumns"
          :useLeftJoin="useLeftJoin"
          :joinTable="joinTable"
          @update-query="updateQuery"
      />

      <!-- Query Execution Component -->
      <QueryExecution
          :selectedColumns="selectedColumns"
          :query="currentQuery"
          @execute-query="executeQuery"
      />
    </div>

  <DataTable
      :bodyData="bodyData"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :searchValue="searchValue"
      :selectedColumn="selectedColumn"
      @update-page="currentPage = $event"
      @update-search-value="searchValue = $event"
      @update-selected-column="selectedColumn = $event"
      update-page=""/>
  </div>
</template>
<script>
import {selectRecordsOracle} from '@/stores/SelectStore';
import ColumnSelection from "@/components/oracle/query/sub/ColumnSelection.vue";
import DataTable from "@/components/oracle/query/sub/DataTable.vue";
import JoinSelection from "@/components/oracle/query/sub/JoinSelection.vue";
import WhereSelection from "@/components/sql/query/sub/WhereSelection.vue";
import QueryExecution from "@/components/sql/query/sub/QueryExecution.vue";

export default {
  name: 'SelectComponent',
  components: {QueryExecution, WhereSelection, JoinSelection, ColumnSelection, DataTable},
  data() {
    return {
      isUpdatingQuery: false,
      joins: [   // Array per gestire più join
        {
          useLeftJoin: false,
          joinTable: '',
          tipoJoin: '',
          availableJoinColumns: [],
          selectedJoinColumns: [],
          joinConditions: [ // Cambia da joinCondition a joinConditions
            {
              varT1: '',
              operator: '=',
              varT2: ''
            }
          ]
        }
      ],
      availableColumns: [],            // Colonne della tabella principale
      selectedColumns: [],             // Colonne selezionate dalla tabella principale
      whereConditions: [               // Condizioni WHERE dinamiche
        {
          table: 't1',                 // Tabella (t1 = principale, t2 = join)
          column: '',                  // Colonna selezionata
          operator: '=',               // Operatore di confronto
          value: '',                   // Valore di confronto
        }
      ],
      results: [],                     // Risultati della query
      query: '',                       // Query formata
      useLeftJoin: false,              // Se usare o no il LEFT JOIN
      joinTable: '',                   // Nome della tabella per il JOIN
      availableJoinColumns: [],        // Colonne della tabella di JOIN
      selectedJoinColumns: [],         // Colonne selezionate dalla tabella di JOIN
      connectionError: '',             // Errore di connessione (se presente)
      joinConditions: [{  // Changed this to hold multiple conditions
        varT1: '',
        operator: '=',
        varT2: ''
      }],
      bodyData: [],
      tipoJoin: '',
      joinList: ['', 'LEFT', 'RIGHT'],
      searchValue: '',
      selectedColumn: '',
      currentPage: 1,
      itemsPerPage: 100,
    };
  },

  created() {
    const storedColumns = localStorage.getItem('availableColumnsOracle');
    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
  },


  computed: {
    currentQuery() {
      console.log("current query");
      return this.query; // Returns the current query value
    },
    filteredData() {
      if (this.searchValue && this.selectedColumn) {
        return this.bodyData.filter(row =>
            String(row[this.selectedColumn])
                .toLowerCase()
                .includes(this.searchValue.toLowerCase())
        );
      }
      return this.bodyData;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },

    areAllSelected() {
      return this.selectedColumns.length === this.availableColumns.length;
    },


    areAllSelectedJoin() {
      return (index) => {


        if (typeof index !== 'number' || index < 0 || index >= this.joins.length) {
          console.error("Indice non valido:", index);
          return false;
        }

        const join = this.joins[index];

        if (!join || !join.selectedJoinColumns || !join.availableJoinColumns) {
          console.error("Join non definito o proprietà mancanti:", join);
          return false;
        }

        if (!Array.isArray(join.selectedJoinColumns) || !Array.isArray(join.availableJoinColumns)) {
          console.error("Proprietà mancanti o non sono array:", join);
          return false;
        }

        return join.selectedJoinColumns.length === join.availableJoinColumns.length;
      };
    },

    allSelectedColumns() {
      const formattedMainColumns = this.selectedColumns.map(col => `t1.${col}`);
      const formattedJoinColumns = this.selectedJoinColumns.map(col => `t2.${col}`);
      return [...formattedMainColumns, ...formattedJoinColumns];
    },
  },

  methods: {
    handleJoinsUpdate(updatedJoins) {
      this.joins = updatedJoins;
      this.updateQuery(); // Aggiorna la query se necessario
    },
    filterData() {
      this.currentPage = 1; // Resetta la pagina quando si applica un filtro
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
    },
    updateQuery() {

      let query = "SELECT " + this.selectedColumns.map(column => 't1.' + column).join(', ');
      this.joins.forEach((join, index) => {
        if (join.joinTable && join.selectedJoinColumns && join.selectedJoinColumns.length > 0) {
          query += ", " + join.selectedJoinColumns.map(col => `t${index + 2}.${col}`).join(', ');
        }
      })
      query += ` FROM ${localStorage.getItem('tableNameOracle')} t1`;
      this.joins.forEach((join, index) => {
        if (join.joinTable) {
          query += ` ${join.tipoJoin} JOIN ${join.joinTable} t${index + 2}`;
          if (join.joinConditions && Array.isArray(join.joinConditions)) {
            console.log("join.joinConditions: " + join.joinConditions);
            const joinConditions = join.joinConditions
                .filter(cond => cond.varT1 && cond.varT2)
                .map(cond => `t1.${cond.varT1} ${cond.operator} t${index + 2}.${cond.varT2}`);

            if (joinConditions.length) {
              query += ` ON ${joinConditions.join(' AND ')}`; // Utilizza AND per unire le condizioni
            }
          }
        }
      });

      // Aggiungi le condizioni WHERE
      if (this.whereConditions.length) {
        const whereClauses = this.whereConditions
            .filter(cond => cond.column && cond.value) // Filtro per condizioni valide
            .map(cond => `${cond.table}.${cond.column} ${cond.operator} ${cond.value}`);
        if (whereClauses.length) {
          query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
      }

      this.query = query;
    },
    updateSelectedColumns(newColumns) {
      this.selectedColumns = newColumns; // Update the selected columns based on child component's selection
    },
    async executeQuery() {

      console.log('Esecuzione della query:', this.query);

      const response = await selectRecordsOracle({
        url: localStorage.getItem("urlOracle"),
        database: localStorage.getItem("databaseNameOracle"),
        porta: localStorage.getItem("portOracle"),
        fusoOrario: localStorage.getItem("fusoorarioOracle"),
        tabella: this.joinTable,
        username: localStorage.getItem("usernameDBOracle"),
        password: localStorage.getItem("passwordDBOracle")
      }, this.query);


      console.log(response)

      this.bodyData = response

      console.log("dopo bodydata")

    },
  },


};
</script>


<style scoped>


.search-filter {
  display: flex;
  /* Utilizza flexbox per allineare gli elementi */
  align-items: center;
  /* Allinea verticalmente al centro */
  margin-bottom: 15px;
  /* Spazio sotto il filtro */
}

.search-filter label {
  margin-right: 10px;
  /* Spazio tra l'etichetta e il dropdown */
}

.search-filter select,
.search-filter input {
  margin-right: 10px;
  /* Spazio tra gli elementi */
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

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>















