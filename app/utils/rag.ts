import { DbConnectionArgs, DbServerSettings } from "./datatypes";

const getConnectionArgsToDisplay = (
  connectionArgs: DbConnectionArgs, 
  kgServers: Array<DbServerSettings>,
  defaultPort: string,
): DbConnectionArgs => {
  for (const server of kgServers) {
    if (server.server === connectionArgs.host) {
      return {
        host: server.server,
        port: server.port ?? defaultPort,
      }
    }
    if (server.address === connectionArgs.host 
      && (server.port === connectionArgs.port 
        || (server.port === undefined 
          && connectionArgs.port === "7687")) ) {
      return {
        host: server.server,
        port: server.port ?? defaultPort,
      }
    }
  }

  return connectionArgs;
};

export const getKGConnectionArgsToDisplay = (
  connectionArgs: DbConnectionArgs,
  kgServers: Array<DbServerSettings>,
): DbConnectionArgs => {
  return getConnectionArgsToDisplay(connectionArgs, kgServers, "7687");
}
export const getVectorStoreConnectionArgsToDisplay = (
  connectionArgs: DbConnectionArgs,
  vsServers: Array<DbServerSettings>,
): DbConnectionArgs => {
  return getConnectionArgsToDisplay(connectionArgs, vsServers, "19530");
}

const getConnectionArgsToConnect = (
  connectionArgs: DbConnectionArgs, 
  kgServers: Array<DbServerSettings>,
  defaultPort: string,
): DbConnectionArgs => {
  for (const server of kgServers) {
    if (server.server === connectionArgs.host) {
      return {
        host: server.address,
        port: `${server.port??defaultPort}`,
      }
    }
    if (server.address === connectionArgs.host 
      && (server.port === connectionArgs.port 
        || (server.port === undefined 
          && connectionArgs.port === defaultPort)) ) {
      return {
        host: server.address,
        port: `${server.port??defaultPort}`,
      }
    }
  }

  return {
    ...connectionArgs,
  }
};

export const getKGConnectionArgsToConnect = (
  connectionArgs: DbConnectionArgs,
  kgServers: Array<DbServerSettings>
): DbConnectionArgs => {
  return getConnectionArgsToConnect(connectionArgs, kgServers, "7687");
}
export const getVectorStoreConnectionArgsToConnect = (
  connectionArgs: DbConnectionArgs,
  vsServers: Array<DbServerSettings>
): DbConnectionArgs => {
  return getConnectionArgsToConnect(connectionArgs, vsServers, "19530");
}

export const getServerDescription = (
  connectionArgs: DbConnectionArgs,
  servers: Array<DbServerSettings>,
  defaultPort: string,
): string | undefined => {
  for (const server of servers) {
    if (server.server === connectionArgs.host) {
      return server.description
    }
    if (server.address === connectionArgs.host
      && server.port === connectionArgs.port) {
      return server.description
    }
  }
  return undefined;
}