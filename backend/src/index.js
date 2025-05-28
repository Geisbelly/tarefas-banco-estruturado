import express from 'express';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuarios.routes.js';
import tarefasRoutes from './routes/tarefas.routes.js';
import authRoutes from './routes/auth.routes.js';
import cadastreRoutes from './routes/cadastre.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/usuarios', usuariosRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/auth', authRoutes);
app.use('/cadastre', cadastreRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});
