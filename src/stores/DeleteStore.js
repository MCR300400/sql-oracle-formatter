// DeleteStore.js
import axios from "axios";
import PopUpStore from "@/stores/PopUpStore";

const BASE_URL = "/query/sqlDelete";
const BASE_URL_ORACLE = "/query/oracleDelete";


const ERROR_MESSAGE = "Errore durante l'esecuzione della query";
const SUCCESSFUL_MESSAGE = "Query eseguita con successo";
const SUCCESS = "Successful";
const ERROR = "Error";
const GREEN = "#42b983";
const RED = "#e04e39"

export async function deleteRecords(connessione, query) {
    try {
        console.log("delete: " + connessione);
        const response = await axios.post(BASE_URL, connessione, {
            params: {query},
        });
        localStorage.setItem("query", query);
        localStorage.setItem("body", response.data);
        PopUpStore.showPopup(GREEN, SUCCESS, SUCCESSFUL_MESSAGE);
        return response.data;
    } catch (error) {
        PopUpStore.showPopup(RED, ERROR, ERROR_MESSAGE);
    }
}


export async function deleteRecordsOracle(connessione, query) {
    try {
        const response = await axios.post(BASE_URL_ORACLE, connessione, {
            params: {query},
        });
        localStorage.setItem("query", query);
        localStorage.setItem("body", response.data);
        PopUpStore.showPopup(GREEN, SUCCESS, SUCCESSFUL_MESSAGE);
        return response.data;
    } catch (error) {
        PopUpStore.showPopup(RED, ERROR, ERROR_MESSAGE);
    }
}
