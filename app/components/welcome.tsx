import { ErrorBoundary } from "./error";
import Locale from "../locales";

import styles from "./welcome.module.scss";
import { MarkdownContent } from "./markdown";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { showConfirm } from "./ui-lib";
import { useAppConfig, useUpdateStore, useAccessStore } from "../store";

import React, { useState, useEffect } from 'react';
import { ProductionInfo } from "../utils/datatypes";

export function Welcome() {
  const config = useAppConfig();
  const navigate = useNavigate();

  const updateStore = useUpdateStore();
  const accessStore = useAccessStore();
  const customProduct = accessStore.customProduct;
  const prodInfo = accessStore.productionInfo === "undefined" ? 
    undefined : 
    (JSON.parse(accessStore.productionInfo) as any) as ProductionInfo;
  const welcome = prodInfo?.Text.Welcome ?? Locale.Welcome.Page;

  const what = customProduct ?
    prodInfo?.Text.Welcome.What :
    prodInfo?.Text.Welcome.What ?? Locale.Welcome.Page.What;
  const whatMessages = prodInfo?.Text.Welcome.WhatMessages ?? Locale.Welcome.Page.WhatMessages;
  const how = customProduct ? 
    prodInfo?.Text.Welcome.How : 
    prodInfo?.Text.Welcome.How ?? Locale.Welcome.Page.How;
  const howMessages = prodInfo?.Text.Welcome.HowMessages ?? Locale.Welcome.Page.HowMessages;
  const about = prodInfo?.Text.Welcome.About ?? Locale.Welcome.Page.About;


  function checkUpdate(force = false) {
    updateStore.getLatestVersion(force).then(() => {
      console.log("[Update] local version ", updateStore.version);
      console.log("[Update] remote version ", updateStore.remoteVersion);
    });
  }

  useEffect(() => {
    checkUpdate();
  }, []);

  const [currentWhatMessageIndex, setCurrentWhatMessageIndex] = useState(0);
  const [currentHowMessageIndex, setCurrentHowMessageIndex] = useState(0);

  const handleWhatClick = () => {
    setCurrentWhatMessageIndex((prevIndex) => (prevIndex + 1) % whatMessages.length);
  };

  const handleHowClick = () => {
    setCurrentHowMessageIndex((prevIndex) => (prevIndex + 1) % howMessages.length);
  };

  return (
    <ErrorBoundary>
      <div className={styles["welcome-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {welcome.Title}
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
              <MarkdownContent content={welcome.Disclaimer} />
            </div>
            <h2>About</h2>
            <div>
              <p>
                {about.ListTitle}
                <ul>
                  {about.ListItems.map((listItem: any, index: any) => (
                    <li key={index}>
                      {listItem}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
            <h2>{about.Heading2}</h2>
            <MarkdownContent content={about.Models} />
            <p>
              <MarkdownContent content={about.Citation} />
            </p>
          </section>
          {(how && what) && (<section>
            <div className={styles["what-how-messages"]}>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{what}</h2>
                <div className={styles["message-list"]} onClick={handleWhatClick}>
                  <div className={styles["message-text"]}>
                    <MarkdownContent content={whatMessages[currentWhatMessageIndex]} />
                  </div>
                </div>
              </div>
              <div className={styles["message-column"]}>
                <h2 className={styles["message-column-title"]}>{how}</h2>
                <div className={styles["message-list"]} onClick={handleHowClick}>
                  <div className={styles["message-text"]}>
                    <MarkdownContent content={howMessages[currentHowMessageIndex]} />
                  </div>
                </div>
              </div>
            </div>
          </section>)}
          <section className={styles["version-info"]}>
            <MarkdownContent content={Locale.Welcome.Page.VersionInfo(updateStore.version)} />
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
}