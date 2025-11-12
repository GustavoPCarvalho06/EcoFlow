import {read, readAll, deleteRecord, create, update} from "../config/database.js"
import { findUserByCpf } from "./loginModel.js";
import { cpf as cpfValidator } from 'cpf-cnpj-validator'; 
import bcrypt from "bcryptjs"; 
// =======================================================
// PASSO 1: Importe a nova biblioteca
// =======================================================
import cep from 'cep-promise';
import crypto from 'crypto';


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
        const sql = "SELECT * FROM usuarios WHERE id = ?";
        const usuario = await read(sql, [id]); 
        return usuario.length > 0 ? usuario[0] : null; 

    } catch (err) {
        console.error("Erro ao consultar o usuario ao sistema, erro: ", err);
        throw err;
    }
};

const readUserEmail = async (email) => {
    try {
        const usuario = await read("usuarios", `email = '${email}'`)
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
    // 1. LIMPA OS DADOS DE ENTRADA
    const cleanCPF = data.cpf.replace(/\D/g, '');
    const cleanCEP = data.CEP.replace(/\D/g, ''); 
     
    // =======================================================
    // PASSO 2: VALIDAÇÃO DE EXISTÊNCIA DO CEP
    // =======================================================
    try {
        await cep(cleanCEP); // Tenta buscar o CEP. Se não encontrar, lança um erro.
    } catch (error) {
        // Se a biblioteca cep-promise der erro, significa que o CEP não foi encontrado.
        const cepError = new Error("O CEP fornecido não foi encontrado ou é inválido.");
        cepError.statusCode = 404; // Not Found
        throw cepError;
    }

    // 3. VALIDA O CPF JÁ LIMPO
    if (!cpfValidator.isValid(cleanCPF)) {
      const error = new Error("O CPF fornecido é inválido. Por favor, insira um CPF real.");
      error.statusCode = 400;
      throw error;
    }
    
    // 4. VERIFICA DUPLICIDADE COM O CPF LIMPO
    const existingUser = await findUserByCpf(cleanCPF);
    if (existingUser) {
      const error = new Error("Este CPF já está cadastrado. Por favor, insira um CPF válido.");
      error.statusCode = 409;
      throw error;
    }

     const token = crypto.randomBytes(32).toString('hex'); // <-- 2. GERE UM TOKEN SEGURO
    const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000); // <-- 3. VALIDADE DE 24 HORAS

    const senhaHash = await bcrypt.hash(data.senha, 10);
    
    const dataUsuario = {
      nome: data.nome,
      cpf: cleanCPF,
      senha: senhaHash,
      cargo: data.cargo,
      email: data.email,
      sexo: data.sexo,
      estadoCivil: data.estadoCivil,
      CEP: cleanCEP,
      statusConta: 'desligado', // <-- 4. SEMPRE CRIAR COMO 'desligado'
      token_verificacao: token, // <-- 5. SALVE O TOKEN
      expiracao_token_verificacao: expiracao // <-- 6. SALVE A EXPIRAÇÃO
    };


    await create("usuarios", dataUsuario);
    return { email: data.email, token: token };

  } catch (err) {
    // Repassa o erro (seja de CEP, CPF ou outro) para o controller tratar.
    throw err;
  }
};

const updateUser = async (data, cpf) => {
  try {
    const conteudo = {};

    if (data.nome) conteudo.nome = data.nome;
    if (data.cargo) conteudo.cargo = data.cargo;
    if (data.email) conteudo.email = data.email;
    if (data.statusConta) conteudo.statusConta = data.statusConta;
    if (data.sexo) conteudo.sexo = data.sexo;
    if (data.estadoCivil) conteudo.estadoCivil = data.estadoCivil;
    
    // =======================================================
    // PASSO 3: VALIDAÇÃO DE CEP TAMBÉM NA ATUALIZAÇÃO
    // =======================================================
    if (data.CEP) {
        const cleanCEP = data.CEP.replace(/\D/g, '');
        try {
            await cep(cleanCEP);
        } catch (error) {
            const cepError = new Error("O CEP fornecido não foi encontrado ou é inválido.");
            cepError.statusCode = 404;
            throw cepError;
        }
        conteudo.CEP = cleanCEP;
    }

    if (data.senha) {
      conteudo.senha = await bcrypt.hash(data.senha, 10);
    }

    if (Object.keys(conteudo).length === 0) {
      return "Nenhum dado fornecido para atualização.";
    }

    await update("usuarios", conteudo, `cpf = '${cpf}'`);
    return "Usuário atualizado com sucesso";

  } catch (err) {
    // Repassa o erro para o controller
    throw err;
  }
};
  
const findUsersPaginated = async ({ filters = {}, page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC' }) => {
  try {
    let whereClauses = [];
    let queryParams = [];

    if (filters.search) {
      const originalSearchTerm = filters.search;
      const numericSearchTerm = originalSearchTerm.replace(/\D/g, '');
      const searchConditions = [];
      searchConditions.push(`nome LIKE ?`);
      queryParams.push(`%${originalSearchTerm}%`);
      if (numericSearchTerm.length > 0) {
        searchConditions.push(`cpf LIKE ?`);
        queryParams.push(`%${numericSearchTerm}%`);
      }
      whereClauses.push(`(${searchConditions.join(' OR ')})`);
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
      SELECT id, nome, cpf, cargo, statusConta, email, sexo, estadoCivil, CEP
      FROM usuarios 
      ${whereString} 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT ? OFFSET ?
    `;
    
    const finalDataParams = [...queryParams, limit, offset];
    const users = await read(dataQuery, finalDataParams);

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






const findUserByCpfWithEmail = async (cpf) => {
    try {
        const sql = "SELECT email FROM usuarios WHERE cpf = ?";
        const [user] = await read(sql, [cpf]);
        return user;
    } catch (err) {
        console.error("Erro ao buscar usuário por CPF e email:", err);
        throw err;
    }
};

const saveRecoveryCode = async (cpf, codigo, expiracao) => {
    try {
        const data = {
            codigo_recuperacao: codigo,
            expiracao_codigo: expiracao
        };
        await update("usuarios", data, `cpf = '${cpf}'`);
    } catch (err) {
        console.error("Erro ao salvar código de recuperação:", err);
        throw err;
    }
};

const findUserByCpfAndCode = async (cpf, codigo) => {
    try {
        const sql = "SELECT id FROM usuarios WHERE cpf = ? AND codigo_recuperacao = ? AND expiracao_codigo > NOW()";
        const [user] = await read(sql, [cpf, codigo]);
        return user;
    } catch (err) {
        console.error("Erro ao verificar código:", err);
        throw err;
    }
};

const updatePasswordByCpf = async (cpf, newPassword) => {
    try {
        const senhaHash = await bcrypt.hash(newPassword, 10);
        const data = {
            senha: senhaHash,
            codigo_recuperacao: null, // Limpa o código após o uso
            expiracao_codigo: null
        };
        await update("usuarios", data, `cpf = '${cpf}'`);
    } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        throw err;
    }
};

const verifyUserByToken = async (token) => {
    try {
        // 1. Encontra o usuário pelo token
        const sqlFind = "SELECT id, expiracao_token_verificacao FROM usuarios WHERE token_verificacao = ?";
        const [user] = await read(sqlFind, [token]);

        if (!user) {
            throw new Error("Token de verificação inválido.");
        }

        // 2. Verifica se o token expirou
        if (new Date(user.expiracao_token_verificacao) < new Date()) {
            throw new Error("Seu link de verificação expirou.");
        }

        // 3. Ativa o usuário e limpa o token
        const dataUpdate = {
            statusConta: 'ativo',
            token_verificacao: null,
            expiracao_token_verificacao: null
        };
        await update("usuarios", dataUpdate, `id = '${user.id}'`);

        return true;
    } catch (err) {
        console.error("Erro no model ao verificar token:", err);
        throw err; // Repassa o erro para o controller
    }
};

export {readAllUser, readUser, readUserEmail,   createUser, updateUser, changeStatus, changeFuncao,deleteUser,findUsersPaginated,
  findUserByCpfWithEmail,saveRecoveryCode,findUserByCpfAndCode,updatePasswordByCpf,verifyUserByToken}