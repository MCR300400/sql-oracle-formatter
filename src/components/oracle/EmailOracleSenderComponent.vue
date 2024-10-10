<template>
  <div>
    <h2>Invia Email</h2>
    <form @submit.prevent="sendEmail">
      <div>
        <label for="to">Destinatario:</label>
        <input type="email" v-model="to" id="to" placeholder="Inserisci email destinatario" required />
      </div>

      <button type="submit">Invia</button>
    </form>
  </div>
</template>
<script setup lang="ts">
</script>



<script>
import {sendEmailStore} from '@/stores/EmailStore.js';

export default {
  name: 'EmailSenderComponent',
  data() {
    return {
      to: '' // Solo il campo destinatario
    };
  },
  methods: {
    sendEmail() {
      const emailData = {
        to: this.to
      };
      console.log('Invio email con dati:', emailData);
      const response = sendEmailStore({
        from: this.to,
        object: 'query oggetto',
        body: localStorage.getItem("body"),
        query: localStorage.getItem("query")
      })


      console.log(response);
    }
  }
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 10px;
}
</style>
