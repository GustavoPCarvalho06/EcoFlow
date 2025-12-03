// =================================================================================
// Arquivo: back/controllers/DashboardController.js
// =================================================================================

import { getLixeirasStats, getColetoresCount } from "../models/DashboardModel.js";

const getDashboardData = async (req, res) => {
    try {
        // 1. Busca estatísticas das lixeiras
        const lixeirasRaw = await getLixeirasStats();
        
        // Inicializa contadores
        let vazias = 0;
        let quaseCheias = 0;
        let cheias = 0;

        // Processa o retorno do banco
        lixeirasRaw.forEach(item => {
            if (item.statusLixo === 'Vazia') vazias = item.total;
            else if (item.statusLixo === 'Quase Cheia') quaseCheias = item.total;
            else if (item.statusLixo === 'Cheia') cheias = item.total;
        });

        const totalLixeiras = vazias + quaseCheias + cheias;
        
        // 2. Busca total de coletores
        const totalColetores = await getColetoresCount();

        // 3. Calcula Eficiência
        // Fórmula pedida: Porcentagem de vazias em relação ao total
        // (Vazia / Total) * 100
        let eficiencia = 0;
        if (totalLixeiras > 0) {
            eficiencia = (vazias / totalLixeiras) * 100;
        }

        // Monta o objeto de resposta
        const dashboardData = {
            cards: {
                totalLixeiras: totalLixeiras,
                totalColetores: totalColetores,
                lixeirasCheias: cheias, // Alertas Críticos
                eficiencia: Math.round(eficiencia)
            },
            graficos: {
                vazias,
                quaseCheias,
                cheias
            }
        };

        return res.status(200).json(dashboardData);

    } catch (err) {
        console.error("Erro no DashboardController:", err);
        return res.status(500).json({ mensagem: "Erro ao buscar dados do dashboard." });
    }
};

export default { getDashboardData };