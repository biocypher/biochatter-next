import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./welcome.module.scss";
import { MarkdownContent } from "./markdown";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { showConfirm } from "./ui-lib";
import { useAppConfig, useUpdateStore } from "../store";

import React, { useState } from 'react';

export function Welcome() {
  const config = useAppConfig();
  const navigate = useNavigate();

  const updateStore = useUpdateStore();

  const [currentWhatMessageIndex, setCurrentWhatMessageIndex] = useState(0);
  const [currentHowMessageIndex, setCurrentHowMessageIndex] = useState(0);

  const handleWhatClick = () => {
    setCurrentWhatMessageIndex((prevIndex) => (prevIndex + 1) % Locale.Welcome.Page.WhatMessages.length);
  };

  const handleHowClick = () => {
    setCurrentHowMessageIndex((prevIndex) => (prevIndex + 1) % Locale.Welcome.Page.HowMessages.length);
  };

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
            <MarkdownContent content={Locale.Welcome.Page.About.Models} />
            <p>
              <MarkdownContent content={Locale.Welcome.Page.About.Citation} />
            </p>
          </section>
          <section>
            <div className={styles["what-how-messages"]}>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{Locale.Welcome.Page.What}</h2>
                <div className={styles["message-list"]} onClick={handleWhatClick}>
                  <div className={styles["message-text"]}>
                    <MarkdownContent content={Locale.Welcome.Page.WhatMessages[currentWhatMessageIndex]} />
                  </div>
                </div>
              </div>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{Locale.Welcome.Page.How}</h2>
                <div className={styles["message-list"]} onClick={handleHowClick}>
                  <div className={styles["message-text"]}>
                    <MarkdownContent content={Locale.Welcome.Page.HowMessages[currentHowMessageIndex]} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={styles["version-info"]}>
            <MarkdownContent content={Locale.Welcome.Page.VersionInfo(updateStore.version)} />
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
}