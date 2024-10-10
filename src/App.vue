<template>
  <NavBarComponent/>
  <PopUpComponent/>
  <router-view></router-view>
</template>

<script>
import NavBarComponent from './components/NavBarComponent.vue';
import PopUpComponent from "./components/PopUpComponent.vue";



export default {
  name: 'App',
  components: {
    PopUpComponent,
    NavBarComponent
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
</style>
