import express from 'express';
import { loginin } from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/', loginin);


export default router;
