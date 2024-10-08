// SelectStore.js
import axios from "axios";

const BASE_URL = "/query/sqlSelect";
const BASE_URL_ORACLE = "/query/oracleSelect";

export async function selectRecords(connessione, query) {
  try {
    const response = await axios.post(BASE_URL, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", "DONE");

    /*
    localStorage.setItem(
      "body",
      response.data
        .map((obj) => JSON.stringify(obj)) // Converte ogni oggetto in stringa
        .join(",\n")
    );
    */
    return response.data;
  } catch (error) {
    console.error("Errore durante la selezione dei record:", error);
    throw error;
  }
}



export async function selectRecordsOracle(connessione, query) {
  try {
    const response = await axios.post(BASE_URL_ORACLE, connessione, {
      params: { query },
    });
    localStorage.setItem("query", query);
    localStorage.setItem("body", "DONE");

    /*
    localStorage.setItem(
      "body",
      response.data
        .map((obj) => JSON.stringify(obj)) // Converte ogni oggetto in stringa
        .join(",\n")
    );
    */
    return response.data;
  } catch (error) {
    console.error("Errore durante la selezione dei record:", error);
    throw error;
  }
}