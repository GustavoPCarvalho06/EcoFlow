export function filtrarPontos(pontos, filtro) {
  switch (filtro) {
    case "Prioridade: Maxima":
      return pontos.filter(p => p.Stats === "Cheia");
    case "Coleta Padrão":
      return pontos.filter(p => p.Stats === "Cheia" || p.Stats === "Quase Cheia");
    case "Prioridade: Média":
      return pontos.filter(p => p.Stats === "Quase Cheia");
    case "Prioridade: Baixa":
      return pontos.filter(p => p.Stats === "Vazia");
    default:
      return [];
  }
}

export function routeToLatLngArray(geometry) {
  if (!geometry || !geometry.coordinates) return [];
  return geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}
