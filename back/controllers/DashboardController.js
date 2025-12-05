import { getLixeirasStats, getColetoresCount, getHistoryStats } from "../models/DashboardModel.js";

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

        const historyRaw = await getHistoryStats();

        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const ultimos7Dias = [];
        const hoje = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(hoje.getDate() - i);
            const dataFormatada = d.toISOString().split('T')[0]; 
            
            const dadosBanco = historyRaw.find(h => h.data === dataFormatada);

            ultimos7Dias.push({
                dia: diasSemana[d.getDay()], 
                coletas: dadosBanco ? parseInt(dadosBanco.coletas) : 0,
                alertas: dadosBanco ? parseInt(dadosBanco.alertas) : 0
            });
        }

        const dashboardData = {
            cards: {
                totalLixeiras: totalLixeiras,
                totalColetores: totalColetores,
                lixeirasCheias: cheias,
                eficiencia: Math.round(eficiencia)
            },
            graficoRosca: {
                vazias,
                quaseCheias,
                cheias
            },
            graficoBarra: {
                labels: ultimos7Dias.map(d => d.dia),
                coletas: ultimos7Dias.map(d => d.coletas),
                alertas: ultimos7Dias.map(d => d.alertas)
            }
        };

        return res.status(200).json(dashboardData);

    } catch (err) {
        console.error("Erro no DashboardController:", err);
        return res.status(500).json({ mensagem: "Erro ao buscar dados do dashboard." });
    }
};

export default { getDashboardData };