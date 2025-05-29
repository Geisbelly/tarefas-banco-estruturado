import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, User, X, ListTodo, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Efeito para verificar login quando a página carrega ou rota muda
  useEffect(() => {
    // Simulando a verificação de autenticação
    const checkAuth = () => {
      const fakeAuthStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(fakeAuthStatus);
      
      // Redirecionar para login se não estiver autenticado e tentar acessar páginas protegidas
      if (!fakeAuthStatus && 
         (location.pathname === '/dashboard' || 
          location.pathname === '/tasks')) {
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogin = () => {
    // Simulação de login
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    
    toast({
      title: "Login realizado",
      description: "Você entrou na sua conta com sucesso.",
    });
    
    if (location.pathname === '/auth') {
      navigate('/u/dashboard');
    }
  };

  const handleLogout = () => {
    // Simulação de logout
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
    
    navigate('/auth');
  };

  // Para fins de demonstração, expor a função de login no window
  useEffect(() => {
    (window as any).simulateLogin = handleLogin;
    return () => {
      delete (window as any).simulateLogin;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700/50 bg-gray-900/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sistema de Tarefas
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto bg-gray-800 hover:bg-gray-700"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? 
            <X className="h-6 w-6 text-white" /> : 
            <Menu className="h-6 w-6 text-white" />
          }
        </Button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              {isLoggedIn && (
                <>
                  <NavigationMenuItem>
                    <Link to="/dashboard" className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === "/u/dashboard" ? "bg-gray-700 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-100"
                    )}>
                      <BarChart className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link to="/tasks" className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === "/u/tasks" ? "bg-gray-700 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-100"
                    )}>
                      <ListTodo className="mr-2 h-4 w-4" />
                      Tarefas
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-gray-800 hover:bg-gray-700 text-gray-100">
                      <User className="mr-2 h-4 w-4" />
                      Minha Conta
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[200px] bg-gray-800 border-gray-700">
                      <div className="p-2">
                        <NavigationMenuLink asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-white hover:bg-gray-700" 
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                          </Button>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="bg-gray-800 hover:bg-gray-700 text-gray-100">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 w-full bg-gray-900/95 md:hidden animate-fade-in">
            <div className="container px-4 py-6 flex flex-col space-y-4">
              {isLoggedIn && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={cn(
                      "flex items-center px-4 py-3 text-white rounded-md",
                      location.pathname === "/u/dashboard" ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    <BarChart className="mr-3 h-5 w-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/u/tasks"
                    className={cn(
                      "flex items-center px-4 py-3 text-white rounded-md",
                      location.pathname === "/tasks" ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    <ListTodo className="mr-3 h-5 w-5" />
                    Tarefas
                  </Link>
                </>
              )}

              {isLoggedIn ? (
                <Button 
                  variant="ghost" 
                  className="flex items-center px-4 py-3 text-white justify-start bg-gray-800 hover:bg-gray-700"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </Button>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center px-4 py-3 text-white rounded-md bg-gray-800 hover:bg-gray-700"
                  onClick={toggleMobileMenu}
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
