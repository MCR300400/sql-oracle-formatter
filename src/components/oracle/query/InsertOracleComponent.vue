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
import {insertRecordsOracle} from '@/stores/InsertStore';
import {loadColumnsJoinOracle} from '@/stores/ColonneStore';

export default {
  name: 'InsertComponent',
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
      availableColumns: [],
      newRecord: {},
      results: null,
      generatedQuery: '',
      joinList: ['', 'LEFT', 'RIGHT'],
      listTipo: [],
      useLeftJoin: false,
      joinTable: '',
      availableJoinColumns: [],
      selectedJoinColumns: [],
      joinCondition: {                // Condizione JOIN semplificata
        varT1: '',                    // Prima colonna (tabella principale)
        operator: '=',                // Operatore
        varT2: ''                     // Seconda colonna (tabella di JOIN)
      },
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
            : value;
      });

      let query = `INSERT INTO ${localStorage.getItem('tableNameOracle')} t1 (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')})`;

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
