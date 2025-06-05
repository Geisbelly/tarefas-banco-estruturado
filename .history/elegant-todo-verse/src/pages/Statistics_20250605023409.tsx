import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ListChecks, MessageSquare, Tags, CheckCircle, Clock, Zap, CalendarCheck2, TrendingUp, Info, Filter } from 'lucide-react';

// --- Componentes UI (Card, Tabs, etc.) - permanecem inalterados ---
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
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-700/80 p-1 text-gray-300 ${className}`}>{children}</div>
);
const TabsTrigger = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  return <button onClick={() => context.setActiveTab(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all ${context.activeTab === value ? 'bg-gray-600 text-white shadow-md' : 'hover:bg-gray-600/50'} ${className}`}>{children}</button>;
};
const TabsContent = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  return <div className={`${context.activeTab === value ? 'block' : 'hidden'} ${className}`}>{children}</div>;
};
const Badge = ({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <span className={`inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-semibold bg-gray-700/50 text-gray-200 ${className}`} style={style}>{children}</span>
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
// --- Fim Componentes UI ---

// --- Tipos para dados das APIs AJUSTADOS ---
interface ApiProductivityData {
  [key: `tarefas_criadas_${string}`]: string | number | undefined;
  tempo_medio_conclusao_ms?: number;
  total_concluidas?: number;
  taxaConclusaoSemanal?: number;
}
interface ApiStatusData {
  pendente?: number;
  "em andamento"?: number;
  concluida?: number;
}
interface ApiTagData {
  value: string;
  score: number;
}
interface ApiConcluidasPorDia {
  [date: string]: number;
}
// Novo tipo para API de tarefas criadas por período (SE VOCÊ CRIAR ESSA API)
interface ApiCriadasPorDia {
    [date: string]: number;
}
// --- Fim Tipos ---

// --- Componente Statistics ---
interface StatisticsProps {
  userIdentifier: string | null;
  generalStats: {
    totalTasksAtivas: number; // Mudou aqui
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number; // Total concluídas do /status
    totalComments: number;
    uniqueTags: number;
    avgCompletionTime: string;
    tasksCreatedToday: number;
    weeklyCompletionRate: number;
  } | null;
  statusChartData: { name: string; value: number; fill: string }[];
  activityConcluidasChartData: { dia: string; tarefasConcluidas: number }[];
  activityCriadasChartData: { dia: string; tarefasCriadas: number }[] | null; // Pode ser null se API não existir
  tagsChartData: { tag: string; count: number }[];
  // Props para os filtros
  startDateConcluidas: string;
  setStartDateConcluidas: (date: string) => void;
  endDateConcluidas: string;
  setEndDateConcluidas: (date: string) => void;
  startDateCriadas: string;
  setStartDateCriadas: (date: string) => void;
  endDateCriadas: string;
  setEndDateCriadas: (date: string) => void;
  handleFilterApply: () => void; // Função para aplicar filtros
}

const Statistics = ({
  userIdentifier,
  generalStats,
  statusChartData,
  activityConcluidasChartData,
  activityCriadasChartData, // Nova prop
  tagsChartData,
  startDateConcluidas, setStartDateConcluidas, endDateConcluidas, setEndDateConcluidas,
  startDateCriadas, setStartDateCriadas, endDateCriadas, setEndDateCriadas,
  handleFilterApply
}: StatisticsProps) => {

  const PIE_CHART_COLORS = ['#eab308', '#3b82f6', '#22c55e'];
  const BAR_CHART_TAG_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!generalStats && statusChartData.length === 0 && tagsChartData.length === 0 && activityConcluidasChartData.length === 0 && !userIdentifier) {
    return ( /* ... tela de loading ... */ );
  }
  if (!generalStats || (generalStats.totalTasksAtivas === 0 && generalStats.tasksCreatedToday === 0 && generalStats.completedTasks === 0)) {
    return ( /* ... tela de nenhum dado ... */ );
  }

  const stats = generalStats;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard de Produtividade
        </h1>
        {/* ... (descrição e userIdentifier) ... */}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><ListChecks className="w-4 h-4 mr-2 text-blue-400"/>Total Tarefas Ativas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{stats.totalTasksAtivas}</div></CardContent>
        </Card>
        {/* ... (outros cards de stats como antes: Taxa Conclusão, Criadas Hoje, Tempo Médio, Comentários, Tags) ... */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><TrendingUp className="w-4 h-4 mr-2 text-green-400"/>Taxa Conclusão (Sem.)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{stats.weeklyCompletionRate}%</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Zap className="w-4 h-4 mr-2 text-yellow-400"/>Tarefas Criadas Hoje</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-400">{stats.tasksCreatedToday}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><CalendarCheck2 className="w-4 h-4 mr-2 text-teal-400"/>Tempo Médio Conclusão</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold text-teal-400">{stats.avgCompletionTime || "N/A"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><MessageSquare className="w-4 h-4 mr-2 text-orange-400"/>Total Comentários</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-400">{stats.totalComments}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Tags className="w-4 h-4 mr-2 text-purple-400"/>Tags (Top {tagsChartData.length})</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-400">{stats.uniqueTags}</div></CardContent>
        </Card>
      </div>

      {/* Seção de Filtros de Data */}
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="flex items-center"><Filter className="w-5 h-5 mr-2 text-sky-400" />Filtros por Período</CardTitle>
            <CardDescription>Selecione os períodos para visualizar os gráficos de tarefas concluídas e criadas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Período de Tarefas Concluídas:</h4>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDateConcluidas} onChange={e => setStartDateConcluidas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full"/>
                    <span className="text-gray-400">até</span>
                    <input type="date" value={endDateConcluidas} onChange={e => setEndDateConcluidas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full"/>
                </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Período de Tarefas Criadas:</h4>
                 <div className="flex items-center gap-2">
                    <input type="date" value={startDateCriadas} onChange={e => setStartDateCriadas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full"/>
                    <span className="text-gray-400">até</span>
                    <input type="date" value={endDateCriadas} onChange={e => setEndDateCriadas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full"/>
                </div>
            </div>
        </CardContent>
        {/* O botão de aplicar filtro foi removido, o useEffect no App vai reagir às mudanças de data */}
      </Card>


      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-8"> {/* Adicionado +1 col para Criadas */}
          <TabsTrigger value="status"><PieChartIcon className="w-4 h-4 mr-2" /> Estado Atual</TabsTrigger>
          <TabsTrigger value="activityConcluidas"><BarChart3 className="w-4 h-4 mr-2" /> Concluídas</TabsTrigger>
          <TabsTrigger value="activityCriadas"><Zap className="w-4 h-4 mr-2" /> Criadas</TabsTrigger> {/* Nova Aba */}
          <TabsTrigger value="tags"><Tags className="w-4 h-4 mr-2" /> Top Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-0"> {/* ... (Gráfico de Status como antes) ... */} 
            <Card>
            <CardHeader><CardTitle>Distribuição por Estado</CardTitle><CardDescription>Visão geral do estado atual das suas tarefas.</CardDescription></CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-72 sm:h-80 w-full max-w-md">
                <ChartContainer>
                  <PieChart>
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100} labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        if (percent * 100 < 5 || value === 0) return null;
                        return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">{`${name} (${value})`}</text>;
                      }}
                    >
                      {statusChartData.map((entry) => ( <Cell key={entry.name} fill={entry.fill} stroke={entry.fill} className="focus:outline-none"/> ))}
                    </Pie>
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activityConcluidas" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Tarefas Concluídas no Período</CardTitle><CardDescription>Número de tarefas finalizadas por dia no período selecionado.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-72 sm:h-80 w-full">
                <ChartContainer>
                  <BarChart data={activityConcluidasChartData} margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 20, left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="dia" stroke="#9ca3af" fontSize="10px" />
                    <YAxis stroke="#9ca3af" fontSize="10px" allowDecimals={false}/>
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="tarefasConcluidas" name="Tarefas Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Nova Aba para Tarefas Criadas */}
        <TabsContent value="activityCriadas" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Tarefas Criadas no Período</CardTitle><CardDescription>Número de tarefas iniciadas por dia no período selecionado.</CardDescription></CardHeader>
            <CardContent>
              {activityCriadasChartData ? (
                <div className="h-72 sm:h-80 w-full">
                  <ChartContainer>
                    <BarChart data={activityCriadasChartData} margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 20, left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="dia" stroke="#9ca3af" fontSize="10px" />
                      <YAxis stroke="#9ca3af" fontSize="10px" allowDecimals={false}/>
                      <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                      <Bar dataKey="tarefasCriadas" name="Tarefas Criadas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30} />
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <p>Para visualizar este gráfico, é necessário um endpoint na API que retorne tarefas criadas por dia para o período selecionado.</p>
                  <p className="text-xs mt-2">(Ex: <code>/tarefas/criadasPorPeriodo?userId=...&de=...&ate=...</code> retornando <code>{"{YYYY-MM-DD: count}"}</code>)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-0"> {/* ... (Gráfico de Tags como antes) ... */} 
            <Card>
            <CardHeader><CardTitle>Top Tags Mais Usadas</CardTitle><CardDescription>As tags mais frequentes nas suas tarefas.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-72 sm:h-80 w-full mb-6">
                <ChartContainer>
                  <BarChart data={tagsChartData} layout="vertical" margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30, left: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#9ca3af" fontSize="10px" allowDecimals={false} />
                    <YAxis dataKey="tag" type="category" stroke="#9ca3af" fontSize="10px" width={typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 60} />
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="count" name="Nº de Tarefas" radius={[0, 4, 4, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 15 : 20}>
                      {tagsChartData.map((entry, index) => ( <Cell key={`cell-tag-${index}`} fill={BAR_CHART_TAG_COLORS[index % BAR_CHART_TAG_COLORS.length]} /> ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {tagsChartData.map((tagData, index) => (
                  <Badge key={tagData.tag} style={{ borderLeftColor: BAR_CHART_TAG_COLORS[index % BAR_CHART_TAG_COLORS.length], borderLeftWidth: 3 }}>
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
// --- Fim Statistics Component ---

// --- Funções Auxiliares ---
const formatDataParaAPI = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const dia = data.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const formatMillisecondsToReadable = (ms: number | undefined | null): string => {
  if (ms === undefined || ms === null || ms <= 0 || isNaN(ms)) return "N/A";
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60; minutes %= 60; hours %= 24;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (days === 0 && minutes > 0) parts.push(`${minutes}m`);
  if (days === 0 && hours === 0 && minutes === 0 && seconds > 0) parts.push(`${seconds}s`);
  if (parts.length === 0) return ms < 1000 && ms > 0 ? `< 1s` : (ms > 0 ? `< 1m` : "N/A");
  return parts.join(' ');
};
// --- Fim Funções Auxiliares ---


// --- Componente Principal App ---
const App = () => {
  const [generalStats, setGeneralStats] = useState<StatisticsProps['generalStats']>(null);
  const [statusChartData, setStatusChartData] = useState<StatisticsProps['statusChartData']>([]);
  const [activityConcluidasChartData, setActivityConcluidasChartData] = useState<StatisticsProps['activityChartData']>([]);
  const [activityCriadasChartData, setActivityCriadasChartData] = useState<StatisticsProps['activityCriadasChartData'] | null>(null); // Novo estado
  const [tagsChartData, setTagsChartData] = useState<StatisticsProps['tagsChartData']>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Estados para os filtros de data
  const hoje = new Date();
  const seteDiasAtrasDefault = new Date();
  seteDiasAtrasDefault.setDate(hoje.getDate() - 6); // Default: últimos 7 dias incluindo hoje

  const [startDateConcluidas, setStartDateConcluidas] = useState(formatDataParaAPI(seteDiasAtrasDefault));
  const [endDateConcluidas, setEndDateConcluidas] = useState(formatDataParaAPI(hoje));
  const [startDateCriadas, setStartDateCriadas] = useState(formatDataParaAPI(seteDiasAtrasDefault));
  const [endDateCriadas, setEndDateCriadas] = useState(formatDataParaAPI(hoje));

  useEffect(() => {
    console.log("[App useEffect] Disparado. Deps:", { userEmail, startDateConcluidas, endDateConcluidas, startDateCriadas, endDateCriadas });
    let emailForApi: string | null = null;
    if (!userEmail) { // Só busca email do localStorage na primeira vez ou se userEmail for null
        const defaultMockUser = { email: "geisbelly19@gmail.com" };
        try {
            const storedUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (storedUserString) {
                const storedUser = JSON.parse(storedUserString);
                emailForApi = storedUser.email;
            } else if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(defaultMockUser));
                emailForApi = defaultMockUser.email;
            } else {
                emailForApi = defaultMockUser.email;
            }
        } catch (e) { emailForApi = defaultMockUser.email; }
        
        if (!emailForApi) {
            setInitializationError("Email do utilizador não pôde ser determinado.");
            setIsLoading(false); return;
        }
        setUserEmail(emailForApi); // Define o email do usuário no estado
        console.log("[App useEffect] Email para API definido (ou reconfirmado):", emailForApi);
        // Não retorna aqui, deixa o fetchAllDashboardData rodar se o email foi obtido
    } else {
        emailForApi = userEmail; // Usa o email já em estado se não for a primeira montagem
    }
    
    if (!emailForApi) { // Verificação final se o email não pode ser determinado
        console.error("[App useEffect] Email do utilizador é NULO após tentativa de definição. Não carregando dados.");
        setInitializationError("Email do utilizador não pôde ser determinado para carregar os dados.");
        setIsLoading(false);
        return;
    }


    const fetchAllDashboardData = async (email: string, deConcluidas: string, ateConcluidas: string, deCriadas: string, ateCriadas: string) => {
      setIsLoading(true);
      setInitializationError(null);
      console.log(`[fetchAllDashboardData] Iniciando busca para: ${email}, Concluídas: ${deConcluidas}-${ateConcluidas}, Criadas: ${deCriadas}-${ateCriadas}`);
      const baseUrl = "https://tarefas-banco-estruturado.onrender.com/tarefas";

      const productivityUrl = `${baseUrl}/produtividade?userId=${email}`;
      const statusUrl = `${baseUrl}/status?userId=${email}`;
      const tagsUrl = `${baseUrl}/tags?userId=${email}`;
      const concluidasNoPeriodoUrl = `${baseUrl}/concluidas?userId=${email}&de=${deConcluidas}&ate=${ateConcluidas}`;
      
      // **NOVA API NECESSÁRIA PARA TAREFAS CRIADAS POR PERÍODO**
      const criadasNoPeriodoUrl = `${baseUrl}/criadasPorPeriodo?userId=${email}&de=${deCriadas}&ate=${ateCriadas}`; // Exemplo de URL

      console.log("[fetchAllDashboardData] URLs:", { productivityUrl, statusUrl, tagsUrl, concluidasNoPeriodoUrl, criadasNoPeriodoUrl });

      try {
        const promises = [
          fetch(productivityUrl),
          fetch(statusUrl),
          fetch(tagsUrl),
          fetch(concluidasNoPeriodoUrl),
          // fetch(criadasNoPeriodoUrl) // DESCOMENTE QUANDO A API EXISTIR
        ];

        // Apenas adiciona o fetch para criadasPorPeriodo se a URL for diferente (exemplo, ou se você tiver uma flag)
        // Por agora, vamos simular que ela pode falhar ou não existir.
        // Para um teste real, você precisaria da API.
        // Para evitar que tudo quebre se a API não existir, vamos tratá-la separadamente ou mockar.
        // Por ora, não vamos incluir no Promise.all para não quebrar as outras se ela der 404.

        const [productivityRes, statusRes, tagsRes, concluidasNoPeriodoRes] = await Promise.all(promises);

        if (!productivityRes.ok) throw new Error(`Erro API Produtividade (${productivityRes.status}): ${await productivityRes.text() || productivityRes.statusText}`);
        if (!statusRes.ok) throw new Error(`Erro API Status (${statusRes.status}): ${await statusRes.text() || statusRes.statusText}`);
        if (!tagsRes.ok) throw new Error(`Erro API Tags (${tagsRes.status}): ${await tagsRes.text() || tagsRes.statusText}`);
        if (!concluidasNoPeriodoRes.ok) throw new Error(`Erro API Concluídas (${concluidasNoPeriodoRes.status}): ${await concluidasNoPeriodoRes.text() || concluidasNoPeriodoRes.statusText}`);
        
        const productivityApiData: ApiProductivityData = await productivityRes.json();
        const statusApiData: ApiStatusData = await statusRes.json();
        const tagsApiData: ApiTagData[] = await tagsRes.json();
        const concluidasPorDiaApiData: ApiConcluidasPorDia = await concluidasNoPeriodoRes.json();

        console.log("[fetchAllDashboardData] Dados JSON (Prod, Status, Tags, Concluídas/Dia):", { productivityApiData, statusApiData, tagsApiData, concluidasPorDiaApiData });

        // Processamento para Status
        const pending = statusApiData.pendente ?? 0;
        const inProgress = statusApiData["em andamento"] ?? 0;
        const completed = statusApiData.concluida ?? 0;
        setStatusChartData([
          { name: "Pendentes", value: pending, fill: "#eab308" },
          { name: "Em Andamento", value: inProgress, fill: "#3b82f6" },
          { name: "Concluídas", value: completed, fill: "#22c55e" }
        ]);

        // Processamento para Tags
        const processedTags = (tagsApiData || [])
            .map(item => ({ tag: String(item.value || "N/A"), count: Number(item.score || 0) }))
            .filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
        setTagsChartData(processedTags);

        // Processamento para Gráfico de Concluídas (ActivityConcluidasChartData)
        const diasConcluidasParaGrafico = Array.from({ length: Math.max(1, (new Date(ateConcluidas).getTime() - new Date(deConcluidas).getTime()) / (1000 * 3600 * 24) + 1) }, (_, i) => {
            const data = new Date(deConcluidas + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso ao somar dias
            data.setDate(data.getDate() + i);
            return data;
        });
         if (diasConcluidasParaGrafico.length === 0 && deConcluidas === ateConcluidas) { // Caso de período de 1 dia
            diasConcluidasParaGrafico.push(new Date(deConcluidas + "T00:00:00"));
        }


        const processedActivityConcluidas = diasConcluidasParaGrafico.map(dataDia => {
            const diaLabel = dataDia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const dataFormatadaChave = formatDataParaAPI(dataDia);
            const contagem = concluidasPorDiaApiData[dataFormatadaChave] ?? 0;
            return { dia: diaLabel, tarefasConcluidas: Number(contagem) };
        });
        setActivityConcluidasChartData(processedActivityConcluidas);
        console.log("[fetchAllDashboardData] Gráfico de Atividade (Concluídas) Processado:", JSON.stringify(processedActivityConcluidas));

        // TENTATIVA DE BUSCAR E PROCESSAR DADOS DE TAREFAS CRIADAS (requer API)
        try {
            const criadasResponse = await fetch(criadasNoPeriodoUrl);
            if (criadasResponse.ok) {
                const criadasPorDiaApiData: ApiCriadasPorDia = await criadasResponse.json();
                console.log("[fetchAllDashboardData] Tarefas Criadas por Dia (bruto da API):", JSON.stringify(criadasPorDiaApiData));
                
                const diasCriadasParaGrafico = Array.from({ length: Math.max(1, (new Date(ateCriadas).getTime() - new Date(deCriadas).getTime()) / (1000 * 3600 * 24) + 1) }, (_, i) => {
                    const data = new Date(deCriadas + "T00:00:00");
                    data.setDate(data.getDate() + i);
                    return data;
                });
                if (diasCriadasParaGrafico.length === 0 && deCriadas === ateCriadas) {
                    diasCriadasParaGrafico.push(new Date(deCriadas + "T00:00:00"));
                }

                const processedActivityCriadas = diasCriadasParaGrafico.map(dataDia => {
                    const diaLabel = dataDia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                    const dataFormatadaChave = formatDataParaAPI(dataDia);
                    const contagem = criadasPorDiaApiData[dataFormatadaChave] ?? 0;
                    return { dia: diaLabel, tarefasCriadas: Number(contagem) };
                });
                setActivityCriadasChartData(processedActivityCriadas);
                console.log("[fetchAllDashboardData] Gráfico de Atividade (Criadas) Processado:", JSON.stringify(processedActivityCriadas));
            } else {
                console.warn(`[fetchAllDashboardData] API de Tarefas Criadas (${criadasResponse.status}) falhou ou não existe. Gráfico não será populado.`);
                setActivityCriadasChartData(null); // Indica que não há dados
            }
        } catch (errorCriadas) {
            console.error("[fetchAllDashboardData] Erro ao buscar/processar tarefas criadas:", errorCriadas);
            setActivityCriadasChartData(null);
        }


        // Estatísticas Gerais
        const totalTasksAtivas = pending + inProgress; // CORRIGIDO
        const hojeFormatadoChave = `tarefas_criadas_${formatDataParaAPI(new Date())}`;
        const tarefasCriadasHojeValor = productivityApiData[hojeFormatadoChave];
        let tasksCreatedTodayNum = 0;
        if (typeof tarefasCriadasHojeValor === 'string') tasksCreatedTodayNum = parseInt(tarefasCriadasHojeValor, 10);
        else if (typeof tarefasCriadasHojeValor === 'number') tasksCreatedTodayNum = tarefasCriadasHojeValor;
        if (isNaN(tasksCreatedTodayNum)) tasksCreatedTodayNum = 0;

        if (!productivityApiData.taxaConclusaoSemanal && productivityApiData.taxaConclusaoSemanal !== 0) {
            console.warn("[fetchAllDashboardData] API de Produtividade não retornou 'taxaConclusaoSemanal'. Usando 0.");
        }

        const finalGeneralStats = {
          totalTasksAtivas: totalTasksAtivas,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed, // Total concluídas do /status
          totalComments: 0, // API não fornece
          uniqueTags: processedTags.length,
          avgCompletionTime: formatMillisecondsToReadable(productivityApiData.tempo_medio_conclusao_ms),
          tasksCreatedToday: tasksCreatedTodayNum,
          weeklyCompletionRate: productivityApiData.taxaConclusaoSemanal ?? 0,
        };
        setGeneralStats(finalGeneralStats);
        console.log("[fetchAllDashboardData] Estatísticas Gerais Finais:", JSON.stringify(finalGeneralStats));

      } catch (error) {
        console.error("[fetchAllDashboardData] ERRO GERAL:", error);
        setInitializationError((error as Error).message || "Erro desconhecido.");
      } finally {
        console.log("[fetchAllDashboardData] FINALLY: isLoading = false");
        setIsLoading(false);
      }
    };
    
    // Chama o fetch com as datas atuais do estado
    fetchAllDashboardData(emailForApi, startDateConcluidas, endDateConcluidas, startDateCriadas, endDateCriadas);

  }, [userEmail, startDateConcluidas, endDateConcluidas, startDateCriadas, endDateCriadas]); // Adiciona as datas como dependências

  if (isLoading) { /* ... (tela de loading) ... */ 
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <svg className="animate-spin h-12 w-12 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold">Carregando Dashboard...</h2>
        {userEmail && <p className="text-sm text-gray-500 mt-2">Utilizador: <code className="bg-gray-700 p-1 rounded text-gray-300">{userEmail}</code></p>}
      </div>
    );
  }
   if (initializationError) { /* ... (tela de erro) ... */ 
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
                <Info className="w-16 h-16 mb-4 text-red-500" />
                <h2 className="text-2xl font-semibold text-gray-300 mb-2">Erro ao Carregar Dados</h2>
                <p className="text-gray-400 mb-1 max-w-md">{initializationError}</p>
                {userEmail && <p className="text-sm text-gray-500 mt-2">Utilizador: <code className="bg-gray-700 p-1 rounded">{userEmail}</code></p>}
                 <p className="text-xs text-gray-600 mt-4">Verifique a consola do navegador (F12) para detalhes técnicos e confirme se as APIs estão respondendo corretamente.</p>
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
          activityConcluidasChartData={activityConcluidasChartData}
          activityCriadasChartData={activityCriadasChartData}
          tagsChartData={tagsChartData}
          startDateConcluidas={startDateConcluidas}
          setStartDateConcluidas={setStartDateConcluidas}
          endDateConcluidas={endDateConcluidas}
          setEndDateConcluidas={setEndDateConcluidas}
          startDateCriadas={startDateCriadas}
          setStartDateCriadas={setStartDateCriadas}
          endDateCriadas={endDateCriadas}
          setEndDateCriadas={setEndDateCriadas}
          handleFilterApply={() => { // A lógica de refetch agora é pelo useEffect
            console.log("Filtros de data alterados, useEffect irá re-buscar.");
          }}
        />
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        Dashboard de Produtividade &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;