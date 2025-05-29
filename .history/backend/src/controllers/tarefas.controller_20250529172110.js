import { usuarios } from '../models/usuario.model.js';
import { 
    buscarTodasTarefas,
    adicionarComentario,
    atualizarTarefa,
    buscarTarefaPorId,
    buscarTarefasAposData,
    buscarTarefasPorStatus,
    buscarTarefasPorTags,
    deletarTarefa,
    criarTarefa,
    deletarComentario,
    buscarTarefasPorUsuario
 } from '../services/tarefas.service.js';

export const listarTarefas = async (req, res) => {
  try {
    console.log('Ta buscando para isso aqui', req);
    const tarefas = await buscarTarefasPorUsuario(req.usuario);
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro interno ao listar tarefas' });
  }
};

export const criarTask = async (req, res) => {
  try {
    const body = req.body;
    const novaTarefa = await criarTarefa(body.titulo, body.descricao, body.criador, body.colaboradores, body.status, body.tags, body.dataCriacao, body.dataConclusao, body.comentarios);
    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa' });
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
    const id = req.params.id;            // Pega o id da URL
    const dadosNovos = req.body;         // Dados para atualizar

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

