<template>
  <div>
    <h1>Automazioni Database</h1>
    <DbOracleConnectionComponent @connection-status="handleConnectionStatus" />
    <QueryOracleExecutionComponent v-if="isConnected" :key="queryExecutionKey" />

    <EmailSenderComponent />
  </div>
</template>

<script>
import DbOracleConnectionComponent from '@/components/oracle/DbOracleConnectionComponent.vue';
import QueryOracleExecutionComponent from '@/components/oracle/QueryOracleExecutionComponent.vue';


export default {
  name: 'HomeOracleView',
  components: {
    DbOracleConnectionComponent,
    QueryOracleExecutionComponent
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
