import { getLixeirasStats, getColetoresCount, getHistoryStats } from "../models/DashboardModel.js";

const getDashboardData = async (req, res) => {
    try {
   
        const { range } = req.query; 
        const filter = range || 'semanal';

        const lixeirasRaw = await getLixeirasStats();
        let vazias = 0, quaseCheias = 0, cheias = 0;
        lixeirasRaw.forEach(item => {
            if (item.statusLixo === 'Vazia') vazias = item.total;
            else if (item.statusLixo === 'Quase Cheia') quaseCheias = item.total;
            else if (item.statusLixo === 'Cheia') cheias = item.total;
        });
        const totalLixeiras = vazias + quaseCheias + cheias;
        const totalColetores = await getColetoresCount();
        let eficiencia = totalLixeiras > 0 ? (vazias / totalLixeiras) * 100 : 0;

        const historyRaw = await getHistoryStats(filter);
        const labelsData = [];
        const hoje = new Date();

        if (filter === 'anual') {
           
            const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            
            for (let i = 11; i >= 0; i--) {
                const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
                
                const anoMesBanco = d.toISOString().slice(0, 7); 
                
                const dadosBanco = historyRaw.find(h => h.data === anoMesBanco);
                
                labelsData.push({
                    label: `${mesesNome[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`, 
                    coletas: dadosBanco ? parseInt(dadosBanco.coletas) : 0,
                    alertas: dadosBanco ? parseInt(dadosBanco.alertas) : 0
                });
            }
        } else {
        
            const diasParaVoltar = filter === 'mensal' ? 29 : 6;
            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            for (let i = diasParaVoltar; i >= 0; i--) {
                const d = new Date();
                d.setDate(hoje.getDate() - i);
                const dataFormatada = d.toISOString().split('T')[0]; 
                
                const dadosBanco = historyRaw.find(h => h.data === dataFormatada);
                const label = filter === 'mensal' 
                    ? `${d.getDate()}/${d.getMonth()+1}` 
                    : diasSemana[d.getDay()];

                labelsData.push({
                    label: label,
                    coletas: dadosBanco ? parseInt(dadosBanco.coletas) : 0,
                    alertas: dadosBanco ? parseInt(dadosBanco.alertas) : 0
                });
            }
        }

        const dashboardData = {
            cards: {
                totalLixeiras, totalColetores, lixeirasCheias: cheias, eficiencia: Math.round(eficiencia)
            },
            graficoRosca: { vazias, quaseCheias, cheias },
            graficoBarra: {
                labels: labelsData.map(d => d.label),
                coletas: labelsData.map(d => d.coletas),
                alertas: labelsData.map(d => d.alertas)
            }
        };

        return res.status(200).json(dashboardData);

    } catch (err) {
        console.error("Erro no DashboardController:", err);
        return res.status(500).json({ mensagem: "Erro ao buscar dados." });
    }
};

export default { getDashboardData };