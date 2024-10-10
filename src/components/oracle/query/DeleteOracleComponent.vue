<template>
  <div>
    <h3>Elimina Record</h3>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne -->


      <!-- Selezione LEFT JOIN -->
      <div @change="updateQuery">
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

      <!-- Pulsante per eseguire eliminazione -->
      <button @click="executeDelete" >Esegui Eliminazione</button>

      <div v-if="results">
        <h3>Risultati Eliminazione</h3>
        <p>{{ results }}</p>
      </div>

      <!-- Mostra i risultati prima dell'eliminazione -->
      <div v-if="showPreview">
        <h3>Anteprima dei Record da Eliminare:</h3>
        <table>
          <thead>
          <tr>
            <th v-for="column in selectedColumns" :key="column">{{ column }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(result, index) in previewResults" :key="index">
            <td v-for="column in selectedColumns" :key="column">{{ result[column] }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Visualizzazione della query in tempo reale -->
      <div>
        <h4>Query Generata:</h4>
        <pre>{{ deleteQuery }}</pre>
      </div>
    </div>
  </div>
</template>


<script>

import {loadColumnsJoinOracle} from '@/stores/ColonneStore';
import {deleteRecordsOracle} from '@/stores/DeleteStore';

export default {
  name: 'DeleteComponent',
  data() {
    return {
      tipoJoin: '',
      whereConditions: [               // Condizioni WHERE dinamiche
        {
          table: 't1',                 // Tabella (t1 = principale, t2 = join)
          column: '',                  // Colonna selezionata
          operator: '=',               // Operatore di confronto
          value: '',                   // Valore di confronto
        }
      ],
      availableColumns: [],           // Colonne disponibili
      selectedColumns: [],            // Colonne selezionate per i risultati
      whereCondition: '',             // Condizione WHERE
      results: null,                  // Risultati dell'eliminazione
      showPreview: false,             // Flag per mostrare l'anteprima
      previewResults: [],             // Risultati dell'anteprima
      useLeftJoin: false,             // Flag per utilizzare LEFT JOIN
      joinTable: '',                  // Nome della tabella per il LEFT JOIN
      availableJoinColumns: [],       // Colonne disponibili nella tabella di JOIN
      selectedJoinColumns: [],        // Colonne selezionate dalla tabella di JOIN
      joinCondition: {                // Condizione JOIN semplificata
        varT1: '',                    // Prima colonna (tabella principale)
        operator: '=',                // Operatore
        varT2: ''                     // Seconda colonna (tabella di JOIN)
      },
      deleteQuery: '',                // Query generata
    };
  },
  created() {
    const storedColumns = localStorage.getItem('availableColumnsOracle');
    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    this.updateQuery();
  },
  computed: {
    areAllSelectedJoin() {
      return this.selectedJoinColumns.length === this.availableJoinColumns.length;
    },
    areAllSelected() {
      return this.selectedColumns.length === this.availableColumns.length;
    },
  },
  methods: {

    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
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

      // Controllo se ci sono condizioni di JOIN
      if (this.useLeftJoin && this.joinTable) {
        // Aggiunta della condizione EXISTS per il JOIN
        baseQuery += ` WHERE EXISTS ( SELECT 1 FROM ${this.joinTable} t2`;

        // Aggiunta della condizione di JOIN
        if (this.joinCondition.varT1 && this.joinCondition.varT2) {
          baseQuery += ` WHERE t1.${this.joinCondition.varT1} ${this.joinCondition.operator} t2.${this.joinCondition.varT2}`;
        }

        baseQuery += ')'; // Chiusura della sottoquery EXISTS
      }

      // Aggiungi le condizioni WHERE se ci sono
      if (this.whereConditions.length) {
        const whereClauses = this.whereConditions
            .filter(cond => cond.column && cond.value) // Filtro per condizioni valide
            .map(cond => `t1.${cond.column} ${cond.operator} ${cond.value}`); // Usa t1 per riferirsi alla tabella principale

        // Controlla se ci sono clausole WHERE aggiuntive e uniscile con AND
        if (whereClauses.length) {
          if (this.useLeftJoin && this.joinTable) {
            // Se c'è già una clausola WHERE per EXISTS, aggiungi AND
            baseQuery += ` AND ${whereClauses.join(' AND ')}`;
          } else {
            // Altrimenti, inizia una nuova clausola WHERE
            baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
          }
        }
      }

      this.deleteQuery = baseQuery; // Salva la query finale
    },


    async executeDelete() {
      const response = await deleteRecordsOracle({
        url: localStorage.getItem("urlOracle"),
        database: localStorage.getItem("databaseNameOracle"),
        porta: localStorage.getItem("portOracle"),
        fusoOrario: localStorage.getItem("fusoorarioOracle"),
        tabella: localStorage.getItem('tableNameOracle'), // Utilizza la tabella di cui è stata caricata la struttura
        username: localStorage.getItem("usernameDBOracle"),
        password: localStorage.getItem("passwordDBOracle")
      }, this.deleteQuery);

      console.log(response);
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
  