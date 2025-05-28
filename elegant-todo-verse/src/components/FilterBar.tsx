
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar } from "lucide-react";
import { TaskFilters } from "@/types/task";

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      tags: "",
      titulo: "",
      dataInicio: "",
      dataFim: ""
    });
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
          <Button 
            onClick={clearFilters}
            variant="ghost" 
            size="sm"
            className="ml-auto text-gray-400 hover:text-white"
          >
            Limpar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por título"
              value={filters.titulo}
              onChange={(e) => handleFilterChange('titulo', e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white pl-10"
            />
          </div>

          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-gray-800/50 border border-gray-600 text-white px-3 py-2 rounded-md"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>

          <Input
            placeholder="Filtrar por tags"
            value={filters.tags}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
          />

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              placeholder="Data início"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white pl-10"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              placeholder="Data fim"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
