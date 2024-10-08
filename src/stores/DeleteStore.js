// DeleteStore.js
import axios from "axios";

const BASE_URL = "/query/sqlDelete";
const BASE_URL_ORACLE = "/query/oracleDelete";

export async function deleteRecords(connessione, query) {
  try {
    const response = await axios.post(BASE_URL, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'eliminazione del record:", error);
    throw error;
  }
}



export async function deleteRecordsOracle(connessione, query) {
  try {
    const response = await axios.post(BASE_URL_ORACLE, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'eliminazione del record:", error);
    throw error;
  }
}
