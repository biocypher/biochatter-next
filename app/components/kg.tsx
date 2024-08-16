"use client"
import { useNavigate } from "react-router-dom"
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState, useContext } from "react";
import { useKGStore } from "../store/kg";
import { useAccessStore } from "../store/access";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";
import ConnectionIcon from "../icons/connection.svg";

import Locale from "../locales";

import { ERROR_BIOSERVER_OK } from "../constant";
import { DbConfiguration, DbServerSettings, } from "../utils/datatypes";
import { requestKGConnectionStatus } from "../client/datarequest";
import {Markdown} from "./markdown";
import { ErrorBoundary } from "./error";
import styles from "./kg.module.scss";
import { List, ListItem, SelectInput } from "./ui-lib";

import { InputRange } from "./input-range";
import { DbConnectionArgs } from "../utils/datatypes";
import { getKGConnectionArgsToConnect, getKGConnectionArgsToDisplay } from "../utils/rag";

const DEFAULT_PORT = "7687";
const DEFAULT_HOST = "";

export function KGPage() {
  const navigate = useNavigate();
  const kgStore = useKGStore();
  const accessStore = useAccessStore();
  const prodInfo = accessStore.productionInfo === "undefined" ? undefined : JSON.parse(accessStore.productionInfo);
  let kgProdInfo = (prodInfo?.KnowledgeGraph ?? {servers: []}) as DbConfiguration;
  const kgConfig = kgStore.config;
  const [connectionArgs, setConnectionArgs] 
    = useState(getKGConnectionArgsToDisplay(kgConfig.connectionArgs, kgProdInfo.servers ?? []));
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (kgConfig.connectionArgs.host === "local") {
      // default value
      if (kgProdInfo.servers && kgProdInfo.servers.length > 0) {
        const server = kgProdInfo.servers[0]
        setConnectionArgs({
          host: server.server,
          port: server.port ?? "7687",
        });
        kgStore.updateConfig((config) => {
          config.connectionArgs.host = server.address;
          config.connectionArgs.port = server.port ?? "7687";
          if (server.number_of_results !== undefined) {
            config.resultNum = server.number_of_results;
          }
        })
      }
    }
  }, []);

  const updateConnectionStatus = useDebouncedCallback(async () => {    
    setIsReconnecting(true);
    try {
      const conn = getKGConnectionArgsToConnect(connectionArgs, kgProdInfo.servers??[]);
      const res = await requestKGConnectionStatus(conn);
      const value = await res.json();
      if(value?.code === ERROR_BIOSERVER_OK && value.status) {
        setConnected(value.status === 'connected');
      }
      setIsReconnecting(false);
    } catch (e: any) {
      console.error(e);
      setIsReconnecting(false);
    }
  });

  async function onRemoveDocument(doc: string) {}
  const make_remove_function = (doc: string) => {
    return () => {
      onRemoveDocument(doc);
    }
  }

  useEffect(() => {
    updateConnectionStatus();
  }, []);
  
  function DocumentComponent({doc}: {doc: string}) {
    return (
      <div className={styles["document-item"]}>
        <div className={styles["document-label"]}>{doc}</div>
        <div className={styles["document-stretch-area"]}></div>
        <div 
          className={`${styles["document-remove-icon"]} clickable`} 
          onClick={make_remove_function(doc)}>
          <ClearIcon />
        </div>
      </div>
    )
  }
  return (
    <ErrorBoundary>
      <div className={styles["kg-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.KG.Page.Title}
            </div>
          </div>
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
        <div className={styles["kg-page-body"]}>
          <div className={styles["kg-description"]}>
            <Markdown 
            content={Locale.KG.Description}
            />
          </div>

          <div className={styles["kg-page-content"]}>
            <div className={styles["kg-column"]}>
              <div className={styles["column-container"]}>
                <div className={styles["column-title"]}>
                  <div className={styles["column-icon"]}>
                    <SettingsIcon />
                  </div>
                  <div className={styles["column-label"]}>{Locale.KG.Settings.Label}</div>
                </div>
                <div className={styles["column-body"]} >
                  <List>
                    <ListItem
                      title={Locale.KG.Settings.useKG}
                    >
                      <input
                        type="checkbox"
                        checked={kgStore.useKG}
                        onChange={(e) => {
                          kgStore.setUseKG(e.currentTarget?.checked??false)
                        }}
                      ></input>
                    </ListItem>
                    <ListItem
                      title={Locale.KG.Settings.ConnectionStatus}
                    >
                      {connected ? (
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                          <div className={styles["connected-snippet"]}><p>connected</p></div>
                          <div>
                            <IconButton
                              disabled={!kgStore.useKG}
                              text={Locale.KG.Settings.Refresh}
                              icon={isReconnecting ? (<ReloadingIcon width={32} height={16} />) : <ConnectionIcon />}
                              onClick={updateConnectionStatus}
                            ></IconButton>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                          <div className={styles["disconnected-snippet"]}><p>disconnected</p></div>
                          <div>
                            <IconButton
                              disabled={!kgStore.useKG}
                              text={Locale.KG.Settings.Reconnect}
                              icon={isReconnecting ? (<ReloadingIcon width={32} height={16} />) : <ConnectionIcon />}
                              onClick={updateConnectionStatus}
                            ></IconButton>
                          </div>
                        </div>
                      )}
                    </ListItem>
                    <ListItem
                      title={Locale.KG.Settings.DatabaseURL}
                    >
                      {kgProdInfo.servers && kgProdInfo.servers.length > 0 ? (
                        <SelectInput 
                          disabled={!kgStore.useKG} 
                          listName="kgservers" 
                          value={connectionArgs.host}
                          onChange={(e) => {
                          const val = e.currentTarget?.value ?? DEFAULT_HOST;
                          let default_server = false;
                          for (let kg of kgProdInfo.servers??[]) {
                            if (kg.server === val) {
                              default_server = true;
                              setConnectionArgs({
                                ...connectionArgs,
                                host: kg.server,
                                port: kg.port??"7687",
                              })
                              kgStore.updateConfig(
                                (config) => {
                                  config.connectionArgs.host = kg.address;
                                  config.connectionArgs.port = kg.port ?? "7687";
                                  if (kg.number_of_results !== undefined) {
                                    config.resultNum = kg.number_of_results;
                                  }
                                  if (kg.description !== undefined) {
                                    config.description = kg.description;
                                  }
                                }
                              )
                              break;
                            }
                          }
                          if (!default_server) {
                            setConnectionArgs({
                              ...connectionArgs,
                              host:e.currentTarget?.value??DEFAULT_HOST
                            });
                            kgStore.updateConfig(
                              (config) => (
                                config.connectionArgs.host = e.currentTarget?.value??DEFAULT_HOST
                              )
                            )
                          }
                        }}>
                          {kgProdInfo.servers?.map((kg) => (
                            <option key={kg.server} value={kg.server} />
                          ))}
                        </SelectInput>
                      ) : (
                        <input
                         disabled={!kgStore.useKG}
                         type="text"
                         value={connectionArgs.host}
                         onChange={(e) => {
                           setConnectionArgs({
                             ...connectionArgs,
                             host:e.currentTarget?.value??DEFAULT_HOST
                           });
                           kgStore.updateConfig(
                             (config) => (
                               config.connectionArgs.host = e.currentTarget?.value??DEFAULT_HOST
                             )
                           )
                         }}
                        ></input>
                      )}
                      
                    </ListItem>
                    <ListItem
                      title={Locale.KG.Settings.DatabasePort}
                    >
                      <input
                        disabled={!kgStore.useKG}
                        type="text"
                        value={connectionArgs.port}
                        onChange={(e) => {
                          setConnectionArgs({
                            ...connectionArgs,
                            port: e.currentTarget?.value??DEFAULT_PORT
                          });
                          kgStore.updateConfig(
                            (config) => (
                              config.connectionArgs.port = e.currentTarget?.value??DEFAULT_PORT
                            )
                          )
                        }}
                      ></input>
                    </ListItem>
                    <ListItem
                      title={Locale.KG.Settings.ResultsNum.Label}
                      subTitle={Locale.KG.Settings.ResultsNum.subLabel}
                    >
                      <InputRange
                        disabled={!kgStore.useKG}
                        value={kgConfig.resultNum}
                        min="0"
                        max="20"
                        step="1"
                        onChange={(e) => {
                          kgStore.updateConfig(
                            (config) => (config.resultNum = Number(e.currentTarget.value))
                          )
                        }}
                      ></InputRange>
                    </ListItem>
                    <ListItem
                      title={Locale.KG.Settings.useReflexion.Label}
                    >
                      <input
                        type="checkbox"
                        disabled={!kgStore.useKG}
                        checked={kgConfig.useReflexion??false}
                        onChange={(e) => {
                          kgStore.updateConfig(
                            (config) => (config.useReflexion = e.currentTarget?.checked??false)
                          )
                        }}
                      ></input>
                    </ListItem>
                  </List>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ErrorBoundary>
  )
}

