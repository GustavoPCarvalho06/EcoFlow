export function verificaPermissao(user, rolesPermitidas = []) {
    if (!user || !user.cargo) return false;
    return rolesPermitidas.includes(user.cargo);
  }