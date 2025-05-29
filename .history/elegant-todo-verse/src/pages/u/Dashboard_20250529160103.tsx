
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

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "",
    tags: "",
    titulo: "",
    dataInicio: "",
    dataFim: "",
    criador: "",
    colaboradores: []
  });
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Dados simulados iniciais
  useEffect(() => {
    const initialTasks: Task[] = [
      {
        _id: "1",
        titulo: "Estudar para as provas",
        descricao: "Revisar materias e projetos pra se preparar para o inicio das provas.",
        dataCriacao: new Date("2024-05-20"),
        status: "em andamento",
        tags: ["provas", "universidade", "materias"],
        comentarios: [
          {
            _id: "c1",
            autor: "Professor",
            texto: "O ultimo conteudo passado na sala tambem estará na prova!",
            dataComentario: new Date("2024-05-21")
          }
        ]
      },
      {
        _id: "2",
        titulo: "Fazer compras",
        descricao: "Organizar uma ida ao mercado para fazer compras.",
        dataCriacao: new Date("2024-05-19"),
        status: "concluida",
        tags: ["compras", "rotina"],
        comentarios: [],
        criador: "",
        colaboradores: []
      },
      {
        _id: "3",
        titulo: "Desenvolver projeto web",
        descricao: "Criar interface moderna para sistema de tarefas com React e TypeScript.",
        dataCriacao: new Date("2024-05-22"),
        status: "pendente",
        tags: ["desenvolvimento", "react", "typescript"],
        comentarios: []
      }
    ];
    setTasks(initialTasks);
  }, []);

  const createTask = (taskData: Omit<Task, '_id' | 'dataCriacao' | 'comentarios'>) => {
    const newTask: Task = {
      ...taskData,
      _id: Date.now().toString(),
      dataCriacao: new Date(),
      comentarios: []
    };
    setTasks([newTask, ...tasks]);
    setShowTaskModal(false);
    toast({
      title: "Tarefa criada!",
      description: `"${taskData.titulo}" foi adicionada com sucesso.`,
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task._id === id ? { ...task, ...updates } : task
    ));
    toast({
      title: "Tarefa atualizada!",
      description: "As alterações foram salvas.",
    });
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t._id === id);
    setTasks(tasks.filter(task => task._id !== id));
    toast({
      title: "Tarefa removida!",
      description: `"${task?.titulo}" foi excluída.`,
    });
  };

  const addComment = (taskId: string, autor: string, texto: string) => {
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
          Sistema de Tarefas
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
        <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Criar Nova Tarefa</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os detalhes para criar uma nova tarefa
              </DialogDescription>
            </DialogHeader>
            <TaskForm onCreateTask={createTask} />
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
