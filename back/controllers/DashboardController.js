import { getLixeirasStats, getColetoresCount } from "../models/DashboardModel.js";

const getDashboardData = async (req, res) => {
    try {
       
        const lixeirasRaw = await getLixeirasStats();
        
        
        let vazias = 0;
        let quaseCheias = 0;
        let cheias = 0;

       
        lixeirasRaw.forEach(item => {
            if (item.statusLixo === 'Vazia') vazias = item.total;
            else if (item.statusLixo === 'Quase Cheia') quaseCheias = item.total;
            else if (item.statusLixo === 'Cheia') cheias = item.total;
        });

        const totalLixeiras = vazias + quaseCheias + cheias;
        
        const totalColetores = await getColetoresCount();

        
        let eficiencia = 0;
        if (totalLixeiras > 0) {
            eficiencia = (vazias / totalLixeiras) * 100;
        }

        const dashboardData = {
            cards: {
                totalLixeiras: totalLixeiras,
                totalColetores: totalColetores,
                lixeirasCheias: cheias,
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