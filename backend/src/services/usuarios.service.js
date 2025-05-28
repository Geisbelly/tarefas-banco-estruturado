import { usuarios } from '../models/usuario.model.js';

export const getUsuarios = () => {
  return usuarios;
};

export const addUsuario = (data) => {
  const novo = {
    id: usuarios.length + 1,
    nome: data.nome,
  };
  usuarios.push(novo);
  return novo;
};
