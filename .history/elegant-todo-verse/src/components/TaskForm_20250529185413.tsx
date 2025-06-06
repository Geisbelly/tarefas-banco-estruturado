
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";

interface TaskFormProps {
  onCreateTask: (task: Omit<Task, '_id' | 'dataCriacao' | 'comentarios'>) => void;
  task?: Task | null; // Optional prop for editing existing tasks
  onUpdateTask?: (id,task: Task) => void; // Optional prop for updating existing tasks
  criador?: string; // Optional prop for the creator's email
}

export const TaskForm = ({ onCreateTask, task=null, onUpdateTask, criador }: TaskFormProps) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<Task['status']>("pendente");
  const [statusAntes, setStatusAntes] = useState<Task['status']>("pendente");
  const [colaboradores, setColaboradores] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newColaborador, setNewColaborador] = useState("");
  const [cabecalho, setCabecalho] = useState('Criar Tarefa');
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (task) {
      setCabecalho('Atualizar Tarefa');
      setTitulo(task.titulo);
      setDescricao(task.descricao);
      setStatus(task.status);
      setColaboradores(task.colaboradores || []);
      setTags(task.tags || []);
    } else {
      setCabecalho('Criar Tarefa');
      setTitulo("");
      setDescricao("");
      setStatus("pendente");
      setColaboradores([]);
      setTags([]);
  };
  }
, []);

  const handleSubmit = (e: React.FormEvent) => {

    if (task) {
      e.preventDefault();
      console.log("Atualizando tarefa:", task._id);
      console.log("Dados da tarefa:", {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status,
        criador,
        colaboradores,
        tags
      });
      if (status !== statusAntes) {
        onUpdateTask(task._id, {
          _id: task._id,
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          status,
          criador: criador || task.criador,
          colaboradores,
          tags,
          dataCriacao: task.dataCriacao,
          comentarios: task.comentarios || [],
          dataConclusao: (status === "concluida") ? new Date() : null
        });
      }
      resetForm();
      return;
    }
    e.preventDefault();
    if (titulo.trim() ) {
      onCreateTask({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        criador,
        colaboradores,
        status,
        tags
      });
      resetForm();
      return;
    }
    e.preventDefault();
    if (titulo.trim()) {
      onCreateTask({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        criador,
        colaboradores,
        status,
        tags
      });
      resetForm();
      return;
    }
    setStatus("pendente");
    setTags([]);
    setNewTag("");
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  const isEmailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const addColaborador = () => {
    const email = newColaborador.trim();

    if (!email) return;

    if (!isEmailValido(email)) {
      setMensagem("E-mail inválido. Tente um email válido.");

      // Faz a mensagem sumir depois de 3 segundos
      setTimeout(() => setMensagem(""), 3000);

      return;
    }

    if (!colaboradores.includes(email)) {
      setColaboradores([...colaboradores, email]);
      setNewColaborador("");
    } else {
      setMensagem("Esse e-mail já está na lista!");
       setTimeout(() => setMensagem(""), 3000);
    }
  };

  const removeColaborador = (colaboradorToRemove: string) => {
    setColaboradores(colaboradores.filter(colaborador => colaborador !== colaboradorToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Input
          placeholder="Título da tarefa"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="bg-gray-800/50 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Descrição da tarefa"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="bg-gray-800/50 border-gray-600 text-white"
          rows={3}
        />
      </div>

      <div>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value as Task['status'])}
          className="w-full bg-gray-800/50 border border-gray-600 text-white px-3 py-2 rounded-md"
        >
          <option value="pendente">Pendente</option>
          <option value="em andamento">Em Andamento</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>

      <div>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Adicionar colaborador(es)"
            value={newColaborador}
            onChange={(e) => setNewColaborador(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColaborador())}
          />
          <Button type="button" onClick={addColaborador} variant="outline" className="border-gray-600">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {mensagem && (
          <div className="text-red-500 text-sm mb-2">
            {mensagem}
          </div>
        )}

        {colaboradores.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colaboradores.map((colaborador, index) => (
              <Badge key={index} variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {colaborador}
                <button
                  type="button"
                  onClick={() => removeColaborador(colaborador)}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Adicionar tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline" className="border-gray-600">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {cabecalho}
      </Button>
    </form>
  );
};
function resetForm() {
  throw new Error("Function not implemented.");
}

