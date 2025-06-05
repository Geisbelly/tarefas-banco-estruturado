import { 
    adicionarComentario,
    atualizarTarefa,
    deletarTarefa,
    criarTarefa,
    deletarComentario,
    buscarTarefasPorUsuario,
    obterContadoresStatus,
    atualizarContadorStatus,
    getTagsMaisUsadas,
    getTarefasConcluidasPorPeriodo,
    getProdutividade
 } from '../services/tarefas.service.js';

export const listarTarefas = async (req, res) => {
  try {
    const tarefas = await buscarTarefasPorUsuario(req.body.usuario);
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro interno ao listar tarefas' });
  }
};

export const criarTask = async (req, res) => {
  try {
    const body = req.body;
    const novaTarefa = await criarTarefa(
      body.titulo,
      body.descricao,
      body.criador,
      body.colaboradores,
      body.status,
      body.tags,
      body.dataCriacao,
      body.dataConclusao,
      body.comentarios
    );

    console.log("Criou aqui de boa");

    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro interno ao criar tarefa' });
    }
  }
};

export const criarTaskComentario = async (req, res) => {
  try {
    const body = req.body;
    const novoComentario = await adicionarComentario(body.taskId, body.autor, body.texto);
    res.status(201).json(novoComentario);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro interno ao criar comentário' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const id = req.body.id;
    const dadosNovos = req.body;

    const tarefaAtualizada = await atualizarTarefa(id, dadosNovos);

    if (!tarefaAtualizada) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    console.log("Tarefa atualizada com sucesso");

    res.status(200).json(tarefaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro interno ao atualizar tarefa' });
    }
  }
};

export const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;

    const tarefaDeletada = await deletarTarefa(id);

    if (!tarefaDeletada) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    console.log("Tarefa deletada com sucesso");

    await atualizarContadorStatus(tarefaDeletada.criador, tarefaDeletada.status, -1);
    console.log("Contador atualizado com sucesso");

    res.status(200).json(tarefaDeletada);
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro interno ao deletar tarefa' });
    }
  }
};


export const deletarComentarioTask = async (req, res) => {
  try {
    const { taskId, comentarioId } = req.body;

    const comentarioDeletado = await deletarComentario(taskId, comentarioId);

    if (!comentarioDeletado) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.status(200).json(comentarioDeletado); // Retorna o comentário deletado
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro interno ao deletar comentário' });
  }
}

export async function verContadoresPorStatus(req, res) {
  try {
    const userId = req.query.userId || "default"; // você pode ajustar isso para pegar o id do usuário real
    const contadores = await obterContadoresStatus(userId);
    res.status(200).json(contadores);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao obter contadores", detalhes: error.message });
  }
}

// /tarefas/tags?userId=...
export async function obterTagsMaisUsadas(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Parâmetro userId é obrigatório." });

    const tags = await getTagsMaisUsadas(userId);
    res.status(200).json(tags);
  } catch (err) {
    console.error("Erro ao obter tags:", err);
    res.status(500).json({ error: "Erro ao obter tags." });
  }
}

// /tarefas/concluidas?userId=...&de=2025-06-01&ate=2025-06-07
export async function obterTarefasConcluidasPorPeriodo(req, res) {
  try {
    const userId = req.query.userId ;
    const de = req.query.de ;
    const ate = req.query.ate ;
    if (!userId || !de || !ate) return res.status(400).json({ error: "Parâmetros userId, de e ate são obrigatórios." });

    const dataInicio = new Date(de);
    const dataFim = new Date(ate);
    if (isNaN(dataInicio) || isNaN(dataFim)) return res.status(400).json({ error: "Datas inválidas." });

    const dias = [];
    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
      dias.push(d.toISOString().split("T")[0]);
    }

    const resultados = await getTarefasConcluidasPorPeriodo(userId, dias);
    res.status(200).json(resultados);
  } catch (err) {
    console.error("Erro ao obter tarefas por período:", err);
    res.status(500).json({ error: "Erro interno." });
  }
}

// /tarefas/produtividade?userId=...
export async function obterProdutividade(req, res) {
  try {
    const userId = req.query.userId || "default";
    if (!userId) return res.status(400).json({ error: "Parâmetro userId é obrigatório." });

    const dados = await getProdutividade(userId);
    res.status(200).json(dados);
  } catch (err) {
    console.error("Erro ao obter produtividade:", err);
    res.status(500).json({ error: "Erro ao obter produtividade." });
  }
}