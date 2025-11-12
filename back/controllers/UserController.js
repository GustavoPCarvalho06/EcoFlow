import {readAllUser, readUser, createUser, updateUser, changeStatus, changeFuncao,findUsersPaginated} from "../models/UserModels.js"
import { sendVerificationEmail } from '../config/mailer.js'; 


const createUserController = async (req, res) => {
  try {
    const userData = req.body;

    if (!userData || !userData.cpf || !userData.senha || !userData.nome || !userData.email || !userData.estadoCivil || !userData.CEP) {
      return res.status(400).json({ mensagem: "Dados insuficientes para criar o usuário." });
    }

    // 1. Chama a função UMA ÚNICA VEZ
    const { email, token } = await createUser(userData);

    // 2. Envia o e-mail
    await sendVerificationEmail(email, token);

    // 3. Retorna a resposta de sucesso
    return res.status(201).json({ mensagem: "Usuário criado com sucesso. Um e-mail de verificação foi enviado." });

  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ mensagem: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ mensagem: err.message });
    }
    if (err.statusCode === 409) {
      return res.status(409).json({ mensagem: err.message });
    }
    if (err.message === "Não foi possível enviar o e-mail de verificação.") {
        // Este erro pode acontecer se o usuário for criado mas o email falhar.
        return res.status(500).json({ mensagem: "Usuário criado, mas houve uma falha ao enviar o e-mail de verificação. Contate o suporte." });
    }
    
    console.error("Erro no controller ao criar usuário: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao tentar criar o usuário." });
  }
};

// Renomeei para ficar consistente com a rota
const findUsersPaginatedController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      cargo = '', 
      statusConta = '',
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;

    const filters = { search, cargo, statusConta };
    Object.keys(filters).forEach(key => (filters[key] === '' || filters[key] === 'todos') && delete filters[key]);
    
    const result = await findUsersPaginated({ 
      filters, 
      page: parseInt(page), 
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao ler usuários paginados: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao buscar usuários." });
  }
};

const updateUserController = async (req, res) => {
    try {
      const { cpf } = req.body; 
      const userData = req.body; 
  
      if (!cpf) {
        return res.status(400).json({ mensagem: "CPF do usuário não fornecido para atualização" });
      }
  
      await updateUser(userData, cpf);
      return res.status(200).json({ mensagem: "Usuário atualizado com sucesso" });
  
    } catch (err) {
      // =======================================================
      // LÓGICA DE TRATAMENTO DE ERRO COMPLETA ADICIONADA AQUI
      // =======================================================
      // CAPTURA DO ERRO DE CEP NÃO ENCONTRADO
      if (err.statusCode === 404) {
        return res.status(404).json({ mensagem: err.message });
      }

      // CAPTURA DO ERRO DE FORMATO INVÁLIDO (ex: CEP com menos de 8 dígitos)
      if (err.statusCode === 400) {
        return res.status(400).json({ mensagem: err.message });
      }
      
      // CAPTURA DE OUTROS ERROS
      console.error("Erro no controller ao atualizar usuário: ", err);
      return res.status(500).json({ mensagem: "Erro interno ao atualizar o usuário" });
    }
};
  

const changeFuncaoUserController = async (req, res) => {
    try { 
        const data = await readUser(req.params.id)

        if (data.length != 0 ){
            try{
                await changeFuncao (req.body, req.params.id )
                return res.status(200).json({mensagem: "funcao Usuario atualizado com sucesso ---"})
            } catch (err) {
                console.error("Erro ao atualizar um Usuario: ", err)
                return res.status(400).json({mensagem: "Erro ao atualizar funcao um Usuario"})
            }
        } else {
            return res.status(400).json({mensagem: "Erro ao atualizar um Usuario, funcao usuario não encontrado"})
        }
    } catch (err) {
        console.error("Erro ao atualizar um Usuario: ", err)
        return res.status(400).json({mensagem: "Erro ao atualizar um Usuario funcao 2"})
    }
}

const changeStatusUserController = async (req, res) => {
    try { 
        const data = await readUser(req.params.id)

        if (data.length != 0 ){
            try{
                await changeStatus (req.body, req.params.id )
                return res.status(200).json({mensagem: "funcao Usuario atualizado com sucesso ---"})
            } catch (err) {
                console.error("Erro ao atualizar um Usuario: ", err)
                return res.status(400).json({mensagem: "Erro ao atualizar funcao um Usuario"})
            }
        } else {
            return res.status(400).json({mensagem: "Erro ao atualizar um Usuario, funcao usuario não encontrado"})
        }
    } catch (err) {
        console.error("Erro ao atualizar um Usuario: ", err)
        return res.status(400).json({mensagem: "Erro ao atualizar um Usuario funcao 2"})
    }
}


const readFilterUserController = async (req,res) =>{
    try {
        return res.status(200).json( await readUser(req.params.id))
    } catch (err) {
        console.error("Erro ao Ler meus Chamados: ", err)
        return res.status(400).json({mensagem:"Erro ao ler meus Usuarios"})
    }
};

const readAllUserController = async (req,res) =>{
    try {
        
        return res.status(200).json(await readAllUser())
    } catch (err) {
        console.error("Erro ao Ler meus Chamdos: ", err)
        return res.status(400).json({mensagem:"Erro ao ler meus Usuarios"})
    }
};

export default{changeStatusUserController, readFilterUserController, readAllUserController, updateUserController, changeFuncaoUserController,createUserController,readPaginatedController: findUsersPaginatedController}