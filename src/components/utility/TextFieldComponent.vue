<template>
  <div class="text-field-component">
    <!-- Nome come titolo sopra il TextField -->
    <label :for="nome" class="field-label">{{ nome }}</label>

    <!-- Input dinamico con tipo e valore predefinito -->
    <input
      :id="nome"
      :type="tipo"
      v-model="inputValue"
      :placeholder="defaultVal"
      :disabled="isDisabled"
      :required="!isNullable"
      class="text-field-input"
    />

    <!-- Messaggio se il campo è chiave primaria, esterna o ha indici -->
    <p v-if="keyType !== ''" class="field-info">
      Questo campo è una {{ keyType }}
    </p>

    <!-- Messaggio se il campo ha informazioni extra -->
    <p v-if="extra !== ''" class="field-extra">
      Extra: {{ extra }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'TextFieldComponent',
  props: {
    nome: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      default: 'text', // Di default, il tipo è "text"
    },
    null: {
      type: String, // Cambiato in String per supportare "YES" o altro
      default: 'NO', // Valore di default (non nullable)
    },
    keyType: {
      type: String,
      default: '', // Specifica se è chiave primaria o altro
    },
    default: {
      type: String,
      default: '', // Valore predefinito
    },
    extra: {
      type: String,
      default: '', // Informazioni extra come auto_increment
    },
  },
  data() {
    return {
      inputValue: this.default, // Imposta il valore iniziale dal default
    };
  },
  computed: {
    isNullable() {
      return this.null === 'YES'; // Rende nullable solo se `null` è "YES"
    },
    defaultVal() {
      return this.default || ''; // Usa il valore predefinito o vuoto
    },
    isDisabled() {
      return this.extra.includes('auto_increment'); // Disabilita se extra include "auto_increment"
    },
  },
};
</script>

<style scoped>
.text-field-component {
  margin-bottom: 20px;
}

.field-label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.text-field-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  margin-bottom: 10px;
}

.field-info {
  font-size: 14px;
  color: #007bff;
}

.field-extra {
  font-size: 12px;
  color: #6c757d;
}
</style>
