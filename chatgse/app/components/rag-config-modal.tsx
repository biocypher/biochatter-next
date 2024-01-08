import { createEmptyRAGConfig, useChatStore } from "../store";

import ResetIcon from "../icons/reload.svg";
import OKIcon from "../icons/config.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import RAGDocumentsIcon from "../icons/rag-documents.svg";
import DisconnectedIcon from "../icons/disconnected.svg";
import ConnectedIcon from "../icons/connected.svg"
import ConnectionIcon from "../icons/connection.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";

import Locale from "../locales";
import { IconButton } from "./button";
import { List, ListItem, LoadingComponent, Modal, ReactDropZone, showConfirm } from "./ui-lib";

import styles from "./rag.module.scss";
import { InputRange } from "./input-range";
import { ApiPath, ERROR_BIOSERVER_MILVUS_CONNECT_FAILED, ERROR_BIOSERVER_OK } from "../constant";
import { getHeaders } from "../client/api";
import { useEffect, useState } from "react";

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

export function RAGConfigModal(props: {onClose: () => void}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  async function updateDocuments() {
    const RAG_URL = ApiPath.RAG;
    let fetchUrl = RAG_URL as string;
    if (!fetchUrl.endsWith('/')) {
      fetchUrl += '/';
    }
    fetchUrl += 'alldocuments';
    try {
      const res = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({connectionArgs: session.ragConfig.connectionArgs}),
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
  }
  async function updateConnectionStatus() {
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
        body: JSON.stringify({connectionArgs: session.ragConfig.connectionArgs}),
      });
      const value = await res.json();
      if (value?.code === ERROR_BIOSERVER_OK && value.status) {
        if (value.status === "connected") {
          setConnected(true);
        } else {
          setConnected(false);
        }
      }
      setIsReconnecting(false);
    } catch (e: any) {
      console.error(e);
      setIsReconnecting(false);
    }
    updateDocuments();
  }

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
    data.set('ragConfig', JSON.stringify(session.ragConfig));
    
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
        body: JSON.stringify({docId, connectionArgs: session.ragConfig.connectionArgs}),
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
    <div className="modal-mask">
      <Modal
        title="Current RAG Settings"
        onClose={props.onClose}
        defaultMax={true}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.RAG.Reset}
            onClick={async () => {
              if (await showConfirm("Resetting will clear all settings. Are you sure?")) {
                chatStore.updateCurrentSession(
                  (session) => {
                    session.ragConfig = createEmptyRAGConfig();
                  }
                )
              }
            }}
          ></IconButton>,
          <IconButton
            key="ok"
            icon={<OKIcon />}
            bordered
            text={Locale.Chat.RAG.OK}
            onClick={props.onClose}
          ></IconButton>
        ]}
      >
        <div className={styles["rag-page"]}>
          <div className={styles["rag-page-body"]}>
            <div className={styles["rag-description"]}>
              {Locale.Chat.RAG.Description}
            </div>
  
            <div className={styles["rag-page-content"]}>
              <div className={styles["rag-column"]}>
                <div className={styles["column-container"]}>
                  <div className={styles["column-title"]}>
                    <div className={styles["column-icon"]}>
                      <RAGDocumentsIcon />
                    </div>
                    <div className={styles["column-label"]}>{Locale.Chat.RAG.Documents.Label}</div>
                  </div>
                  <div className={styles["column-body"]}>
                    {!session.ragConfig.useRAG ? (<div className={styles["feature-hints"]}>
                      {Locale.Chat.RAG.Documents.DocumentsHints}         
                    </div>) : (<div />)}
                    <div className={styles["feature-hints"]}>
                      {Locale.Chat.RAG.Documents.DocumentsPrompts}
                    </div>
                    <div className={styles["feature-hints"]}>
                      <ReactDropZone
                        disabled={!session.ragConfig.useRAG}
                        accept={{"application/pdf": ["application/pdf"], "text/plain": ["text/plain"]}}
                        onUpload={onUpload}
                      />
                    </div>
                    {(uploading) ? (
                      <div className={styles["uploading-prompts"]}>
                        <div style={{marginLeft: 5, marginRight: 5}}>
                          <p>{Locale.Chat.RAG.Documents.UploadingMessage}
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
                    <div className={styles["column-label"]}>{Locale.Chat.RAG.Settings.Label}</div>
                  </div>
                  <div className={styles["column-body"]} >
                    <List>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.UseRAG}
                      >
                        <input
                          type="checkbox"
                          checked={session.ragConfig.useRAG}
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.useRAG = e.currentTarget.checked)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.ConnectionStatus}
                      >
                        {connected ? (
                          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className={styles["connected-snippet"]}><p>connected</p></div>                            
                            <div>
                              <IconButton
                                disabled={!session.ragConfig.useRAG}
                                text={Locale.Chat.RAG.Settings.Refresh}
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
                                disabled={!session.ragConfig.useRAG}
                                text={Locale.Chat.RAG.Settings.Reconnect}
                                icon={isReconnecting ? (<ReloadingIcon width={32} height={16} />) : <ConnectionIcon />}
                                onClick={updateConnectionStatus}
                              ></IconButton>
                            </div>
                          </div>
                        )}
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.DatabaseURL}
                      >
                        <input
                          disabled={!session.ragConfig.useRAG}
                          type="text"
                          value={session.ragConfig.connectionArgs.host??"127.0.0.1"}
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.connectionArgs.host = e.currentTarget.value)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.DatabasePort}
                      >
                        <input
                          disabled={!session.ragConfig.useRAG}
                          type="text"
                          value={session.ragConfig.connectionArgs.port??"19530"}
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.connectionArgs.port = (Number(e.currentTarget.value) as unknown as string))
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.DatabaseUser}
                      >
                        <input
                          disabled
                          type="text"
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.connectionArgs.user = e.currentTarget.value)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.DatabasePassword}
                      >
                        <input
                          disabled
                          type="password"
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.connectionArgs.password = e.currentTarget.value)
                            )
                          }}
                        ></input>
                      </ListItem>

                    </List>
                    <List>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.SplitByChar}
                      >
                        <input
                          type="checkbox"
                          checked={session.ragConfig.splitByChar}
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.splitByChar = e.currentTarget.checked)
                            )
                          }}
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.ChunkSize.Label}
                        subTitle={Locale.Chat.RAG.Settings.ChunkSize.subLabel}
                      >
                        <InputRange
                          value={session.ragConfig.chunkSize}
                          min="0"
                          max="5000"
                          step="10"
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) =>(sess.ragConfig.chunkSize = parseInt(e.currentTarget.value))
                            )
                          }}
                        ></InputRange>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.Overlap.Label}
                        subTitle={Locale.Chat.RAG.Settings.Overlap.subLabel}
                      >
                        <InputRange
                          value={session.ragConfig.overlapSize}
                          min="0"
                          max="1000"
                          step="1"
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.overlapSize = Number(e.currentTarget.value))
                            )
                          }}
                        ></InputRange>
                      </ListItem>
                      <ListItem
                        title={Locale.Chat.RAG.Settings.ResultsNum.Label}
                        subTitle={Locale.Chat.RAG.Settings.ResultsNum.subLabel}
                      >
                        <InputRange
                          value={session.ragConfig.resultNum}
                          min="0"
                          max="1000"
                          step="1"
                          onChange={(e) => {
                            chatStore.updateCurrentSession(
                              (sess) => (sess.ragConfig.resultNum = Number(e.currentTarget.value))
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
      </Modal>
    </div>
  )
}
