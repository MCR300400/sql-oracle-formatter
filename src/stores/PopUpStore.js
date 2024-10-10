// PopUpStore.js

import {ref} from 'vue'

// Stato per la visibilità del popup
const isVisible = ref(false)
const popupContent = ref({
    backgroundColor: '',
    title: '',
    text: ''
})

// Funzione per mostrare il popup
function showPopup(backgroundColor, title, text) {
    popupContent.value = {backgroundColor, title, text}
    isVisible.value = true

    // Nasconde il popup dopo 3 secondi
    setTimeout(() => {
        isVisible.value = false
    }, 3000)
}

// Funzione per ottenere il contenuto del popup
function getPopupContent() {
    return popupContent.value
}

// Funzione per verificare la visibilità
function isPopupVisible() {
    return isVisible.value
}

// Funzione per chiudere il popup manualmente
function closePopup() {
    isVisible.value = false
}

export default {
    showPopup,
    getPopupContent,
    isPopupVisible,
    closePopup
}
