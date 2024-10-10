<template>
  <nav class="navbar">
    <ul>
      <li>
        <button @click="handleMysql">MYSQL</button>
      </li>
      <li>
        <button @click="handleOracle">ORACLE</button>
      </li>
      <li>
        <button @click="handleManualeUso">MANUALE D'USO</button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'NavBarComponent',
  methods: {
    handleMysql() {
      console.log('Pulsante MYSQL cliccato');
      this.$router.push('/mysql'); // Naviga a /mysql
    },
    handleOracle() {
      console.log('Pulsante ORACLE cliccato');
      this.$router.push('/oracle'); // Naviga a /oracle
    },
    handleManualeUso() {
      console.log("Pulsante MANUALE D'USO cliccato");
      this.$router.push('/manuale'); // Naviga a /manuale
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #3b3b3b; /* Colore scuro per il navbar */
  padding: 15px;
  display: flex; /* Abilita flexbox */
  justify-content: center; /* Centra gli elementi orizzontalmente */

}

ul {
  list-style: none;
  display: flex;
  flex: 1; /* Consente di espandere l'ul per occupare tutto lo spazio disponibile */
  padding: 0; /* Rimuovi padding */
  margin: 0; /* Rimuovi margini */
}

li {
  flex: 1; /* Ogni elemento 'li' occupa un terzo dello spazio disponibile */
  display: flex; /* Abilita flexbox per centrare il contenuto */
  justify-content: center; /* Centra orizzontalmente il contenuto del 'li' */
}

button {
  color: white; /* Colore del testo */
  border: none;
  background-color: transparent;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px; /* Dimensione del font */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Aggiungi transizione */
}

/* Effetto hover per i pulsanti */
button:hover {
  transform: translateY(-2px); /* Leggera elevazione al passaggio del mouse */
}

/* Effetto active per i pulsanti */
button:active {
  transform: translateY(0); /* Torna alla posizione originale quando premuto */
}
</style>
