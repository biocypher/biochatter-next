import { useNavigate } from "react-router-dom"
import { useKGStore } from "../store/kg";
import { useEffect, useState } from "react";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import DocumentIcon from "../icons/rag-documents.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";
import ConnectionIcon from "../icons/connection.svg";


import Locale from "../locales";

import {Markdown} from "./markdown";
import { ErrorBoundary } from "./error";
import styles from "./kg.module.scss";
import { List, ListItem, LoadingComponent, ReactDropZone } from "./ui-lib";
import { useDebouncedCallback } from "use-debounce";
import { ApiPath, ERROR_BIOSERVER_OK, HDR_APPLICATION_JSON, HDR_CONTENT_TYPE } from "../constant";

const DEFAULT_PORT = "7687";
const DEFAULT_HOST = "local";

export function KGPage() {
  const navigate = useNavigate();
  const kgStore = useKGStore();
  const kgConfig = kgStore.config;
  const [connectionArgs, setConnectionArgs] 
    = useState(kgConfig.connectionArgs);
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const updateConnectionStatus = useDebouncedCallback(async () => {
    const KG_UAL = ApiPath.KG;
    let fetchUrl = KG_UAL as string;
    if (!fetchUrl.endsWith('/')) {
      fetchUrl += '/';
    }
    const connectionStatusUrl = fetchUrl + 'connectionstatus';
    setIsReconnecting(true);
    try {
      const res = await fetch(connectionStatusUrl, {
        method: "POST",
        headers: {
          [HDR_CONTENT_TYPE]: HDR_APPLICATION_JSON,
        },
        body: JSON.stringify({connectionArgs})
      });
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
  async function onUpload(f: File, done: () => void) {}

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
                    <DocumentIcon />
                  </div>
                  <div className={styles["column-label"]}>{Locale.KG.SchemaConfiguration.Label}</div>
                </div>
                <div className={styles["column-body"]}>
                  {!kgStore.useKG ? (<div className={`${styles["feature-hints"]} snippet warning`}>
                    {Locale.KG.SchemaConfiguration.DocumentsHints}
                  </div>) : (<div />)}
                  <div className={`${styles["feature-hints"]} snippet primary`}>
                    {Locale.KG.SchemaConfiguration.DocumentsPrompts}
                  </div>
                  <div className={styles["feature-hints"]}>
                    <ReactDropZone
                      disabled={!kgStore.useKG}
                      accept={{ "text/yaml": [".yml", ".yaml"] }}
                      onUpload={onUpload}
                      fileLabel="YAML, YML"
                    />
                  </div>
                  {(uploading) ? (
                    <div className={styles["uploading-prompts"]}>
                      <div style={{ marginLeft: 5, marginRight: 5 }}>
                        <p>{Locale.KG.SchemaConfiguration.UploadingMessage}
                        </p>
                      </div>
                      <div><LoadingComponent noLogo /></div>
                    </div>
                  ) : (<></>)}
                  <div className={styles["documents"]}>
                    <ul>
                      { document && [document].map((doc) => (
                        <li key={doc ?? ""}>
                          <DocumentComponent doc={doc} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
                          connectionArgs.host = e.currentTarget?.value ?? DEFAULT_HOST;
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
                          connectionArgs.port = e.currentTarget?.value??DEFAULT_PORT;
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

