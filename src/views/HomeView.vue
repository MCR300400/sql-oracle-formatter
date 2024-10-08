<template>
  <div>
    <h1>Automazioni Database</h1>
    <DbConnectionComponent @connection-status="handleConnectionStatus" />
    <QueryexecutionComponent v-if="isConnected" :key="queryExecutionKey" />
    <EmailSenderComponent />
  </div>
</template>

<script>
import DbConnectionComponent from '@/components/sql/DbConnectionComponent.vue';
import EmailSenderComponent from '../components/sql/EmailSenderComponent.vue';
import QueryexecutionComponent from '../components/sql/QueryExecutionComponent.vue';

export default {
  name: 'AutomationView',
  components: {
    DbConnectionComponent,
    QueryexecutionComponent,
    EmailSenderComponent
  },
  data() {
    return {
      isConnected: false,
      queryExecutionKey: 0 // Chiave per ricaricare QueryexecutionComponent
    };
  },
  methods: {
    handleConnectionStatus(status) {
      this.isConnected = status; // Aggiorna lo stato della connessione
      if (status) {
        this.reloadQueryExecutionComponent();
      }
    },
    reloadQueryExecutionComponent() {
      // Incrementa la chiave per ricaricare il componente
      this.queryExecutionKey++;
    }
  }
};
</script>
