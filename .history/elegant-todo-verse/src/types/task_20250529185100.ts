
export interface Comment {
  _id: string;
  autor: string;
  texto: string;
  dataComentario: Date;
}

export interface Task {
  _id: string;
  titulo: string;
  descricao: string;
  dataCriacao: Date;
  data
  status: "pendente" | "em andamento" | "concluida";
  criador: string;
  colaboradores: string[];
  tags: string[];
  comentarios: Comment[];
}

export interface TaskFilters {
  status: string;
  criador: string;
  colaboradores: string[];
  tags: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
}

export interface Usuario{
  email: string;
  nome: string;
  usuario: string;
}
