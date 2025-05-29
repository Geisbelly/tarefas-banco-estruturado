import { 
      criarUsuario,
      login
 } from '../services/auth.service.js';



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


