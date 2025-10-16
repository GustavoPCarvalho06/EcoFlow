import { readAll } from "../config/database.js";

const readCordinates = async (lixo_id) => {
    try {

        const dataCordinates = await readAll('RotasRelatorio', `ID = ${lixo_id}`);
        return dataCordinates;
    } catch (err) {
        console.error("Houve um erro ao buscar os checkpoints: ", err);
        return [];
    }
};

export default { readCordinates };
