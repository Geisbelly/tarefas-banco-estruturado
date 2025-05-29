
import {Task, Comment} from '../types/task';

const getTask = async () => {
      try {
        const res = await fetch("api/tarefas");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro ${res.status}: ${text}`);
        }
        const data = await res.json();

        console.log("Dados recebidos:", data);
    
       return data;
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
};
const postTask = async (newTask:Task) => {
      try {
        const res = await fetch("api/tarefas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTask)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro ${res.status}: ${text}`);
        }
        const data = await res.json();

        console.log("Dados recebidos:", data);
        return data;
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
};
const postTaskCommentario = async (newComment: Comment) => {
      try {
        const res = await fetch("api/tarefas/comentario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            taskId: newComment._id,
            autor: newComment.autor,
            texto: newComment.texto,
          })
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro ${res.status}: ${text}`);
        }
        const data = await res.json();

        console.log("Dados recebidos:", data);
        return data;
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
};
const postUser = async (datas:{email:string, senha: string, nome: string}) => {
      try {
        const res = await fetch("api/cadastre", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datas)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro ${res.status}: ${text}`);
        }
        const data = await res.json();

        console.log("Dados recebidos:", data);
        return data;
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
};

const atualizarTarefa = async (id, dadosAtualizados) => {
  try {
    const response = await fetch(`api/tarefas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!response.ok) {
      throw new Error(`Erro na atualização: ${response.statusText}`);
    }

    const tarefaAtualizada = await response.json();
    console.log('Tarefa atualizada com sucesso:', tarefaAtualizada);
    return tarefaAtualizada;
  } catch (error) {
    console.error('Falha ao atualizar tarefa:', error);
  }
};
const deletarTarefa = async (id) => {
  try {
    const response = await fetch(`api/tarefas/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro na deleção: ${response.statusText}`);
    }

    const tarefaDeletada = await response.json();
    console.log('Tarefa deletada com sucesso:', tarefaDeletada);
    return tarefaDeletada;
  } catch (error) {
    console.error('Falha ao deletar tarefa:', error);
  }
};

export  {postTask, getTask, atualizarTarefa, deletarTarefa,postUser,postTaskCommentario};