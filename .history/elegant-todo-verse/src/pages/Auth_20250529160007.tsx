
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { postUser } from "@/services/tarefas";

const Auth = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/u/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulando autenticação
    setTimeout(() => {
      setIsLoading(false);
      // Aceitar qualquer login para demonstração
      localStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Login realizado!",
        description: "Você foi autenticado com sucesso.",
      });
      
      navigate('/dashboard');
    }, 1500);
  };

  const clear = ()=>{
    setLoginEmail("")
    setLoginPassword("")
    setLoginPassword("")
    setRegisterEmail("")
    setRegisterName("")
    setRegisterPassword("")
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    postUser({email:registerEmail, senha:registerPassword, nome:registerName}).then((e) => {
      const novoUser = {email:registerEmail,senha:registerPassword,nome:registerName}
      console.log("Usuario criada com sucesso:", novoUser);

      toast({
        title: "Registro realizado!",
        description: "Sua conta foi criada com sucesso.",
      });

      navigate('/dashboard')
    }).catch(err => {
      console.error("Erro ao criar usuario:", err);
    }).finally(()=>{setIsLoading(false); clear()});
    
    
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md bg-gray-900/90 border-gray-700/50 backdrop-blur-sm animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sistema de Tarefas
          </CardTitle>
          <CardDescription className="text-gray-300">
            Gerencie suas tarefas de forma eficiente
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60">
            <TabsTrigger value="login" className="data-[state=active]:bg-gray-700">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gray-700">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-300">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-gray-800/70 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm text-gray-300">Senha</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-gray-800/70 border-gray-600 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">Entrando...</span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" /> Entrar
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-gray-300">Nome</label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-gray-800/70 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-sm text-gray-300">Email</label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-gray-800/70 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm text-gray-300">Senha</label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-gray-800/70 border-gray-600 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">Registrando...</span>
                  ) : (
                    <span className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
