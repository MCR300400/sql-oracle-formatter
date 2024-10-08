<template>
    <div class="manuale-uso">
      <h1>Manuale d'Uso del Sito Web</h1>
      
      <section>
        <h2>Introduzione</h2>
        <p>
          Benvenuto nel nostro sito web! Questa guida ti aiuterà a navigare e utilizzare tutte le funzionalità disponibili.
        </p>
      </section>
  
      <section>
        <h2>Sezioni Principali</h2>
        <ul>
          <li>
            <strong>MySQL:</strong> Qui puoi gestire le tue query e le operazioni sul database MySQL. Utilizza il modulo per effettuare aggiornamenti, selezioni e molto altro.
          </li>
          <li>
            <strong>Oracle:</strong> In questa sezione puoi lavorare con il database Oracle. Simile alla sezione MySQL, ma con funzionalità specifiche per Oracle.
          </li>
          <li>
            <strong>Manuale d'Uso:</strong> Sei attualmente in questa sezione! Qui troverai tutte le informazioni necessarie per utilizzare il sito.
          </li>
        </ul>
      </section>
  
      <section>
        <h2>Come Usare il Sito</h2>
        <h3>1. Navigazione</h3>
        <p>
          Utilizza i pulsanti nella barra di navigazione per passare tra le diverse sezioni del sito. Cliccando su "MySQL" accederai alla gestione del database MySQL, mentre il pulsante "Oracle" ti porterà alla gestione del database Oracle.
        </p>
  
        <h3>2. Esecuzione di Query</h3>
        <p>
          Nella sezione MySQL o Oracle, troverai dei moduli per inserire le tue query. Compila i campi richiesti e premi il pulsante di invio per eseguire le operazioni desiderate. Assicurati di seguire la sintassi corretta per evitare errori.
        </p>
  
        <h3>3. Consultazione dei Risultati</h3>
        <p>
          Dopo aver eseguito una query, i risultati saranno mostrati sotto il modulo. Puoi consultare i dati aggiornati e verificare che le operazioni siano state completate con successo.
        </p>
      </section>
  
      <section>
        <h2>Contatti e Supporto</h2>
        <p>
          Se hai bisogno di ulteriore aiuto, non esitare a contattarci. Puoi inviare un'email a <a href="mailto:support@example.com">support@example.com</a> per assistenza.
        </p>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ManualeUsoPage',
  };
  </script>
  
  <style scoped>
  .manuale-uso {
    padding: 20px;
  }
  
  h1 {
    color: #333;
  }
  
  h2 {
    color: #007bff;
  }
  
  ul {
    list-style-type: disc;
    padding-left: 20px;
  }
  
  p {
    margin: 10px 0;
  }
  </style>
  