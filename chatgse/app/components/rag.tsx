import { useNavigate } from "react-router-dom";
import { useRAGStore } from "../store/rag";
import { useChatStore } from "../store";
import { ErrorBoundary } from "./error";
import Locale from "../locales";

import { List, ListItem, LoadingComponent, Modal, ReactDropZone, showConfirm } from "./ui-lib";

import CloseIcon from "../icons/close.svg";
import ResetIcon from "../icons/reload.svg";
import OKIcon from "../icons/config.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import RAGDocumentsIcon from "../icons/rag-documents.svg";
import ConnectionIcon from "../icons/connection.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";

import styles from "./rag.module.scss";

import { IconButton } from "./button";
import { useEffect, useState } from "react";
import { getHeaders } from "../client/api";
import { ApiPath, ERROR_BIOSERVER_MILVUS_CONNECT_FAILED, ERROR_BIOSERVER_OK } from "../constant";
import { InputRange } from "./input-range";
import { useDebouncedCallback } from "use-debounce";

const AUTHORIZATION = "Authorization";
const APIKEY = "api-key";
function getAuthHeader(): Record<string, string> {
  const jsonHeaders = getHeaders();
  if (jsonHeaders[AUTHORIZATION]) {
    return {[AUTHORIZATION]: jsonHeaders[AUTHORIZATION]};
  }
  return {[APIKEY]: jsonHeaders[APIKEY]};
}

function getDocumentName(doc: any) {
  if (!doc) {
    return "";
  }
  if (doc.source && doc.source !== 'unknown') {
    return doc.source;
  }
  if (doc.title && doc.title !== 'unknown') {
    return doc.title;
  }
  if (doc.name && doc.name !== 'unknown') {
    return doc.name;
  }
  return "unknown";
}

export function RAGPage() {
  const navigate = useNavigate();

  const ragStore = useRAGStore();

  const [documents, setDocuments] = useState<Array<any>>([]);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const ragConfig = ragStore.currentRAGConfig();
  const [host, setHost] = useState(ragConfig.connectionArgs?.host??"local");
  const [port, setPort] = useState(ragConfig.connectionArgs?.port??"19530");

  const updateDocuments = useDebouncedCallback(async () => {
    const RAG_URL = ApiPath.RAG;
    let fetchUrl = RAG_URL as string;
    if (!fetchUrl.endsWith('/')) {
      fetchUrl += '/';
    }
    
    const theConfig = ragStore.currentRAGConfig();
    console.log(`[updateDocuments] ${theConfig.connectionArgs.host}`);
    console.log(`[updateDocuments] ${ragConfig.connectionArgs.host}`);
    fetchUrl += 'alldocuments';
    try {
      const res = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({connectionArgs: theConfig.connectionArgs}),
      });
      const value = await res.json();
      if (value.documents) {
        setDocuments(value.documents);
      } else {
        if (value.code === ERROR_BIOSERVER_MILVUS_CONNECT_FAILED) {
          setConnected(false);
        }
        setDocuments([]);
      }
    } catch (e: any) {
      console.error(e);
    }
  });
  const updateConnectionStatus = useDebouncedCallback(async () => {
    const RAG_URL = ApiPath.RAG;
    let fetchUrl = RAG_URL as string;
    if (!fetchUrl.endsWith('/')) {
      fetchUrl += '/';
    }
    const connectionStatusUrl = fetchUrl + "connectionstatus"
    setIsReconnecting(true);
    try {
      const res = await fetch(connectionStatusUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({connectionArgs: {host, port}}),
      });
      const value = await res.json();
      if (value?.code === ERROR_BIOSERVER_OK && value.status) {
        if (value.status === "connected") {
          setConnected(true);
          ragStore.selectRAGConfig(host, port);
        } else {
          setConnected(false);
        }
      }
      setIsReconnecting(false);
    } catch (e: any) {
      console.error(e);
      setIsReconnecting(false);
    }
    setTimeout(updateDocuments, 1000);
  });

  useEffect(() => {
    updateConnectionStatus();
  }, []);

  async function onUpload(file: File, done: ()=>void) {
    const RAG_URL = ApiPath.RAG;
    const path = "newdocument";
    let uploadPath = RAG_URL as string;
    if (!uploadPath.endsWith('/')) {
      uploadPath += '/';
    }
    uploadPath += path;
    const data = new FormData();
    data.set('file', file);
    data.set('ragConfig', JSON.stringify(ragConfig));
    data.set('useRAG', useRAGStore.getState().useRAG as unknown as string);
    
    try {
      setUploading(true);
      const res = await fetch(uploadPath, {
        method: "POST",
        body: data,
        headers: { 
          ...getAuthHeader(),
        },
      });
      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      setUploading(false);
      done();
      updateDocuments();
    }
  }
  async function onRemoveDocument(docId: string) {
    if (docId.length === 0) {
      return;
    }
    if (!await showConfirm(`Are you sure to remove the document?`)) {
      return;
    }
    const RAG_URL = ApiPath.RAG;
    const path = "document";
    let delPath = RAG_URL as string;
    if (!delPath.endsWith('/')) {
      delPath += '/';
    }
    delPath += path;
    try {
      const res = await fetch(delPath, {
        method: "DELETE",
        body: JSON.stringify({docId, connectionArgs: ragConfig.connectionArgs}),
        headers: {
          ...getAuthHeader()
        }
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
    } catch (e: any) {
      console.error(e);
    }
    updateDocuments();
  }
  const make_remove_function = (docId: string) => {
    return () => {
      onRemoveDocument(docId);
    }
  }
  function DocumentComponent({doc}: {doc: any}) {
    return (
      <div className={styles["document-item"]}>
        <div className={styles["document-label"]}>{getDocumentName(doc)}</div>
        <div className={styles["document-stretch-area"]}></div>
        <div className={`${styles["document-remove-icon"]} clickable`} onClick={make_remove_function(doc.id)}><ClearIcon /></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={styles["rag-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.RAG.Page.Title}
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
        <div className={styles["rag-page-body"]}>
            <div className={styles["rag-description"]}>
              {Locale.RAG.Description}
            </div>
  
            <div className={styles["rag-page-content"]}>
              <div className={styles["rag-column"]}>
                <div className={styles["column-container"]}>
                  <div className={styles["column-title"]}>
                    <div className={styles["column-icon"]}>
                      <RAGDocumentsIcon />
                    </div>
                    <div className={styles["column-label"]}>{Locale.RAG.Documents.Label}</div>
                  </div>
                  <div className={styles["column-body"]}>
                    {!ragStore.useRAG? (<div className={styles["feature-hints"]}>
                      {Locale.RAG.Documents.DocumentsHints}         
                    </div>) : (<div />)}
                    <div className={styles["feature-hints"]}>
                      {Locale.RAG.Documents.DocumentsPrompts}
                    </div>
                    <div className={styles["feature-hints"]}>
                      <ReactDropZone
                        disabled={!ragStore.useRAG}
                        accept={{"application/pdf": ["application/pdf"], "text/plain": ["text/plain"]}}
                        onUpload={onUpload}
                      />
                    </div>
                    {(uploading) ? (
                      <div className={styles["uploading-prompts"]}>
                        <div style={{marginLeft: 5, marginRight: 5}}>
                          <p>{Locale.RAG.Documents.UploadingMessage}
                          </p>
                        </div>
                        <div><LoadingComponent noLogo /></div>
                    </div>
                    ) : (<></>)}
                    <div className={styles["documents"]}>
                      <ul>
                        {documents.map((doc) => (
                          <li key={doc.id??""}>
                            <DocumentComponent doc={doc} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles["rag-column"]}>
                <div className={styles["column-container"]}>
                  <div className={styles["column-title"]}>
                    <div className={styles["column-icon"]}>
                      <SettingsIcon />
                    </div>
                    <div className={styles["column-label"]}>{Locale.RAG.Settings.Label}</div>
                  </div>
                  <div className={styles["column-body"]} >
                    <List>
                      <ListItem
                        title={Locale.RAG.Settings.UseRAG}
                      >
                        <input
                          type="checkbox"
                          checked={ragStore.useRAG}
                          onChange={(e) => {
                            ragStore.setUseRAG(e.currentTarget.checked)
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.ConnectionStatus}
                      >
                        {connected ? (
                          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className={styles["connected-snippet"]}><p>connected</p></div>                            
                            <div>
                              <IconButton
                                disabled={!ragStore.useRAG}
                                text={Locale.RAG.Settings.Refresh}
                                icon={isReconnecting ? (<ReloadingIcon width={32} height={16} />) : <ConnectionIcon />}
                                onClick={updateConnectionStatus}
                              ></IconButton>
                            </div>
                          </div>
                        ) : (
                          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className={styles["disconnected-snippet"]}><p>disconnected</p></div>                                                      
                            <div>
                              <IconButton
                                disabled={!ragStore.useRAG}
                                text={Locale.RAG.Settings.Reconnect}
                                icon={isReconnecting ? (<ReloadingIcon width={32} height={16} />) : <ConnectionIcon />}
                                onClick={updateConnectionStatus}
                              ></IconButton>
                            </div>
                          </div>
                        )}
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.DatabaseURL}
                      >
                        <input
                          disabled={!ragStore.useRAG}
                          type="text"
                          value={host}
                          onChange={(e) => {
                            setHost(e.currentTarget?.value??"local")
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.DatabasePort}
                      >
                        <input
                          disabled={!ragStore.useRAG}
                          type="text"
                          value={port}
                          onChange={(e) => {
                            setPort(e.currentTarget?.value??"19530")
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.DatabaseUser}
                      >
                        <input
                          disabled
                          type="text"
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
                              (config) => (config.connectionArgs.user = e.currentTarget.value)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.DatabasePassword}
                      >
                        <input
                          disabled
                          type="password"
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
                              (config) => (config.connectionArgs.password = e.currentTarget.value)
                            )
                          }}
                        ></input>
                      </ListItem>

                    </List>
                    <List>
                      <ListItem
                        title={Locale.RAG.Settings.SplitByChar}
                      >
                        <input
                          type="checkbox"
                          checked={ragConfig.splitByChar}
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
                              (config) => (config.splitByChar = e.currentTarget.checked)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.ChunkSize.Label}
                        subTitle={Locale.RAG.Settings.ChunkSize.subLabel}
                      >
                        <InputRange
                          value={ragConfig.chunkSize}
                          min="0"
                          max="5000"
                          step="10"
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
                              (config) => (config.chunkSize = parseInt(e.currentTarget.value))
                            )
                          }}
                        ></InputRange>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.Overlap.Label}
                        subTitle={Locale.RAG.Settings.Overlap.subLabel}
                      >
                        <InputRange
                          value={ragConfig.overlapSize}
                          min="0"
                          max="1000"
                          step="1"
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
                              (config) => (config.overlapSize = Number(e.currentTarget.value))
                            )
                          }}
                        ></InputRange>
                      </ListItem>
                      <ListItem
                        title={Locale.RAG.Settings.ResultsNum.Label}
                        subTitle={Locale.RAG.Settings.ResultsNum.subLabel}
                      >
                        <InputRange
                          value={ragConfig.resultNum}
                          min="0"
                          max="1000"
                          step="1"
                          onChange={(e) => {
                            ragStore.updateCurrentRAGConfig(
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