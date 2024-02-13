import { RagContext } from "../store"
import { Modal } from "./ui-lib"
import Locale from "../locales";

import styles from "./rag-contextual-prompts-modal.module.scss";

export function RagContextualPromptsModal(
    props: {
      onClose: () => void,
      contexts: Array<RagContext>,
    }
) {
  return (
    <div className="modal-mask">
      <Modal
        title={Locale.RagContext.Edit}
        onClose={props.onClose}
    >
      <>
        {props.contexts.map((ctx) => (
          ctx.context.length === 0 ? (<></>) : (
            <div className={styles["rag-mode"]}>{ctx.mode}
              {ctx.context.map(ctxItem => (
                (ctx.mode === "kg") ? (
                  <>
                    <div className={styles["rag-context-item"]}>{ctxItem[0]}</div>
                    <div className={styles["rag-context-meta"]}>{`cypher_query: ${ctxItem[1].cypher_query}`}</div>
                  </>
                ) : (
                  <>
                    <div className={styles["rag-context-item"]}>{ctxItem[0]}</div> 
                    <div className={styles["rag-context-meta"]}>{` source: ${ctxItem[1].source}`}</div>
                  </>
                )
              ))}
            </div>
          )
        ))}
      </>
    </Modal>
    </div>
  )
}



