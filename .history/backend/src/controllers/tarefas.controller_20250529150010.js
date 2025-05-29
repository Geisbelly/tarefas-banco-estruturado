import { 
    buscarTodasTarefas,
    adicionarComentario,
    atualizarTarefa,
    buscarTarefaPorId,
    buscarTarefasAposData,
    buscarTarefasPorStatus,
    buscarTarefasPorTags,
    deletarTarefa,
    criarTarefa
 } from '../services/tarefas.service.js';

export const listarTarefas = async (req, res) => {
  try {
    const tarefas = await buscarTodasTarefas();
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro interno ao listar tarefas' });
  }
};

export const criarTask = async (req, res) => {
  try {
    const body = req.body;
    const novaTarefa = await criarTarefa(body.titulo, body.descricao, body.status, body.tags, body.dataCriacao, body.dataConclusao, body.comentarios);
    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa' });
  }
};
export const criarTask = async (req, res) => {
  try {
    const body = req.body;
    const novaTarefa = await criarTarefa(body.titulo, body.descricao, body.status, body.tags, body.dataCriacao, body.dataConclusao, body.comentarios);
    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa' });
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

