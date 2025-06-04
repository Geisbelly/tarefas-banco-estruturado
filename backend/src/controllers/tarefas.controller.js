import { 
    adicionarComentario,
    atualizarTarefa,
    deletarTarefa,
    criarTarefa,
    deletarComentario,
    buscarTarefasPorUsuario,
    obterContadoresStatus,
    atualizarContadorStatus
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

//antigo
// export const criarTask = async (req, res) => {
//   try {
//     const body = req.body;
//     const novaTarefa = await criarTarefa(body.titulo, body.descricao, body.criador, body.colaboradores, body.status, body.tags, body.dataCriacao, body.dataConclusao, body.comentarios);
//     res.status(201).json(novaTarefa);
//     console.log("Criou aqui de boa")
//     await atualizarContadorStatus(criador, novaTarefa.status, 1);
//     console.log("Contador atualizado com sucesso")
//   } catch (error) {
//     console.error('Erro ao criar tarefa:', error);
//     res.status(500).json({ error: 'Erro interno ao criar tarefa' });
//   }
// };

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

    // Corrigido: aguarda atualizar contador antes de responder
    await atualizarContadorStatus(body.criador, body.status, 1);
    console.log("Contador atualizado com sucesso");

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

    // Supondo que atualizarTarefa(id, dadosNovos) retorne a tarefa atualizada
    const tarefaAtualizada = await atualizarTarefa(id, dadosNovos);

    if (!tarefaAtualizada) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.status(200).json(tarefaAtualizada); // Retorna a tarefa atualizada
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar tarefa' });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;            // Pega o id da URL

    const tarefaDeletada = await deletarTarefa(id);

    if (!tarefaDeletada) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.status(200).json(tarefaDeletada); // Retorna a tarefa deletada
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao deletar tarefa' });
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

