import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js'; // Importar a chave secreta

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req.headers)
  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido' });
  }

  const [ , token] = authHeader.split(' ');
  console.log("token: ", token)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.body.id = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Não autorizado: Token inválido', error });
  }
};

export default authMiddleware;