import { useNavigate } from "react-router-dom";
import { useRAGStore } from "../store/rag";
import { useChatStore } from "../store";
import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./rag.module.scss";

import CloseIcon from "../icons/close.svg";
import SettingsIcon from "../icons/rag-settings.svg";

import { IconButton } from "./button";


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

          <div className={styles["rag-content"]}>
            <div className={styles["rag-documents"]}>
                <SettingsIcon />
                <div>Documents</div>
            </div>
            <div className={styles["rag-settings"]}>
                settings
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}