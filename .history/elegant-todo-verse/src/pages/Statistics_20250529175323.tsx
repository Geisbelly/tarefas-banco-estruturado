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

  useEffect(() => {
    async function fetchTasks() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await getTask(user.email);
      const initialTasks: Task[] = res.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
      setTasks(initialTasks);
    }
    fetchTasks();
  }, []);

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
      task.tags.forEach(tag => {
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
    return last7Days.map(day => {
      const dayFormatted = day.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
      const tasksCreated = tasks.filter(task => new Date(task.dataCriacao) >= dayStart && new Date(task.dataCriacao) <= dayEnd).length;
      return { day: dayFormatted, tarefas: tasksCreated };
    });
  };

  const getGeneralStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === "pendente").length;
    const inProgressTasks = tasks.filter(task => task.status === "em andamento").length;
    const completedTasks = tasks.filter(task => task.status === "concluida").length;
    const totalComments = tasks.reduce((sum, task) => sum + task.comentarios.length, 0);
    const uniqueTags = new Set(tasks.flatMap(task => task.tags)).size;
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
      {/* Dashboard content */}
    </div>
  );
};

export default Statistics;
