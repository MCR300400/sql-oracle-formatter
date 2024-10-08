<template>
    <div>
      <h3>Elimina Record</h3>
      <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
      <div v-else>
        <!-- Selezione delle colonne -->
        <div @change="updateQuery">
          <label for="selectedColumns">Seleziona Colonne da Visualizzare nei Risultati:</label>
          <div >
            <input type="checkbox" id="selectAll" @change="toggleSelectAll" :checked="areAllSelected" />
            <label for="selectAll">Seleziona Tutte</label>
            <div class="checkbox-container">
              <div v-for="column in availableColumns" :key="column" class="checkbox-item">
                <input type="checkbox" :value="column" v-model="selectedColumns" :id="column" />
                <label :for="column">{{ column }}</label>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Selezione LEFT JOIN -->
        <div @change="updateQuery">
          <label for="leftJoin">Vuoi fare un LEFT JOIN?</label>
          <input type="checkbox" v-model="useLeftJoin" id="leftJoin" @change="updateJoinVisibility" />
        </div>
  
        <!-- Form per il LEFT JOIN -->
        <div v-if="useLeftJoin" @change="updateQuery">
          <h3>Dettagli LEFT JOIN</h3>
          <div>
            <label for="joinTable">Nome Tabella per il JOIN:</label>
            <input type="text" v-model="joinTable" id="joinTable" placeholder="Inserisci nome tabella" />
          </div>
          <button @click="connectToDbJoin" :disabled="!joinTable">Cerca Colonne Join</button>
  
          <!-- Se ci sono colonne della tabella di JOIN disponibili -->
          <div v-if="availableJoinColumns.length">
            <label for="joinColumns">Colonne della Tabella JOIN:</label>
            <div class="checkbox-container">
              <div v-for="column in availableJoinColumns" :key="column" class="checkbox-item">
                <input type="checkbox" :value="column" v-model="selectedJoinColumns" :id="'join_' + column" />
                <label :for="'join_' + column">{{ column }}</label>
              </div>
            </div>
          </div>
  
          <!-- Condizioni di JOIN -->
          <div @change="updateQuery">
            <h4>Condizioni di JOIN</h4>
            <button @click="addJoinCondition">Aggiungi Condizione</button>
  
            <div v-for="(condition, index) in joinConditions" :key="index">
              <select v-model="condition.type" @change="updateQuery">
                <option value="type1">Colonna 1 &lt;,&lt;=,=,&gt;=,&gt; Colonna 2</option>
                <option value="type2">Colonna 1 &lt;,&lt;=,=,&gt;=,&gt; Valore</option>
                <option value="type3">Colonna 2 &lt;,&lt;=,=,&gt;=,&gt; Valore</option>
              </select>
  
              <div v-if="condition.type === 'type1'" @change="updateQuery">
                <select v-model="condition.varT1">
                  <option v-for="column in selectedColumns" :key="column" :value="column">{{ column }}</option>
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
  
              <div v-if="condition.type === 'type2'" @change="updateQuery">
                <select v-model="condition.varT1">
                  <option v-for="column in selectedColumns" :key="column" :value="column">{{ column }}</option>
                </select>
                <select v-model="condition.operator">
                  <option value="<">&lt;</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value=">=">&gt;=</option>
                  <option value=">">&gt;</option>
                </select>
                <input type="text" v-model="condition.valueT1" placeholder="Valore" />
              </div>
  
              <div v-if="condition.type === 'type3'" @change="updateQuery">
                <select v-model="condition.varT2">
                  <option v-for="column in selectedJoinColumns" :key="column" :value="column">{{ column }}</option>
                </select>
                <select v-model="condition.operator">
                  <option value="<">&lt;</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value=">=">&gt;=</option>
                  <option value=">">&gt;</option>
                </select>
                <input type="text" v-model="condition.valueT2" placeholder="Valore" />
              </div>
  
              <button @click="removeJoinCondition(index)" >Rimuovi Condizione</button>
            </div>
          </div>
        </div>
  
        <!-- Condizione WHERE -->
        <div v-if="!useLeftJoin">
          <label for="whereCondition">Condizione WHERE:</label>
          <input
            type="text"
            v-model="whereCondition"
            id="whereCondition"
            placeholder="es. customer_id = 1"
            @input="updateQuery"
          />
        </div>
  
        <!-- Pulsante per eseguire eliminazione -->
        <button @click="executeDelete" :disabled="!whereCondition">Esegui Eliminazione</button>
  
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

  import { loadColumnsJoinOracle} from '@/stores/ColonneStore';
  import { deleteRecordsOracle} from '@/stores/DeleteStore';
  
  export default {
    name: 'DeleteComponent',
    data() {
      return {
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
        joinConditions: [],             // Condizioni per il LEFT JOIN
        deleteQuery: '',                // Query generata
      };
    },
    created() {
      const storedColumns = localStorage.getItem('availableColumnsOracle');
      this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    },
    computed: {
      areAllSelected() {
        return this.selectedColumns.length === this.availableColumns.length;
      },
    },
    methods: {
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
        let baseQuery = `DELETE FROM ${localStorage.getItem('tableNameOracle')} t1`;
  
        if (this.useLeftJoin && this.joinTable) {
          baseQuery += `WHERE EXIST ( SELECT 1 FORM ${this.joinTable} t2 WHERE @CONDICTIONS@ )`;
          const joinConditionsStr = this.joinConditions.map((condition) => {
            switch (condition.type) {
              case 'type1':
                return `t1.${condition.varT1} ${condition.operator} t2.${condition.varT2}`;
              case 'type2':
                return `t1.${condition.varT1} ${condition.operator} '${condition.valueT1}'`;
              case 'type3':
                return `t2.${condition.varT2} ${condition.operator} '${condition.valueT2}'`;
              default:
                return '';
            }
          }).join(' AND ');
          baseQuery = baseQuery.replace('@CONDICTIONS@',joinConditionsStr)
        }
  
        if (this.whereCondition) {
          baseQuery += ` WHERE ${this.whereCondition}`;
        }
  
        this.deleteQuery = baseQuery;
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
  