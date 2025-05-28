import { getUsuarios, addUsuario } from '../services/usuarios.service.js';

export const listarUsuarios = (req, res) => {
  const usuarios = getUsuarios();
  res.json(usuarios);
};

export const criarUsuario = (req, res) => {
  const novoUsuario = addUsuario(req.body);
  res.status(201).json(novoUsuario);
};
