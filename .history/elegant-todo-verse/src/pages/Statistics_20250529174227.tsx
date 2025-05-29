
import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart as PieChartIcon, ListChecks } from "lucide-react";
import { getTask } from "@/services/tarefas";

const Statistics = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Efeito para carregar dados de tarefas (simulados)
  useEffect(() => {
    async function fetchTasks() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await getTask(user.email);
      const initialTasks: Task[] = res.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());

      setTasks(initialTasks);
    }

  // Dados para o gráfico por status
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

  // Dados para o gráfico de tags
  const getTagsChartData = () => {
    const tagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Pegar apenas as 5 tags mais frequentes
  };

  // Dados para o gráfico de atividade por dia
  const getActivityByDayData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();
    
    const dayData = last7Days.map(day => {
      const dayFormatted = day.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const tasksCreated = tasks.filter(task => 
        new Date(task.dataCriacao) >= dayStart && 
        new Date(task.dataCriacao) <= dayEnd
      ).length;
      
      return {
        day: dayFormatted,
        tarefas: tasksCreated
      };
    });
    
    return dayData;
  };

  // Dados para estatísticas gerais
  const getGeneralStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === "pendente").length;
    const inProgressTasks = tasks.filter(task => task.status === "em andamento").length;
    const completedTasks = tasks.filter(task => task.status === "concluida").length;
    
    const totalComments = tasks.reduce(
      (sum, task) => sum + task.comentarios.length, 0
    );
    
    const uniqueTags = new Set(
      tasks.flatMap(task => task.tags)
    ).size;
    
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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard Estatístico
        </h1>
        <p className="text-gray-300 text-lg">Visualize estatísticas e métricas sobre suas tarefas</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-sm font-medium">Total de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-sm font-medium">Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.totalComments}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-sm font-medium">Tags Únicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.uniqueTags}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-800/50 border-gray-700">
          <TabsTrigger value="status" className="data-[state=active]:bg-gray-700">
            <PieChartIcon className="w-4 h-4 mr-2" /> Status
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-gray-700">
            <BarChart3 className="w-4 h-4 mr-2" /> Atividade
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-gray-700">
            <ListChecks className="w-4 h-4 mr-2" /> Tags
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-0">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full max-w-xl">
                <ChartContainer 
                  config={{
                    pendente: { theme: { light: "#eab308", dark: "#eab308" } },
                    "em andamento": { theme: { light: "#3b82f6", dark: "#3b82f6" } },
                    concluida: { theme: { light: "#22c55e", dark: "#22c55e" } }
                  }}
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Atividade nos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer config={{}}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tarefas" name="Tarefas Criadas" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags" className="mt-0">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top 5 Tags Mais Usadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer config={{}}>
                  <BarChart data={tagsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="tag" type="category" stroke="#888" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" name="Número de Tarefas" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {tagsData.map((tagData, index) => (
                  <Badge 
                    key={tagData.tag} 
                    className="bg-gray-700/50 text-white border-gray-600"
                    style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: 3 }}
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

export default Statistics;
