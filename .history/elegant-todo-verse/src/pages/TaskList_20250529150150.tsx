
import { useState, useEffect } from "react";
import { Task, TaskFilters } from "@/types/task";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { FilterBar } from "@/components/FilterBar";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTask,postTask, atualizarTarefa, deletarTarefa, postTaskCommentario } from "../services/tarefas";

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "",
    criador: "",
    colaboradores: [],
    tags: "",
    titulo: "",
    dataInicio: "",
    dataFim: ""
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

 const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTask();
        console.log("Dados recebidos:", res);
        setTasks(res.sort((a: Task, b: Task) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()));
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
    };

    fetchTasks();
    
  }, []);

  useEffect(() => {
  fetch('/api/usuarios')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
}, []);


  const createTask = (taskData: Omit<Task, '_id' | 'dataCriacao' | 'comentarios'>) => {
    const newTask: Task = {
      ...taskData,
      dataCriacao: new Date(),
      comentarios: [],
      _id: ""
    };
     postTask(newTask).then((e) => {
      const novaTarefa = {_id: e, ...newTask}
      console.log("Tarefa criada com sucesso:", novaTarefa);
      setTasks((prev)=>[novaTarefa, ...prev]);
       toast({
      title: "Tarefa criada!",
      description: `"${taskData.titulo}" foi adicionada com sucesso.`,
    });
    }).catch(err => {
      console.error("Erro ao criar tarefa:", err);
    });
    
    setShowTaskModal(false);
   
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    closeTaskDetails();
    atualizarTarefa(id, updates).then((e) => {
      setTasks(tasks.map(task => 
      task._id === id ? { ...task, ...updates } : task
      ));
      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas.",
      });
      
    }).catch(err => {
      console.error("Erro ao atualizar tarefa:", err);
    });
    
  };

  const deleteTask = (id: string) => {
    deletarTarefa(id).then(() => {
      console.log("Tarefa excluída com sucesso:", id);
      const task = tasks.find(t => t._id === id);
      setTasks(tasks.filter(task => task._id !== id));
       toast({
        title: "Tarefa removida!",
        description: `"${task?.titulo}" foi excluída.`,
      });
    }).catch(err => {
      console.error("Erro ao excluir tarefa:", err);
    });
   
    
   
  };

  const addComment = (taskId: string, autor: string, texto: string) => {
    postTask(newTask).then((e) => {
      const novaTarefa = {_id: e, ...newTask}
      console.log("Tarefa criada com sucesso:", novaTarefa);
      setTasks((prev)=>[novaTarefa, ...prev]);
       toast({
      title: "Tarefa criada!",
      description: `"${taskData.titulo}" foi adicionada com sucesso.`,
    });
    }).catch(err => {
      console.error("Erro ao criar tarefa:", err);
    });
    const newComment = {
      id: Date.now().toString(),
      autor,
      texto,
      dataComentario: new Date()
    };
    
    setTasks(tasks.map(task => 
      task._id === taskId 
        ? { ...task, comentarios: [...task.comentarios, newComment] }
        : task
    ));
    
    toast({
      title: "Comentário adicionado!",
      description: "Seu comentário foi salvo.",
    });
  };

  const deleteComment = (taskId: string, commentId: string) => {
    setTasks(tasks.map(task => 
      task._id === taskId 
        ? { 
            ...task, 
            comentarios: task.comentarios.filter(comment => comment.id !== commentId) 
          }
        : task
    ));
    
    toast({
      title: "Comentário removido!",
      description: "O comentário foi excluído.",
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesTags = !filters.tags || task.tags.some(tag => 
      tag.toLowerCase().includes(filters.tags.toLowerCase())
    );
    const matchesTitulo = !filters.titulo || task.titulo.toLowerCase().includes(filters.titulo.toLowerCase());
    
    const matchesDataInicio = !filters.dataInicio || 
      new Date(task.dataCriacao) >= new Date(filters.dataInicio);
    const matchesDataFim = !filters.dataFim || 
      new Date(task.dataCriacao) <= new Date(filters.dataFim);

    return matchesStatus && matchesTags && matchesTitulo && matchesDataInicio && matchesDataFim;
  });

  const getStatusStats = () => {
    const stats = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      pendente: stats.pendente || 0,
      "em andamento": stats["em andamento"] || 0,
      concluida: stats.concluida || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Gerenciamento de Tarefas
        </h1>
        <p className="text-gray-300 text-lg">Gerencie suas tarefas de forma eficiente e organizada</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              {stats.pendente} Pendentes
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {stats["em andamento"]} Em Andamento
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-400" />
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {stats.concluida} Concluídas
            </Badge>
          </div>
        </div>
      </div>


      {/* Task Creation Button and Modal */}
      <div className="mb-8">
        <Dialog open={showTaskModal}  onOpenChange={(open) => {setShowTaskModal(open);if (!open) {closeTaskDetails();}}}>
          <DialogTrigger asChild >
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Criar Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">{selectedTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os detalhes para criar uma nova tarefa
              </DialogDescription>
            </DialogHeader>
            <TaskForm onCreateTask={createTask} task={selectedTask} onUpdateTask={updateTask} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm">
              <h3 className="text-xl text-gray-300 mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-gray-500">
                {tasks.length === 0 
                  ? "Crie sua primeira tarefa para começar!" 
                  : "Tente ajustar os filtros para encontrar suas tarefas."
                }
              </p>
            </div>
          </div>
        ) : (
          filteredTasks.map(task => (
            
            <TaskCard
              key={task._id}
              task={task}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
              onClick={() => openTaskDetails(task)} // <-- aqui
            />
          ))
        )}
      </div>
      
    </div>
  );
};

export default TaskList;
