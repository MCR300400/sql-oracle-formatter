<template>
  <div v-if="isPopupVisible" class="popup" :style="{ backgroundColor: popupContent.backgroundColor }">
    <div class="popup-header">
      <h3 class="popup-title">{{ popupContent.title }}</h3>
      <button class="close-btn" @click="closePopup">&times;</button>
    </div>
    <div class="popup-body">
      <p>{{ popupContent.text }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PopUpStore from '@/stores/PopUpStore';

// Computed properties per la visibilità e il contenuto del popup
const isPopupVisible = computed(() => PopUpStore.isPopupVisible())
const popupContent = computed(() => PopUpStore.getPopupContent())

// Funzione per chiudere il popup
function closePopup() {
  PopUpStore.closePopup() // Chiamata per chiudere il popup
}
</script>

<style scoped>
.popup {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  color: white;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.9; /* Semi-trasparente */
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px; /* Ridotto padding per meno spazio */
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.popup-title {
  font-size: 1.3rem; /* Dimensione ridotta rispetto alla precedente */
  font-weight: bold; /* Grassetto */
  margin: 0; /* Rimuovi margini */
}

.popup-body {
  padding: 20px; /* Maggiore padding per il corpo */
  font-size: 1rem; /* Dimensione normale */
  line-height: 1.5; /* Maggiore interlinea */
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px; /* Maggiore dimensione del pulsante */
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ffdddd; /* Colore del pulsante al passaggio del mouse */
}

/* Effetto di apparizione */
@keyframes popup-appear {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popup {
  animation: popup-appear 0.3s ease forwards; /* Animazione al caricamento */
}
</style>
