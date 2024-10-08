<template>
  <div>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne da aggiornare -->
      <div>
        <label for="updateColumns">Seleziona Colonne da Aggiornare:</label>
        <input type="checkbox" id="selectAll" @change="toggleSelectAll" :checked="areAllSelected" />
        <label for="selectAll">Seleziona Tutte</label>
        <div @change="generateUpdateQuery">
          <div class="checkbox-container">
            <div v-for="(column, index) in availableColumns" :key="column" class="checkbox-item">
              <input type="checkbox" :value="column" v-model="selectedUpdateColumns" :id="'update_' + column"
                @change="generateUpdateQuery(index)" />
              <label :for="'update_' + column"> {{ column }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Input per i valori da aggiornare -->
      <div class="input-container">
        <div v-for="(column, index) in selectedUpdateColumns" :key="column" class="input-item">
          <label>{{ column }}</label>
          <input :type="getTipo(column)" v-model="updateValues[index]" :id="'value_' + column"
            :placeholder="getDefault(column)" :disabled="isDisabled(getExtra(column))"
            :required="isRequired(getNull(column))" @input="generateUpdateQuery" />
        </div>
      </div>

      <!-- Sezione per le condizioni WHERE -->
      <div v-if="!useLeftJoin">
        <label for="whereCondition">Condizione WHERE (opzionale):</label>
        <input type="text" v-model="whereCondition" id="whereCondition" placeholder="es. id = 1"
          @input="generateUpdateQuery" />
      </div>

      <!-- Checkbox per abilitare il LEFT JOIN -->
      <div>
        <input type="checkbox" v-model="useLeftJoin" id="useLeftJoin" @change="generateUpdateQuery" />
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
        <div class="checkbox-container">
          <div v-for="column in availableJoinColumns" :key="column" class="checkbox-item">
            <input type="checkbox" :value="column" v-model="selectedJoinColumns" :id="'join_' + column"
              @change="generateUpdateQuery" />
            <label :for="'join_' + column">{{ column }}</label>
          </div>
        </div>
      </div>
      <div>
        <div>
          <h4 v-if="useLeftJoin">Condizioni di JOIN</h4>
          <button @click="addJoinCondition" v-if="useLeftJoin">Aggiungi Condizione</button>
          <div v-for="(condition, index) in joinConditions" :key="index">
            <select v-model="condition.type" @change="generateUpdateQuery">
              <option value="type1">Formato 1</option>
              <option value="type2">Formato 2</option>
              <option value="type3">Formato 3</option>
            </select>

            <div v-if="condition.type === 'type1'" @change="generateUpdateQuery">
              <select v-model="condition.varT1">
                <option v-for="column in selectedUpdateColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <select v-model="condition.operator">
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value="=">=</option>
                <option value=">=">&gt;=</option>
                <option value=">">&gt;</option>
              </select>
              <select v-model="condition.varT2">
                <option v-for="column in selectedJoinColumns" :key="column" :value="column">{{ column }}</option>
              </select>
            </div>

            <div v-if="condition.type === 'type2'" @change="generateUpdateQuery">
              <select v-model="condition.varT1">
                <option v-for="column in selectedUpdateColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <input type="text" v-model="condition.valueT1" placeholder="Valore" />
            </div>

            <div v-if="condition.type === 'type3'" @change="generateUpdateQuery">
              <select v-model="condition.varT2">
                <option v-for="column in selectedJoinColumns" :key="column" :value="column">{{ column }}</option>
              </select>
              <input type="text" v-model="condition.valueT2" placeholder="Valore" />
            </div>

            <button @click="removeJoinCondition(index)">Rimuovi Condizione</button>
          </div>
        </div>
      </div>

      <!-- Pulsante esecuzione query -->
      <button @click="executeUpdate" :disabled="!selectedUpdateColumns.length || !allValuesProvided">Esegui
        Aggiornamento</button>

      <!-- Mostra query formata -->
      <div v-if="query">
        <h3>Query Formata:</h3>
        <p>{{ query }}</p>
      </div>
    </div>

    <!-- Risultati dell'operazione -->
    <div v-if="results.length">
      <h3>Risultati dell'Aggiornamento</h3>
      <p>{{ resultsMessage }}</p>
    </div>
  </div>
</template>

<script>
import { loadColumnsJoin } from '../../../stores/ColonneStore.js';
import { updateRecords } from '../../../stores/UpdateStore.js';

export default {
  name: 'UpdateComponent',
  components: {

  },
  data() {
    return {
      availableColumns: [],            // Colonne della tabella principale
      availableJoinColumns: [],        // Colonne della tabella di JOIN
      selectedUpdateColumns: [],       // Colonne selezionate da aggiornare
      selectedJoinColumns: [],         // Colonne selezionate dalla tabella di JOIN
      updateValues: [],                // Valori da impostare per le colonne selezionate
      whereCondition: '',              // Condizione WHERE
      joinTable: '',                   // Nome della tabella da unire
      useLeftJoin: false,              // Stato per l'uso di LEFT JOIN
      joinConditions: [],              // Condizioni di JOIN
      query: '',                       // Query formata
      results: [],                     // Risultati dell'operazione
      resultsMessage: '',
      listTipo: [],
      listNull: [],
      listKey: [],
      listDefault: [],
      listExtra: [],
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
    allValuesProvided() {
      return this.updateValues.length === this.selectedUpdateColumns.length && this.updateValues.every(value => value !== '');
    },


  },




  methods: {
    toggleSelectAll(event) {
      this.selectedUpdateColumns = event.target.checked ? [...this.availableColumns] : [];
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

    async fetchColumns() {
      // Logica per recuperare le colonne dal database
      const columns = await loadColumnsJoin({
        url: localStorage.getItem("url"),
        database: localStorage.getItem("databaseName"),
        porta: localStorage.getItem("port"),
        fusoOrario: localStorage.getItem("fusoorario"),
        tabella: localStorage.getItem("tableName"),
        username: localStorage.getItem("usernameDB"),
        password: localStorage.getItem("passwordDB")
      });
      this.availableColumns = columns;
    },

    async fetchJoinColumns() {
      if (!this.joinTable) return;

      try {
        const columns = await loadColumnsJoin({
          url: localStorage.getItem("url"),
          database: localStorage.getItem("databaseName"),
          porta: localStorage.getItem("port"),
          fusoOrario: localStorage.getItem("fusoorario"),
          tabella: this.joinTable,
          username: localStorage.getItem("usernameDB"),
          password: localStorage.getItem("passwordDB")
        });
        this.availableJoinColumns = columns;
      } catch (error) {
        console.error('Errore durante il caricamento delle colonne di JOIN:', error);
        this.availableJoinColumns = []; // Reset in caso di errore
      }
    },


    generateUpdateQuery() {
      if (this.useLeftJoin) {
        this.whereCondition = '';
      } else {
        this.availableJoinColumns = [],
          this.selectedJoinColumns = [];
        this.joinConditions = [];
      }
      if (this.selectedUpdateColumns.length > 0) {
        const setClauses = this.selectedUpdateColumns.map((col, index) => `t1.${col} = '${this.updateValues[index]}'`).join(', ');
        const whereClause = this.whereCondition ? ` WHERE ${this.whereCondition}` : '';

        let joinClause = '';
        if (this.useLeftJoin && this.joinTable && this.selectedJoinColumns.length > 0) {
          const joinConditions = this.joinConditions.map(condition => this.getJoinCondition(condition)).join(' AND ');
          joinClause = ` LEFT JOIN ${this.joinTable} AS t2 ON ${joinConditions}`;
        }

        this.query = `UPDATE ${localStorage.getItem('tableName')} AS t1 SET ${setClauses}${joinClause}${whereClause};`;
      } else {
        this.query = '';
      }
    },

    getJoinCondition(condition) {
      if (condition.type === 'type1') {
        return `t1.${condition.varT1} ${condition.operator} t2.${condition.varT2}`;
      } else if (condition.type === 'type2') {
        return `t1.${condition.varT1} = '${condition.valueT1}'`;
      } else if (condition.type === 'type3') {
        return `t2.${condition.varT2} = '${condition.valueT2}'`;
      }
      return '';
    },

    addJoinCondition() {
      this.joinConditions.push({ type: 'type1', varT1: '', operator: '=', varT2: '' });
      this.generateUpdateQuery();
    },

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
      this.generateUpdateQuery();
    },

    async executeUpdate() {
      // Logica per eseguire la query di aggiornamento


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
