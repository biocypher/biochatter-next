import { DbConnectionArgs, DbServerSettings } from "./datatypes";

export const getConnectionArgsToDisplay = (
  connectionArgs: DbConnectionArgs, 
  kgServers: Array<DbServerSettings>
): DbConnectionArgs => {
  for (const server of kgServers) {
    if (server.server === connectionArgs.host) {
      return {
        host: server.server,
        port: server.port ?? "7687",
      }
    }
    if (server.address === connectionArgs.host 
      && (server.port === connectionArgs.port || (server.port === undefined && connectionArgs.port === "7687")) ) {
      return {
        host: server.server,
        port: server.port ?? "7687",
      }
    }
  }

  return connectionArgs;
};

export const getConnectionArgsToConnect = (
  connectionArgs: DbConnectionArgs, 
  kgServers: Array<DbServerSettings>
): DbConnectionArgs => {
  for (const server of kgServers) {
    if (server.server === connectionArgs.host) {
      return {
        host: server.address,
        port: `${server.port ?? 7687}`,
      }
    }
    if (server.address === connectionArgs.host 
      && (server.port === connectionArgs.port || (server.port === undefined && connectionArgs.port === "7687")) ) {
      return {
        host: server.address,
        port: `${server.port ?? 7687}`,
      }
    }
  }

  return {
    ...connectionArgs,
    port: `${connectionArgs.port ?? 7687}`
  }
};