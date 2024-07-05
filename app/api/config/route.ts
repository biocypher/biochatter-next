import { NextResponse } from "next/server";
import * as path from "path";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { getServerSideConfig } from "../../config/server";
import { DbConfiguration, DbServerSettings, ProductionInfo } from "@/app/utils/datatypes";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  productionInfo: "undefined",
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

const validate_db_configuration = (prodInfo: ProductionInfo, entry: string): ProductionInfo => {
  const server_names = {};
  const dbConfig = ((prodInfo as any)[entry]) as DbConfiguration;
  if (dbConfig === undefined) {
    return prodInfo;
  }
  dbConfig.enabled = dbConfig.enabled ?? true;
  dbConfig.servers = dbConfig.servers ?? [];
  let valid = true;
  const validated_dbs = dbConfig.servers.map((val: DbServerSettings) => {
    if (val.server.length === 0 || val.server in server_names) {
      valid = false;
      return val;
    }
    return {
      ...val,
      port: val.port ?? "7687",
    }
  });
  dbConfig.servers = validated_dbs;
  if (!valid) {
    console.error(`Invalid ${entry} configuration in yaml`);
  }
  return {...prodInfo, [entry]: valid ? dbConfig : undefined};
}

const validate_configuration = (config: ProductionInfo): ProductionInfo | undefined => {
  let validated_config = config;
  validated_config = validate_db_configuration(validated_config, "KnowledgeGraph");
  validated_config = validate_db_configuration(validated_config, "VectorStore");
  
  return validated_config;
}

async function handle() {
  try {
    const custom_file = process.env.CUSTOM_BIOCHATTER_NEXT_FILE;
    let custom_config = undefined;
    if (custom_file) {
      try {
        const yaml = load(readFileSync(custom_file, "utf-8"));
        custom_config = validate_configuration(yaml as ProductionInfo);
      } catch (err: any) {
        console.error(err);
      }
    }
    return NextResponse.json({
      ...DANGER_CONFIG,
      productionInfo: custom_config ? JSON.stringify(custom_config) : "undefined",
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(DANGER_CONFIG);
  }
}

export const GET = handle;
export const POST = handle;

