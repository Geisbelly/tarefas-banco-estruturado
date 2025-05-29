import express from 'express';
import { criarTask,listarTarefas, updateTask, deleteTask,  } from '../controllers/tarefas.controller.js';

const router = express.Router();

router.get('/', listarTarefas);
router.post('/', criarTask);
router.post('/comentario', criarTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
