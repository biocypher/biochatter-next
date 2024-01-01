import { createEmptyRAGConfig, useChatStore } from "../store";

import ResetIcon from "../icons/reload.svg";
import OKIcon from "../icons/config.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import RAGDocumentsIcon from "../icons/rag-documents.svg";

import Locale from "../locales";
import { IconButton } from "./button";
import { List, ListItem, Modal, ReactDropZone, showConfirm } from "./ui-lib";

import styles from "./rag.module.scss";
import { InputRange } from "./input-range";
import { ApiPath } from "../constant";

export function RAGConfigModal(props: {onClose: () => void}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  async function onUpload(file: File) {
    const RAG_URL = ApiPath.RAG;
    const path = "newdocument";
    let uploadPath = RAG_URL as string;
    if (!uploadPath.endsWith('/')) {
      uploadPath += '/';
    }
    uploadPath += path;
    const data = new FormData();
    data.set('file', file);
    try {
      const res = await fetch(uploadPath, {
        method: "POST",
        body: data
      });
      if (!res.ok) {
        throw new Error(await res.text())
      }
    } catch (e: any) {
      console.log(e);
    }
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
            text="reset"
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
            text="OK"
            onClick={props.onClose}
          ></IconButton>
        ]}
      >
        <div className={styles["rag-page"]}>
          <div className={styles["rag-page-body"]}>
            <div className={styles["rag-description"]}>
              {Locale.RAG.Page.Description}
            </div>
  
            <div className={styles["rag-page-content"]}>
              <div className={styles["rag-column"]}>
                <div className={styles["column-container"]}>
                  <div className={styles["column-title"]}>
                    <div className={styles["column-icon"]}>
                      <RAGDocumentsIcon />
                    </div>
                    <div className={styles["column-label"]}>Documents</div>
                  </div>
                  <div className={styles["column-body"]}>
                    {!session.ragConfig.useRAG ? (<div className={styles["feature-hints"]}>
                      To use the feature, please enable it in the settings panel. →                  
                    </div>) : (<div />)}
                    <div className={styles["feature-hints"]}>
                      Upload documents one at a time. Upon upload, the document is split according to the settings and the embeddings are stored in the connected vector database.
                    </div>
                    <div className={styles["feature-hints"]}>
                      <ReactDropZone
                        disabled={!session.ragConfig.useRAG}
                        accept={{"application/pdf": ["application/pdf"], "text/plain": ["text/plain"]}}
                        onUpload={onUpload}
                      />
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
                    <div className={styles["column-label"]}>Settings</div>
                  </div>
                  <div className={styles["column-body"]} >
                    <List>
                      <ListItem
                        title="Use document sumarisaztion"
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
                        title="Split by characters (instead of tokens)"
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
                        title="Chunk size"
                        subTitle="How large should the embedded text fragments be?"
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
                        title="Overlap"
                        subTitle="Should the chunks overlap, and by how much?"
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
                        title="Number of results"
                        subTitle="How many chunks should be used to supplement the prompts"
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