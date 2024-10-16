<template>
  <div>
    <label for="leftJoin">Vuoi fare un JOIN?</label>
    <input
        type="checkbox"
        v-model="localUseLeftJoin"
        id="leftJoin"
        @change="updateParentUseLeftJoin"
    />

    <div v-if="localUseLeftJoin">
      <div v-for="(join, joinIndex) in localJoins" :key="joinIndex">
        <h3>Dettagli JOIN {{ joinIndex + 1 }}</h3>

        <!-- Add user-friendly error messages -->
        <div v-if="!join.joinTable" class="error-message">Il nome della tabella è richiesto.</div>
        <div v-if="!isJoinConditionValid(join)" class="error-message">Condizioni JOIN non valide.</div>

        <div @change="updateQuery">
          <label for="tipoJoin">TIPOLOGIA JOIN:</label>
          <select v-model="join.tipoJoin" @change="emitJoins">
            <option disabled value="">Seleziona il tipo del join</option>
            <option v-for="item in joinList" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div>
          <label for="joinTable">Nome Tabella per il JOIN:</label>
          <input
              type="text"
              v-model="join.joinTable"
              placeholder="Inserisci nome tabella"
              @input="emitJoins"
          />
          <button @click="connectToDbJoin(joinIndex)" :disabled="!join.joinTable">
            Connettiti alla tabella
          </button>
        </div>


        <div v-if="join.joinTable && join.availableJoinColumns.length">
          <h4>Condizioni di JOIN</h4>
          <div v-for="(condition, condIndex) in join.joinConditions" :key="condIndex" class="join-condition">
            <select v-model="condition.varT1" @change="emitJoins">
              <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
            </select>
            <select v-model="condition.operator" @change="emitJoins">
              <option value="<">&lt;</option>
              <option value="<=">&lt;=</option>
              <option value="=">=</option>
              <option value=">=">&gt;=</option>
              <option value=">">&gt;</option>
            </select>
            <select v-model="condition.varT2" @change="emitJoins">
              <option v-for="column in join.availableJoinColumns" :key="column" :value="column">{{ column }}</option>
            </select>
            <button @click="removeJoinCondition(joinIndex, condIndex)">Rimuovi Condizione</button>
          </div>
          <button @click="addJoinCondition(join)">Aggiungi Condizione JOIN</button>
        </div>
      </div>

      <button @click="addJoinSub">Aggiungi JOIN</button>
    </div>
  </div>
</template>

<script>
import {loadColumnsJoin} from "@/stores/ColonneStore";

export default {
  props: {
    joins: Array,
    availableColumns: Array,
    useLeftJoin: Boolean,
    updateQuery: Function,
    addJoin: Function,
    toggleSelectAllJoin: Function,
    areAllSelectedJoin: Function,
    joinList: Array,
  },
  data() {
    return {
      localUseLeftJoin: this.useLeftJoin,
      localJoins: JSON.parse(JSON.stringify(this.joins)), // Clone the props to local state
      loading: false, // New loading state
    };
  },
  watch: {
    useLeftJoin(newVal) {
      this.localUseLeftJoin = newVal;
    },
    joins(newVal) {
      this.localJoins = JSON.parse(JSON.stringify(newVal)); // Ensure deep copy to avoid reference issues
      console.log("Updated local joins: ", JSON.stringify(this.localJoins)); // For debugging
    },
  },
  methods: {
    addJoinCondition(join) {
      const newCondition = {varT1: '', operator: '=', varT2: ''}; // Create a new join condition
      console.log("JOIN: " + join);
      // Check if joinConditions is defined and is an array
      if (join && Array.isArray(join.joinConditions)) {

        join.joinConditions.push(newCondition); // Safely push to the array
        this.emitJoins();
      } else {
        console.error('join or joinConditions is not defined for:', join);
        // Optional: Initialize joinConditions if it's not defined
        if (join) {
          join.joinConditions = [newCondition];
          this.emitJoins();
        }
      }
    },

    removeJoinCondition(joinIndex, conditionIndex) {
      this.localJoins[joinIndex].joinConditions.splice(conditionIndex, 1);
      this.emitJoins(); // Emit after removing the condition
      this.updateQuery(); // Update the query after removing a condition
    },

    updateParentUseLeftJoin() {
      this.$emit('update:leftJoin', this.localUseLeftJoin);
    },
    emitJoins() {
      this.$emit('update:joins', this.localJoins);
    },
    isJoinConditionValid(join) {
      return join.selectedJoinColumns.length > 0 && join.joinTable && join.tipoJoin;
    },
    toggleSelectAllJoinSub(joinIndex) {
      const join = this.localJoins[joinIndex];
      const allSelected = join.availableJoinColumns.length === join.selectedJoinColumns.length;
      join.selectedJoinColumns = allSelected ? [] : [...join.availableJoinColumns];
      this.emitJoins();
    },
    addJoinSub() {
      this.localJoins.push({
        tipoJoin: '',
        joinTable: '',
        availableJoinColumns: [],
        selectedJoinColumns: [],
        joinConditions: [],
      });
      this.emitJoins();
    },

    async connectToDbJoin(index) {
      console.log("index: " + index);
      const join = this.joins[index];
      console.log("join: " + JSON.stringify(this.joins));
      console.log("join: " + JSON.stringify(join));

      if (!join.joinTable) {
        console.log(join.joinTable);
        console.error('Nome tabella non fornito');
        return;
      }

      console.log("Prima di caricare le colonne del join");

      try {
        const columns = await loadColumnsJoin({
          url: localStorage.getItem("url"),
          database: localStorage.getItem("databaseName"),
          porta: localStorage.getItem("port"),
          fusoOrario: localStorage.getItem("fusoorario"),
          tabella: join.joinTable,
          username: localStorage.getItem("usernameDB"),
          password: localStorage.getItem("passwordDB")
        });

        console.log("Colonne restituite: ", columns); // Debug
        if (columns) {
          this.localJoins[index].availableJoinColumns = columns;
          console.log("Colonne aggiornate join: ", this.joins[index].availableJoinColumns);
          this.emitJoins();
        } else {
          throw new Error('Nessuna colonna trovata.');
        }
      } catch (error) {
        console.error('Errore durante il caricamento delle colonne di JOIN:', error);
        this.localJoins[index].availableJoinColumns = [];
        this.emitJoins();
      }
    },
  },
};
</script>

<style scoped>
.join-condition {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.join-condition select,
.join-condition input {
  margin-right: 10px;
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

/* Optional loading styles */
.loading {
  opacity: 0.5;
}
</style>
