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



export async function criarUsuario(nome, email, senha) {
  let usuariosCollection;

  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);

    const senhaCriptografada = await bcrypt.hash(senha, 10); // 10 é o saltRounds

    const novoUsuario = {
      nome,
      email,
      senha: senhaCriptografada,
    };

    const result = await usuariosCollection.insertOne(novoUsuario);
    console.log("Usuário criado com sucesso:", result.insertedId);
    return result.insertedId;
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return null;
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}

export async function buscarTodosEmails() {
  let usuariosCollection;
  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);
    
    // Projeção: { email: 1 } significa "traz só o campo email"
    const usuarios = await usuariosCollection.find({}, { projection: { email: 1, _id: 0 } }).toArray();
    
    console.log("\n--- Emails dos Usuários ---");
    console.log(usuarios);
    return usuarios;
  } catch (err) {
    console.error("Erro ao buscar emails dos usuários:", err);
    return [];
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}


export async function buscarUsuarioPorId(id) {
  let usuariosCollection;
  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);
    if (!ObjectId.isValid(id)) {
      console.error("ID inválido:", id);
      return null;
    }
    const usuario = await usuariosCollection.findOne({ _id: new ObjectId(id) });
    console.log(`\n--- Usuário encontrado por ID (${id}) ---`);
    console.log(usuario);
    return usuario;
  } catch (err) {
    console.error(`Erro ao buscar usuário por ID (${id}):`, err);
    return null;
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}

export async function buscarUsuariosPorEmail(email) {
  let usuariosCollection;
  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);
    const usuarios = await usuariosCollection.find({ email }).toArray();
    console.log(`\n--- Usuários com email "${email}" ---`);
    console.log(usuarios);
    return usuarios;
  } catch (err) {
    console.error(`Erro ao buscar usuários por email "${email}":`, err);
    return [];
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}
export async function atualizarUsuario(id, updates) {
  let usuariosCollection;
  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);
    if (!ObjectId.isValid(id)) {
      console.error("ID inválido para atualização:", id);
      return false;
    }
    const result = await usuariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) {
      console.log(`Nenhum usuário encontrado com o ID ${id} para atualização.`);
      return false;
    } else if (result.modifiedCount > 0) {
      console.log(`Usuário com ID ${id} atualizado com sucesso!`);
      return true;
    } else {
      console.log(`Nenhuma alteração foi feita no usuário com ID ${id}.`);
      return false;
    }
  } catch (err) {
    console.error(`Erro ao atualizar usuário com ID ${id}:`, err);
    return false;
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}



export async function deletarUsuario(id) {
  let usuariosCollection;
  try {
    usuariosCollection = await connectToMongoDB(dbName, collectionName);
    if (!ObjectId.isValid(id)) {
      console.error("ID inválido para deleção:", id);
      return false;
    }
    const result = await usuariosCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      console.log(`Nenhum usuário encontrado com o ID ${id} para deleção.`);
      return false;
    } else {
      console.log(`Usuário com ID ${id} deletado com sucesso!`);
      return true;
    }
  } catch (err) {
    console.error(`Erro ao deletar usuário com ID ${id}:`, err);
    return false;
  } finally {
    if (usuariosCollection) await closeMongoDBConnection();
  }
}

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
