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
  background-color: #dddddd; /* Colore dello sfondo */
  padding: 10px;
  display: flex; /* Abilita flexbox */
  justify-content: center; /* Centra gli elementi orizzontalmente */
}

ul {
  list-style: none;
  display: flex;
  gap: 20px;
}

li {
  display: inline;
}

button {
  background-color: transparent; /* Sfondo trasparente per i pulsanti */
  color: #000000; /* Colore del testo */
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: underline; /* Sottolinea il testo */
  transition: background-color 0.3s ease, color 0.3s ease; /* Aggiungi transizione */
}
</style>
