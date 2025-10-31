// middleware/auth.js (VERSÃO CORRIGIDA E ROBUSTA)

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js'; // Ótimo que você já tem isso separado!

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ------> AQUI ESTÁ A MUDANÇA <------
    // Anexamos todo o payload do token (que pode ter id, nome, etc.) a req.user
    req.user = decoded; 
    
    // Agora o próximo controller terá acesso a req.user.id, req.user.nome, etc.
    next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Não autorizado: Token inválido ou expirado.' });
  }
};

export default authMiddleware;





// import jwt from 'jsonwebtoken';
// import { JWT_SECRET } from '../config/jwt.js'; // Importar a chave secreta

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   console.log(req.headers)
//   if (!authHeader) {
//     return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido' });
//   }

//   const [ , token] = authHeader.split(' ');
//   console.log("token: ", token)
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.body.id = decoded.id;
//     next();
//   } catch (error) {
//     return res.status(403).json({ mensagem: 'Não autorizado: Token inválido', error });
//   }
// };

// export default authMiddleware;