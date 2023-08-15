import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@cmsgov/design-system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  backTo
}: any) => {
  const navigate = useNavigate();

  const handleTravel = () => (backTo ? navigate(backTo) : navigate(-1));

  return (
    <div
      id={TITLE_BAR_ID}
      className={ "page-title-bar title-bar-light-theme" }
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
                handleTravel()
              }
              variation="transparent"
            >
              <FontAwesomeIcon
                //icon={faChevronLeft}
                icon={("chevron-left")}
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
