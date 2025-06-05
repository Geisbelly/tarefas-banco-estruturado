import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ListChecks, MessageSquare, Tags, CheckCircle, Clock, Zap, CalendarCheck2, TrendingUp, Info } from 'lucide-react';

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

// --- Tipos ---
interface Task {
  id: string;
  nome: string;
  dataCriacao: string;
  dataConclusao?: string | null; // ESSENCIAL para o gráfico de concluídas
  tags?: string[];
  comentarios?: any[];
  // Adicione quaisquer outros campos que sua Task possa ter
}

interface ApiProductivityData {
  totalTarefasGeral?: number;
  totalComentarios?: number;
  totalTagsUnicas?: number;
  tempoMedioConclusao?: string;
  tarefasCriadasHoje?: number;
  taxaConclusaoSemanal?: number;
}

interface ApiStatusData {
  pendente?: number;
  "em_andamento"?: number;
  "em andamento"?: number;
  concluida?: number;
}

interface ApiTagData {
  tag: string;
  count: number;
}
// --- Fim Tipos ---

// --- Componente Statistics (definição permanece a mesma) ---
interface StatisticsProps {
  userIdentifier: string | null;
  generalStats: {
    totalTasks: number;
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
  activityChartData: { dia: string; tarefasConcluidas: number }[];
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

  if (!generalStats && statusChartData.length === 0 && tagsChartData.length === 0 && activityChartData.length === 0 && !userIdentifier) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">Carregando dados...</h2>
            <p className="text-gray-400">Por favor, aguarde.</p>
        </div>
    );
  }

  if (!generalStats || (generalStats.totalTasks === 0 && generalStats.tasksCreatedToday === 0 && generalStats.pendingTasks === 0 && generalStats.inProgressTasks === 0 && generalStats.completedTasks === 0)) {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><ListChecks className="w-4 h-4 mr-2 text-blue-400"/>Total Tarefas Ativas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{stats.totalTasks}</div></CardContent>
        </Card>
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
          <CardHeader className="pb-2"><CardTitle className="flex items-center text-gray-300 text-sm font-medium"><Tags className="w-4 h-4 mr-2 text-purple-400"/>Tags Únicas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-400">{stats.uniqueTags}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
          <TabsTrigger value="status"><PieChartIcon className="w-4 h-4 mr-2" /> Estado Atual</TabsTrigger>
          <TabsTrigger value="activity"><BarChart3 className="w-4 h-4 mr-2" /> Concluídas (7d)</TabsTrigger>
          <TabsTrigger value="tags"><Tags className="w-4 h-4 mr-2" /> Top Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-0">
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

        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Tarefas Concluídas nos Últimos 7 Dias</CardTitle><CardDescription>Número de tarefas finalizadas por dia.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-72 sm:h-80 w-full">
                <ChartContainer>
                  <BarChart data={activityChartData} margin={{ top: 5, right: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 20, left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -10, bottom: 5 }}>
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

        <TabsContent value="tags" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Top 5 Tags Mais Usadas</CardTitle><CardDescription>As tags mais frequentes nas suas tarefas.</CardDescription></CardHeader>
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

// --- Componente Principal App ---
const App = () => {
  const [generalStats, setGeneralStats] = useState<StatisticsProps['generalStats']>(null);
  const [statusChartData, setStatusChartData] = useState<StatisticsProps['statusChartData']>([]);
  const [activityChartData, setActivityChartData] = useState<StatisticsProps['activityChartData']>([]);
  const [tagsChartData, setTagsChartData] = useState<StatisticsProps['tagsChartData']>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[App useEffect] Iniciando efeito...");
    let emailForApi: string | null = null;
    const defaultMockUser = { email: "geisbelly19@gmail.com" }; // Use seu email mock aqui

    try {
      const storedUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        emailForApi = storedUser.email;
        console.log("[App useEffect] Email encontrado no localStorage:", emailForApi);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(defaultMockUser));
        emailForApi = defaultMockUser.email;
        console.log("[App useEffect] Email não encontrado, usando mock e salvando no localStorage:", emailForApi);
      } else {
        emailForApi = defaultMockUser.email;
        console.log("[App useEffect] localStorage não disponível, usando email mock:", emailForApi);
      }
    } catch (e) {
      console.warn("[App useEffect] Falha ao obter/analisar 'user' do localStorage. Usando mock.", e);
      if (typeof window !== 'undefined' && !localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(defaultMockUser));
      }
      emailForApi = defaultMockUser.email;
    }

    if (!emailForApi) {
      console.error("[App useEffect] Email do utilizador final é NULO ou INDEFINIDO. Não é possível carregar dados.");
      setInitializationError("Email do utilizador não pôde ser determinado.");
      setIsLoading(false);
      return;
    }
    setUserEmail(emailForApi);
    console.log("[App useEffect] Email para API definido:", emailForApi);

    const fetchAllDashboardData = async (email: string) => {
      setIsLoading(true);
      setInitializationError(null);
      console.log(`[fetchAllDashboardData] Iniciando busca de dados para: ${email}`);
      const baseUrl = "https://tarefas-banco-estruturado.onrender.com/tarefas";

      const productivityUrl = `${baseUrl}/produtividade?userId=${email}`;
      const statusUrl = `${baseUrl}/status?userId=${email}`;
      const tagsUrl = `${baseUrl}/tags?userId=${email}`;

      const hoje = new Date();
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);

      const formatDataParaAPI = (data: Date): string => {
        const ano = data.getFullYear();
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const dia = data.getDate().toString().padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      };

      const dataFimParaAPI = formatDataParaAPI(hoje);
      const dataInicioParaAPI = formatDataParaAPI(seteDiasAtras);
      const concluidasNoPeriodoUrl = `${baseUrl}/concluidas?userId=${email}&de=${dataInicioParaAPI}&ate=${dataFimParaAPI}`;

      console.log("[fetchAllDashboardData] URLs a serem chamadas:");
      console.log("  Produtividade:", productivityUrl);
      console.log("  Status:", statusUrl);
      console.log("  Tags:", tagsUrl);
      console.log("  Concluídas no Período (gráfico):", concluidasNoPeriodoUrl);

      try {
        const responses = await Promise.all([
          fetch(productivityUrl),
          fetch(statusUrl),
          fetch(tagsUrl),
          fetch(concluidasNoPeriodoUrl)
        ]);

        console.log("[fetchAllDashboardData] Respostas brutas recebidas:", responses);
        const [productivityRes, statusRes, tagsRes, concluidasNoPeriodoRes] = responses;

        if (!productivityRes.ok) throw new Error(`Erro API Produtividade (${productivityRes.status}): ${await productivityRes.text() || productivityRes.statusText}`);
        if (!statusRes.ok) throw new Error(`Erro API Status (${statusRes.status}): ${await statusRes.text() || statusRes.statusText}`);
        if (!tagsRes.ok) throw new Error(`Erro API Tags (${tagsRes.status}): ${await tagsRes.text() || tagsRes.statusText}`);
        if (!concluidasNoPeriodoRes.ok) throw new Error(`Erro API Concluídas no Período (${concluidasNoPeriodoRes.status}): ${await concluidasNoPeriodoRes.text() || concluidasNoPeriodoRes.statusText}`);

        console.log("[fetchAllDashboardData] Todas as respostas OK. Convertendo para JSON...");

        const productivityData: ApiProductivityData = await productivityRes.json();
        const statusApiData: ApiStatusData = await statusRes.json();
        const tagsApiData: ApiTagData[] = await tagsRes.json();
        // --- INÍCIO DA CORREÇÃO PARA TAREFAS CONCLUÍDAS ---
        const respostaApiConcluidas = await concluidasNoPeriodoRes.json();
        console.log("[fetchAllDashboardData] Tarefas Concluídas no Período (bruto da API):", JSON.stringify(respostaApiConcluidas));

        let tarefasConcluidasNoPeriodo: Task[] = []; // Inicializa como array vazio

        if (Array.isArray(respostaApiConcluidas)) {
            tarefasConcluidasNoPeriodo = respostaApiConcluidas;
            console.log("[fetchAllDashboardData] API /concluidas retornou um ARRAY diretamente.");
        } else if (respostaApiConcluidas && typeof respostaApiConcluidas === 'object') {
            // Tente encontrar o array dentro de chaves comuns
            if (Array.isArray(respostaApiConcluidas.data)) {
                tarefasConcluidasNoPeriodo = respostaApiConcluidas.data;
                console.log("[fetchAllDashboardData] API /concluidas: array encontrado em '.data'");
            } else if (Array.isArray(respostaApiConcluidas.tasks)) {
                tarefasConcluidasNoPeriodo = respostaApiConcluidas.tasks;
                console.log("[fetchAllDashboardData] API /concluidas: array encontrado em '.tasks'");
            } else if (Array.isArray(respostaApiConcluidas.tarefas)) {
                tarefasConcluidasNoPeriodo = respostaApiConcluidas.tarefas;
                console.log("[fetchAllDashboardData] API /concluidas: array encontrado em '.tarefas'");
            }
            // **ADICIONE MAIS 'else if' AQUI SE A SUA API USA OUTRA CHAVE PARA O ARRAY DE TAREFAS**
            // else if (Array.isArray(respostaApiConcluidas.sua_chave_customizada)) {
            //     tarefasConcluidasNoPeriodo = respostaApiConcluidas.sua_chave_customizada;
            //     console.log("[fetchAllDashboardData] API /concluidas: array encontrado em '.sua_chave_customizada'");
            // }
             else {
                console.warn("[fetchAllDashboardData] A resposta da API /concluidas é um OBJETO, mas não foi possível encontrar um array aninhado (data, tasks, tarefas). Verifique a estrutura da resposta. Usando array vazio.");
            }
        } else {
             console.warn("[fetchAllDashboardData] A resposta da API /concluidas NÃO é um array nem um objeto reconhecível. Verifique a API. Usando array vazio.");
        }
        // --- FIM DA CORREÇÃO PARA TAREFAS CONCLUÍDAS ---

        console.log("[fetchAllDashboardData] Dados JSON (outros):");
        console.log("  Produtividade (bruto):", JSON.stringify(productivityData));
        console.log("  Status (bruto):", JSON.stringify(statusApiData));
        console.log("  Tags (bruto):", JSON.stringify(tagsApiData));
        console.log("[fetchAllDashboardData] Lista de tarefas efetivamente usada para o gráfico de concluídas:", JSON.stringify(tarefasConcluidasNoPeriodo));


        const pending = statusApiData.pendente ?? 0;
        const inProgress = statusApiData["em_andamento"] ?? statusApiData["em andamento"] ?? 0;
        const completed = statusApiData.concluida ?? 0;
        console.log(`[fetchAllDashboardData] Status Processado: P: ${pending}, IP: ${inProgress}, C: ${completed}`);
        setStatusChartData([
          { name: "Pendentes", value: pending, fill: "#eab308" },
          { name: "Em Andamento", value: inProgress, fill: "#3b82f6" },
          { name: "Concluídas", value: completed, fill: "#22c55e" }
        ]);

        const processedTags = (tagsApiData || [])
            .map(item => ({ tag: String(item.tag || "N/A"), count: Number(item.count || 0) }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setTagsChartData(processedTags);
        console.log("[fetchAllDashboardData] Tags Processadas (Top 5):", JSON.stringify(processedTags));

        const activityMap = new Map<string, number>();
        const diasParaGrafico = Array.from({ length: 7 }, (_, i) => {
            const data = new Date();
            data.setDate(hoje.getDate() - i);
            return data;
        }).reverse();

        const diasFormatadosLabels = diasParaGrafico.map(d => d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));
        diasFormatadosLabels.forEach(label => activityMap.set(label, 0));

        // Agora usando a variável `tarefasConcluidasNoPeriodo` que foi corrigida
        (tarefasConcluidasNoPeriodo || []).forEach(task => {
          if (task.dataConclusao) {
            try {
              const dataConclusaoTask = new Date(task.dataConclusao);
              const diaLabel = dataConclusaoTask.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              if (activityMap.has(diaLabel)) {
                activityMap.set(diaLabel, (activityMap.get(diaLabel) || 0) + 1);
              }
            } catch (e) {
              console.warn(`[fetchAllDashboardData] Data de conclusão inválida para tarefa ID ${task.id}: ${task.dataConclusao}`, e);
            }
          } else {
            // Opcional: Logar tarefas sem data de conclusão, se esperado que tenham
            // console.warn(`[fetchAllDashboardData] Tarefa concluída ID ${task.id} sem dataConclusao.`);
          }
        });
        const processedActivity = diasFormatadosLabels.map(diaLabel => ({
          dia: diaLabel,
          tarefasConcluidas: activityMap.get(diaLabel) || 0
        }));
        setActivityChartData(processedActivity);
        console.log("[fetchAllDashboardData] Atividade (Concluídas por Dia) Processada:", JSON.stringify(processedActivity));

        const totalTasks = productivityData.totalTarefasGeral ?? (pending + inProgress + completed);
        console.log(`[fetchAllDashboardData] Total Tarefas Calculado: ${totalTasks}`);
        const finalGeneralStats = {
          totalTasks: totalTasks,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed,
          totalComments: productivityData.totalComentarios ?? 0,
          uniqueTags: productivityData.totalTagsUnicas ?? tagsApiData?.length ?? 0,
          avgCompletionTime: productivityData.tempoMedioConclusao ?? "N/A",
          tasksCreatedToday: productivityData.tarefasCriadasHoje ?? 0,
          weeklyCompletionRate: productivityData.taxaConclusaoSemanal ?? 0,
        };
        setGeneralStats(finalGeneralStats);
        console.log("[fetchAllDashboardData] Estatísticas Gerais Finais:", JSON.stringify(finalGeneralStats));

      } catch (error) {
        console.error("[fetchAllDashboardData] ERRO DURANTE FETCH OU PROCESSAMENTO:", error);
        setInitializationError((error as Error).message || "Erro desconhecido ao buscar ou processar dados.");
      } finally {
        console.log("[fetchAllDashboardData] Bloco FINALLY. Definindo isLoading para false.");
        setIsLoading(false);
      }
    };

    fetchAllDashboardData(emailForApi);

  }, []);

  console.log(`[App Render] isLoading: ${isLoading}, initializationError: ${initializationError}`);

  if (isLoading) {
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