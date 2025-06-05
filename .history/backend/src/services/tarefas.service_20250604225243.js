// tarefaService.ts
import redis from "./redis.service.js";
import {ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from './banco.service.js'; // adapta pro teu caminho


const statusPermitidos = ['pendente', 'em andamento', 'concluida'];

const dbName = 'listaTarefas';
const collectionName = 'tarefas';

/**
 * @typedef {Object} Comentario
 * @property {string} autor
 * @property {string} texto
 * @property {Date} dataComentario
 */

/**
 * @typedef {Object} Tarefa
 * @property {ObjectId} [_id]
 * @property {string} titulo
 * @property {string} descricao
 * @property {Date} dataCriacao
 * @property {Date} dataConclusao
 * @property {'pendente' | 'em andamento' | 'concluida'} status
 * @property {string[]} tags
 * @property {string[]} colaboradores
 * @property {string[]} criador
 * @property {Comentario[]} comentarios
 */



export async function criarTarefa(
  titulo,
  descricao,
  criador,
  colaboradores = [],
  status,
  tags = []
) {
  let tarefasCollection;
  
  console.log("Criando tarefa com os seguintes dados:", {
    titulo,
    descricao,
    criador,
    colaboradores,
    status,
    tags
  });
  if (status && !statusPermitidos.includes(status)) {
    console.error(`Status inválido: "${status}". Status permitidos são: ${statusPermitidos.join(', ')}`);
    return null;
  }

  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName );
    const novaTarefa = {
      titulo,
      descricao,
      dataCriacao: new Date(),
      status: (status) || "pendente",
      criador,
      colaboradores,
      dataConclusao: null, // Inicialmente nulo
      tags,
      comentarios: []
    };
    const result = await tarefasCollection.insertOne(novaTarefa);
    console.log("Tarefa criada com sucesso:", result.insertedId);
    if(status === "concluida") {
      console.log("Registrando conclusão diária e atualizando estatísticas de produtividade...");
      await registrarConclusaoPorData(criador);
      await atualizarEstatisticasProdutividade(criador);
    }
    await atualizarRankingTags(criador, tags);
    await atualizarContadorStatus(criador, status, 1);
    return result.insertedId;
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    return null;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function buscarTodasTarefas() {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    const tarefas = await tarefasCollection.find({}).toArray();
    console.log("\n--- Todas as Tarefas ---");
    console.log(tarefas);
    return tarefas;
  } catch (err) {
    console.error("Erro ao buscar todas as tarefas:", err);
    return [];
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function buscarTarefaPorId(id) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    if (!ObjectId.isValid(id)) {
      console.error("ID inválido:", id);
      return null;
    }
    const tarefa = await tarefasCollection.findOne({ _id: new ObjectId(id) });
    console.log(`\n--- Tarefa encontrada por ID (${id}) ---`);
    console.log(tarefa);
    return tarefa;
  } catch (err) {
    console.error(`Erro ao buscar tarefa por ID (${id}):`, err);
    return null;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function buscarTarefasPorStatus(status) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    const tarefas = await tarefasCollection.find({ status }).toArray();
    console.log(`\n--- Tarefas com status "${status}" ---`);
    console.log(tarefas);
    return tarefas;
  } catch (err) {
    console.error(`Erro ao buscar tarefas por status "${status}":`, err);
    return [];
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function buscarTarefasPorUsuario(usuario) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName, collectionName);

    const tarefas = await tarefasCollection.find({
      $or: [
        { criador: usuario },
        { colaboradores: usuario } 
      ]
    }).toArray();

    console.log(`\n--- Tarefas do usuário "${usuario}" ---`);
    console.log(tarefas);
    return tarefas;
  } catch (err) {
    console.error(`Erro ao buscar tarefas do usuário "${usuario}":`, err);
    return [];
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}


export async function buscarTarefasAposData(dataInicioString) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    const dataInicio = new Date(dataInicioString);
    if (isNaN(dataInicio.getTime())) {
      console.error("Data de início inválida:", dataInicioString);
      return [];
    }
    const tarefas = await tarefasCollection.find({ dataCriacao: { $gte: dataInicio } }).toArray();
    console.log(`\n--- Tarefas criadas após ${dataInicioString} ---`);
    console.log(tarefas);
    return tarefas;
  } catch (err) {
    console.error(`Erro ao buscar tarefas por data após ${dataInicioString}:`, err);
    return [];
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function buscarTarefasPorTags(tags) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    const tarefas = await tarefasCollection.find({ tags: { $in: tags } }).toArray();
    console.log(`\n--- Tarefas com as tags "${tags.join(', ')}" ---`);
    console.log(tarefas);
    return tarefas;
  } catch (err) {
    console.error(`Erro ao buscar tarefas por tags "${tags.join(', ')}":`, err);
    return [];
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function atualizarTarefa(id, updates) {
  let tarefasCollection;

  try {
    tarefasCollection = await connectToMongoDB(dbName, collectionName);

    if (!ObjectId.isValid(id)) return false;

    const tarefaAtual = await tarefasCollection.findOne({ _id: new ObjectId(id) });
    if (!tarefaAtual) return false;

    const dadosFiltrados = Object.fromEntries(
      Object.entries(updates).filter(([chave]) => chave !== "_id" && chave !== "id")
    );

    const result = await tarefasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: dadosFiltrados }
    );

    // Atualiza contadores no Redis se status mudou
    if (updates.status && updates.status !== tarefaAtual.status) {
      console.log(`Status alterado de "${tarefaAtual.status}" para "${updates.status}"`);
      await atualizarContadorStatus(tarefaAtual.criador, updates.status, 1, tarefaAtual.status);
      if (updates.status === "concluida") {
        console.log("Registrando conclusão diária e atualizando estatísticas de produtividade...");
        await registrarConclusaoPorData(tarefaAtual.criador);
        await atualizarEstatisticasProdutividade(tarefaAtual.criador);
      }
    }
    if (updates.tags) {
      console.log("Atualizando ranking de tags...");
      await atualizarRankingTags(tarefaAtual.criador, updates.tags);
    }

    return result.modifiedCount > 0;
  } catch (err) {
    console.error(`Erro ao atualizar tarefa com ID ${id}:`, err);
    return false;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}


export async function adicionarComentario(tarefaId, autor, texto) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    if (!ObjectId.isValid(tarefaId)) {
      console.error("ID de tarefa inválido para adicionar comentário:", tarefaId);
      return false;
    }
    const novoComentario = {
      _id: new ObjectId(),
      autor,
      texto,
      dataComentario: new Date()
    };
    const result = await tarefasCollection.updateOne(
      { _id: new ObjectId(tarefaId) },
      { $push: { comentarios: novoComentario } }
    );
    if (result.matchedCount === 0) {
      console.log(`Nenhuma tarefa encontrada com o ID ${tarefaId} para adicionar comentário.`);
      return false;
    } else if (result.modifiedCount > 0) {
      console.log(`Comentário adicionado com sucesso à tarefa ${tarefaId}!`);
      return true;
    } else {
      console.log(`Nenhuma alteração foi feita ao adicionar comentário na tarefa ${tarefaId}.`);
      return false;
    }
  } catch (err) {
    console.error(`Erro ao adicionar comentário na tarefa ${tarefaId}:`, err);
    return false;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function deletarComentario(taskId, comentarioId) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName, collectionName);

    console.log(`Tentando deletar comentário ${comentarioId} da tarefa ${taskId}...`);

    if (!ObjectId.isValid(taskId) || !ObjectId.isValid(comentarioId)) {
      console.error("ID de tarefa ou comentário inválido:", taskId, comentarioId);
      return false;
    }

    const result = await tarefasCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $pull: { comentarios: { _id: new ObjectId(comentarioId) } } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Comentário ${comentarioId} removido com sucesso da tarefa ${taskId}!`);
      return true;
    } else {
      console.log(`Nenhum comentário foi removido. Verifique se o ID do comentário existe.`);
      return false;
    }

  } catch (err) {
    console.error(`Erro ao deletar comentário ${comentarioId} da tarefa ${taskId}:`, err);
    return false;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function deletarTarefa(id) {
  let tarefasCollection;
  try {
    tarefasCollection = await connectToMongoDB(dbName,collectionName);
    if (!ObjectId.isValid(id)) {
      console.error("ID inválido para exclusão:", id);
      return false;
    }
    const tarefa = await tarefasCollection.findOne({ _id: new ObjectId(id) });
    if (!tarefa) return false;

    const result = await tarefasCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      console.log(`Nenhuma tarefa encontrada com o ID ${id} para exclusão.`);
      return false;
    } 
      await atualizarContadorStatus(tarefa.criador, tarefa.status, -1);
      console.log(`Tarefa com ID ${id} excluída com sucesso!`);
      return true;

  } catch (err) {
    console.error(`Erro ao deletar tarefa com ID ${id}:`, err);
    return false;
  } finally {
    if (tarefasCollection) await closeMongoDBConnection();
  }
}

export async function atualizarContadorStatus(userId, status, incremento = 1, statusVelho=null) {
  const chave = `user:${userId}:tasks:status:${status}`;
  
  const chaveVelha = `user:${userId}:tasks:status:${statusVelho}`;

  console.log(`Atualizando contador Redis: chave=${chave}, incremento=${incremento}`);
  console.log(`Atualizando contador Redis: chave=${chaveVelha}, incremento=${-1}`);

  try {
    const resultado = await redis.incrBy(chave, incremento);
    const resultado2 = await redis.incrBy(chaveVelha, -1);
    console.log(`Novo valor para ${chave}: ${resultado}`);
    console.log(`Valor antigo para ${chave}: ${resultado2}`);
  } catch (error) {
    console.error(`Erro ao atualizar contador Redis para ${chave}:`, error);
  }
}

export async function obterContadoresStatus(userId) {
  const statusList = ["pendente", "em andamento", "concluida"];
  const resultados = {};

  for (const status of statusList) {
    const chave = `user:${userId}:tasks:status:${status}`;
    const valor = await redis.get(chave);
    resultados[status] = parseInt(valor) || 0;
  }

  return resultados;
}


export async function registrarConclusaoPorData(userId) {
  const hoje = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  const chave = `user:${userId}:tasks:completed:${hoje}`;

  try {
    const novoValor = await redis.incr(chave);
    console.log(`✅ Conclusão diária registrada: ${chave} = ${novoValor}`);
  } catch (error) {
    console.error(`❌ Erro ao registrar conclusão por data (${chave}):`, error);
  }
}

export async function atualizarRankingTags(userId, tags = []) {
  const chave = `user:${userId}:tags:top`;

  try {
    for (const tag of tags) {
      await redis.zIncrBy(chave, 1, tag); // incrementa a pontuação da tag
    }
    console.log(`🏷️ Tags atualizadas para o ranking: ${tags.join(', ')}`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar ranking de tags:`, error);
  }
}

export async function atualizarEstatisticasProdutividade(userId, tempoConclusaoMs = null) {
  const chave = `user:${userId}:stats:productivity`;

  try {
    const hoje = new Date().toISOString().split("T")[0];

    // Incrementa contador de tarefas criadas hoje
    await redis.hIncrBy(`${chave}`, `tarefas_criadas_${hoje}`, 1);

    // Atualiza tempo médio de conclusão se fornecido
    if (tempoConclusaoMs !== null) {
      const totalTempoKey = `${chave}:soma_tempo_conclusao`;
      const totalConcluidasKey = `${chave}:qtd_concluidas`;

      await redis.incrBy(totalTempoKey, tempoConclusaoMs);
      await redis.incr(totalConcluidasKey);

      const soma = await redis.get(totalTempoKey);
      const qtd = await redis.get(totalConcluidasKey);

      const media = (parseInt(soma) / parseInt(qtd)).toFixed(0);
      await redis.hSet(`${chave}`, 'tempo_medio_conclusao_ms', media);
    }

    console.log(`📊 Estatísticas atualizadas para ${userId}`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar estatísticas de produtividade:`, error);
  }
}

export async function reverterConclusaoTarefa(userId, dataConclusao, tempoConclusaoMs) {
  const dia = new Date(dataConclusao).toISOString().split("T")[0];
  const chaveDiaria = `user:${userId}:tasks:completed:${dia}`;
  const statsKey = `user:${userId}:stats:productivity`;

  try {
    // Reverte contagem do dia
    await redis.decrBy(chaveDiaria, 1);

    // Reverte soma do tempo total e contagem de tarefas concluídas
    await redis.decrBy(`${statsKey}:soma_tempo_conclusao`, tempoConclusaoMs);
    await redis.decr(`${statsKey}:qtd_concluidas`);

    // Recalcula a média
    const soma = await redis.get(`${statsKey}:soma_tempo_conclusao`);
    const qtd = await redis.get(`${statsKey}:qtd_concluidas`);

    const novaMedia = qtd > 0 ? Math.floor(soma / qtd) : 0;
    await redis.hSet(statsKey, 'tempo_medio_conclusao_ms', novaMedia);

    console.log(`🔁 Conclusão revertida com sucesso para ${userId}`);
  } catch (err) {
    console.error("❌ Erro ao reverter conclusão:", err);
  }
}

// TAGS MAIS USADAS (TOP 10)
export async function getTagsMaisUsadas(userId) {
  const chave = `user:${userId}:tags:top`;
  return await redis.(chave, 0, 9);
}

// TAREFAS CONCLUÍDAS POR DIA (intervalo de datas)
export async function getTarefasConcluidasPorPeriodo(userId, dias) {
  const resultado = {};
  for (const dia of dias) {
    const chave = `user:${userId}:tasks:completed:${dia}`;
    const valor = await redis.get(chave);
    resultado[dia] = parseInt(valor) || 0;
  }
  return resultado;
}

// ESTATÍSTICAS DE PRODUTIVIDADE
export async function getProdutividade(userId) {
  const base = `user:${userId}:stats:productivity`;
  const stats = await redis.hGetAll(base);
  const soma = await redis.get(`${base}:soma_tempo_conclusao`);
  const qtd = await redis.get(`${base}:qtd_concluidas`);

  const tempoMedio = qtd > 0 ? Math.floor(soma / qtd) : 0;

  return {
    ...stats,
    tempo_medio_conclusao_ms: tempoMedio,
    total_concluidas: parseInt(qtd) || 0,
  };
}