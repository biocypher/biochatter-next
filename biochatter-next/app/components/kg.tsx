import { useNavigate } from "react-router-dom"
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";
import { useKGStore } from "../store/kg";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";
import ConnectionIcon from "../icons/connection.svg";

import Locale from "../locales";

import { ERROR_BIOSERVER_OK } from "../constant";
import { requestKGConnectionStatus } from "../client/datarequest";
import {Markdown} from "./markdown";
import { ErrorBoundary } from "./error";
import styles from "./kg.module.scss";
import { List, ListItem } from "./ui-lib";

import { InputRange } from "./input-range";
import { useAccessStore } from "../store";


const DEFAULT_PORT = "7687";
const DEFAULT_HOST = "";

export function KGPage() {
  const navigate = useNavigate();
  const kgStore = useKGStore();
  const accessSttore = useAccessStore();
  const kgConfig = kgStore.config;
  const [connectionArgs, setConnectionArgs] 
    = useState(kgConfig.connectionArgs);
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);


  const updateConnectionStatus = useDebouncedCallback(async () => {    
    setIsReconnecting(true);
    try {
      const res = await requestKGConnectionStatus(
        connectionArgs, accessSttore.subPath
      );
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

  useEffect(() => {
    updateConnectionStatus();
  }, []);
  
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

