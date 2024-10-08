// InsertStore.js
import axios from "axios";

const BASE_URL = "/query/sqlInsert";
const BASE_URL_ORACLE = "/query/oracleInsert";


export async function insertRecords(connessione, query) {
  try {
    const response = await axios.post(BASE_URL, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'inserimento del record:", error);
    throw error;
  }
}


export async function insertRecordsOracle(connessione, query) {
  try {
    const response = await axios.post(BASE_URL_ORACLE, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'inserimento del record:", error);
    throw error;
  }
}

