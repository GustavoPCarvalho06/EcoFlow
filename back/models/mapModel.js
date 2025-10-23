import { readAll } from '../config/database.js';

export async function getAllPoints() {
  try {
    const pontos = await readAll('RotasRelatorio');
    return pontos;
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    throw error;
  }
}
