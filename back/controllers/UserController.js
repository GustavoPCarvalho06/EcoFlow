import {readAllUser, readUser, createUser, updateUser, changeStatus, changeFuncao} from "../models/UserModels.js"



const createUserController = async (req, res) => {
    try {
        const userData = req.body;
        

        if (userData || userData.id_login ){
            try{
                console.log("RESPOSTA", req.body)
                await createUser (req.body, req.params.id || userData )
                return res.status(200).json({mensagem: "Usuario criado com sucesso"})
            } catch (err) {
                console.error("Erro ao criar um Usuario: ", err)
                return res.status(400).json({mensagem: "Erro ao criar um Usuario"})
            }
        } else {
            return res.status(400).json({mensagem: "Erro ao criar um Usuario, usuario não encontrado"})
        }


    } catch (err) {
        console.error("Erro no controller ao atualizar usuário: ", err);
        return res.status(500).json({ mensagem: "Erro interno ao tentar atualizar o usuário." });
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
        console.error("Erro ao Ler meus Chamdos: ", err)
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

export default{changeStatusUserController, readFilterUserController, readAllUserController, updateUserController, changeFuncaoUserController,createUserController}