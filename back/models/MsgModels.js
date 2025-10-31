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

// models/MsgModels.js

const readMsg = async (id) => {
    try {
        // Agora passamos a query SQL completa e os parâmetros em um array
        const sql = "SELECT * FROM mensagens_suporte WHERE id = ?";
        const usuario = await read(sql, [id]); 
        
        // A 'read' retorna um array, então pegamos o primeiro elemento
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
    // 1. LIMPA O CPF: Remove todos os caracteres que não são dígitos.
    const cleanCPF = data.cpf.replace(/\D/g, '');

    // 2. VALIDA O CPF JÁ LIMPO
    if (!cpfValidator.isValid(cleanCPF)) {
      const error = new Error("O CPF fornecido é inválido. Por favor, insira um CPF real.");
      error.statusCode = 400;
      throw error;
    }
    
    // 3. VERIFICA DUPLICIDADE COM O CPF LIMPO
    const existingUser = await findUserByCpf(cleanCPF);
    if (existingUser) {
      const error = new Error("Este CPF já está cadastrado. Por favor, insira um CPF válido.");
      error.statusCode = 409;
      throw error;
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const dataUsuario = {
      nome: data.nome,
      cpf: cleanCPF, // 4. SALVA O CPF LIMPO NO BANCO DE DADOS
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
    // 1. COMEÇAMOS COM UM OBJETO VAZIO
    const conteudo = {};

    // 2. ADICIONAMOS AS PROPRIEDADES CONDICIONALMENTE
    // Se 'data.nome' existir, adicionamos ao objeto.
    if (data.nome) conteudo.nome = data.nome;
    if (data.cpf) conteudo.cpf = data.cpf;
    if (data.cargo) conteudo.cargo = data.cargo;
    if (data.statusConta) conteudo.statusConta = data.statusConta;

    // A lógica da senha permanece a mesma
    if (data.senha) {
      conteudo.senha = await bcrypt.hash(data.senha, 10);
    }

    // 3. VERIFICAMOS SE HÁ ALGO PARA ATUALIZAR
    // Se o objeto 'conteudo' estiver vazio, não há nada a fazer.
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
      // --- INÍCIO DA ALTERAÇÃO ---
      // 1. Limpa o termo de busca, removendo pontos, traços, etc.
      const searchTerm = filters.search.replace(/\D/g, '');

      // 2. A busca por CPF agora usa o termo limpo.
      //    A busca por nome continua usando o termo original.
      whereClauses.push(`(nome LIKE ? OR cpf LIKE ?)`);
      queryParams.push(`%${filters.search}%`, `%${searchTerm}%`); // AQUI ESTÁ A MUDANÇA
      // --- FIM DA ALTERAÇÃO ---
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

    // O resto da função continua igual...
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