<template>
  <div>
    <h3>Condizioni WHERE (opzionali):</h3>
    <div v-for="(condition, index) in whereConditions" :key="index" class="where-condition">
      <!-- Dropdown per scegliere la tabella (t1 o t2) -->
      <select v-model="condition.table" @change="updateQuerySub">
        <option value="t1">Tabella Principale (t1)</option>
        <option value="t2" v-if="useLeftJoin && joinTable">Tabella JOIN (t2)</option>
      </select>

      <!-- Dropdown per scegliere la colonna -->
      <select v-if="condition.table === 't1'" v-model="condition.column" @change="updateQuerySub">
        <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
      </select>
      <select v-else v-model="condition.column" @change="updateQuerySub">
        <option v-for="column in availableJoinColumns" :key="column" :value="column">{{ column }}</option>
      </select>

      <!-- Dropdown per scegliere l'operatore di confronto -->
      <select v-model="condition.operator" @change="updateQuerySub">
        <option value="=">=</option>
        <option value="<">&lt;</option>
        <option value=">">&gt;</option>
        <option value="<=">&lt;=</option>
        <option value=">=">&gt;=</option>
        <option value="!=">!=</option>
      </select>

      <!-- Input per il valore da confrontare -->
      <input type="text" v-model="condition.value" placeholder="Inserisci valore" @input="updateQuerySub" />

      <!-- Pulsante per rimuovere la condizione -->
      <button @click="removeWhereCondition(index)">Rimuovi</button>
    </div>

    <!-- Pulsante per aggiungere una nuova condizione WHERE -->
    <button @click="addWhereCondition">Aggiungi Condizione WHERE</button>
  </div>
</template>

<script>
export default {
  props: {
    whereConditions: Array,
    availableColumns: Array,
    availableJoinColumns: Array,
    useLeftJoin: Boolean,
    joinTable: String,
  },
  data() {
    return {
      whereConditionsSub: this.whereConditions,
    }
  },
  methods: {
    addWhereCondition() {
      // Add a new condition object to the whereConditions array
      this.whereConditionsSub.push({
        table: 't1', // Default table
        column: '', // Default empty column
        operator: '=', // Default operator
        value: '', // Default empty value
      });
    },
    removeWhereCondition(index) {
      this.whereConditionsSub.splice(index, 1);
    },
    updateQuerySub() {
      this.$emit('update-query'); // Emit an event to notify the parent for a query update
    },
  },
};
</script>

<style scoped>
.where-condition {
  display: flex; /* Utilizza flexbox per allineare gli elementi */
  align-items: center; /* Allinea verticalmente al centro */
  margin-bottom: 10px; /* Spazio sotto ogni condizione */
}

.where-condition select,
.where-condition input {
  margin-right: 10px; /* Spazio tra gli elementi */
}
</style>
