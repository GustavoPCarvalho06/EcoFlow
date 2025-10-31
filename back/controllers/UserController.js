import {readAllUser, readUser, createUser, updateUser, changeStatus, changeFuncao,findUsersPaginated} from "../models/UserModels.js"



const createUserController = async (req, res) => {
  try {
    const userData = req.body;

    if (!userData || !userData.cpf || !userData.senha || !userData.nome|| !userData.email) {
      return res.status(400).json({ mensagem: "Dados insuficientes para criar o usuário." });
    }

    await createUser(userData);

    return res.status(201).json({ mensagem: "Usuário criado com sucesso" });

  } catch (err) {
    // CAPTURA DO ERRO DE CPF INVÁLIDO (formato)
    if (err.statusCode === 400) {
      return res.status(400).json({ mensagem: err.message });
    }
    
    // CAPTURA DO ERRO DE CPF DUPLICADO
    if (err.statusCode === 409) {
      return res.status(409).json({ mensagem: err.message });
    }
    
    // CAPTURA DE OUTROS ERROS
    console.error("Erro no controller ao criar usuário: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao tentar criar o usuário." });
  }
};


const readPaginatedController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      cargo = '', 
      statusConta = '',
      sortBy = 'statusConta', // Ordena por status por padrão
      sortOrder = 'ASC'      // 'ativo' vem primeiro
    } = req.query;

    const filters = { search, cargo, statusConta };
    // Remove filtros vazios
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
        return res.status(400).json({ mensagem: "CPF do usuário não fornecido" });
      }
  
      await updateUser(userData, cpf);
      return res.status(200).json({ mensagem: "Usuário atualizado com sucesso" });
  
    } catch (err) {
      console.error("Erro ao atualizar usuário: ", err);
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

export default{changeStatusUserController, readFilterUserController, readAllUserController, updateUserController, changeFuncaoUserController,createUserController,readPaginatedController}