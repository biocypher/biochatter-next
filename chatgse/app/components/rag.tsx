import { useNavigate } from "react-router-dom";
import { useRAGStore } from "../store/rag";
import { useChatStore } from "../store";
import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./mask.module.scss";

import CloseIcon from "../icons/close.svg";

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
      </div>
    </ErrorBoundary>
  )
}