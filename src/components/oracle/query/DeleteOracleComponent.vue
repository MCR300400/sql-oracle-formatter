<template>
  <div>
    <h3>Elimina Record</h3>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione LEFT JOIN -->
      <OnlyJoinConnection
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

    </div>

    <!-- Query Execution Component -->
    <QueryExecution
        :selectedColumns="selectedColumns"
        :query="currentQuery"
        @execute-query="executeQuery"
    />


  </div>
</template>


<script>

import {loadColumnsJoinOracle} from '@/stores/ColonneStore';
import {deleteRecordsOracle} from '@/stores/DeleteStore';
import OnlyJoinConnection from "@/components/oracle/query/sub/OnlyJoinConnection.vue";
import QueryExecution from "@/components/oracle/query/sub/QueryExecution.vue";
import WhereSelection from "@/components/oracle/query/sub/WhereSelection.vue";

export default {
  name: 'DeleteComponent',
  components: {QueryExecution, OnlyJoinConnection, WhereSelection},
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
    this.updateQuery();
  },
  computed: {
    currentQuery() {
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
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
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
  },
  methods: {


    handleJoinsUpdate(updatedJoins) {
      this.joins = updatedJoins;
      this.updateQuery(); // Aggiorna la query se necessario
    },

    emitJoins() {
      this.$emit('update:joins', this.joins);
    },

    addJoin() {
      this.joins.push({
        useLeftJoin: false,
        joinTable: '',
        tipoJoin: '',
        availableJoinColumns: [],
        selectedJoinColumns: [],
        joinCondition: {
          varT1: '',
          operator: '=',
          varT2: ''
        }
      });
    },

    toggleSelectAllJoin(index) {
      console.log("indice dentro a toggle: " + index)
      const join = this.joins[index];
      join.selectedJoinColumns = join.selectedJoinColumns.length === join.availableJoinColumns.length ? [] : [...join.availableJoinColumns];
    },

    updateSelectedColumns(newColumns) {
      this.selectedColumns = newColumns; // Update the selected columns based on child component's selection
    },



    toggleSelectAll(event) {
      this.selectedColumns = event.target.checked ? [...this.availableColumns] : [];
    },

    updateJoinVisibility() {
      if (!this.useLeftJoin) {
        this.joinTable = '';
        this.selectedJoinColumns = [];
        this.availableJoinColumns = [];
        this.joinConditions = [];
      }
      this.updateQuery();  // Aggiorna la query quando il JOIN viene attivato/disattivato
    },

    async connectToDbJoin() {
      if (!this.joinTable) return;
      try {
        const columns = await loadColumnsJoinOracle({
          url: localStorage.getItem("urlOracle"),
          database: localStorage.getItem("databaseNameOracle"),
          porta: localStorage.getItem("portOracle"),
          fusoOrario: localStorage.getItem("fusoorarioOracle"),
          tabella: this.joinTable, // Utilizza la tabella di cui è stata caricata la struttura
          username: localStorage.getItem("usernameDBOracle"),
          password: localStorage.getItem("passwordDBOracle"),
        });
        this.availableJoinColumns = columns;
        console.log("colonne join disponibili: " + this.availableJoinColumns)
      } catch (error) {
        console.error("Errore durante il caricamento delle colonne di JOIN:", error);
      }
    },

    addJoinCondition() {
      this.joinConditions.push({
        type: 'type1',  // Tipo predefinito
        varT1: '',
        varT2: '',
        operator: '=',
        valueT1: '',
        valueT2: '',
      });
    },

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
      this.updateQuery();
    },

    updateQuery() {
      // Base per la query DELETE
      let baseQuery = `DELETE FROM ${localStorage.getItem('tableNameOracle')} t1`;

      this.joins.forEach((join, index) => {
        if (join.joinTable) {
          baseQuery += ` ${join.tipoJoin} JOIN ${join.joinTable} t${index + 2}`;
          if (join.joinConditions && Array.isArray(join.joinConditions)) {
            console.log("join.joinConditions: " + join.joinConditions);
            const joinConditions = join.joinConditions
                .filter(cond => cond.varT1 && cond.varT2)
                .map(cond => `t1.${cond.varT1} ${cond.operator} t${index + 2}.${cond.varT2}`);

            if (joinConditions.length) {
              baseQuery += ` ON ${joinConditions.join(' AND ')}`; // Utilizza AND per unire le condizioni
            }
          }
        }
      });

      // Aggiungi le condizioni WHERE
      let whereClause = '';
      if (this.whereConditions.length) {
        const whereClauses = this.whereConditions
            .filter(cond => cond.column && cond.value)
            .map(cond => `${cond.table}.${cond.column} ${cond.operator} '${cond.value}'`);
        if (whereClauses.length) {
          whereClause += ` WHERE ${whereClauses.join(' AND ')}`;
        }
      }


      this.query = baseQuery + whereClause; // Salva la query finale
    },


    async executeQuery() {
      const response = await deleteRecordsOracle({
        url: localStorage.getItem("urlOracle"),
        database: localStorage.getItem("databaseNameOracle"),
        porta: localStorage.getItem("portOracle"),
        fusoOrario: localStorage.getItem("fusoorarioOracle"),
        tabella: localStorage.getItem('tableNameOracle'), // Utilizza la tabella di cui è stata caricata la struttura
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
  