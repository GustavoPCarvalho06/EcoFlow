import {read, readAll, deleteRecord, create, update} from "../config/database.js"
import bcrypt from "bcryptjs"; 


const deleteUser = async (id) => {
    try {
        const usuario = await deleteRecord("usuarios", `id = '${id}'`)
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}


const readAllUser = async (id) => {
    try {
        const usuario = await readAll("usuarios")
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}

const readUser = async (id) => {
    try {
        const usuario = await read("usuarios", `id = '${id}'`)
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}

const readUserEmail = async (email) => {
    try {
        const usuario = await read("usuarios", `emai = '${email}'`)
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}


const createUser = async (data) => {
    try {
     
      const senhaHash = await bcrypt.hash(data.senha, 10);
  
      const dataUsuario = {
        nome: data.nome,
        cpf: data.cpf,
        senha: senhaHash,
        cargo: data.cargo
      };
  
      await create("usuarios", dataUsuario);
      return;
    } catch (err) {
      console.error("Houve um erro ao criar o usuario: ", err);
      throw err;
    }
  };

  const updateUser = async (data, cpf) => {
    try {
      const senhaHash = data.senha ? await bcrypt.hash(data.senha, 10) : undefined;
  
      const conteudo = {
        nome: data.nome,
        cpf: data.cpf,   
        cargo: data.cargo,
        statusConta: data.statusConta,
      };
  
      if (senhaHash) {
        conteudo.senha = senhaHash;
      }
  
      await update("usuarios", conteudo, `cpf = '${cpf}'`);
      return "Usuário atualizado com sucesso";
  
    } catch (err) {
      console.log("Erro na camada de serviço ao atualizar o usuário: ", err);
      throw err;
    }
  };
  



const changeStatus = async (data, id) => {
    try {

        update("usuarios", {status: data.status} , `id = '${id}'`)
        return ("Usuario atualizado com sucesso")
    } catch (err){
        console.log("Erro ao atualizar usuarios")
        throw err;
    }
}

const changeFuncao = async (data, id) => {
    try {

        update("usuarios", {funcao: data.funcao} , `id = '${id}'`)
        return ("Usuario atualizado com sucesso")
    } catch (err){
        console.log("Erro ao atualizar usuarios")
        throw err;
    }
}



export {readAllUser, readUser, readUserEmail,   createUser, updateUser, changeStatus, changeFuncao,deleteUser}