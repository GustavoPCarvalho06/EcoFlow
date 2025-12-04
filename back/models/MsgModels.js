import {read, readAll, deleteRecord, create, update} from "../config/database.js"
import { findUserByCpf } from "./loginModel.js";
import { cpf as cpfValidator } from 'cpf-cnpj-validator'; 
import bcrypt from "bcryptjs"; 


const deleteMsg = async (id) => {
    try {
        const usuario = await deleteRecord("mensagens_suporte", `id = '${id}'`)
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}


const readAllMsg = async (id) => {
    try {
        const usuario = await readAll("mensagens_suporte")
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}


const readMsg = async (id) => {
    try {
        const sql = "SELECT * FROM mensagens_suporte WHERE id = ?";
        const usuario = await read(sql, [id]); 
        
        return usuario.length > 0 ? usuario[0] : null; 

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err);
        throw err;
    }
};

const readMsgEmail = async (email) => {
    try {
        const usuario = await read("mensagens_suporte", `email = '${email}'`)
        if (!usuario) {
            return 'ERRO ao consultar'
        }
        return usuario

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err)
        throw err
    }
}


const createMsg = async (data) => {
  try {

    const cleanCPF = data.cpf.replace(/\D/g, '');

    if (!cpfValidator.isValid(cleanCPF)) {
      const error = new Error("O CPF fornecido é inválido. Por favor, insira um CPF real.");
      error.statusCode = 400;
      throw error;
    }
    
    const existingUser = await findUserByCpf(cleanCPF);
    if (existingUser) {
      const error = new Error("Este CPF já está cadastrado. Por favor, insira um CPF válido.");
      error.statusCode = 409;
      throw error;
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const dataUsuario = {
      nome: data.nome,
      cpf: cleanCPF, 
      senha: senhaHash,
      cargo: data.cargo,
      statusConta: 'ativo'
    };

    await create("mensagens_suporte", dataUsuario);
    return;

  } catch (err) {
    throw err;
  }
};

const updateMsg = async (data, cpf) => {
  try {
    
    const conteudo = {};

   
    if (data.nome) conteudo.nome = data.nome;
    if (data.cpf) conteudo.cpf = data.cpf;
    if (data.cargo) conteudo.cargo = data.cargo;
    if (data.statusConta) conteudo.statusConta = data.statusConta;

    if (data.senha) {
      conteudo.senha = await bcrypt.hash(data.senha, 10);
    }

    if (Object.keys(conteudo).length === 0) {
      return "Nenhum dado fornecido para atualização.";
    }

    await update("mensagens_suporte", conteudo, `cpf = '${cpf}'`);
    return "Usuário atualizado com sucesso";

  } catch (err) {
    console.log("Erro na camada de serviço ao atualizar o usuário: ", err);
    throw err;
  }
};
  

const findMsgPaginated = async ({ filters = {}, page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC' }) => {
  try {
    let whereClauses = [];
    let queryParams = [];

    if (filters.search) {
     
      const searchTerm = filters.search.replace(/\D/g, '');

      whereClauses.push(`(nome LIKE ? OR cpf LIKE ?)`);
      queryParams.push(`%${filters.search}%`, `%${searchTerm}%`); 
      
    }
    if (filters.cargo) {
      whereClauses.push(`cargo = ?`);
      queryParams.push(filters.cargo);
    }
    if (filters.statusConta) {
      whereClauses.push(`statusConta = ?`);
      queryParams.push(filters.statusConta);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT id, nome, cpf, cargo, statusConta 
      FROM usuarios 
      ${whereString} 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT ? OFFSET ?
    `;
    const users = await read(dataQuery, [...queryParams, limit, offset]);

    const countQuery = `SELECT COUNT(*) as total FROM usuarios ${whereString}`;
    const [countResult] = await read(countQuery, queryParams);
    const total = countResult.total;

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("Erro ao buscar usuários com paginação: ", err);
    throw err;
  }
};

const changeStatus = async (data, id) => {
    try {

        update("mensagens_suporte", {status: data.status} , `id = '${id}'`)
        return ("Usuario atualizado com sucesso")
    } catch (err){
        console.log("Erro ao atualizar usuarios")
        throw err;
    }
}

const changeFuncao = async (data, id) => {
    try {

        update("mensagens_suporte", {funcao: data.funcao} , `id = '${id}'`)
        return ("Usuario atualizado com sucesso")
    } catch (err){
        console.log("Erro ao atualizar usuarios")
        throw err;
    }
}



export {readAllMsg, readMsg, readMsgEmail,   createMsg, updateMsg, changeStatus, changeFuncao,deleteMsg,findMsgPaginated}