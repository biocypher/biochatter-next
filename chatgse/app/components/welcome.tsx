import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./welcome.module.scss";
import { MarkdownContent } from "./markdown";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { showConfirm } from "./ui-lib";
import { useAppConfig } from "../store";

export function Welcome() {
  const config = useAppConfig();
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className={styles["welcome-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Welcome.Page.Title}
            </div>
          </div>
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
              text={Locale.Welcome.Page.NotShow}
              onClick={async () => {
                if (await showConfirm(Locale.NewChat.ConfirmNoShow)) {
                  config.update(
                    (config) => (config.dontShowWelcomeSplashScreen = true),
                  );
                  navigate(Path.NewChat)
                }
              }} />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => { navigate(Path.NewChat) }}
              />
            </div>
          </div>
        </div>
        <div className={styles["welcome-page-body"]}>
          <section>
            <p>
              <MarkdownContent content={Locale.Welcome.Page.About.Heading1}/>
            </p>
            <div className={styles["what-how-messages"]}>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{Locale.Welcome.Page.What}</h2>
                <div className={styles["message-list"]}>
                  {Locale.Welcome.Page.WhatMessages.map((message, messageIndex) => (
                    <div key={messageIndex} className={styles["message-text"]}>
                      <MarkdownContent content={message}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{Locale.Welcome.Page.How}</h2>
                <div className={styles["message-list"]}>
                  {Locale.Welcome.Page.HowMessages.map((message, messageIndex) => (
                    <div key={messageIndex} className={styles["message-text"]}>
                      <MarkdownContent content={message}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className={styles["alert"]}>
              <MarkdownContent content={Locale.Welcome.Page.Disclaimer} />
            </div>
            <h2>About</h2>
            <div>
              <p>
                {Locale.Welcome.Page.About.ListTitle}
                <ul>
                  {Locale.Welcome.Page.About.ListItems.map((listItem, index) => (
                    <li key={index}>
                      {listItem}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
            <h2>{Locale.Welcome.Page.About.Heading2}</h2>
            <MarkdownContent content={Locale.Welcome.Page.About.Models}/>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
}