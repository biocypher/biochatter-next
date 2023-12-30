import { useNavigate } from "react-router-dom";
import { useRAGStore } from "../store/rag";
import { useChatStore } from "../store";
import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./rag.module.scss";

import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";
import RAGDocumentsIcon from "../icons/rag-documents.svg";

import { IconButton } from "./button";
import {
  List,
  ListItem
} from "./ui-lib";
import { InputRange } from "./input-range";


export function RAGPage() {
  const navigate = useNavigate();

  const ragStore = useRAGStore();
  const chatStore = useChatStore();

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
          <div>
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
                  <div className={styles["feature-hints"]}>
                    To use the feature, please enable it in the settings panel. →                  
                  </div>
                  <div className={styles["feature-hints"]}>
                    Upload documents one at a time. Upon upload, the document is split according to the settings and the embeddings are stored in the connected vector database.
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
                      ></input>
                    </ListItem>
                    <ListItem
                      title="Split by characters (instead of tokens)"
                    >
                      <input
                        type="checkbox"
                      ></input>
                    </ListItem>
                    <ListItem
                      title="Chunk size"
                      subTitle="How large should the embedded text fragments be?"
                    >
                      <InputRange
                        title="1000"
                        value={1000}
                        min="0"
                        max="5000"
                        step="10"
                        onChange={() => {}}
                      ></InputRange>
                    </ListItem>
                    <ListItem
                      title="Overlap"
                      subTitle="Should the chunks overlap, and by how much?"
                    >
                      <InputRange
                        title="0"
                        value={0}
                        min="0"
                        max="1000"
                        step="1"
                        onChange={() => {}}
                      ></InputRange>
                    </ListItem>
                    <ListItem
                      title="Number of results"
                      subTitle="How many chunks should be used to supplement the prompts"
                    >
                      <InputRange
                        title="0"
                        value={0}
                        min="0"
                        max="1000"
                        step="1"
                        onChange={() => {}}
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
