<template>
  <div>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne della prima tabella -->
      <ColumnSelection
          :availableColumns="availableColumns"
          :selectedColumns="selectedColumns"
          @update:selectedColumns="updateSelectedColumns"
          @updateQuery="updateQuery"
      />

      <!-- Input per i valori da aggiornare -->
      <div class="input-container">
        <div v-for="(column, index) in selectedColumns" :key="column" class="input-item">
          <label>{{ column }}</label>
          <input :type="getTipo(column)" v-model="updateValues[index]" :id="'value_' + column"
                 :placeholder="getDefault(column)" :disabled="isDisabled(getExtra(column))"
                 :required="isRequired(getNull(column))" @input="updateQuery"/>
        </div>
      </div>

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
  </div>
</template>

<script>
import {updateRecords} from '@/stores/UpdateStore.js';
import QueryExecution from "@/components/sub/QueryExecution.vue";
import WhereSelection from "@/components/sub/WhereSelection.vue";
import JoinSelection from "@/components/sub/JoinSelection.vue";
import ColumnSelection from "@/components/sub/ColumnSelection.vue";


export default {
  name: 'UpdateComponent',
  components: {ColumnSelection, JoinSelection, WhereSelection, QueryExecution},
  data() {
    return {
      selectedUpdateColumns: [],       // Colonne selezionate da aggiornare
      updateValues: [],                // Valori da impostare per le colonne selezionate
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
    const storedColumns = localStorage.getItem('availableColumns');
    const storedTipo = localStorage.getItem('tipo');
    const storedNull = localStorage.getItem('null');
    const storedKey = localStorage.getItem('key');
    const storedDefault = localStorage.getItem('default');
    const storedExtra = localStorage.getItem('extra');

    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    this.listTipo = storedTipo ? JSON.parse(storedTipo) : [];
    this.listNull = storedNull ? JSON.parse(storedNull) : [];
    this.listKey = storedKey ? JSON.parse(storedKey) : [];
    this.listDefault = storedDefault ? JSON.parse(storedDefault) : [];
    this.listExtra = storedExtra ? JSON.parse(storedExtra) : [];
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

    isDisabled(string) {
      if (typeof string !== 'string') {
        return false;
      }
      return string.includes('auto_increment');
    },

    isRequired(nullValue) {
      return nullValue === 'NO';  // Se "NO", il campo è richiesto
    },

    // Funzione per ottenere il tipo di dato della colonna selezionata
    getTipo(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listTipo[index] || '' : '';
    },

    // Funzione per ottenere il valore di default della colonna selezionata
    getDefault(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listDefault[index] || '' : '';
    },

    // Funzione per ottenere il valore "extra" della colonna selezionata
    getExtra(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listExtra[index] || '' : '';
    },

    // Funzione per ottenere il valore "null" della colonna selezionata
    getNull(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listNull[index] || 'YES' : 'YES';  // Se "NO", è richiesto
    },

    updateQuery() {
      console.log("update query");
      if (this.selectedColumns.length > 0) {
        let setClauses = this.selectedColumns.map((col, index) => `t1.${col} = '${this.updateValues[index]}'`).join(', ');


        let whereClause = '';
        if (this.whereConditions.length) {
          const whereClauses = this.whereConditions
              .filter(cond => cond.column && cond.value)
              .map(cond => `${cond.table}.${cond.column} ${cond.operator} '${cond.value}'`);
          if (whereClauses.length) {
            whereClause += ` WHERE ${whereClauses.join(' AND ')}`;
          }
        }

        let joinClause = '';
        this.joins.forEach((join, index) => {
          if (join.joinTable) {
            joinClause += ` ${join.tipoJoin} JOIN ${join.joinTable} t${index + 2}`;
            if (join.joinConditions && Array.isArray(join.joinConditions)) {
              console.log("join.joinConditions: " + join.joinConditions);
              const joinConditions = join.joinConditions
                  .filter(cond => cond.varT1 && cond.varT2)
                  .map(cond => `t1.${cond.varT1} ${cond.operator} t${index + 2}.${cond.varT2}`);

              if (joinConditions.length) {
                joinClause += ` ON ${joinConditions.join(' AND ')}`; // Utilizza AND per unire le condizioni
              }
            }
          }
        });
        this.query = `UPDATE ${localStorage.getItem('tableName')} t1 SET ${setClauses} ${whereClause} ${joinClause} `;
        console.log("query: " + this.query);
      } else {
        console.log("no query");
        this.query = '';
      }
    },

    async executeQuery() {
      // Logica per eseguire la query di aggiornamento
      console.log("update query");
      console.log(this.query);

      const response = await updateRecords({
        url: localStorage.getItem("url"),
        database: localStorage.getItem("databaseName"),
        porta: localStorage.getItem("port"),
        fusoOrario: localStorage.getItem("fusoorario"),
        tabella: this.joinTable,
        username: localStorage.getItem("usernameDB"),
        password: localStorage.getItem("passwordDB")
      }, this.query);

      console.log(response);
    }
  }
};
</script>


<style scoped>
.column-selection {
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* Aggiunto un'ombra leggera */
  transition: background-color 0.3s;
  /* Transizione per il colore di sfondo */
}

.column-selection:hover {
  background-color: #f1f1f1;
  /* Cambia colore al passaggio del mouse */
}

.checkbox-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  /* Spazio tra gli elementi */
}

button {
  margin-top: 10px;
}


.input-container {
  display: flex;
  flex-wrap: wrap;
  /* Permette di andare a capo */
  gap: 15px;
  /* Spazio tra gli elementi */
}

.input-item {
  flex: 1 1 30%;
  /* Ogni input occupa il 30% della larghezza */
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input {
  width: 100%;
  /* Assicura che l'input occupi l'intera larghezza dell'elemento */
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #007bff;
  /* Cambia il colore del bordo al focus */
  outline: none;
  /* Rimuove l'outline di default */
}


label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  /* Grassetto per le etichette */
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
