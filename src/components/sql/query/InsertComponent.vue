<template>
  <div>
    <h3>Inserisci Record</h3>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Form di Inserimento -->
      <form @submit.prevent="executeInsert">
        <div v-for="column in availableColumns" :key="column" class="form-group">
          <label :for="column">{{ column }}</label>
          <input
            v-model="newRecord[column]"
            :id="column"
            type="text"
            :placeholder="'Inserisci ' + column"
            @input="updateQuery"
          />
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
import { insertRecords } from '@/stores/InsertStore.js'; // Supponendo che questa funzione gestisca l'inserimento

export default {
  name: 'InsertComponent',
  data() {
    return {
      availableColumns: [], // Colonne disponibili nella tabella
      newRecord: {}, // Dati del nuovo record da inserire
      results: null, // Risultati dell'operazione di inserimento
      generatedQuery: '', // Query generata dinamicamente
    };
  },
  created() {
    const storedColumns = localStorage.getItem('availableColumns');
    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    this.resetForm(); // Inizializza newRecord
  },
  methods: {
    resetForm() {
      this.newRecord = {};
      this.availableColumns.forEach((column) => {
        this.newRecord[column] = ''; // Inizializza ogni campo del form
      });
    },

    updateQuery() {
      const tableName = localStorage.getItem('tableName');
      if (!tableName || !Object.keys(this.newRecord).length) {
        console.error('Errore: nome tabella o dati non forniti');
        return;
      }

      // Filtra le colonne e i valori per escludere quelli nulli
      const filteredColumns = Object.keys(this.newRecord).filter(
        (key) => this.newRecord[key] !== null && this.newRecord[key] !== ''
      );
      const filteredValues = filteredColumns.map((column) => `${this.newRecord[column]}`);

      if (filteredColumns.length === 0) {
        console.error("Errore: nessun dato valido per l'inserimento");
        return;
      }

      const columns = filteredColumns.join(', ');
      const values = filteredValues.join(', ');

      this.generatedQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
    },

    async executeInsert() {
      if (!this.generatedQuery) {
        console.error('Errore: query non generata');
        return;
      }

      const response = await insertRecords({
        url: localStorage.getItem("url"),
        database: localStorage.getItem("databaseName"),
        porta: localStorage.getItem("port"),
        fusoOrario: localStorage.getItem("fusoorario"),
        tabella: localStorage.getItem('tableName'), // Utilizza la tabella di cui è stata caricata la struttura
        username: localStorage.getItem("usernameDB"),
        password: localStorage.getItem("passwordDB")
      }, this.generatedQuery);

      this.results = response; // Mostra i risultati
      console.log(response);
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
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
}
</style>
