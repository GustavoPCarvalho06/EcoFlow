import { readAllUser, readUser, createUser, updateUser, changeStatus, changeFuncao, findUsersPaginated } from "../models/UserModels.js"
import { sendVerificationEmail } from '../config/mailer.js';
import { registrarLog } from "../models/LogModel.js"; 

const createUserController = async (req, res) => {
  try {
    const userData = req.body;

    if (!userData || !userData.cpf || !userData.senha || !userData.nome || !userData.email || !userData.estadoCivil || !userData.CEP) {
      return res.status(400).json({ mensagem: "Dados insuficientes para criar o usuário." });
    }

    const adminResponsavel = req.user;
    const { email, token } = await createUser(userData);

    await sendVerificationEmail(email, token);

    if (adminResponsavel) {
      await registrarLog({
        usuario_id: adminResponsavel.id,
        nome_usuario: adminResponsavel.nome,
        cargo_usuario: adminResponsavel.cargo,
        acao: 'CRIACAO_USUARIO',
        detalhes: `Criou um novo usuário: ${userData.nome} (Cargo: ${userData.cargo}, CPF: ${userData.cpf})`,
        ip: req.ip
      });
    }
    

    
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
      return res.status(500).json({ mensagem: "Usuário criado, mas houve uma falha ao enviar o e-mail de verificação. Contate o suporte." });
    }

    console.error("Erro no controller ao criar usuário: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao tentar criar o usuário." });
  }
};

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
    
    const adminResponsavel = req.user;

    if (!cpf) {
      return res.status(400).json({ mensagem: "CPF do usuário não fornecido para atualização" });
    }

    const cleanCpf = cpf.replace(/\D/g, '');

    await updateUser(userData, cleanCpf);

    if (adminResponsavel) {
        let acaoLog = 'EDICAO_USUARIO';
        let detalhesLog = `Atualizou os dados do usuário CPF: ${cleanCpf}`;

        if (userData.statusConta) {
            if (userData.statusConta === 'desligado') {
                acaoLog = 'DESLIGAMENTO_USUARIO';
                detalhesLog = `Desativou o usuário CPF: ${cleanCpf}`;
            } else if (userData.statusConta === 'ativo') {
                acaoLog = 'ATIVACAO_USUARIO';
                detalhesLog = `Reativou o usuário CPF: ${cleanCpf}`;
            }
        }

        await registrarLog({
            usuario_id: adminResponsavel.id,
            nome_usuario: adminResponsavel.nome,
            cargo_usuario: adminResponsavel.cargo,
            acao: acaoLog,
            detalhes: detalhesLog,
            ip: req.ip
        });
    }
  

    return res.status(200).json({ mensagem: "Usuário atualizado com sucesso" });

  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ mensagem: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ mensagem: err.message });
    }

    console.error("Erro no controller ao atualizar usuário: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao atualizar o usuário" });
  }
};


const changeFuncaoUserController = async (req, res) => {
  try {
    const data = await readUser(req.params.id)

    if (data.length != 0) {
      try {
        await changeFuncao(req.body, req.params.id)
        return res.status(200).json({ mensagem: "funcao Usuario atualizado com sucesso ---" })
      } catch (err) {
        console.error("Erro ao atualizar um Usuario: ", err)
        return res.status(400).json({ mensagem: "Erro ao atualizar funcao um Usuario" })
      }
    } else {
      return res.status(400).json({ mensagem: "Erro ao atualizar um Usuario, funcao usuario não encontrado" })
    }
  } catch (err) {
    console.error("Erro ao atualizar um Usuario: ", err)
    return res.status(400).json({ mensagem: "Erro ao atualizar um Usuario funcao 2" })
  }
}

const changeStatusUserController = async (req, res) => {
  try {
    const data = await readUser(req.params.id)

    if (data.length != 0) {
      try {
        await changeStatus(req.body, req.params.id)
        return res.status(200).json({ mensagem: "funcao Usuario atualizado com sucesso ---" })
      } catch (err) {
        console.error("Erro ao atualizar um Usuario: ", err)
        return res.status(400).json({ mensagem: "Erro ao atualizar funcao um Usuario" })
      }
    } else {
      return res.status(400).json({ mensagem: "Erro ao atualizar um Usuario, funcao usuario não encontrado" })
    }
  } catch (err) {
    console.error("Erro ao atualizar um Usuario: ", err)
    return res.status(400).json({ mensagem: "Erro ao atualizar um Usuario funcao 2" })
  }
}


const readFilterUserController = async (req, res) => {
  try {
    return res.status(200).json(await readUser(req.params.id))
  } catch (err) {
    console.error("Erro ao Ler meus Chamados: ", err)
    return res.status(400).json({ mensagem: "Erro ao ler meus Usuarios" })
  }
};

const readAllUserController = async (req, res) => {
  try {

    return res.status(200).json(await readAllUser())
  } catch (err) {
    console.error("Erro ao Ler meus Chamdos: ", err)
    return res.status(400).json({ mensagem: "Erro ao ler meus Usuarios" })
  }
};

export default { changeStatusUserController, readFilterUserController, readAllUserController, updateUserController, changeFuncaoUserController, createUserController, readPaginatedController: findUsersPaginatedController }