import express from 'express';
import { listarUsuarios, criarUsuario } from '../controllers/usuarios.controller.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);

export default router;
