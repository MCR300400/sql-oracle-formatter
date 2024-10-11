<template>
  <div>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne della prima tabella -->
      <div>
        <label for="selectedColumns">Seleziona Colonne:</label>
        <div @change="updateQuery">
          <input type="checkbox" id="selectAll" @change="toggleSelectAll" :checked="areAllSelected"/>
          <label for="selectAll">Seleziona Tutte</label>
          <div class="checkbox-container">
            <div v-for="column in availableColumns" :key="column" class="checkbox-item" @change="updateQuery">
              <input type="checkbox" :value="column" v-model="selectedColumns" :id="column"/>
              <label :for="column">{{ column }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Selezione LEFT JOIN -->
      <div>
        <label for="leftJoin">Vuoi fare un JOIN?</label>
        <input type="checkbox" v-model="useLeftJoin" id="leftJoin" @change="updateQuery"/>
      </div>

      <!-- Form aggiuntivo per il LEFT JOIN -->
      <div v-if="useLeftJoin">
        <h3>Dettagli JOIN</h3>
        <div @change="updateQuery">
          <label for="tipoJoin">TIPOLOGIA JOIN:</label>
          <select v-model="tipoJoin" id="tipoJoin">
            <option disabled value="">Seleziona il tipo del join</option>
            <option v-for="item in joinList" :key="item.id" :value=item> {{ item }}</option>
          </select>
        </div>
        <div>
          <label for="joinTable">Nome Tabella per il JOIN:</label>
          <input type="text" v-model="joinTable" id="joinTable" placeholder="Inserisci nome tabella"/>
        </div>
        <button @click="connectToDbJoin" :disabled="!joinTable">Cerca Colonne Join</button>

        <!-- Se ci sono colonne della tabella di JOIN disponibili -->
        <div v-if="availableJoinColumns.length" @change="updateQuery">
          <label for="joinColumns">Colonne della Tabella JOIN:</label>
          <input type="checkbox" id="selectAll" @change="toggleSelectAllJoin" :checked="areAllSelectedJoin"/>
          <label for="selectAll">Seleziona Tutte</label>
          <div class="checkbox-container">
            <div v-for="column in availableJoinColumns" :key="column" class="checkbox-item">
              <input type="checkbox" :value="column" v-model="selectedJoinColumns" :id="'join_' + column"/>
              <label :for="'join_' + column">{{ column }}</label>
            </div>
          </div>
        </div>

        <!-- Sezione per le condizioni di JOIN -->
        <div v-if="joinTable != null && availableJoinColumns.length">
          <h4>Condizione di JOIN</h4>
          <div class="join-condition">
            <!-- Condizione semplificata (type1) -->
            <select v-model="joinCondition.varT1" @change="updateQuery">
              <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
            </select>
            <select v-model="joinCondition.operator" @change="updateQuery">
              <option value="<">&lt;</option>
              <option value="<=">&lt;=</option>
              <option value="=">=</option>
              <option value=">=">&gt;=</option>
              <option value=">">&gt;</option>
            </select>
            <select v-model="joinCondition.varT2" @change="updateQuery">
              <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Selezione WHERE -->
      <div>
        <h3>Condizioni WHERE (opzionali):</h3>

        <div v-for="(condition, index) in whereConditions" :key="index" class="where-condition">
          <!-- Dropdown per scegliere la tabella (t1 o t2) -->
          <select v-model="condition.table" @change="updateQuery">
            <option value="t1">Tabella Principale (t1)</option>
            <option value="t2" v-if="useLeftJoin && joinTable">Tabella JOIN (t2)</option>
          </select>

          <!-- Dropdown per scegliere la colonna -->
          <select v-if="condition.table === 't1'" v-model="condition.column" @change="updateQuery">
            <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
          </select>
          <select v-else v-model="condition.column" @change="updateQuery">
            <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
          </select>

          <!-- Dropdown per scegliere l'operatore di confronto -->
          <select v-model="condition.operator" @change="updateQuery">
            <option value="=">=</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
            <option value="!=">!=</option>
          </select>

          <!-- Input per il valore da confrontare -->
          <input type="text" v-model="condition.value" placeholder="Inserisci valore" @input="updateQuery" />

          <!-- Pulsante per rimuovere la condizione -->
          <button @click="removeWhereCondition(index)">Rimuovi</button>
        </div>

        <!-- Pulsante per aggiungere una nuova condizione WHERE -->
        <button @click="addWhereCondition">Aggiungi Condizione WHERE</button>
      </div>


      <!-- Pulsante esecuzione query -->
      <button @click="executeQuery" :disabled="!selectedColumns.length">Esegui Query</button>

      <!-- Mostra query formata -->
      <div v-if="query">
        <h3>Query Formata:</h3>
        <p>{{ query }}</p>
      </div>
    </div>

    <!-- Visualizzazione dei dati (se presente) -->
    <div v-if="bodyData && bodyData.length">
      <h3>Tabella con i Dati estratti con la query</h3>

      <!-- Filtro di ricerca -->
      <div class="search-filter">
        <label for="searchColumn">Seleziona colonna:</label>
        <select v-model="selectedColumn" id="searchColumn">
          <option disabled value="">Scegli una colonna</option>
          <option v-for="(value, key) in bodyData[0]" :key="key" :value="key">{{ key }}</option>
        </select>
        <input type="text" v-model="searchValue" placeholder="Cerca valore..."/>
      </div>
      <div class="table-container">
        <table>
          <thead>
          <tr>
            <th v-for="(value, key) in bodyData[0]" :key="key">{{ key }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, rowIndex) in paginatedData" :key="rowIndex">
            <td v-for="(value, key) in row" :key="key">{{ value }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginazione -->
      <div v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">Precedente</button>
        <span>Pagina {{ currentPage }} di {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Successiva</button>
      </div>
    </div>
  </div>
</template>
<script>
import {loadColumnsJoinOracle} from '@/stores/ColonneStore';
import {selectRecordsOracle} from '@/stores/SelectStore';

export default {
  name: 'SelectComponent',
  data() {
    return {
      whereConditions: [               // Condizioni WHERE dinamiche
        {
          table: 't1',                 // Tabella (t1 = principale, t2 = join)
          column: '',                  // Colonna selezionata
          operator: '=',               // Operatore di confronto
          value: '',                   // Valore di confronto
        }
      ],
      availableColumns: [],            // Colonne della tabella principale
      selectedColumns: [],             // Colonne selezionate dalla tabella principale
      whereCondition: '',              // Condizione WHERE
      results: [],                     // Risultati della query
      query: '',                       // Query formata
      useLeftJoin: false,              // Se usare o no il LEFT JOIN
      joinTable: '',                   // Nome della tabella per il JOIN
      availableJoinColumns: [],        // Colonne della tabella di JOIN
      selectedJoinColumns: [],         // Colonne selezionate dalla tabella di JOIN
      connectionError: '',             // Errore di connessione (se presente)
      joinCondition: {                // Condizione JOIN semplificata
        varT1: '',                    // Prima colonna (tabella principale)
        operator: '=',                // Operatore
        varT2: ''                     // Seconda colonna (tabella di JOIN)
      },            // Array per memorizzare le condizioni di JOIN
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
      return this.selectedJoinColumns.length === this.availableJoinColumns.length;
    },


    allSelectedColumns() {
      const formattedMainColumns = this.selectedColumns.map(col => `t1.${col}`);
      const formattedJoinColumns = this.selectedJoinColumns.map(col => `t2.${col}`);
      return [...formattedMainColumns, ...formattedJoinColumns];
    },
  },

  methods: {
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

    toggleSelectAll(event) {
      this.selectedColumns = event.target.checked ? [...this.availableColumns] : [];
    },

    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
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

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
    },

    getJoinCondition(index) {
      const condition = this.joinConditions[index];
      if (condition.type === 'type1') {
        return `t1.${condition.varT1} ${condition.operator} t2.${condition.varT2}`;
      } else if (condition.type === 'type2') {
        return `t1.${condition.varT1} = '${condition.valueT1}'`;
      } else if (condition.type === 'type3') {
        return `t2.${condition.varT2} = '${condition.valueT2}'`;
      }
      return ''; // Default case
    },

    updateQuery() {

      let query = "SELECT " + this.selectedColumns.map(column => 't1.' + column).join(', ');
      if (this.useLeftJoin && this.joinTable && this.selectedJoinColumns) {
        query += ", " + this.selectedJoinColumns.map(column => 't2.' + column).join(', ');
      }
      query += ` FROM ${localStorage.getItem('tableNameOracle')} t1`;
      if (this.useLeftJoin && this.joinTable) {
        query += ` ${this.tipoJoin} JOIN ${this.joinTable} t2`;
        if (this.joinCondition.varT1 && this.joinCondition.varT2) {
          query += ` ON t1.${this.joinCondition.varT1} ${this.joinCondition.operator} t2.${this.joinCondition.varT2}`;
        }
      }

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