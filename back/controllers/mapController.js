import { getAllPoints } from '../models/mapModel.js';

export async function listarPontos(req, res) {
  try {
    const pontos = await getAllPoints();
    res.json(pontos);
  } catch (err) {
    console.error('Erro ao listar pontos:', err);
    res.status(500).json({ error: 'Erro ao buscar pontos no banco de dados' });
  }
}
