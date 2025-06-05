
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, ListTodo } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Redirecionar para o dashboard se logado, ou para auth se não estiver
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Trabalho 
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Bem-vindo ao sistema de gerenciamento de tarefas. Gerencie suas tarefas de forma eficiente e organizada.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
              if (isLoggedIn) {
                navigate("/dashboard");
              } else {
                navigate("/auth");
              }
            }}
          >
            <BarChart className="mr-2 h-5 w-5" />
            {localStorage.getItem('isLoggedIn') === 'true' ? 'Dashboard' : 'Fazer Login'}
          </Button>
          
          {localStorage.getItem('isLoggedIn') === 'true' && (
            <Button 
              size="lg" 
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              onClick={() => navigate("/tasks")}
            >
              <ListTodo className="mr-2 h-5 w-5" />
              Gerenciar Tarefas
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
