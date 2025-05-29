import express from 'express';
import { criarTask,listarTarefas, updateTask, deleteTask, criarTaskComentario, deletarComentarioTask } from '../controllers/tarefas.controller.js';

const router = express.Router();

router.post('/u', listarTarefas);
router.post('/', criarTask);
router.post('/comentario', criarTaskComentario);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.delete('/comentario/delete', deletarComentarioTask);

export default router;
