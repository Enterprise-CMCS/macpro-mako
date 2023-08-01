import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "@cmsgov/design-system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

import { useAppContext } from "../../lib/context/contextLib";

export const TITLE_BAR_ID = "title_bar";

/**
 * PageTitleBar contains supplemental information for the user in the form of a title (usually describes the page).
 * If a enableBackNav prop is present/set to true, the title bar will display with a light theme instead of the default dark theme.
 * @param {Component} [rightSideContent] - (optional) content to render on the right hand side of the title bar, such as a Button
 * @param {String} [heading] - (optional) text to display in the title bar
 * @param {Boolean} [enableBackNav] - (optional) enables the back button on the title bar (also enables the light theme styling)
 * @param {String} [backNavConfirmationMessage] - (optional) message to display in browser confirmation window when back nav button is clicked
 */
const PageTitleBar = ({
  heading,
  rightSideContent,
  enableBackNav,
  backTo,
  backNavConfirmationMessage,
}) => {
  const history = useHistory();
  const { confirmAction } = useAppContext() ?? {};

  const handleTravel = () => (backTo ? history.push(backTo) : history.goBack());

  return (
    <div
      id={TITLE_BAR_ID}
      className={classNames("page-title-bar", {
        "title-bar-light-theme": enableBackNav,
        "title-bar-dark-theme": !enableBackNav,
      })}
    >
      <div className="header-wrapper">
        <div className="title-bar-left-content">
          {enableBackNav && (
            <Button
              aria-label="Back to previous page"
              id="back-button"
              data-testid="back-button"
              className="title-bar-back-button"
              onClick={() =>
                backNavConfirmationMessage
                  ? confirmAction &&
                    confirmAction(
                      "Leave this page?",
                      "Leave Anyway",
                      "Stay on Page",
                      backNavConfirmationMessage,
                      handleTravel
                    )
                  : handleTravel()
              }
              variation="transparent"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="title-bar-back-arrow"
              />
            </Button>
          )}
          <h1>{heading}</h1>
        </div>
        {rightSideContent}
      </div>
    </div>
  );
};

export default PageTitleBar;
