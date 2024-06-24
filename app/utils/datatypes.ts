
export interface DbConnectionArgs {
  host: string;
  port: string;
  user?: string;
  password?: string
}

export interface DbServerSettings {
  server: string;
  address: string;
  port?: string;
  number_of_results?: number;
}

export interface DbConfiguration {
  enabled?: boolean;
  servers?: Array<DbServerSettings>;
}

export interface ProductionInfo {
  KnowledgeGraph?: DbConfiguration;
  VectorStore?: DbConfiguration;
}
