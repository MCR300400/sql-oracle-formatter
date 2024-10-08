// UpdateStore.js
import axios from "axios";

const BASE_URL = "/query/sqlUpdate";
const BASE_URL_ORACLE = "/query/oracleUpdate";

export async function updateRecords(connessione, query) {
  try {
    const response = await axios.post(BASE_URL, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'aggiornamento del record:", error);
    throw error;
  }
}

export async function updateRecordsOracle(connessione, query) {
  try {
    const response = await axios.post(BASE_URL_ORACLE, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'aggiornamento del record:", error);
    throw error;
  }
}
