import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // 1. IMPORTE O PACOTE CORS

import usuariosRoutes from './routes/usuarios.routes.js';
import tarefasRoutes from './routes/tarefas.routes.js';
import authRoutes from './routes/auth.routes.js';
import cadastreRoutes from './routes/cadastre.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 2. DEFINA AS OPÇÕES DO CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Permita requisições do seu frontend Vite
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization", // Adicione outros cabeçalhos se necessário
  credentials: true, // Se você lida com cookies/sessões
  optionsSuccessStatus: 200 // Para compatibilidade
};

// 3. APLIQUE O MIDDLEWARE DO CORS ANTES DE QUALQUER ROTA E ANTES DE express.json() (boa prática)
app.use(cors(corsOptions));

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// Suas rotas
app.use('/usuarios', usuariosRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/auth', authRoutes);
app.use('/cadastre', cadastreRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT} ou na porta definida pelo Render`);
});