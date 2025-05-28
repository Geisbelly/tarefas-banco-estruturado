import express from 'express';
import { criarUsuario,listarUsuarios,deleteUser, updateUser} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
