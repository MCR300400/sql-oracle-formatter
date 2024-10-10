<template>
  <div>
    <div v-if="!availableColumns.length">Caricamento delle colonne...</div>
    <div v-else>
      <!-- Selezione delle colonne da aggiornare -->
      <div @change="generateUpdateQuery">
        <label for="updateColumns">Seleziona Colonne da Aggiornare:</label>
        <input type="checkbox" id="selectAll" @change="toggleSelectAll" :checked="areAllSelected"/>
        <label for="selectAll">Seleziona Tutte</label>
        <div @change="generateUpdateQuery">
          <div class="checkbox-container">
            <div v-for="(column, index) in availableColumns" :key="column" class="checkbox-item">
              <input type="checkbox" :value="column" v-model="selectedUpdateColumns" :id="'update_' + column"
                     @change="generateUpdateQuery(index)"/>
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
                 :placeholder="getDefault(column)"
                 :required="isRequired(getNull(column))" @input="generateUpdateQuery"/>
        </div>
      </div>



      <!-- Checkbox per abilitare il LEFT JOIN -->
      <div>
        <input type="checkbox" v-model="useLeftJoin" id="useLeftJoin" @change="generateUpdateQuery"/>
        <label for="useLeftJoin">Usa JOIN</label>
      </div>




      <!-- Form aggiuntivo per il LEFT JOIN -->
      <div v-if="useLeftJoin">
        <h3>Dettagli JOIN</h3>
        <div @change="generateUpdateQuery">
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
        <div v-if="availableJoinColumns.length" @change="generateUpdateQuery">
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
            <select v-model="joinCondition.varT1" @change="generateUpdateQuery">
              <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
            </select>
            <select v-model="joinCondition.operator" @change="generateUpdateQuery">
              <option value="<">&lt;</option>
              <option value="<=">&lt;=</option>
              <option value="=">=</option>
              <option value=">=">&gt;=</option>
              <option value=">">&gt;</option>
            </select>
            <select v-model="joinCondition.varT2" @change="generateUpdateQuery">
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
          <select v-model="condition.table" @change="generateUpdateQuery">
            <option value="t1">Tabella Principale (t1)</option>
            <option value="t2" v-if="useLeftJoin && joinTable">Tabella JOIN (t2)</option>
          </select>

          <!-- Dropdown per scegliere la colonna -->
          <select v-if="condition.table === 't1'" v-model="condition.column" @change="generateUpdateQuery">
            <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
          </select>
          <select v-else v-model="condition.column" @change="generateUpdateQuery">
            <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
          </select>

          <!-- Dropdown per scegliere l'operatore di confronto -->
          <select v-model="condition.operator" @change="generateUpdateQuery">
            <option value="=">=</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
            <option value="!=">!=</option>
          </select>

          <!-- Input per il valore da confrontare -->
          <input type="text" v-model="condition.value" placeholder="Inserisci valore" @input="generateUpdateQuery"/>

          <!-- Pulsante per rimuovere la condizione -->
          <button @click="removeWhereCondition(index)">Rimuovi</button>
        </div>

        <!-- Pulsante per aggiungere una nuova condizione WHERE -->
        <button @click="addWhereCondition">Aggiungi Condizione WHERE</button>
      </div>

      <!-- Pulsante esecuzione query -->
      <button @click="executeUpdate" :disabled="!selectedUpdateColumns.length || !allValuesProvided">Esegui
        Aggiornamento
      </button>

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
import {loadColumnsJoinOracle} from '@/stores/ColonneStore';
import {updateRecordsOracle} from '@/stores/UpdateStore';

export default {
  name: 'UpdateComponent',
  components: {},
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
      tipoJoin: '',
      joinList: ['', 'LEFT', 'RIGHT'],
      availableColumns: [],            // Colonne della tabella principale
      availableJoinColumns: [],        // Colonne della tabella di JOIN
      selectedUpdateColumns: [],       // Colonne selezionate da aggiornare
      selectedJoinColumns: [],         // Colonne selezionate dalla tabella di JOIN
      updateValues: [],                // Valori da impostare per le colonne selezionate
      whereCondition: '',              // Condizione WHERE
      joinTable: '',                   // Nome della tabella da unire
      useLeftJoin: false,              // Stato per l'uso di LEFT JOIN
      joinCondition: {                // Condizione JOIN semplificata
        varT1: '',                    // Prima colonna (tabella principale)
        operator: '=',                // Operatore
        varT2: ''                     // Seconda colonna (tabella di JOIN)
      },
      query: '',                       // Query formata
      results: [],                     // Risultati dell'operazione
      resultsMessage: '',
      listTipo: [],
      listNull: [],
      listKey: [],
      listDefault: [],
    };
  },

  created() {
    const storedColumns = localStorage.getItem('availableColumnsOracle');
    const storedTipo = localStorage.getItem('tipoOracle');
    const storedNull = localStorage.getItem('nullOracle');
    const storedKey = localStorage.getItem('lengthOracle');
    const storedDefault = localStorage.getItem('defaultOracle');

    this.availableColumns = storedColumns ? JSON.parse(storedColumns) : [];
    this.listTipo = storedTipo ? JSON.parse(storedTipo) : [];
    this.listNull = storedNull ? JSON.parse(storedNull) : [];
    this.listKey = storedKey ? JSON.parse(storedKey) : [];
    this.listDefault = storedDefault ? JSON.parse(storedDefault) : [];
  },

  computed: {
    allValuesProvided() {
      return this.updateValues.length === this.selectedUpdateColumns.length && this.updateValues.every(value => value !== '');
    },

    areAllSelectedJoin() {
      return this.selectedJoinColumns.length === this.availableJoinColumns.length;
    },


  },


  methods: {

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
    toggleSelectAll(event) {
      this.selectedUpdateColumns = event.target.checked ? [...this.availableColumns] : [];
    },

    toggleSelectAllJoin(event) {
      this.selectedJoinColumns = event.target.checked ? [...this.availableJoinColumns] : [];
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


    // Funzione per ottenere il valore "null" della colonna selezionata
    getNull(column) {
      const index = this.availableColumns.indexOf(column);
      return index !== -1 ? this.listNull[index] || 'YES' : 'YES';  // Se "NO", è richiesto
    },

    async fetchJoinColumns() {
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
        this.generateUpdateQuery();
        this.availableJoinColumns = columns;
      } catch (error) {
        console.error('Errore durante il caricamento delle colonne di JOIN:', error);
        this.availableJoinColumns = []; // Reset in caso di errore
      }
    },


    generateUpdateQuery() {
      if (this.selectedUpdateColumns.length > 0) {
        let setClauses = this.selectedUpdateColumns.map((col, index) => `t1.${col} = '${this.updateValues[index]}'`).join(', ');
        let whereClause = '';
        if (this.whereConditions.length) {
          const whereClauses = this.whereConditions
              .filter(cond => cond.column && cond.value) // Filtro per condizioni valide
              .map(cond => `${cond.table}.${cond.column} ${cond.operator} ${cond.value}`);
          if (whereClauses.length) {
            whereClause += ` WHERE ${whereClauses.join(' AND ')}`;
          }
        }

        let joinClause = '';
        if (this.useLeftJoin && this.joinTable) {
          joinClause += ` ${this.tipoJoin} JOIN ${this.joinTable} t2`;
          if (this.joinCondition.varT1 && this.joinCondition.varT2) {
            joinClause += ` ON t1.${this.joinCondition.varT1} ${this.joinCondition.operator} t2.${this.joinCondition.varT2}`;
          }
        }
        this.query = `UPDATE ${localStorage.getItem('tableNameOracle')} t1 SET ${setClauses} ${joinClause} ${whereClause}`;
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
      this.joinConditions.push({type: 'type1', varT1: '', operator: '=', varT2: ''});
      this.generateUpdateQuery();
    },

    removeJoinCondition(index) {
      this.joinConditions.splice(index, 1);
      this.generateUpdateQuery();
    },

    async executeUpdate() {
      // Logica per eseguire la query di aggiornamento


      const response = await updateRecordsOracle({
        url: localStorage.getItem("urlOracle"),
        database: localStorage.getItem("databaseNameOracle"),
        porta: localStorage.getItem("portOracle"),
        fusoOrario: localStorage.getItem("fusoorarioOracle"),
        tabella: this.joinTable,
        username: localStorage.getItem("usernameDBOracle"),
        password: localStorage.getItem("passwordDBOracle")
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


table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

button {
  padding: 10px;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
