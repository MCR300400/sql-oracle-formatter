// ColonneStore.js
import axios from 'axios';


/**
 * 
 *          MYSQL 
 *  
 */

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
            return response.data; // Return the columns
        } else {
            throw new Error('Errore nel caricamento delle colonne: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne tipo: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne tipo: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne null: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne null: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne key : Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne key: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne default: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne default: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne extra: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne extra: ' + error.message);
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
            return response.data; // Return the columns
        } else {
            throw new Error('Errore nel caricamento delle colonne: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne: ' + error.message);
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
            return response.data; // Return the columns
        } else {
            throw new Error('Errore nel caricamento delle colonne: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne tipo: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne tipo: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne null: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne null: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne key : Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne key: ' + error.message);
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
        } else {
            throw new Error('Errore nel caricamento delle colonne default: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne default: ' + error.message);
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
            return response.data; // Return the columns
        } else {
            throw new Error('Errore nel caricamento delle colonne: Risposta non valida');
        }
    } catch (error) {
        // Error handling
        throw new Error('Errore nel caricamento delle colonne: ' + error.message);
    }
}