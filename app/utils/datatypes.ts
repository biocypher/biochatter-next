import { Mask } from "../store/mask";

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

export interface WelcomeConfiguration {
  Title: string;
  Disclaimer: string;
  About: Record<string, any>;
  What?: string;
  WhatMessages?: Array<string>;
  How?: string;
  HowMessages?: Array<string>;
}

export interface TextConfiguration {
  Welcome?: WelcomeConfiguration;
  Masks?: Array<Mask>;
}

export interface ProductionInfo {
  KnowledgeGraph?: DbConfiguration;
  VectorStore?: DbConfiguration;
  Text?: TextConfiguration;
}
