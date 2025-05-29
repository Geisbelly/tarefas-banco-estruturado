import express from 'express';
import { cadastrarUsuario} from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/', cadastrarUsuario);


export default router;
