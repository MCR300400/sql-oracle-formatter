import { createApp } from 'vue'
import App from './App.vue'
import router from './router'; // Se usi Vue Router

// Importa gli stili globali, se hai un file separato per il CSS/SCSS
import './styles/main.css'

createApp(App)
  .use(router) // Usa il router, se configurato
  .mount('#app')
