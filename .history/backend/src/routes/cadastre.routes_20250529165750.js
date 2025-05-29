import express from 'express';
import { cadastrarUsuario} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', cadastrarUsuario);


export default router;
