
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Trash2, MessageSquare, Calendar, Tag, User, Edit2 } from "lucide-react";
import { Task, Comment } from "@/types/task";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddComment: (taskId: string, autor: string, texto: string) => void;
  onDeleteComment: (taskId: string, comentarioId: string) => void;
  onClick: (task: Task) => void;
}

export const TaskCard = ({ task, onUpdateTask, onDeleteTask, onAddComment, onDeleteComment, onClick }: TaskCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdateTask(task._id, { status: newStatus });
  };

  useEffect(()=>)

  const handleAddComment = () => {
    if (newComment.trim() && commentAuthor.trim()) {
      onAddComment(task._id, commentAuthor.trim(), newComment.trim());
      setNewComment("");
      setCommentAuthor("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "em andamento": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "concluida": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div  className="cursor-pointer">
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl text-white mb-2">{task.titulo}</CardTitle>
            <p className="text-gray-300 text-sm mb-3">{task.descricao}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dataCriacao), "dd/MM/yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {task.comentarios.length} comentários
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${getStatusColor(task.status)} border`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            
            </div>

            {task.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3 h-3 text-gray-400" />
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => onDeleteTask(task._id)}
            variant="ghost" 
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => onClick(task)}
            variant="ghost" 
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button 
          onClick={() => setShowComments(!showComments)}
          variant="ghost" 
          size="sm"
          className="text-blue-400 hover:text-blue-300 mb-3 p-0"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {showComments ? 'Ocultar' : 'Ver'} Comentários ({task.comentarios.length})
        </Button>

        {showComments && (
          <div className="space-y-3 border-t border-gray-700/50 pt-3">
            {task.comentarios.map((comment) => (
              <div key={comment._id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium text-blue-300">{comment.autor}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.dataComentario), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <Button 
                    onClick={() => onDeleteComment(task._id, comment._id)}
                    variant="ghost" 
                    size="sm"
                    className="text-red-400 hover:text-red-300 p-1 h-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
             
                </div>
                <p className="text-gray-300 text-sm">{comment.texto}</p>
              </div>
            ))}
            
            <div className="space-y-2">
              <Input
                placeholder="Seu nome"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicionar comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white flex-1"
                  rows={2}
                />
                <Button 
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white self-end"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
