
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";

interface TaskFormProps {
  onCreateTask: (task: Omit<Task, '_id' | 'dataCriacao' | 'comentarios'>) => void;
  task?: Task; // Optional prop for editing existing tasks
  onUpdateTask?: (id,task: Task) => void; // Optional prop for updating existing tasks
}

export const TaskForm = ({ onCreateTask, task=null, onUpdateTask }: TaskFormProps) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<Task['status']>("pendente");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [cabecalho, setCabecalho] = useState('Criar Tarefa');

  const handleSubmit = (e: React.FormEvent) => {
    if (onUpdateTask && task) {
      e.preventDefault();
      console.log("Atualizando tarefa:", task._id);
      console.log("Dados da tarefa:", {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status,
        tags
      });
      
      onUpdateTask(task._id, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
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
        status,
        tags
      });
      resetForm();
    }
  };

  useEffect(() => {
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao);
      setStatus(task.status);
      setTags(task.tags);
      setCabecalho('Editar Tarefa');
    }
  }, [task]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
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
