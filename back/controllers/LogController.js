import { getLogsPaginated } from "../models/LogModel.js";

const listarLogsController = async (req, res) => {
    try {
        const { page, limit, search, acao, usuario_id } = req.query;

        const resultado = await getLogsPaginated({ 
            page: page || 1, 
            limit: limit || 10,
            search: search || '',
            acao: acao || '',
            target_user_id: usuario_id 
        });

        return res.status(200).json(resultado);
    } catch (err) {
        console.error("Erro no controller de logs:", err);
        return res.status(500).json({ mensagem: "Erro ao buscar logs." });
    }
};

export default { listarLogsController };