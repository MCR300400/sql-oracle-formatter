// EmailStore.js
import axios from "axios";

const BASE_URL = "/api/email/automator";

export async function sendEmailStore(emailParams) {
    try {
        const response = await axios.post(BASE_URL, emailParams);
        return response.data;
    } catch (error) {
        console.error("Errore durante l'invio della email:", error);
        throw error;
    }
}
