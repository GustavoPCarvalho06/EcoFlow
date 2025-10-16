import mapa from '../models/rotasModel.js';

const readCordenadas = async (req, res) => {
    try {
        const dataCordenadas = await mapa.readCordinates(req.params.id);
        res.status(200).json({ mensagem: dataCordenadas });
    } catch (err) {
        console.error("Houve um erro ao buscar os sensores: ", err);
        res.status(500).json({ mensagem: 'Houve um erro ao buscar os sensores' });
    }
};

export default { readCordenadas };
