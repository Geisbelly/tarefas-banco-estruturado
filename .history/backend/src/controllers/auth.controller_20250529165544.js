import { 
     atualizarUsuario,
     buscarTodosEmails,
      buscarUsuarioPorId,
      buscarUsuariosPorEmail,
      criarUsuario,
      deletarUsuario,
      login
 } from '../services/auth.service.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuario = await buscarTodosEmails();
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno ao listar usuários' });
  }
};

export const cadastrarUsuario = async (req, res) => {
  try {
    const body = req.body;
    const novoUsuario = await criarUsuario(body.nome, body.email, body.senha);
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
};

export const loginin = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await login(email, senha);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(401).json({ error: 'Email ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;            // Pega o id da URL
    const dadosNovos = req.body;         // Dados para atualizar

    // Supondo que atualizarUsuario(id, dadosNovos) retorne o usuário atualizado
    const usuarioAtualizado = await atualizarUsuario(id, dadosNovos);

    if (!usuarioAtualizado) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(usuarioAtualizado); // Retorna o usuário atualizado
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;            // Pega o id da URL

    const usuarioDeletado = await deletarUsuario(id);

    if (!usuarioDeletado) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(usuarioDeletado); // Retorna o usuário deletado
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao deletar usuário' });
  }
};

