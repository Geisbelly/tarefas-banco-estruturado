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
  <div className={`p-4 md:p-6 ${className}`}>{children}</div> // Ajustei o padding top que estava pt-0
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
  return <div className={`${context.activeTab === value ? 'block' : 'hidden'} mt-6 ${className}`}>{children}</div>; // Adicionado mt-6 para espaço após TabsList
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

// --- Tipos para dados das APIs ---
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
interface ApiCriadasPorDia {
    [date: string]: number;
}
// --- Fim Tipos ---

// --- Componente Statistics ---
interface StatisticsProps {
  userIdentifier: string | null;
  generalStats: {
    totalTasksAtivas: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    totalComments: number;
    uniqueTags: number;
    avgCompletionTime: string;
    tasksCreatedToday: number;
    weeklyCompletionRate: number;
  } | null;
  statusChartData: { name: string; value: number; fill: string }[];
  activityConcluidasChartData: { dia: string; tarefasConcluidas: number }[];
  activityCriadasChartData: { dia: string; tarefasCriadas: number }[] | null;
  tagsChartData: { tag: string; count: number; rank: number }[];
  startDateConcluidas: string;
  setStartDateConcluidas: (date: string) => void;
  endDateConcluidas: string;
  setEndDateConcluidas: (date: string) => void;
  startDateCriadas: string;
  setStartDateCriadas: (date: string) => void;
  endDateCriadas: string;
  setEndDateCriadas: (date: string) => void;
}

const Statistics = ({
  userIdentifier,
  generalStats,
  statusChartData,
  activityConcluidasChartData,
  activityCriadasChartData,
  tagsChartData,
  startDateConcluidas, setStartDateConcluidas, endDateConcluidas, setEndDateConcluidas,
  startDateCriadas, setStartDateCriadas, endDateCriadas, setEndDateCriadas,
}: StatisticsProps) => {

  const PIE_CHART_COLORS = ['#eab308', '#3b82f6', '#22c55e'];
  const BAR_CHART_TAG_COLORS_DEFAULT = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ff7300'];
  const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

  if (!generalStats && statusChartData.length === 0 && tagsChartData.length === 0 && activityConcluidasChartData.length === 0 && !userIdentifier) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">Carregando dados...</h2>
            <p className="text-gray-400">Por favor, aguarde.</p>
        </div>
    );
  }

  if (!generalStats || (generalStats.totalTasksAtivas === 0 && generalStats.tasksCreatedToday === 0 && generalStats.completedTasks === 0 && generalStats.pendingTasks === 0 && generalStats.inProgressTasks === 0 )) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <Info className="w-16 h-16 mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">Nenhum dado de tarefa encontrado</h2>
            <p className="text-gray-400">Ainda não há estatísticas de tarefas para este utilizador.</p>
            {userIdentifier && <p className="text-sm text-gray-500 mt-4">Utilizador: <code className="bg-gray-700 p-1 rounded">{userIdentifier}</code></p>}
        </div>
    );
  }

  const stats = generalStats;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard de Produtividade
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg">Métricas e informações chave sobre suas tarefas.</p>
        {userIdentifier && <p className="text-xs text-gray-500 mt-1">Utilizador: <code className="bg-gray-700 p-1 rounded text-gray-300">{userIdentifier}</code></p>}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><ListChecks className="w-4 h-4 mr-2 text-blue-400"/>Total Tarefas Ativas</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-2xl font-bold text-white">{stats.totalTasksAtivas}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><TrendingUp className="w-4 h-4 mr-2 text-green-400"/>Taxa Conclusão (Sem.)</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-2xl font-bold text-green-400">{stats.weeklyCompletionRate}%</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Zap className="w-4 h-4 mr-2 text-yellow-400"/>Tarefas Criadas Hoje</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-2xl font-bold text-yellow-400">{stats.tasksCreatedToday}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><CalendarCheck2 className="w-4 h-4 mr-2 text-teal-400"/>Tempo Médio Conclusão</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-xl font-bold text-teal-400">{stats.avgCompletionTime || "N/A"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><MessageSquare className="w-4 h-4 mr-2 text-orange-400"/>Total Comentários</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-2xl font-bold text-orange-400">{stats.totalComments}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Tags className="w-4 h-4 mr-2 text-purple-400"/>Tags (Top {tagsChartData.length})</CardTitle></CardHeader>
          <CardContent className="pt-2"><div className="text-2xl font-bold text-purple-400">{stats.uniqueTags}</div></CardContent>
        </Card>
      </div>

      {/* Card de Filtro Global REMOVIDO daqui */}

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6"> {/* Ajustado para mb-6 */}
          <TabsTrigger value="status"><PieChartIcon className="w-4 h-4 mr-2" /> Estado Atual</TabsTrigger>
          <TabsTrigger value="activityConcluidas"><BarChart3 className="w-4 h-4 mr-2" /> Concluídas</TabsTrigger>
          <TabsTrigger value="activityCriadas"><Zap className="w-4 h-4 mr-2" /> Criadas</TabsTrigger>
          <TabsTrigger value="tags"><Tags className="w-4 h-4 mr-2" /> Top Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
            <Card>
            <CardHeader><CardTitle>Distribuição por Estado</CardTitle><CardDescription>Visão geral do estado atual das suas tarefas.</CardDescription></CardHeader>
            <CardContent className="pt-0 flex justify-center"> {/* pt-0 para alinhar com outros CardContent */}
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

        <TabsContent value="activityConcluidas">
          <Card>
            <CardHeader>
                <CardTitle>Tarefas Concluídas no Período</CardTitle>
                <CardDescription>Número de tarefas finalizadas por dia no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                    <label htmlFor="startDateConcluidas" className="block text-xs font-medium text-gray-400 mb-1">Período:</label>
                    <div className="flex items-center gap-2">
                        <input id="startDateConcluidas" type="date" value={startDateConcluidas} onChange={e => setStartDateConcluidas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full focus:ring-sky-500 focus:border-sky-500"/>
                        <span className="text-gray-400">até</span>
                        <input id="endDateConcluidas" type="date" value={endDateConcluidas} onChange={e => setEndDateConcluidas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                </div>
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
        
        <TabsContent value="activityCriadas">
          <Card>
            <CardHeader>
                <CardTitle>Tarefas Criadas no Período</CardTitle>
                <CardDescription>Número de tarefas iniciadas por dia no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                    <label htmlFor="startDateCriadas" className="block text-xs font-medium text-gray-400 mb-1">Período:</label>
                    <div className="flex items-center gap-2">
                        <input id="startDateCriadas" type="date" value={startDateCriadas} onChange={e => setStartDateCriadas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full focus:ring-sky-500 focus:border-sky-500"/>
                        <span className="text-gray-400">até</span>
                        <input id="endDateCriadas" type="date" value={endDateCriadas} onChange={e => setEndDateCriadas(e.target.value)} className="bg-gray-700 border-gray-600 text-gray-200 rounded p-2 text-sm w-full focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                </div>
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
                  <p>Os dados para este gráfico (tarefas criadas por período) não puderam ser carregados.</p>
                  <p className="text-xs mt-2">Verifique se a API para tarefas criadas por período está configurada e respondendo corretamente.</p>
                  <p className="text-xs mt-1">(Ex: <code>/tarefas/criadasPorPeriodo?userId=...&de=...&ate=...</code> retornando <code>{"{YYYY-MM-DD: count}"}</code>)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
            <Card>
            <CardHeader><CardTitle>Top 10 Tags Mais Usadas</CardTitle><CardDescription>As tags mais frequentes nas suas tarefas.</CardDescription></CardHeader>
            <CardContent className="pt-0">
              <div className="h-[400px] sm:h-[450px] w-full mb-6">
                <ChartContainer>
                  <BarChart data={tagsChartData} layout="vertical" 
                    margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 30, left: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 70, bottom: 20 }}
                    barCategoryGap="20%" // Espaçamento entre barras
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#9ca3af" fontSize="10px" allowDecimals={false} />
                    <YAxis dataKey="tag" type="category" stroke="#9ca3af" fontSize="10px" width={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80} />
                    <Tooltip content={<CustomChartTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                    <Bar dataKey="count" name="Nº de Tarefas" radius={[0, 4, 4, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 18}>
                      {tagsChartData.map((entry, index) => {
                          let fillColor = BAR_CHART_TAG_COLORS_DEFAULT[ (index - PODIUM_COLORS.length + BAR_CHART_TAG_COLORS_DEFAULT.length) % BAR_CHART_TAG_COLORS_DEFAULT.length];
                          if (entry.rank <= PODIUM_COLORS.length) { // Usar entry.rank que vem do processamento
                            fillColor = PODIUM_COLORS[entry.rank - 1];
                          }
                          return <Cell key={`cell-tag-${index}`} fill={fillColor} />;
                        })}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col items-center gap-2"> {/* Mudado para flex-col e items-center */}
                {tagsChartData.map((tagData) => (
                  <Badge 
                    key={tagData.tag} 
                    className="w-full max-w-xs text-center" // Para melhor alinhamento
                    style={{ 
                        borderLeftColor: tagData.rank <= PODIUM_COLORS.length ? PODIUM_COLORS[tagData.rank -1] : BAR_CHART_TAG_COLORS_DEFAULT[(tagData.rank - 1 - PODIUM_COLORS.length + BAR_CHART_TAG_COLORS_DEFAULT.length) % BAR_CHART_TAG_COLORS_DEFAULT.length], 
                        borderLeftWidth: 3,
                    }}
                  >
                    {tagData.rank}. {tagData.tag} ({tagData.count})
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
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    console.warn("formatDataParaAPI recebeu data inválida:", data, "Usando data atual como fallback.");
    const hoje = new Date();
    return `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
  }
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
  if (days === 0 && hours === 0 && minutes === 0 && seconds > 0 && parts.length < 2) parts.push(`${seconds}s`);
  if (parts.length === 0) return ms < 1000 && ms > 0 ? `< 1s` : (ms > 0 ? `< 1m` : "N/A");
  return parts.join(' ');
};
// --- Fim Funções Auxiliares ---

// --- Componente Principal App ---
const App = () => {
  const [generalStats, setGeneralStats] = useState<StatisticsProps['generalStats']>(null);
  const [statusChartData, setStatusChartData] = useState<StatisticsProps['statusChartData']>([]);
  const [activityConcluidasChartData, setActivityConcluidasChartData] = useState<StatisticsProps['activityChartData']>([]);
  const [activityCriadasChartData, setActivityCriadasChartData] = useState<StatisticsProps['activityCriadasChartData'] | null>(null);
  const [tagsChartData, setTagsChartData] = useState<StatisticsProps['tagsChartData']>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const hojeDate = new Date();
  const seteDiasAtrasDate = new Date();
  seteDiasAtrasDate.setDate(hojeDate.getDate() - 6);

  const [startDateConcluidas, setStartDateConcluidas] = useState(formatDataParaAPI(seteDiasAtrasDate));
  const [endDateConcluidas, setEndDateConcluidas] = useState(formatDataParaAPI(hojeDate));
  const [startDateCriadas, setStartDateCriadas] = useState(formatDataParaAPI(seteDiasAtrasDate));
  const [endDateCriadas, setEndDateCriadas] = useState(formatDataParaAPI(hojeDate));

  useEffect(() => {
    let emailToUse: string | null = userEmail;

    if (!emailToUse) {
      const defaultMockUser = { email: "geisbelly19@gmail.com" };
      try {
        const storedUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUserString) {
          const storedUser = JSON.parse(storedUserString);
          emailToUse = storedUser.email;
        } else if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(defaultMockUser));
          emailToUse = defaultMockUser.email;
        } else {
          emailToUse = defaultMockUser.email;
        }
      } catch (e) { emailToUse = defaultMockUser.email; }
      setUserEmail(emailToUse);
    }
    
    if (!emailToUse) {
      setInitializationError("Email do utilizador não pôde ser determinado.");
      setIsLoading(false); return;
    }
    
    // Validação das datas antes de fazer o fetch
    const dStartConcluidas = new Date(startDateConcluidas + "T00:00:00Z"); // Adiciona Z para UTC
    const dEndConcluidas = new Date(endDateConcluidas + "T00:00:00Z");
    const dStartCriadas = new Date(startDateCriadas + "T00:00:00Z");
    const dEndCriadas = new Date(endDateCriadas + "T00:00:00Z");

    let datesAreValid = true;
    let dateErrorMessage = "";

    if (isNaN(dStartConcluidas.getTime()) || isNaN(dEndConcluidas.getTime()) || isNaN(dStartCriadas.getTime()) || isNaN(dEndCriadas.getTime())) {
        datesAreValid = false;
        dateErrorMessage = "Uma ou more datas do filtro são inválidas.";
    } else if (dStartConcluidas > dEndConcluidas) {
        datesAreValid = false;
        dateErrorMessage = "Filtro 'Concluídas': data de início após data de fim.";
    } else if (dStartCriadas > dEndCriadas) {
        datesAreValid = false;
        dateErrorMessage = "Filtro 'Criadas': data de início após data de fim.";
    }

    if (!datesAreValid) {
        console.warn("[App useEffect] Datas de filtro inválidas ou intervalo incorreto. Fetch abortado.", dateErrorMessage);
        setInitializationError(dateErrorMessage);
        setIsLoading(false);
        // Limpar os dados dos gráficos que dependem dessas datas
        setActivityConcluidasChartData([]);
        setActivityCriadasChartData(null);
        // Não limpar stats gerais, status e tags, pois não dependem diretamente dessas datas
        return;
    }
    
    console.log("[App useEffect] Disparado com Email:", emailToUse, "Concluídas:", startDateConcluidas, "-", endDateConcluidas, "Criadas:", startDateCriadas, "-", endDateCriadas);

    const fetchAllDashboardData = async (email: string, deConcluidas: string, ateConcluidas: string, deCriadas: string, ateCriadas: string) => {
      setIsLoading(true);
      setInitializationError(null);
      const baseUrl = "https://tarefas-banco-estruturado.onrender.com/tarefas";

      const productivityUrl = `${baseUrl}/produtividade?userId=${email}`;
      const statusUrl = `${baseUrl}/status?userId=${email}`;
      const tagsUrl = `${baseUrl}/tags?userId=${email}`;
      const concluidasNoPeriodoUrl = `${baseUrl}/concluidas?userId=${email}&de=${deConcluidas}&ate=${ateConcluidas}`;
      const criadasNoPeriodoUrl = `${baseUrl}/criadasPorPeriodo?userId=${email}&de=${deCriadas}&ate=${ateCriadas}`;

      try {
        const [
            productivityRes, statusRes, tagsRes, concluidasNoPeriodoRes
        ] = await Promise.all([
          fetch(productivityUrl), fetch(statusUrl), fetch(tagsUrl), fetch(concluidasNoPeriodoUrl)
        ]);

        if (!productivityRes.ok) throw new Error(`API Produtividade (${productivityRes.status}): ${await productivityRes.text()}`);
        if (!statusRes.ok) throw new Error(`API Status (${statusRes.status}): ${await statusRes.text()}`);
        if (!tagsRes.ok) throw new Error(`API Tags (${tagsRes.status}): ${await tagsRes.text()}`);
        if (!concluidasNoPeriodoRes.ok) throw new Error(`API Concluídas (${concluidasNoPeriodoRes.status}): ${await concluidasNoPeriodoRes.text()}`);
        
        const productivityApiData: ApiProductivityData = await productivityRes.json();
        const statusApiData: ApiStatusData = await statusRes.json();
        const tagsApiData: ApiTagData[] = await tagsRes.json();
        const concluidasPorDiaApiData: ApiConcluidasPorDia = await concluidasNoPeriodoRes.json();

        const pending = statusApiData.pendente ?? 0;
        const inProgress = statusApiData["em andamento"] ?? 0;
        const completed = statusApiData.concluida ?? 0;
        setStatusChartData([
          { name: "Pendentes", value: pending, fill: "#eab308" },
          { name: "Em Andamento", value: inProgress, fill: "#3b82f6" },
          { name: "Concluídas", value: completed, fill: "#22c55e" }
        ]);

        const processedTags = (tagsApiData || [])
            .map((item, index) => ({ 
                tag: String(item.value || "N/A"),
                count: Number(item.score || 0),
                rank: index + 1
            }))
            .filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 10);
        setTagsChartData(processedTags);
        
        // Gráfico de Concluídas
        let diasConcluidasParaGrafico: Date[] = [];
        let currentConcluidaDate = new Date(dStartConcluidas); // Usa o objeto Date validado
        while(currentConcluidaDate <= dEndConcluidas){
            diasConcluidasParaGrafico.push(new Date(currentConcluidaDate)); // Cria nova instância para o array
            currentConcluidaDate.setUTCDate(currentConcluidaDate.getUTCDate() + 1);
        }
        
        const processedActivityConcluidas = diasConcluidasParaGrafico.map(dataDia => {
            const diaLabel = dataDia.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
            const dataFormatadaChave = formatDataParaAPI(dataDia);
            const contagem = concluidasPorDiaApiData[dataFormatadaChave] ?? 0;
            return { dia: diaLabel, tarefasConcluidas: Number(contagem) };
        });
        setActivityConcluidasChartData(processedActivityConcluidas);

        // API de Tarefas Criadas
        try {
            const criadasResponse = await fetch(criadasNoPeriodoUrl);
            if (criadasResponse.ok) {
                const criadasPorDiaApiData: ApiCriadasPorDia = await criadasResponse.json();
                const diasCriadasParaGraficoList: Date[] = [];
                let currentCriadaDate = new Date(dStartCriadas); // Usa o objeto Date validado
                 while(currentCriadaDate <= dEndCriadas){
                    diasCriadasParaGraficoList.push(new Date(currentCriadaDate));
                    currentCriadaDate.setUTCDate(currentCriadaDate.getUTCDate() + 1);
                }
                const processedActivityCriadas = diasCriadasParaGraficoList.map(dataDia => {
                    const diaLabel = dataDia.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
                    const dataFormatadaChave = formatDataParaAPI(dataDia);
                    const contagem = criadasPorDiaApiData[dataFormatadaChave] ?? 0;
                    return { dia: diaLabel, tarefasCriadas: Number(contagem) };
                });
                setActivityCriadasChartData(processedActivityCriadas);
            } else {
                const errorText = await criadasResponse.text();
                console.warn(`[fetchAllDashboardData] API Tarefas Criadas (${criadasResponse.status}): ${errorText}. Gráfico não será populado.`);
                setActivityCriadasChartData(null);
            }
        } catch (errorCriadas) {
            console.error("[fetchAllDashboardData] Erro API tarefas criadas:", errorCriadas);
            setActivityCriadasChartData(null);
        }

        const totalTasksAtivas = pending + inProgress;
        const hojeFormatado = formatDataParaAPI(new Date());
        const chaveTarefasCriadasHoje = `tarefas_criadas_${hojeFormatado}`;
        const tarefasCriadasHojeValor = productivityApiData[chaveTarefasCriadasHoje];
        let tasksCreatedTodayNum = 0;
        if (typeof tarefasCriadasHojeValor === 'string') tasksCreatedTodayNum = parseInt(tarefasCriadasHojeValor, 10);
        else if (typeof tarefasCriadasHojeValor === 'number') tasksCreatedTodayNum = tarefasCriadasHojeValor;
        if (isNaN(tasksCreatedTodayNum)) tasksCreatedTodayNum = 0;
        
        if (productivityApiData.taxaConclusaoSemanal === undefined) {
            console.warn("[fetchAllDashboardData] API Produtividade não retornou 'taxaConclusaoSemanal'. Usando 0%.");
        }

        const finalGeneralStats = {
          totalTasksAtivas: totalTasksAtivas,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed,
          totalComments: 0,
          uniqueTags: processedTags.length,
          avgCompletionTime: formatMillisecondsToReadable(productivityApiData.tempo_medio_conclusao_ms),
          tasksCreatedToday: tasksCreatedTodayNum,
          weeklyCompletionRate: productivityApiData.taxaConclusaoSemanal ?? 0,
        };
        setGeneralStats(finalGeneralStats);

      } catch (error) {
        console.error("[fetchAllDashboardData] ERRO GERAL:", error);
        setInitializationError((error as Error).message || "Erro desconhecido.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllDashboardData(emailToUse, startDateConcluidas, endDateConcluidas, startDateCriadas, endDateCriadas);

  }, [userEmail, startDateConcluidas, endDateConcluidas, startDateCriadas, endDateCriadas]);

  // Telas de Loading e Erro permanecem as mesmas
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">Carregando dados...</h2>
            {userEmail && <p className="text-sm text-gray-500 mt-2">Utilizador: <code className="bg-gray-700 p-1 rounded text-gray-300">{userEmail}</code></p>}
        </div>
    );
  }
  if (initializationError) {
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
        />
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        Dashboard de Produtividade &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;