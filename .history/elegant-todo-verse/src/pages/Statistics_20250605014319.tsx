import React, { useEffect, useState } from 'react';
// Firebase imports removidos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ListChecks, MessageSquare, Tags, CheckCircle, Clock } from 'lucide-react';
// A função getTask foi removida pois usaremos fetch direto para as novas APIs

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
  criador?: string;
}

// Tipos para dados das novas APIs (AJUSTAR CONFORME RESPOSTAS REAIS DAS SUAS APIs)
interface ApiProductivityData {
  totalTarefas?: number;      // Ex: "totalTarefas": 50, ou pode ser "total_tarefas"
  totalComentarios?: number;  // Ex: "totalComentarios": 120, ou "total_comentarios"
  // Adicionar outros campos que a API /produtividade possa retornar
}

interface ApiStatusData {
  pendente?: number;          // Ex: "pendente": 10
  "em_andamento"?: number;    // Ex: "em_andamento": 5  (API pode usar snake_case)
  "em andamento"?: number;    // Ex: "em andamento": 5  (Ou com espaço)
  concluida?: number;         // Ex: "concluida": 35
  // Alternativamente, a API pode retornar um array: { status: string, count: number }[]
}

interface ApiTagData {
  tag: string;                // Ex: "tag": "trabalho"
  count: number;              // Ex: "count": 25
}
// --- End Types ---


// --- Statistics Component MODIFICADO ---
interface StatisticsProps {
  userIdentifier: string | null;
  generalStats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    completionRate: number;
    totalComments: number;
    uniqueTags: number;
  } | null;
  statusChartData: { name: string; value: number; fill: string }[];
  activityChartData: { day: string; tarefasCriadas: number }[];
  tagsChartData: { tag: string; count: number }[];
}

const Statistics = ({
  userIdentifier,
  generalStats,
  statusChartData,
  activityChartData,
  tagsChartData
}: StatisticsProps) => {

  const PIE_CHART_COLORS = ['#eab308', '#3b82f6', '#22c55e'];
  const BAR_CHART_TAG_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Mostra tela de carregamento se os dados ainda não chegaram e não há userIdentifier
  // (O carregamento principal é tratado no App, isto é um fallback)
  if (!generalStats && statusChartData.length === 0 && tagsChartData.length === 0 && activityChartData.length === 0 && !userIdentifier) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">A carregar dados...</h2>
            <p className="text-gray-400">Por favor, aguarde um momento.</p>
        </div>
    );
  }

  // Mostra tela de "Nenhuma tarefa" se generalStats não estiver carregado ou não houver tarefas
  if (!generalStats || generalStats.totalTasks === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <ListChecks className="w-16 h-16 mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">Nenhuma tarefa encontrada</h2>
            <p className="text-gray-400">Verifique se existem tarefas registadas para este utilizador.</p>
            {userIdentifier && <p className="text-sm text-gray-500 mt-4">Utilizador: <code className="bg-gray-700 p-1 rounded">{userIdentifier}</code></p>}
        </div>
    );
  }

  const stats = generalStats; // Os dados já vêm calculados e processados

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard de Produtividade
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
          <TabsTrigger value="status"><PieChartIcon className="w-4 h-4 mr-2" /> Estado</TabsTrigger>
          <TabsTrigger value="activity"><BarChart3 className="w-4 h-4 mr-2" /> Atividade</TabsTrigger>
          <TabsTrigger value="tags"><ListChecks className="w-4 h-4 mr-2" /> Tags</TabsTrigger>
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
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100}
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
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} className="focus:outline-none"/>
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
                  <BarChart data={activityChartData} margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 20, left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize="10px" />
                    <YAxis stroke="#9ca3af" fontSize="10px" allowDecimals={false}/>
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="tarefasCriadas" name="Tarefas Criadas" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30} />
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
                  <BarChart data={tagsChartData} layout="vertical" margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30, left: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#9ca3af" fontSize="10px" allowDecimals={false} />
                    <YAxis dataKey="tag" type="category" stroke="#9ca3af" fontSize="10px" width={typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 60} />
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="count" name="Nº de Tarefas" radius={[0, 4, 4, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 15 : 20}>
                        {tagsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_CHART_TAG_COLORS[index % BAR_CHART_TAG_COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {tagsChartData.map((tagData, index) => (
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
  const [generalStats, setGeneralStats] = useState<StatisticsProps['generalStats']>(null);
  const [statusChartData, setStatusChartData] = useState<StatisticsProps['statusChartData']>([]);
  const [activityChartData, setActivityChartData] = useState<StatisticsProps['activityChartData']>([]);
  const [tagsChartData, setTagsChartData] = useState<StatisticsProps['tagsChartData']>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let emailForApi: string | null = null;
    const defaultMockUser = { email: "geisbelly19@gmail.com" }; // Fallback user

    try {
      const storedUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        emailForApi = storedUser.email;
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(defaultMockUser));
        emailForApi = defaultMockUser.email;
        console.log("Utilizador mock (geisbelly19@gmail.com) definido no localStorage.");
      } else {
        // Fallback para ambientes onde localStorage não está disponível (ex: SSR inicial)
        // Poderia buscar de um cookie seguro ou variável de ambiente se aplicável
        emailForApi = defaultMockUser.email; 
        console.log("localStorage não disponível, usando utilizador mock padrão.");
      }
    } catch (e) {
      console.warn("Falha ao obter/analisar 'user' do localStorage. A utilizar mock padrão.", e);
      if (typeof window !== 'undefined' && !localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(defaultMockUser));
      }
      emailForApi = defaultMockUser.email;
    }

    if (!emailForApi) {
        console.error("Email do utilizador não pôde ser determinado. Não é possível carregar dados.");
        setInitializationError("Email do utilizador não encontrado. Verifique o localStorage ou a configuração padrão.");
        setIsLoading(false);
        return;
    }
    setUserEmail(emailForApi);

    const fetchAllDashboardData = async (email: string) => {
      setIsLoading(true);
      setInitializationError(null);
      const baseUrl = "https://tarefas-banco-estruturado.onrender.com/tarefas";

      try {
        const [productivityRes, statusRes, tagsRes, allTasksRes] = await Promise.all([
          fetch(`${baseUrl}/produtividade?userId=${email}`),
          fetch(`${baseUrl}/status?userId=${email}`),
          fetch(`${baseUrl}/tags?userId=${email}`),
          fetch(`${baseUrl}?userId=${email}`) // API para TODAS as tarefas
        ]);

        // Melhor tratamento de erro para cada fetch
        if (!productivityRes.ok) throw new Error(`Erro Produtividade (${productivityRes.status}): ${await productivityRes.text() || productivityRes.statusText}`);
        if (!statusRes.ok) throw new Error(`Erro Status (${statusRes.status}): ${await statusRes.text() || statusRes.statusText}`);
        if (!tagsRes.ok) throw new Error(`Erro Tags (${tagsRes.status}): ${await tagsRes.text() || tagsRes.statusText}`);
        if (!allTasksRes.ok) throw new Error(`Erro Todas Tarefas (${allTasksRes.status}): ${await allTasksRes.text() || allTasksRes.statusText}`);

        const productivityData: ApiProductivityData = await productivityRes.json();
        const statusApiData: ApiStatusData = await statusRes.json();
        const tagsApiData: ApiTagData[] = await tagsRes.json();
        const allTasks: Task[] = await allTasksRes.json();

        // 1. Processar dados de status
        // **AJUSTE AS CHAVES ABAIXO CONFORME A RESPOSTA REAL DA SUA API /status**
        // Exemplo: se sua API retorna "statusPendente" em vez de "pendente"
        const pending = statusApiData.pendente ?? 0;
        const inProgress = statusApiData["em_andamento"] ?? statusApiData["em andamento"] ?? 0;
        const completed = statusApiData.concluida ?? 0;

        const formattedStatusData = [
          { name: "Pendentes", value: pending, fill: "#eab308" },
          { name: "Em Andamento", value: inProgress, fill: "#3b82f6" },
          { name: "Concluídas", value: completed, fill: "#22c55e" }
        ];
        setStatusChartData(formattedStatusData);

        // 2. Processar dados de tags (Top 5)
        // **AJUSTE AS CHAVES "tag" E "count" CONFORME A RESPOSTA REAL DA SUA API /tags**
        const formattedTagsData = (tagsApiData || [])
            .map(item => ({ tag: item.tag, count: item.count })) // Assegure que item.tag e item.count existem
            .filter(item => typeof item.tag === 'string' && typeof item.count === 'number') // Filtra itens malformados
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setTagsChartData(formattedTagsData);

        // 3. Processar dados de atividade (tarefas criadas nos últimos 7 dias)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date;
        }).reverse();

        const activity = last7Days.map(day => {
          const dayFormatted = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);

          const tasksCreated = (allTasks || []).filter(task => {
            if (!task.dataCriacao) return false; // Garante que dataCriacao existe
            try {
                const taskDate = new Date(task.dataCriacao);
                return taskDate >= dayStart && taskDate <= dayEnd;
            } catch (e) {
                console.warn(`Data de criação inválida para tarefa ${task.id}: ${task.dataCriacao}`);
                return false;
            }
          }).length;
          return { day: dayFormatted, tarefasCriadas: tasksCreated };
        });
        setActivityChartData(activity);

        // 4. Montar estatísticas gerais
        // **AJUSTE AS CHAVES totalTarefas E totalComentarios CONFORME A RESPOSTA DA API /produtividade**
        const totalTasksFromProd = productivityData.totalTarefas;
        const totalTasksFromStatus = pending + inProgress + completed;
        // Prioriza total de tarefas da API de produtividade se for maior ou igual, senão usa a soma dos status.
        const totalTasks = (totalTasksFromProd !== undefined && totalTasksFromProd >= totalTasksFromStatus) 
                           ? totalTasksFromProd 
                           : totalTasksFromStatus;

        const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

        const totalCommentsFromProd = productivityData.totalComentarios;
        const totalCommentsFromAllTasks = (allTasks || []).reduce((sum, task) => sum + (task.comentarios?.length || 0), 0);
        // Prioriza comentários da API de produtividade, se disponível.
        const totalComments = totalCommentsFromProd !== undefined ? totalCommentsFromProd : totalCommentsFromAllTasks;
        
        // Para tags únicas: se a API /tags retorna TODAS as tags únicas, use-a.
        // Senão (ex: só top 5), calcule a partir de allTasks.
        // Assumindo que allTasks é a fonte mais completa para tags únicas se /tags não for.
        const uniqueTags = new Set((allTasks || []).flatMap(task => task.tags || [])).size;


        setGeneralStats({
          totalTasks: totalTasks,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed,
          completionRate: completionRate,
          totalComments: totalComments,
          uniqueTags: uniqueTags,
        });

      } catch (error) {
        console.error("Erro detalhado ao obter dados do dashboard:", error);
        setInitializationError((error as Error).message || "Ocorreu um erro desconhecido ao carregar os dados.");
        // Limpa estados para evitar mostrar dados inconsistentes ou antigos
        setGeneralStats(null);
        setStatusChartData([]);
        setActivityChartData([]);
        setTagsChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDashboardData(emailForApi);

  }, []); // O array de dependências vazio executa o efeito apenas na montagem inicial

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

   if (initializationError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
                <ListChecks className="w-16 h-16 mb-4 text-red-500" /> {/* Ícone de erro */}
                <h2 className="text-2xl font-semibold text-gray-300 mb-2">Erro ao Carregar Dados</h2>
                <p className="text-gray-400 mb-1 max-w-md">{initializationError}</p>
                {userEmail && <p className="text-sm text-gray-500 mt-2">Utilizador: <code className="bg-gray-700 p-1 rounded">{userEmail}</code></p>}
                 <p className="text-xs text-gray-600 mt-4">Tente recarregar a página ou verifique a consola do navegador para mais detalhes.</p>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main>
        <Statistics
          userIdentifier={userEmail}
          generalStats={generalStats}
          statusChartData={statusChartData}
          activityChartData={activityChartData}
          tagsChartData={tagsChartData}
        />
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        Dashboard de Produtividade &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;