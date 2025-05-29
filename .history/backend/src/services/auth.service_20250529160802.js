// tarefaService.ts
import bcrypt from 'bcrypt';
import {ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from './banco.service.js'; // adapta pro teu caminho


const statusPermitidos = ['pendente', 'em andamento', 'concluida'];

const dbName = 'listaTarefas';
const collectionName = 'users';



/**
 * @typedef {Object} Tarefa
 * @property {ObjectId} [_id]
 * @property {string} nome
 * @property {string}  email
 * @property {string} senha

 */




export async function login(email, senha) {
  let usuariosCollection;

  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);

    const usuario = await usuariosCollection.findOne({ email });

    if (!usuario) {
      console.log(`Usuário com email ${email} não encontrado.`);
      return null;
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);

    if (senhaConfere) {
      console.log(`Usuário ${email} logado com sucesso!`);
      // Retorna apenas nome e email
      return {
        nome: usuario.nome,
        email: usuario.email}
    } else {
      console.log(`Senha incorreta para o usuário ${email}.`);
      return null;
    }
  } catch (err) {
    console.error(`Erro ao realizar login para o usuário ${email}:`, err);
    return null;
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}
