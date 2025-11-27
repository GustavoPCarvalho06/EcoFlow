import { getLogsPaginated } from "../models/LogModel.js";

const listarLogsController = async (req, res) => {
    try {
        // Pega os filtros da URL (ex: /logs?page=1&search=joao&acao=CRIAR)
        const { page, limit, search, acao } = req.query;

        const resultado = await getLogsPaginated({ 
            page: page || 1, 
            limit: limit || 10,
            search: search || '',
            acao: acao || ''
        });

        return res.status(200).json(resultado);
    } catch (err) {
        console.error("Erro no controller de logs:", err);
        return res.status(500).json({ mensagem: "Erro ao buscar logs." });
    }
};

export default { listarLogsController };