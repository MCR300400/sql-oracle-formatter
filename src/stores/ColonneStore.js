// ColonneStore.js
import axios from 'axios';
import PopUpStore from "@/stores/PopUpStore";


/**
 *
 *          MYSQL
 *
 */

const DB_ERROR = 'Si è verificato un errore durante la connessione al DB.';
const JOIN_ERROR = 'Si è verificato un errore durante la connessione al DB per il JOIN.';
const CONNECTION_SUCCESSFUL = "Connessione eseguita con successo";
const SUCCESS = "Successful";
const ERROR = "Error";
const GREEN = "#42b983";
const RED = "#e04e39"


export async function loadColumns(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });


        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('availableColumns', JSON.stringify(response.data));
            PopUpStore.showPopup(GREEN, SUCCESS, CONNECTION_SUCCESSFUL);
            return response.data; // Return the columns
        } else {
            PopUpStore.showPopup(RED, ERROR, DB_ERROR)
        }
    } catch (error) {
        PopUpStore.showPopup(RED, ERROR, DB_ERROR)
    }
}


export async function loadColumnsTipo(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne/tipo', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('tipo', JSON.stringify(response.data));
            console.log("tipo");
            console.log(JSON.stringify(response.data));
            console.log(response.data);
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsNull(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne/null', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('null', JSON.stringify(response.data));
            console.log("null");
            console.log(JSON.stringify(response.data));
            console.log(response.data);
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsKey(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne/key', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('key', JSON.stringify(response.data));
            console.log("key");
            console.log(JSON.stringify(response.data));
            console.log(response.data);
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsDefault(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne/default', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('default', JSON.stringify(response.data));
            console.log("default");
            console.log(JSON.stringify(response.data));
            console.log(response.data);
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsExtra(connectionDetails) {
    try {
        const response = await axios.post('/query/sqlColonne/extra', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('extra', JSON.stringify(response.data));
            console.log("extra");
            console.log(JSON.stringify(response.data));
            console.log(response.data);
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsJoin(connectionDetails) {
    try {
        console.log(connectionDetails)
        const response = await axios.post('/query/sqlColonne', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('availableColumnsJoin', JSON.stringify(response.data));
            PopUpStore.showPopup(GREEN, SUCCESS, CONNECTION_SUCCESSFUL);

            return response.data; // Return the columns
        } else {
            PopUpStore.showPopup(RED, ERROR, JOIN_ERROR)
        }
    } catch (error) {
        PopUpStore.showPopup(RED, ERROR, JOIN_ERROR)
    }
}


/**
 *
 *          MYSQL
 *
 */



export async function loadColumnsOracle(connectionDetails) {
    try {
        const response = await axios.post('/query/oracleColonne', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });


        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('availableColumnsOracle', JSON.stringify(response.data));
            PopUpStore.showPopup(GREEN, SUCCESS, CONNECTION_SUCCESSFUL);
            return response.data; // Return the columns
        } else {
            PopUpStore.showPopup(RED, ERROR, 'Si è verificato un errore durante la connessione al DB.')
        }
    } catch (error) {
        PopUpStore.showPopup(RED, ERROR, 'Si è verificato un errore durante la connessione al DB.')
    }
}


export async function loadColumnsTipoOracle(connectionDetails) {
    try {
        const response = await axios.post('/query/oracleColonne/tipo', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('tipoOracle', JSON.stringify(response.data));
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }

}


export async function loadColumnsNullOracle(connectionDetails) {
    try {
        const response = await axios.post('/query/oracleColonne/null', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('nullOracle', JSON.stringify(response.data));
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsLengthOracle(connectionDetails) {
    try {
        const response = await axios.post('/query/oracleColonne/length', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('lengthOracle', JSON.stringify(response.data));
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }

}


export async function loadColumnsDefaultOracle(connectionDetails) {
    try {
        const response = await axios.post('/query/oracleColonne/default', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('defaultOracle', JSON.stringify(response.data));
            return response.data; // Return the columns
        }
    } catch (e) {
        console.log(e);
    }
}


export async function loadColumnsJoinOracle(connectionDetails) {
    try {
        console.log(connectionDetails)
        const response = await axios.post('/query/oracleColonne', connectionDetails, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is OK (HTTP status code in the range 200-299)
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            // Save the columns in localStorage
            localStorage.setItem('availableColumnsJoinOracle', JSON.stringify(response.data));
            PopUpStore.showPopup(GREEN, SUCCESS, CONNECTION_SUCCESSFUL);

            return response.data; // Return the columns
        } else {
            PopUpStore.showPopup(RED, ERROR, JOIN_ERROR)
        }
    } catch (error) {
        // Error handling
        PopUpStore.showPopup(RED, ERROR, JOIN_ERROR)
    }
}