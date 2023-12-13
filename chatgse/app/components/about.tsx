import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./about.module.scss";

import CloseIcon from "../icons/close.svg";

import Locale, {  } from "../locales";
import { useNavigate } from "react-router-dom";


export function AboutPage() {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className={styles['about-page']}>
            <div className="window-header">
                <div className="window-header-title">
                    <div className="window-header-main-title">
                        {Locale.About.Page.Title}
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
            <div className={styles['about-page-body']}>
                <div>
                    <div>
                        <p>
                            {Locale.About.Page.Heading1}
                        </p>
                    </div>
                    <div>
                        <p>
                            {Locale.About.Page.ListTitle}
                            <ul>
                                {Locale.About.Page.ListItems.map((listItem, index) => (
                                    <li key={index}>
                                        {listItem}
                                    </li>
                                ))}
                            </ul>
                        </p>
                    </div>
                </div>
                <div>
                    <h2 className={styles['about-page-title']}>
                        {Locale.About.Page.Heading2}
                    </h2>
                    <div>
                        <p>{Locale.About.Page.Models}</p>
                    </div>
                </div>
            </div>
        </div>
    </ErrorBoundary>
  );
}
