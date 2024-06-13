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
        {props.contexts.map((ctx, ix) => (
          ctx.context.length === 0 ? (<></>) : (
            <div key={`context-item-${ix}`} className={styles["rag-mode"]}>{`${Locale.RagContext.ModeType}: ${ctx.mode}`}
              {ctx.context.map(ctxItem => (
                (ctx.mode === "kg") ? (
                  <>
                    <div className={styles["rag-context-kg-item"]}>{ctxItem[0]}</div>
                    <div className={styles["rag-context-kg-meta"]}>{`cypher_query: ${ctxItem[1].cypher_query}`}</div>
                  </>
                ) : (
                  <>
                    <div className={styles["rag-context-vs-item"]}>{ctxItem[0]}</div> 
                    <div className={styles["rag-context-vs-meta"]}>{` source: ${ctxItem[1].source}`}</div>
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



