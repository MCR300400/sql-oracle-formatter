<template>
  <div>
    <h3>Inserisci Record</h3>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Form di Inserimento -->
      <form @submit.prevent="executeInsert">
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

        <!-- Sezione per le condizioni WHERE -->
        <div>
          <label for="whereCondition">Condizione WHERE (opzionale):</label>
          <input type="text" v-model="whereCondition" id="whereCondition" placeholder="es. id = 1"
                 @input="updateQuery" />
        </div>

        <!-- Checkbox per abilitare il LEFT JOIN -->
        <div>
          <input type="checkbox" v-model="useLeftJoin" id="useLeftJoin" @change="updateQuery" />
          <label for="useLeftJoin">Usa LEFT JOIN</label>
        </div>

        <!-- Sezione per il LEFT JOIN -->
        <div v-if="useLeftJoin">
          <label for="joinTable">Tabella per LEFT JOIN:</label>
          <input type="text" v-model="joinTable" id="joinTable" placeholder="Nome della tabella da unire" />
          <button @click="fetchJoinColumns">Cerca colonne tabella join</button>
        </div>

        <div v-if="availableJoinColumns.length && useLeftJoin">
          <label for="joinColumns">Colonne della Tabella JOIN:</label>
          <input type="checkbox" id="selectAll" @change="toggleSelectAllJoin" :checked="areAllSelectedJoin" />
          <label for="selectAll">Seleziona Tutte</label>
          <div class="checkbox-container">
            <div v-for="column in availableJoinColumns" :key="column" class="checkbox-item">
              <input type="checkbox" :value="column" v-model="selectedJoinColumns" :id="'join_' + column"
                     @change="updateQuery" />
              <label :for="'join_' + column">{{ column }}</label>
            </div>
          </div>
        </div>

        <div>
          <h4 v-if="useLeftJoin" @change="updateQuery">Condizioni di JOIN</h4>
          <button @click="addJoinCondition" v-if="useLeftJoin">Aggiungi Condizione</button>
          <div v-for="(condition, index) in joinConditions" :key="index">
            <select v-model="condition.type" @change="updateQuery">
              <option value="type1">Colonna 1 &lt;,&lt;=,=,&gt;=,&gt; Colonna 2</option>
              <option value="type2">Colonna 1 &lt;,&lt;=,=,&gt;=,&gt; Valore</option>
              <option value="type3">Colonna 2 &lt;,&lt;=,=,&gt;=,&gt; Valore</option>
            </select>

            <div v-if="condition.type === 'type1'" @change="updateQuery">
              <select v-model="condition.varT1">
                <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <select v-model="condition.operator">
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value="=">=</option>
                <option value=">=">&gt;=</option>
                <option value=">">&gt;</option>
              </select>
              <select v-model="condition.varT2">
                <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
              </select>
            </div>

            <div v-if="condition.type === 'type2'" @change="updateQuery">
              <select v-model="condition.varT1">
                <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <input type="text" v-model="condition.valueT1" placeholder="Valore" />
            </div>

            <div v-if="condition.type === 'type3'" @change="updateQuery">
              <select v-model="condition.varT2">
                <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <input type="text" v-model="condition.valueT2" placeholder="Valore" />
            </div>

            <button @click="removeJoinCondition(index)">Rimuovi Condizione</button>
          </div>
        </div>

        <!-- Query generata -->
        <div v-if="generatedQuery">
          <h3>Query Generata</h3>
          <pre>{{ generatedQuery }}</pre>
        </div>

        <button type="submit">Inserisci Record</button>
      </form>

      <div v-if="results">
        <h3>Risultati Inserimento</h3>
        <p>{{ results }}</p>
      </div>
    </div>
  </div>
</template>





<script>
import { insertRecordsOracle } from '@/stores/InsertStore';
import { loadColumnsJoinOracle } from '@/stores/ColonneStore';

export default {
  name: 'InsertComponent',
  data() {
    return {
      availableColumns: [],
      newRecord: {},
      results: null,
      generatedQuery: '',
      listTipo: [],
      whereCondition: '',
      useLeftJoin: false,
      joinTable: '',
      availableJoinColumns: [],
      selectedJoinColumns: [],
      joinConditions: [],
    };
  },
  computed: {
    areAllSelectedJoin() {
      return this.selectedJoinColumns.length === this.availableJoinColumns.length;
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
    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
    },
    resetForm() {
      this.newRecord = {};
      this.availableColumns.forEach((column) => {
        this.newRecord[column] = '';
      });
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
      this.joinConditions.push({ type: 'type1', varT1: '', operator: '=', varT2: '' });
      this.updateQuery();
    },

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
      this.updateQuery();
    },

    updateQuery() {
      const tableName = localStorage.getItem('tableNameOracle');
      if (this.useLeftJoin) {
        this.whereCondition = '';
      } else {
        this.joinConditions = [];
      }

      if (!tableName || !Object.keys(this.newRecord).length) {
        console.error('Errore: nome tabella o dati non forniti');
        return;
      }

      const filteredColumns = Object.keys(this.newRecord).filter(
          (key) => this.newRecord[key] !== null && this.newRecord[key] !== ''
      );
      const filteredValues = filteredColumns.map((column) => {
        const value = this.newRecord[column];
        return this.listTipo[this.availableColumns.indexOf(column)] === 'VARCHAR2' || this.listTipo[this.availableColumns.indexOf(column)] === 'TEXT'
            ? `'${value}'`
            : value;
      });



      let query = `INSERT INTO ${tableName} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')})`;

      if (this.useLeftJoin && this.joinTable && this.selectedJoinColumns.length > 0) {
        const joinConditions = this.joinConditions.map(condition => this.getJoinCondition(condition)).join(' AND ');
        query += ` LEFT JOIN ${this.joinTable} ON ${joinConditions}`;
      }

      if (this.whereCondition) {
        query += ` WHERE ${this.whereCondition}`;
      }

      this.generatedQuery = query;
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

    async executeInsert() {
      const query = this.generatedQuery;
      if (!query) return;

      console.log('Esecuzione della query:', this.generatedQuery);

      try {
        const response = await insertRecordsOracle({
          url: localStorage.getItem("urlOracle"),
          database: localStorage.getItem("databaseNameOracle"),
          porta: localStorage.getItem("portOracle"),
          fusoOrario: localStorage.getItem("fusoorarioOracle"),
          tabella: this.joinTable,
          username: localStorage.getItem("usernameDBOracle"),
          password: localStorage.getItem("passwordDBOracle")
        }, this.generatedQuery);
        this.results = response;
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
