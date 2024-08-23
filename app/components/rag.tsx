import { useNavigate } from "react-router-dom";
import { useRAGStore } from "../store/rag";
import { useAccessStore } from "../store/access";
import { ErrorBoundary } from "./error";
import Locale from "../locales";

import { List, ListItem, LoadingComponent, Modal, ReactDropZone, SelectInput, showConfirm } from "./ui-lib";

import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import RAGDocumentsIcon from "../icons/rag-documents.svg";
import ConnectionIcon from "../icons/connection.svg";
import ClearIcon from "../icons/clear.svg";
import ReloadingIcon from "../icons/three-dots.svg";

import styles from "./rag.module.scss";

import { IconButton } from "./button";
import { useEffect, useState } from "react";
import { ApiPath, ERROR_BIOSERVER_MILVUS_CONNECT_FAILED, ERROR_BIOSERVER_OK } from "../constant";
import { InputRange } from "./input-range";
import { useDebouncedCallback } from "use-debounce";
import { requestAllVSDocuments, requestRemoveDocument, requestUploadFile, requestVSConnectionStatus } from "../client/datarequest";
import { DbConfiguration } from "../utils/datatypes";
import { getVectorStoreConnectionArgsToConnect, getVectorStoreConnectionArgsToDisplay, getVectorStoreServerGlobal } from "../utils/rag";

const DEFAULT_PORT = "19530";
const DEFAULT_HOST = "";

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
  const accessStore = useAccessStore();
  const ragStore = useRAGStore();
  const prodInfo = accessStore.productionInfo === "undefined" ? undefined : JSON.parse(accessStore.productionInfo);
  let ragProdInfo = (prodInfo?.VectorStore ?? {servers: []}) as DbConfiguration;
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const ragConfig = ragStore.currentRAGConfig();
  const [connectionArgs, setConnectionArgs] = useState(
    getVectorStoreConnectionArgsToDisplay(ragConfig.connectionArgs, ragProdInfo.servers??[])
  );
  const [globalVS, setGlobalVS] = useState(
    getVectorStoreServerGlobal(ragConfig.connectionArgs, ragProdInfo.servers??[])
  );

  const updateDocuments = useDebouncedCallback(async () => {
    const theConfig = ragStore.currentRAGConfig();
    console.log(`[updateDocuments] ${theConfig.connectionArgs.host}`);
    console.log(`[updateDocuments] ${ragConfig.connectionArgs.host}`);
    try {
      const res = await requestAllVSDocuments(
        getVectorStoreConnectionArgsToConnect(connectionArgs, ragProdInfo.servers??[]), 
        globalVS ? undefined : theConfig.docIdsWorkspace,
      );
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
    const connectionStatusUrl = fetchUrl + "connectionstatus";
    setIsReconnecting(true);
    const connectionArgsAddress = getVectorStoreConnectionArgsToConnect(
      connectionArgs, ragProdInfo.servers??[]
    );
    const theGlobalVS = getVectorStoreServerGlobal(connectionArgs, ragProdInfo.servers??[]);
    setGlobalVS(theGlobalVS);
    try {
      const res = await requestVSConnectionStatus(connectionArgsAddress);
      const value = await res.json();
      if (value?.code === ERROR_BIOSERVER_OK && value.status) {
        if (value.status === "connected") {
          setConnected(true);
          ragStore.selectRAGConfig(connectionArgsAddress);
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

  async function onUpload(file: File, done: () => void) {
    try {
      setUploading(true);
      const res = await requestUploadFile(
        file, ragConfig, useRAGStore.getState().useRAG
      );
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const result = await res.json();
      if (result.id !== undefined && result.id !== null && result.id.length > 0) {
        ragStore.updateCurrentRAGConfig(
          (config) => (
            config.docIdsWorkspace = config.docIdsWorkspace ? [result.id].concat(config.docIdsWorkspace) : [result.id]
          )
        )
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      setUploading(false);
      done();
      updateDocuments();
    }
  }
  async function onRemoveDocument(docId: string, docName: string) {
    if (docId.length === 0) {
      return;
    }
    if (!await showConfirm(`Are you sure to remove the document ${docName}?`)) {
      return;
    }
    try {
      const res = await requestRemoveDocument(
        ragConfig.connectionArgs,
        docId,
        (ragConfig.docIdsWorkspace !== undefined &&
          ragConfig.docIdsWorkspace.length > 0) ? 
          ragConfig.docIdsWorkspace : [docId],
      )      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      ragStore.updateCurrentRAGConfig(
        (config) => {
          const ix = config.docIdsWorkspace?.indexOf(docId);
          if (ix === undefined || ix < 0) {
            return;
          }
          config.docIdsWorkspace!.splice(ix, 1);
        }
      )
    } catch (e: any) {
      console.error(e);
    }
    updateDocuments();
  }
  const make_remove_function = (docId: string, docName: string) => {
    return () => {
      onRemoveDocument(docId, docName);
    }
  }
  function DocumentComponent({ doc, removable }: { doc: any, removable: boolean }) {
    return (
      <div className={styles["document-item"]}>
        <div className={styles["document-label"]}>{getDocumentName(doc)}</div>
        <div className={styles["document-stretch-area"]}></div>
        {removable && <div className={`${styles["document-remove-icon"]} clickable`} onClick={make_remove_function(doc.id, getDocumentName(doc))}><ClearIcon /></div>}
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
                  {!ragStore.useRAG ? (<div className={`${styles["feature-hints"]} snippet warning`}>
                    {Locale.RAG.Documents.DocumentsHints}
                  </div>) : (<div />)}
                  <div className={`${styles["feature-hints"]} snippet primary`}>
                    {Locale.RAG.Documents.DocumentsPrompts}
                  </div>
                  {!globalVS && <div className={styles["feature-hints"]}>
                    <ReactDropZone
                      disabled={!ragStore.useRAG}
                      accept={{ "application/pdf": ["application/pdf"], "text/plain": ["text/plain"] }}
                      onUpload={onUpload}
                    />
                  </div>}
                  {(uploading) ? (
                    <div className={styles["uploading-prompts"]}>
                      <div style={{ marginLeft: 5, marginRight: 5 }}>
                        <p>{Locale.RAG.Documents.UploadingMessage}
                        </p>
                      </div>
                      <div><LoadingComponent noLogo /></div>
                    </div>
                  ) : (<></>)}
                  <div className={styles["documents"]}>
                    <ul style={{listStyleType: "square"}}>
                      {documents.map((doc) => (
                        <li key={doc.id ?? ""}>
                          <DocumentComponent doc={doc} removable={!globalVS} />
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
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
                      {ragProdInfo.servers && ragProdInfo.servers.length > 0 ? (<SelectInput
                        disabled={!ragStore.useRAG}
                        listName="ragservers"
                        value={connectionArgs.host}
                        onChange={(e) => {
                          const val = e.currentTarget?.value ?? DEFAULT_HOST;
                          let default_server = false;
                          for (let rag of ragProdInfo.servers??[]) {
                            if (rag.server === val) {
                              default_server = true;
                              setConnectionArgs({
                                ...connectionArgs,
                                host: rag.server,
                                port: rag.port??DEFAULT_PORT,
                              })
                              ragStore.updateCurrentRAGConfig(
                                (config) => {
                                  config.connectionArgs.host = rag.address;
                                  config.connectionArgs.port = rag.port ?? DEFAULT_PORT;
                                  if (rag.number_of_results !== undefined) {
                                    config.resultNum = rag.number_of_results;
                                  }
                                  if (rag.description !== undefined) {
                                    config.description = rag.description;
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
                            ragStore.updateCurrentRAGConfig(
                              (config) => (
                                config.connectionArgs.host = e.currentTarget?.value??DEFAULT_HOST
                              )
                            )
                          }
                        }}
                      >
                        {ragProdInfo.servers?.map((rag) => (
                          <option key={rag.server} value={rag.server}></option>
                        ))}
                      </SelectInput>) : (
                        <input
                          disabled={!ragStore.useRAG}
                          type="text"
                          value={connectionArgs.host}
                          onChange={(e) => {
                            setConnectionArgs({
                              ...connectionArgs,
                              host: e.currentTarget?.value ?? "local"
                            });
                            if (
                              e.currentTarget?.value === undefined ||
                              e.currentTarget?.value.length === 0
                            ) {
                              return;
                            }
                            const host = e.currentTarget.value;
                            const theConfig = ragStore.getRAGConfig(host, connectionArgs.port);
                            if (!theConfig) {
                              return;
                            }
                            ragStore.selectRAGConfig({ ...theConfig.connectionArgs })
                          }}
                        ></input>)
                      }
                    </ListItem>
                    <ListItem
                      title={Locale.RAG.Settings.DatabasePort}
                    >
                      <input
                        disabled={!ragStore.useRAG}
                        type="text"
                        value={connectionArgs.port}
                        onChange={(e) => {
                          setConnectionArgs({
                            ...connectionArgs,
                            port: e.currentTarget?.value ?? "19530"
                          });
                          if (
                            e.currentTarget?.value === undefined ||
                            e.currentTarget?.value.length === 0
                          ) {
                            return;
                          }
                          const port = e.currentTarget.value;
                          const theConfig = ragStore.getRAGConfig(connectionArgs.host, port);
                          if (!theConfig) {
                            return;
                          }
                          ragStore.selectRAGConfig({ ...theConfig.connectionArgs })
                        }}
                      ></input>
                    </ListItem>
                  </List>
                  <List>
                    <ListItem title={Locale.RAG.Settings.SplitByChar}>
                      <div onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        ragStore.updateCurrentRAGConfig(
                          (config) => (config.splitByChar = target.value === 'character')
                        )
                      }}>
                        <input
                          type="radio"
                          value="character"
                          checked={ragConfig.splitByChar}
                          name="split"
                        /> Character
                        <input
                          type="radio"
                          value="token"
                          checked={!ragConfig.splitByChar}
                          name="split"
                        /> Token
                      </div>
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
                        max="20"
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
