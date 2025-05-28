import express from 'express';
import { cadastrarUsuario,listarUsuarios,deleteUser, updateUser} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', cadastrarUsuario);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
