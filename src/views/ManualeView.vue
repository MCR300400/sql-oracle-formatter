<template>
  <div class="manuale-uso">
    <h1>Manuale d'Uso del Sito Web</h1>

    <section>
      <h2>Introduzione</h2>
      <p>
        Benvenuto nel nostro sito web dedicato alla creazione dinamica di query per database MySQL e Oracle. Questo strumento ti permette di costruire ed eseguire query SQL in modo semplice e intuitivo, fornendo funzionalità avanzate per la gestione dei tuoi database.
      </p>
    </section>

    <section>
      <h2>Sezioni Principali</h2>
      <ul>
        <li>
          <strong>MySQL:</strong> In questa sezione, puoi creare, modificare ed eseguire query sul tuo database MySQL. Utilizza i moduli disponibili per inserire i tuoi comandi SQL e visualizzare i risultati in tempo reale.
        </li>
        <li>
          <strong>Oracle:</strong> Questa sezione è dedicata alla gestione del database Oracle. Simile alla sezione MySQL, offre la possibilità di costruire query in un ambiente Oracle con funzionalità ottimizzate per questo sistema.
        </li>
        <li>
          <strong>Manuale d'Uso:</strong> La guida che stai leggendo! Qui troverai tutte le istruzioni necessarie per navigare e utilizzare il sito in modo efficace.
        </li>
      </ul>
    </section>

    <section>
      <h2>Come Usare il Sito</h2>
      <h3>1. Navigazione tra le sezioni</h3>
      <p>
        Il sito è suddiviso principalmente in due sezioni principali: MySQL e Oracle. Puoi utilizzare la barra di navigazione in alto per passare tra le due sezioni, selezionando il tipo di database con cui desideri lavorare.
      </p>

      <h3>2. Creazione Dinamica di Query</h3>
      <p>
        Una delle funzionalità principali del sito è la possibilità di creare dinamicamente query SQL. Dopo aver selezionato il database (MySQL o Oracle), puoi inserire le tue query direttamente nei campi dedicati e premere il pulsante di invio per eseguirle. Il sito fornisce anche suggerimenti e controlli per aiutarti a costruire query valide, evitando errori comuni.
      </p>

      <h3>3. Visualizzazione dei Risultati</h3>
      <p>
        I risultati delle query eseguite vengono visualizzati in una tabella interattiva, con la possibilità di filtrare, ordinare e navigare attraverso i dati. Puoi limitare il numero di righe visualizzate e scaricare i dati in vari formati per una successiva elaborazione.
      </p>
    </section>

    <section>
      <h2>Funzionalità Aggiuntive</h2>
      <p>
        Oltre alla creazione e gestione delle query, il sito offre ulteriori strumenti avanzati:
      </p>
      <ul>
        <li>
          <strong>Modifica Dinamica:</strong> È possibile modificare dinamicamente le query e vedere i cambiamenti in tempo reale senza ricaricare la pagina.
        </li>
        <li>
          <strong>Filtraggio Avanzato:</strong> Dopo l'esecuzione di una query, puoi applicare filtri sui risultati per analizzare i dati in modo più approfondito.
        </li>
        <li>
          <strong>Paginazione:</strong> Se i risultati della query sono molto estesi, la tabella supporta la paginazione per semplificare la visualizzazione dei dati.
        </li>
      </ul>
    </section>

    <section>
      <h2>Contatti e Supporto</h2>
      <p>
        Se hai bisogno di assistenza o hai domande sull'uso del sito, non esitare a contattarci. Il nostro team di supporto è disponibile via email all'indirizzo <a href="mailto:support@example.com">support@example.com</a>.
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
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #000;
  text-align: left; /* Allineamento a sinistra */
}

h1 {
  color: #333;
  font-size: 2em;
  margin-bottom: 20px;
}

h2 {
  color: #42b983;
  font-size: 1.5em;
  margin-top: 20px;
}

h3 {
  color: #42b983;
  font-size: 1.2em;
  margin-top: 15px;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 10px 0;
}

ul li {
  margin-bottom: 8px;
}

p {
  margin: 10px 0;
  font-size: 1em;
  color: #000;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
