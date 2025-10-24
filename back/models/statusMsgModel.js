import {read, readAll, deleteRecord, create, update} from "../config/database.js"

const readAllRelatorio = () => {
    try {
        return readAll("MensagensPendentes")
    } catch (err) {
        console.error("Erro ao ler todos os chamados: ", err )
        throw err
    }
}

const readFilterRelatorio = ( filter) => {
    try {
        const data = `${filter.key} = '${filter.value}'`
        
        return read ("MensagensPendentes", data)
    } catch (err) {
        console.error("Erro ao ler meus chamados", err)
        throw err
    }
};

const readFilterBetweenRelatorio = ( filter) => {
    try {
        const data = `${filter.key} BETWEEN '${filter.firstValue}' AND '${filter.secondValue}'`
        
        return read ("MensagensPendentes", data)
    } catch (err) {
        console.error("Erro ao ler meus chamados", err)
        throw err
    }
};

export {readFilterRelatorio, readAllRelatorio, readFilterBetweenRelatorio};