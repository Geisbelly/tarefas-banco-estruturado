import express from 'express';

import { criarTask,listarTarefas, updateTask, deleteTask, criarTaskComentario, deletarComentarioTask } from '../controllers/tarefas.controller.js';
import { verContadoresPorStatus, obterTagsMaisUsadas, obterTarefasConcluidasPorPeriodo, obterProdutividade } from "../controllers/tarefas.controller.js";
const router = express.Router();

router.post('/u', listarTarefas);
router.post('/', criarTask);
router.post('/comentario', criarTaskComentario);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.delete('/comentario/delete', deletarComentarioTask);

export default router;

router.get("/status/contador", verContadoresPorStatus);
router.get("/tarefas/tags", obterTagsMaisUsadas);
router.get("/tarefas/concluidas", obterTarefasConcluidasPorPeriodo);
router.get("/tarefas/produtividade", obterProdutividade);
