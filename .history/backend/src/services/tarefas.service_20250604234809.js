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


//ANTIGO, CASO DE ERRO VOLTE AQUI
// export async function atualizarTarefa(id, updates) {
//   let tarefasCollection;

//   try {
//     tarefasCollection = await connectToMongoDB(dbName, collectionName);

//     if (!ObjectId.isValid(id)) return false;

//     const tarefaAtual = await tarefasCollection.findOne({ _id: new ObjectId(id) });
//     if (!tarefaAtual) return false;

//     const dadosFiltrados = Object.fromEntries(
//       Object.entries(updates).filter(([chave]) => chave !== "_id" && chave !== "id")
//     );

//     const result = await tarefasCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: dadosFiltrados }
//     );

//     // Atualiza contadores no Redis se status mudou
//     if (updates.status && updates.status !== tarefaAtual.status) {
//       console.log(`Status alterado de "${tarefaAtual.status}" para "${updates.status}"`);
//       await atualizarContadorStatus(tarefaAtual.criador, updates.status, 1, tarefaAtual.status);
//       if (updates.status === "concluida") {
//         console.log("Registrando conclusão diária e atualizando estatísticas de produtividade...");
//         await registrarConclusaoPorData(tarefaAtual.criador);
//         await atualizarEstatisticasProdutividade(tarefaAtual.criador);
//       }
//     }
//     if (updates.tags) {
//       console.log("Atualizando ranking de tags...");
//       await atualizarRankingTags(tarefaAtual.criador, updates.tags);
//     }

//     return result.modifiedCount > 0;
//   } catch (err) {
//     console.error(`Erro ao atualizar tarefa com ID ${id}:`, err);
//     return false;
//   } finally {
//     if (tarefasCollection) await closeMongoDBConnection();
//   }
// }

//CASO DE ERRO APAGUE AQUI
export async function atualizarTarefa(id, updates) {
  let tarefasCollection;
  // let mongoClient; // Se connectToMongoDB retorna o client para fechar depois

  try {
    // Se connectToMongoDB retorna { collection, client }
    const mongoConnection = await connectToMongoDB(dbName, collectionName);
    tarefasCollection = mongoConnection.collection;
    // mongoClient = mongoConnection.client; // Para fechar a conexão no finally

    if (!ObjectId.isValid(id)) {
      console.warn(`ID inválido fornecido para atualização: ${id}`);
      return false;
    }

    const tarefaAtual = await tarefasCollection.findOne({ _id: new ObjectId(id) });
    if (!tarefaAtual) {
      console.warn(`Tarefa com ID ${id} não encontrada para atualização.`);
      return false;
    }

    // Filtra _id e id para não serem setados diretamente
    const dadosFiltrados = Object.fromEntries(
      Object.entries(updates).filter(([chave]) => chave !== "_id" && chave !== "id")
    );

    const result = await tarefasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: dadosFiltrados }
    );

    // Atualiza contadores no Redis se status mudou
    if (updates.status && updates.status !== tarefaAtual.status) {
      console.log(`Status alterado de "${tarefaAtual.status}" para "${updates.status}" para tarefa ${id}`);
      await atualizarContadorStatus(tarefaAtual.criador, updates.status, 1, tarefaAtual.status);
      if (updates.status === "concluida") {
        console.log(`Registrando conclusão diária e atualizando estatísticas de produtividade para criador ${tarefaAtual.criador}...`);
        
       if (tarefaAtual.status !== "concluida") {
          // Tarefa está sendo marcada como concluída agora
          const ms = new Date() - new Date(tarefaAtual.dataCriacao);
          await atualizarEstatisticasProdutividade(tarefaAtual.criador, ms);
          await registrarConclusaoPorData(tarefaAtual.criador);
        } else {
          // Tarefa está sendo desmarcada como concluída (voltou pra pendente)
          const ms = new Date(tarefaAtual.dataConclusao) - new Date(tarefaAtual.dataCriacao);
          await atualizarEstatisticasProdutividade(tarefaAtual.criador, ms, true);
          await registrarConclusaoPorData(tarefaAtual.criador, tarefaAtual.dataConclusao);
        }

        
      }
    }

    // Lógica de atualização de tags
    // Verifica se a propriedade 'tags' está presente em 'updates'.
    // Isso permite que um array vazio [] seja passado para remover todas as tags.
    if (updates.hasOwnProperty('tags')) {
      console.log(`Iniciando atualização do ranking de tags para criador ${tarefaAtual.criador}...`);
      const tagsAntigas = tarefaAtual.tags || []; // Tags antes da atualização (garante array)
      const tagsNovas = updates.tags || [];     // Novas tags (garante array)

      // Só chama a atualização do ranking se houver de fato uma mudança ou se for a primeira vez (tagsAntigas é vazio e tagsNovas tem algo)
      // Para simplificar, vamos chamar sempre que 'tags' for parte do update,
      // a função atualizarRankingTags cuidará da lógica de incremento/decremento.
      await atualizarRankingTags(tarefaAtual.criador, tagsNovas, tagsAntigas);
    }

    return result.modifiedCount > 0;
  } catch (err) {
    console.error(`Erro ao atualizar tarefa com ID ${id}:`, err);
    return false; // ou throw err; dependendo de como você quer tratar erros mais acima
  } finally {
    // Fechar a conexão se ela foi aberta nesta função e não é global/gerenciada por pool
    // if (mongoClient) await closeMongoDBConnection(mongoClient);
    // Se closeMongoDBConnection não recebe client ou gerencia globalmente:
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


export async function registrarConclusaoPorData(userId, dataConclusao = null) {
  // Define a data no formato yyyy-mm-dd
  const data = dataConclusao
    ? new Date(dataConclusao).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const chave = `user:${userId}:tasks:completed:${data}`;

  try {
    if (dataConclusao) {
      // Se dataConclusao foi passada: está removendo uma conclusão
      const valorAtual = await redis.get(chave);
      if (valorAtual && parseInt(valorAtual) > 0) {
        const novoValor = await redis.decr(chave);
        console.log(`↩️ Conclusão removida de ${data}: ${chave} = ${novoValor}`);
      } else {
        console.log(`⚠️ Nenhuma conclusão para remover em ${data}`);
      }
    } else {
      // Conclusão normal do dia atual
      const novoValor = await redis.incr(chave);
      console.log(`✅ Conclusão registrada em ${data}: ${chave} = ${novoValor}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao registrar/ajustar conclusão por data (${chave}):`, error);
  }
}


// Se der erro, volte aqui
// export async function atualizarRankingTags(userId, tags = []) {
//   const chave = `user:${userId}:tags:top`;

//   try {
//     for (const tag of tags) {
//       await redis.zIncrBy(chave, 1, tag); // incrementa a pontuação da tag
//     }
//     console.log(`🏷️ Tags atualizadas para o ranking: ${tags.join(', ')}`);
//   } catch (error) {
//     console.error(`❌ Erro ao atualizar ranking de tags:`, error);
//   }
// }

export async function atualizarRankingTags(userId, tagsNovas = [], tagsAntigas = []) {
  const chave = `user:${userId}:tags:top`;

  // Usar Sets para facilitar a identificação de diferenças
  const setTagsNovas = new Set(tagsNovas.map(tag => String(tag).trim()).filter(tag => tag.length > 0));
  const setTagsAntigas = new Set(tagsAntigas.map(tag => String(tag).trim()).filter(tag => tag.length > 0));

  const tagsParaIncrementar = [];
  const tagsParaDecrementar = [];

  // Identificar tags adicionadas (estão em novas, mas não em antigas)
  for (const tag of setTagsNovas) {
    if (!setTagsAntigas.has(tag)) {
      tagsParaIncrementar.push(tag);
    }
  }

  // Identificar tags removidas (estavam em antigas, mas não mais em novas)
  for (const tag of setTagsAntigas) {
    if (!setTagsNovas.has(tag)) {
      tagsParaDecrementar.push(tag);
    }
  }

  if (tagsParaIncrementar.length === 0 && tagsParaDecrementar.length === 0) {
    console.log(`🏷️ Ranking de tags não precisou de alteração para usuário ${userId} (tags inalteradas ou sem tags válidas).`);
    return;
  }

  try {
    // Incrementar score para tags adicionadas/novas
    for (const tag of tagsParaIncrementar) {
      await redis.zIncrBy(chave, 1, tag);
      console.log(`🏷️ Tag '${tag}' incrementada (+1) no ranking para usuário ${userId}`);
    }

    // Decrementar score para tags removidas
    for (const tag of tagsParaDecrementar) {
      await redis.zIncrBy(chave, -1, tag); // Decrementa a pontuação
      console.log(`🏷️ Tag '${tag}' decrementada (-1) no ranking para usuário ${userId}`);

      // Opcional: Remover a tag do sorted set se a pontuação ficar muito baixa (ex: 0 ou menos)
      // Isso evita que tags não usadas fiquem permanentemente no sorted set.
      // const score = await redis.zScore(chave, tag);
      // if (score !== null && parseFloat(score) <= 0) {
      //   await redis.zRem(chave, tag);
      //   console.log(`🏷️ Tag '${tag}' removida do ranking (score <= 0) para usuário ${userId}`);
      // }
    }
    console.log(`🏷️ Ranking de tags atualizado para usuário ${userId}. Adicionadas: [${tagsParaIncrementar.join(', ')}]. Removidas: [${tagsParaDecrementar.join(', ')}].`);

  } catch (error) {
    console.error(`❌ Erro ao atualizar ranking de tags para usuário ${userId}:`, error);
  }
}

export async function atualizarEstatisticasProdutividade(userId, tempoConclusaoMs = null, atualizarConclusao=false) {
  const chave = `user:${userId}:stats:productivity`;

  try {
    const hoje = new Date().toISOString().split("T")[0];

    // Incrementa contador de tarefas criadas hoje
    await redis.hIncrBy(chave, `tarefas_criadas_${hoje}`, 1);

    if (tempoConclusaoMs !== null) {
      const totalTempoKey = `${chave}:soma_tempo_conclusao`;
      const totalConcluidasKey = `${chave}:qtd_concluidas`;

      // Incrementa valores
      await redis.incrBy(totalTempoKey, tempoConclusaoMs);
      if(atualizarConclusao){
        await redis.incrBy(totalConcluidasKey,-1)
      }else{
        
      }

      // Recupera os valores (e faz fallback para 0 caso sejam null)
      const somaStr = await redis.get(totalTempoKey);
      const qtdStr = await redis.get(totalConcluidasKey);

      const soma = parseInt(somaStr || "0");
      const qtd = parseInt(qtdStr || "0");

      if (qtd > 0) {
        const media = Math.round(soma / qtd);
        await redis.hSet(chave, 'tempo_medio_conclusao_ms', media);
      }
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

// TAGS MAIS USADAS (TOP 10) ANTIGA, VOLTE AQUI CASO ED ERRO
// export async function getTagsMaisUsadas(userId) {
//   const chave = `user:${userId}:tags:top`;
//   // Retorna do índice 0 ao 9, com scores
//   return await redis.zrevrange(chave, 0, 9, 'WITHSCORES');
// }

// NOVA, APAGUE SE DER ERRO
export async function getTagsMaisUsadas(userId) {
  const chave = `user:${userId}:tags:top`;
  // Tente com sendCommand se o método direto não funcionar:
  // Nota: os argumentos para sendCommand precisam ser strings
  const result = await redis.sendCommand(['ZREVRANGE', chave, '0', '9', 'WITHSCORES']);
  // O resultado de sendCommand para ZREVRANGE WITHSCORES também é um array achatado.
  // Você precisará processá-lo para o formato desejado.
  // Ex: converter ['tagA', '10', 'tagB', '5'] para [{ value: 'tagA', score: '10' }, ...]
  const formattedResult = [];
  for (let i = 0; i < result.length; i += 2) {
    formattedResult.push({ value: result[i], score: parseFloat(result[i + 1]) });
  }
  return formattedResult;
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