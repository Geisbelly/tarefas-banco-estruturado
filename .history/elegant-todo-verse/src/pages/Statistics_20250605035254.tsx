// Dentro do componente Statistics

// ... (outras props e constantes PIE_CHART_COLORS, etc.)
const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

// Condição de loading (linha 127 no seu erro)
if (!generalStats && statusChartData.length === 0 && tagsChartData.length === 0 && activityConcluidasChartData.length === 0 && !userIdentifier) {
  return ( // CORREÇÃO AQUI: JSX da tela de loading
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
          <Clock className="w-16 h-16 mb-4 text-blue-400 animate-spin" />
          <h2 className="text-2xl font-semibold mb-2">Carregando dados...</h2>
          <p className="text-gray-400">Por favor, aguarde.</p>
      </div>
  );
}

// Condição de nenhum dado (linha 130 no seu erro)
if (!generalStats || (generalStats.totalTasksAtivas === 0 && generalStats.tasksCreatedToday === 0 && generalStats.completedTasks === 0 && generalStats.pendingTasks === 0 && generalStats.inProgressTasks === 0 )) {
  return ( // CORREÇÃO AQUI: JSX da tela de nenhum dado
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <Info className="w-16 h-16 mb-4 text-gray-500" />
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">Nenhum dado de tarefa encontrado</h2>
          <p className="text-gray-400">Ainda não há estatísticas de tarefas para este utilizador.</p>
          {userIdentifier && <p className="text-sm text-gray-500 mt-4">Utilizador: <code className="bg-gray-700 p-1 rounded">{userIdentifier}</code></p>}
      </div>
  );
}

const stats = generalStats; // generalStats não será null aqui devido às verificações acima

// ... resto do componente Statistics ...