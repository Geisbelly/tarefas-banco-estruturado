import React, { useEffect, useState } from 'react';
// Firebase imports removidos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ListChecks, MessageSquare, Tags, CheckCircle, Clock } from 'lucide-react';

// --- Mock UI Components (simulando shadcn/ui) ---
// Estes componentes (Card, Tabs, Badge, ChartContainer, etc.) permanecem inalterados
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-lg backdrop-blur-sm bg-white/10 ${className}`}>{children}</div>
);
const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-base md:text-lg font-semibold leading-none tracking-tight text-gray-200 ${className}`}>{children}</h3>
);
const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <p className={`text-xs md:text-sm text-muted-foreground text-gray-400 ${className}`}>{children}</p>
);
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 md:p-6 pt-0 ${className}`}>{children}</div>
);

const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (value: string) => void } | null>(null);

const Tabs = ({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};
const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-700/80 p-1 text-gray-300 ${className}`}>
    {children}
  </div>
);
const TabsTrigger = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const { activeTab, setActiveTab } = context;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === value ? 'bg-gray-600 text-white shadow-md' : 'hover:bg-gray-600/50'} ${className}`}
    >
      {children}
    </button>
  );
};
const TabsContent = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  return <div className={`${context.activeTab === value ? 'block' : 'hidden'} ${className}`}>{children}</div>;
};

const Badge = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <span className={`inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-700/50 text-gray-200 ${className}`} style={style}>
    {children}
  </span>
);

const ChartContainer = ({ children }: { children: React.ReactElement }) => (
    <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
);

const CustomChartTooltipContent = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-xs bg-gray-800/90 border border-gray-700 rounded-lg shadow-xl text-gray-200">
        <p className="label font-bold mb-1">{`${label || payload[0].payload.name || payload[0].payload.tag}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="capitalize">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
// --- End Helper UI Components ---

// --- Types ---
interface Task {
  id: string; 
  nome: string;
  descricao?: string;
  status: "pendente" | "em andamento" | "concluida";
  dataCriacao: string; // ISO string
  dataConclusao?: string | null; // ISO string
  tags: string[];
  comentarios: { texto: string; data: string; autorId: string; autorNome?: string }[];
  userId?: string; 
}
// --- End Types ---

// --- MOCK API SERVICE (Substitua pelo seu serviço real) ---
const mockApiUser = localStorage.getItem('user'); 

// Simula a estrutura do seu serviço getTask

  // Simula o caso em que o utilizador não tem tarefas
  // if (email === "semtarefas@exemplo.com") {
  // return [];
  // }
  return sampleTasksFromApi;
};
// --- END MOCK API SERVICE ---


// --- Statistics Component ---
const Statistics = ({ tasks, userIdentifier }: { tasks: Task[], userIdentifier: string | null }) => {
  // A lógica interna do Statistics permanece a mesma
  const getStatusChartData = () => {
    const statusCount = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: "Pendentes", value: statusCount["pendente"] || 0, fill: "#eab308" },
      { name: "Em Andamento", value: statusCount["em andamento"] || 0, fill: "#3b82f6" },
      { name: "Concluídas", value: statusCount["concluida"] || 0, fill: "#22c55e" }
    ];
  };

  const getTagsChartData = () => {
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      (task.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getActivityByDayData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();
    
    const dayData = last7Days.map(day => {
      const dayFormatted = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const tasksCreated = tasks.filter(task => {
        const taskDate = new Date(task.dataCriacao);
        return taskDate >= dayStart && taskDate <= dayEnd;
      }).length;
      
      return { day: dayFormatted, tarefasCriadas: tasksCreated };
    });
    return dayData;
  };

  const getGeneralStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === "pendente").length;
    const inProgressTasks = tasks.filter(task => task.status === "em andamento").length;
    const completedTasks = tasks.filter(task => task.status === "concluida").length;
    
    const totalComments = tasks.reduce((sum, task) => sum + (task.comentarios?.length || 0), 0);
    const uniqueTags = new Set(tasks.flatMap(task => task.tags || [])).size;
    
    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalComments,
      uniqueTags
    };
  };

  const statusData = getStatusChartData();
  const tagsData = getTagsChartData();
  const activityData = getActivityByDayData();
  const stats = getGeneralStats();
  
  const PIE_CHART_COLORS = ['#eab308', '#3b82f6', '#22c55e']; 
  const BAR_CHART_TAG_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Estado de carregamento ou sem tarefas
  if (tasks.length === 0 && !userIdentifier) { // Mostra carregamento se não houver identificador de utilizador e tarefas
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">A carregar dados...</h2>
            <p className="text-gray-400">Por favor, aguarde um momento.</p>
        </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <ListChecks className="w-16 h-16 mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">Nenhuma tarefa encontrada</h2>
            <p className="text-gray-400">Verifique se existem tarefas registadas ou se o utilizador está definido no localStorage.</p>
            {userIdentifier && <p className="text-sm text-gray-500 mt-4">Identificador do Utilizador: <code className="bg-gray-700 p-1 rounded">{userIdentifier}</code></p>}
        </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard de Produtividade (API Simplificado)
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg">Métricas e informações sobre as suas tarefas.</p>
        {userIdentifier && <p className="text-xs text-gray-500 mt-1">Utilizador: <code className="bg-gray-700 p-1 rounded text-gray-300">{userIdentifier}</code></p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-gray-300 text-sm font-medium"><ListChecks className="w-4 h-4 mr-2 text-blue-400"/>Total de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-gray-300 text-sm font-medium"><CheckCircle className="w-4 h-4 mr-2 text-green-400"/>Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-gray-300 text-sm font-medium"><MessageSquare className="w-4 h-4 mr-2 text-yellow-400"/>Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.totalComments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Tags className="w-4 h-4 mr-2 text-purple-400"/>Tags Únicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.uniqueTags}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
          <TabsTrigger value="status">
            <PieChartIcon className="w-4 h-4 mr-2" /> Estado
          </TabsTrigger>
          <TabsTrigger value="activity">
            <BarChart3 className="w-4 h-4 mr-2" /> Atividade
          </TabsTrigger>
          <TabsTrigger value="tags">
            <ListChecks className="w-4 h-4 mr-2" /> Tags
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estado</CardTitle>
              <CardDescription>Visão geral do estado atual das suas tarefas.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-72 sm:h-80 w-full max-w-md">
                <ChartContainer>
                  <PieChart>
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 640 ? 80 : 100}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        if (percent * 100 < 5) return null;
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                            {`${name} (${value})`}
                          </text>
                        );
                      }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} stroke={entry.fill} className="focus:outline-none"/>
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Atividade nos Últimos 7 Dias</CardTitle>
              <CardDescription>Número de tarefas criadas por dia.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 sm:h-80 w-full">
                <ChartContainer>
                  <BarChart data={activityData} margin={{ top: 5, right: window.innerWidth < 640 ? 0 : 20, left: window.innerWidth < 640 ? -30 : -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize="10px" />
                    <YAxis stroke="#9ca3af" fontSize="10px" allowDecimals={false}/>
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="tarefasCriadas" name="Tarefas Criadas" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={window.innerWidth < 640 ? 20 : 30} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Tags Mais Usadas</CardTitle>
              <CardDescription>As tags mais frequentes nas suas tarefas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 sm:h-80 w-full mb-6">
                <ChartContainer>
                  <BarChart data={tagsData} layout="vertical" margin={{ top: 5, right: window.innerWidth < 640 ? 20 : 30, left: window.innerWidth < 640 ? 20 : 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#9ca3af" fontSize="10px" allowDecimals={false} />
                    <YAxis dataKey="tag" type="category" stroke="#9ca3af" fontSize="10px" width={window.innerWidth < 640 ? 40 : 60} />
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="count" name="Nº de Tarefas" radius={[0, 4, 4, 0]} barSize={window.innerWidth < 640 ? 15 : 20}>
                        {tagsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_CHART_TAG_COLORS[index % BAR_CHART_TAG_COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {tagsData.map((tagData, index) => (
                  <Badge 
                    key={tagData.tag} 
                    style={{ borderLeftColor: BAR_CHART_TAG_COLORS[index % BAR_CHART_TAG_COLORS.length], borderLeftWidth: 3 }}
                  >
                    {tagData.tag} ({tagData.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
// --- End Statistics Component ---


// --- Main App Component ---
const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Efeito para inicializar o utilizador mock e obter tarefas
  useEffect(() => {
    // Tenta obter o utilizador do localStorage ou define um mock
    let emailForApi: string | null = null;
    try {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        emailForApi = storedUser.email;
      } else {
        // Se não houver utilizador no localStorage, define o mock e guarda-o
        localStorage.setItem('user', JSON.stringify(mockApiUser));
        emailForApi = mockApiUser.email;
        console.log("Utilizador mock definido no localStorage:", mockApiUser);
      }
    } catch (e) {
      console.warn("Falha ao obter/analisar 'user' do localStorage. A utilizar mock padrão.", e);
      // Garante que mockApiUser é usado se localStorage falhar
      if (!localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(mockApiUser));
      }
      emailForApi = mockApiUser.email;
    }
    setUserEmail(emailForApi); // Define o email do utilizador para ser usado no UI

    const fetchTasksFromApi = async (email: string) => {
      setIsLoading(true);
      try {
        const apiTasks = await getTask(email); 
        const sortedTasks: Task[] = apiTasks.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Erro ao obter tarefas da API:", error);
        setTasks([]); 
      } finally {
        setIsLoading(false);
      }
    };

    if (emailForApi) {
      fetchTasksFromApi(emailForApi);
    } else {
      console.warn("Email do utilizador não encontrado. As tarefas não serão obtidas.");
      setTasks([]);
      setIsLoading(false);
    }
  }, []); // Executa apenas uma vez na montagem do componente


  if (isLoading) { 
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <svg className="animate-spin h-12 w-12 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold">A carregar Dashboard...</h2>
         {userEmail && <p className="text-sm text-gray-500 mt-2">Utilizador: <code className="bg-gray-700 p-1 rounded text-gray-300">{userEmail}</code></p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main>
        <Statistics tasks={tasks} userIdentifier={userEmail} />
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        Dashboard de Produtividade &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;

