<template>
  <div>
    <h3>Inserisci Record</h3>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Form di Inserimento -->
      <form @submit.prevent="executeQuery">
        <div class="form-row">
          <div v-for="column in availableColumns" :key="column" class="form-group">
            <label :for="column">{{ column }}</label>
            <input
                v-model="newRecord[column]"
                :id="column"
                :type="getTipo(column)"
                :placeholder="'Inserisci ' + column"
                @input="updateQuery"
            />
          </div>
        </div>


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





        <!-- Query generata -->
        <div v-if="query">
          <h3>Query Generata</h3>
          <pre>{{ currentQuery }}</pre>
        </div>

        <button type="submit">Inserisci Record</button>
      </form>

    </div>
  </div>
</template>


<script>
import {insertRecordsOracle} from '@/stores/InsertStore';
import {loadColumnsJoinOracle} from '@/stores/ColonneStore';
import OnlyJoinConnection from "@/components/oracle/query/sub/OnlyJoinConnection.vue";

export default {
  name: 'InsertComponent',
  components: {OnlyJoinConnection},
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

  created() {
    const storedColumns = localStorage.getItem('availableColumnsOracle');
    const storedTipo = localStorage.getItem('tipoOracle');

    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    this.listTipo = storedTipo ? JSON.parse(storedTipo) : [];
    this.resetForm();
  },
  methods: {
    handleJoinsUpdate(updatedJoins) {
      this.joins = updatedJoins;
      this.updateQuery(); // Aggiorna la query se necessario
    },

    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
    },


    resetForm() {
      this.newRecord = {};
      this.availableColumns.forEach((column) => {
        this.newRecord[column] = '';
      });
    },

    addWhereCondition() {
      this.whereConditions.push({
        table: 't1',   // Impostiamo come default la tabella principale
        column: '',    // Colonna inizialmente vuota
        operator: '=', // Operatore predefinito
        value: ''      // Valore predefinito
      });
    },

    // Rimuove una condizione WHERE
    removeWhereCondition(index) {
      this.whereConditions.splice(index, 1);
      this.updateQuery(); // Aggiorna la query dopo la rimozione
    },

    getTipo(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listTipo[index] || '' : '';
    },

    async fetchJoinColumns() {
      if (!this.joinTable) return;

      try {
        const columns = await loadColumnsJoinOracle({
          url: localStorage.getItem("urlOracle"),
          database: localStorage.getItem("databaseNameOracle"),
          porta: localStorage.getItem("portOracle"),
          fusoOrario: localStorage.getItem("fusoorarioOracle"),
          tabella: this.joinTable,
          username: localStorage.getItem("usernameDBOracle"),
          password: localStorage.getItem("passwordDBOracle"),
        });
        this.availableJoinColumns = columns;
      } catch (error) {
        console.error('Errore durante il caricamento delle colonne di JOIN:', error);
        this.availableJoinColumns = [];
      }
    },

    addJoinCondition() {
      this.joinConditions.push({
        type: 'type1', // Tipo predefinito
        varT1: '',
        operator: '<',
        varT2: '',
        valueT1: '',
        valueT2: '',
      });
    },

    async connectToDbJoin() {
      if (!this.joinTable) {
        console.error('Nome tabella non fornito');
        return;
      }

      try {
        const columns = await loadColumnsJoinOracle({
          url: localStorage.getItem("urlOracle"),
          database: localStorage.getItem("databaseNameOracle"),
          porta: localStorage.getItem("portOracle"),
          fusoOrario: localStorage.getItem("fusoorarioOracle"),
          tabella: this.joinTable,
          username: localStorage.getItem("usernameDBOracle"),
          password: localStorage.getItem("passwordDBOracle")
        });

        if (columns) {
          this.availableJoinColumns = columns; // Aggiorna con le colonne trovate
          this.updateQuery();
        } else {
          throw new Error('Nessuna colonna trovata.');
        }
      } catch (error) {
        this.connectionError = error.message; // Gestione dell'errore
        this.availableJoinColumns = [];       // Reset delle colonne disponibili in caso di errore
        console.error('Errore durante il caricamento delle colonne di JOIN:', error);
      }
    },

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
      this.updateQuery();
    },

    updateQuery() {


      const filteredColumns = Object.keys(this.newRecord).filter(
          (key) => this.newRecord[key] !== null && this.newRecord[key] !== ''
      );
      const filteredValues = filteredColumns.map((column) => {
        const value = this.newRecord[column];
        return this.listTipo[this.availableColumns.indexOf(column)] === 'VARCHAR2' || this.listTipo[this.availableColumns.indexOf(column)] === 'TEXT'
            ? `'${value}'`
            : this.listTipo[this.availableColumns.indexOf(column)] === 'DATE'
                ? `TO_DATE('${value}', 'YYYY-MM-DD 00:00:00')`
                : value;

      });

      let query = `INSERT INTO ${localStorage.getItem('tableNameOracle')} t1 (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')})`;
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



      this.query = query;
    },

    getJoinCondition(condition) {
      if (condition.type === 'type1') {
        return `t1.${condition.varT1} ${condition.operator} t2.${condition.varT2}`;
      } else if (condition.type === 'type2') {
        return `t1.${condition.varT1} = '${condition.valueT1}'`;
      } else if (condition.type === 'type3') {
        return `t2.${condition.varT2} = '${condition.valueT2}'`;
      }
    },

    async executeQuery() {
      const query = this.generatedQuery;
      if (!query) return;

      console.log('Esecuzione della query:', this.query);

      try {
        const response = await insertRecordsOracle({
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
      } catch (error) {
        console.error('Errore durante l\'inserimento:', error);
        this.results = 'Errore durante l\'inserimento dei dati';
      }
    }
  }
};
</script>


<style scoped>
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.form-group {
  flex: 1 1 calc(33.33% - 10px); /* Occupare 1/3 della larghezza, meno il gap */
  box-sizing: border-box;
}


label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px;
  margin-top: 10px;
  padding-bottom: 10px;
}


@media (max-width: 900px) {
  .form-group {
    flex: 1 1 70%;

  }

}


@media (max-width: 900px) {
  .form-group {
    flex: 1 1 70%;

  }
}


</style>
