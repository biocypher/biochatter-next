import { Mask, createEmptyMask } from "../store/mask";
import { DbConfiguration, ProductionInfo } from "./datatypes";
import Locale  from "../locales";


export function getKnowledgeGraphInfo(prodInfo?: ProductionInfo): DbConfiguration {
  return (prodInfo?.KnowledgeGraph ?? {servers: [], enabled: true});
}

export function getVectorStoreInfo(prodInfo?: ProductionInfo): DbConfiguration {
  return (prodInfo?.VectorStore ?? {servers: [], enabled: true});
}

export function getWelcomeAbout(prodInfo?: ProductionInfo): Record<string, any> | undefined {
  if (prodInfo) {
    return prodInfo?.Text?.Welcome?.About;
  } else {
    return Locale.Welcome.Page.About;
  }
}

export function getWelcomeWhat(prodInfo?: ProductionInfo): string | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.What ?? undefined;
  } else {
    return Locale.Welcome.Page.What;
  }
}
export function getWelcomeWhatMessages(prodInfo?: ProductionInfo): Array<string> | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.WhatMessages ?? undefined;
  } else {
    return Locale.Welcome.Page.WhatMessages;
  }
}
export function getWelcomeHow(prodInfo?: ProductionInfo): string | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.How ?? undefined;
  } else {
    return Locale.Welcome.Page.How;
  }
}
export function getWelcomeHowMessages(prodInfo?: ProductionInfo): Array<string> | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.HowMessages ?? undefined;
  } else {
    return Locale.Welcome.Page.HowMessages;
  }
}
export function getMaskInfo(prodInfo?: ProductionInfo): Mask | undefined {
  return prodInfo?.Text?.Masks? prodInfo.Text.Masks[0] : undefined;
}

