<template>
    <div>
      <h2>Connessione al Database</h2>
      <form @submit.prevent="connectToDb">
        <div class="form-grid">
          <div>
            <label for="url">URL:</label>
            <input type="text" v-model="url" id="url" placeholder="Inserisci l'URL" required />
          </div>
  
          <div>
            <label for="databaseName">Nome Database:</label>
            <input type="text" v-model="databaseName" id="databaseName" placeholder="Inserisci nome database" required />
          </div>
  
          <div>
            <label for="port">Porta:</label>
            <input type="number" v-model="port" id="port" placeholder="Inserisci porta" required />
          </div>
  
          <div>
            <label for="fusoorario">Fuso Orario:</label>
            <select v-model="fusoorario" id="fusoorario" required>
                <option disabled value="">Seleziona il fuso orario</option>
                <option v-for="item in fusoOrarioList" :key="item.id" :value="item"> {{ item }}</option>
            </select>
          </div>
  
          <div>
            <label for="tableName">Nome Tabella:</label>
            <input type="text" v-model="tableName" id="tableName" placeholder="Inserisci nome tabella" required />
          </div>
  
          <div>
            <label for="usernameDB">Username:</label>
            <input type="text" v-model="usernameDB" id="usernameDB" placeholder="Inserisci username" required />
          </div>
  
          <div>
            <label for="passwordDB">Password:</label>
            <input type="password" v-model="passwordDB" id="passwordDB" placeholder="Inserisci password" required />
          </div>
        </div>
  
        <button type="submit">Connetti</button>
        <div v-if="connectionError" style="color: red;">{{ connectionError }}</div>
      </form>
  
  
    </div>
  </template>
  
  <script>
  import { loadColumnsDefaultOracle, loadColumnsLengthOracle, loadColumnsNullOracle, loadColumnsOracle, loadColumnsTipoOracle } from '../../stores/ColonneStore.js';
  
  export default {
    name: 'DbConnectionComponent',
    data() {
      return {
        fusoOrarioList: [
          "Europe/Rome",
          "Europe/London",
          "Europe/Berlin",
          "Europe/Paris",
          "Europe/Madrid",
          "Europe/Amsterdam",
          "Europe/Athens",
          "Europe/Brussels",
          "Europe/Budapest",
          "Europe/Copenhagen",
          "Europe/Dublin",
          "Europe/Helsinki",
          "Europe/Lisbon",
          "Europe/Moscow",
          "Europe/Oslo",
          "Europe/Stockholm",
          "Europe/Vienna",
          "Europe/Warsaw",
          "Europe/Zurich",
  
          "America/New_York",
          "America/Chicago",
          "America/Denver",
          "America/Los_Angeles",
          "America/Toronto",
          "America/Vancouver",
          "America/Mexico_City",
          "America/Sao_Paulo",
          "America/Buenos_Aires",
          "America/Santiago",
          "America/Bogota",
          "America/Lima",
  
          "Asia/Tokyo",
          "Asia/Seoul",
          "Asia/Shanghai",
          "Asia/Hong_Kong",
          "Asia/Singapore",
          "Asia/Kolkata",
          "Asia/Dubai",
          "Asia/Bangkok",
          "Asia/Jakarta",
  
          "Africa/Cairo",
          "Africa/Johannesburg",
          "Africa/Lagos",
          "Africa/Nairobi",
          "Africa/Casablanca",
  
          "Australia/Sydney",
          "Australia/Melbourne",
          "Australia/Brisbane",
          "Australia/Perth",
          "Australia/Adelaide",
  
          "Pacific/Auckland",
          "Pacific/Fiji",
          "Pacific/Honolulu",
          "Pacific/Tahiti",
  
          "UTC",
          "GMT",
          "Etc/UTC"
        ],
        url: '',
        databaseName: '',
        port: '',
        fusoorario: '',
        tableName: '',
        usernameDB: '',
        passwordDB: '',
        connectionError: '',
        columnsAvailable: false
      };
    },
    methods: {
      connectToDb() {
        // Salva i dati nel localStorage
        localStorage.setItem('urlOracle', this.url);
        localStorage.setItem('databaseNameOracle', this.databaseName);
        localStorage.setItem('portOracle', this.port);
        localStorage.setItem('fusoorarioOracle', this.fusoorario);
        localStorage.setItem('tableNameOracle', this.tableName);
        localStorage.setItem('usernameDBOracle', this.usernameDB);
        localStorage.setItem('passwordDBOracle', this.passwordDB);
  
        const connectionDetails = {
          url: this.url,
          database: this.databaseName,
          porta: this.port,
          fusoOrario: this.fusoorario,
          tabella: this.tableName,
          username: this.usernameDB,
          password: this.passwordDB
        };
  
        // Chiama la funzione nel ColonneStore

        
        loadColumnsOracle(connectionDetails);
        loadColumnsTipoOracle(connectionDetails);
        loadColumnsNullOracle(connectionDetails);
        loadColumnsLengthOracle(connectionDetails);
        loadColumnsDefaultOracle(connectionDetails)
        .then(columns => {
            if (columns) {
              this.columnsAvailable = true; // Imposta la disponibilità delle colonne
              this.$emit('connection-status', true); // Emette l'evento di successo
            } else {
              throw new Error('Nessuna colonna trovata.');
            }
          })
          .catch(error => {
            this.connectionError = error.message; // Gestione dell'errore
            this.columnsAvailable = false; // Colonne non disponibili
            this.$emit('connection-status', false); // Emette l'evento di errore
          });
      }
    },
    mounted() {
      // Carica i dati dal localStorage se esistono
      this.url = localStorage.getItem('urlOracle') || '';
      this.databaseName = localStorage.getItem('databaseNameOracle') || '';
      this.port = localStorage.getItem('portOracle') || '';
      this.fusoorario = localStorage.getItem('fusoorarioOracle') || '';
      this.tableName = localStorage.getItem('tableNameOracle') || '';
      this.usernameDB = localStorage.getItem('usernameDBOracle') || '';
      this.passwordDB = localStorage.getItem('passwordDBOracle') || '';
    }
  };
  </script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* 7 colonne su schermi grandi */
  grid-template-rows: auto;
  gap: 15px;
  /* Spazio tra i campi */
}

.form-grid div {
  grid-column: span 1;
  /* Ogni campo occupa una colonna */
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
select {
  margin-bottom: 15px;
  padding: 10px;
  width: 100%;
}

button {
  padding: 10px;
}

/* --- Versione Tablet (larghezza max 900px) --- */
@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr);
    /* Riduce a 4 colonne su tablet */
    gap: 10px;
    /* Riduce lo spazio tra i campi */
  }

  .form-grid div {
    grid-column: span 2;
    /* Ogni campo occupa 2 colonne per avere più spazio */
  }
}

/* --- Versione Telefono (larghezza max 600px) --- */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: repeat(1, 1fr);
    /* Una colonna su schermi piccoli */
    gap: 10px;
    /* Riduce lo spazio tra i campi */
  }

  .form-grid div {
    grid-column: span 1;
    /* Ogni campo occupa una colonna intera */
  }

  input,
  select {
    padding: 8px;
    /* Riduce il padding per adattarsi a schermi più piccoli */
  }

  button {
    padding: 10px;
    width: 100%;
    /* Il pulsante occupa il 100% della larghezza su schermi piccoli */
  }
}
</style>
