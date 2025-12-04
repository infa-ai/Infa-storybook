/**
 * CodePreview component - Displays HTML code with syntax highlighting and expand/collapse
 * Adapted from Infa chrome extension CodePreview component
 */

import React, { useState } from "react";
import { ChevronDownIcon } from "@storybook/icons";
import {
  CodePreviewWrapper,
  CodePreviewPre,
  CodePreviewCode,
  ExpandCollapseButton,
  HtmlTag,
  HtmlAttribute,
  HtmlValue,
} from "./styles";

interface HTMLCode {
  parent?: string;
  selected: string;
  child?: string;
}

interface CodePreviewProps {
  htmlCode: HTMLCode;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  defaultCollapsed?: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  htmlCode,
  onNavigateUp,
  onNavigateDown,
  defaultCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const highlightHtml = (html: string): string => {
    if (!html || typeof html !== "string") {
      return "";
    }
    // Escape HTML special characters
    let escapedHtml = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Highlight HTML tags
    escapedHtml = escapedHtml.replace(
      /(?<=&lt;)(\/?\w+)/g,
      (match) => `<span class="html-tag">${match}</span>`
    );

    // Highlight HTML attributes
    escapedHtml = escapedHtml.replace(
      /\b[\w-]+(?==&quot;)/g,
      (match) => `<span class="html-attribute">${match}</span>`
    );

    // Highlight HTML values
    escapedHtml = escapedHtml.replace(
      /&quot;(.*?)&quot;/g,
      (match, p1) => `"<span class="html-value">${p1}</span>"`
    );

    return escapedHtml;
  };

  const createMarkup = (htmlCodeObj: HTMLCode) => {
    // Safety check for htmlCodeObj
    if (!htmlCodeObj || typeof htmlCodeObj !== "object") {
      return { __html: "<!-- Invalid HTML code object -->" };
    }

    let content = "";

    // Add navigation up button if available
    if (htmlCodeObj.parent && onNavigateUp) {
      content += `<span class="code-navigation-button" data-action="navigate-up" style="margin-right: 4px;" title="Go to Parent Element">
                <svg width="12" height="6" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.70703 1.70703L4.41406 5H19C20.7272 5 22.2443 5.58019 23.332 6.66797C24.4198 7.75575 25 9.27275 25 11H23C23 9.72725 22.5802 8.74425 21.918 8.08203C21.2557 7.41981 20.2728 7 19 7H4.41406L7.70703 10.293L6.29297 11.707L0.585938 6L6.29297 0.292969L7.70703 1.70703Z" fill="#C6C6C6"/>
                </svg>
            </span>`;
    }

    // Add the highlighted HTML code
    content += highlightHtml(htmlCodeObj.selected);

    // Add navigation down button if available
    if (htmlCodeObj.child && onNavigateDown) {
      content += `<span class="code-navigation-button" data-action="navigate-down" style="margin-left: 4px;" title="Go to First Child Element">
                <svg width="12" height="6" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.8789 10L21.1719 6.70703L6.58594 6.70703C4.85869 6.70703 3.34169 6.12684 2.25391 5.03906C1.16613 3.95129 0.585937 2.43428 0.585937 0.707033L2.58594 0.707033C2.58594 1.97979 3.00575 2.96278 3.66797 3.625C4.33019 4.28722 5.31318 4.70703 6.58594 4.70703L21.1719 4.70703L17.8789 1.41406L19.293 4.98925e-07L25 5.70703L19.293 11.4141L17.8789 10Z" fill="#C6C6C6"/>
                </svg>
            </span>`;
    }

    return { __html: content };
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest("[data-action]") as HTMLElement;

    if (button) {
      e.stopPropagation();
      const action = button.getAttribute("data-action");
      if (action === "navigate-up" && onNavigateUp) {
        onNavigateUp();
      } else if (action === "navigate-down" && onNavigateDown) {
        onNavigateDown();
      }
    } else if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  // Safety check for htmlCode prop
  if (!htmlCode || typeof htmlCode !== "object") {
    return (
      <CodePreviewWrapper>
        <CodePreviewPre
          title="Selected Element HTML Structure Preview"
          className={isCollapsed ? "collapsed" : ""}
        >
          <CodePreviewCode style={{ opacity: "0.3" }}>
            Invalid code data provided
          </CodePreviewCode>
        </CodePreviewPre>
      </CodePreviewWrapper>
    );
  }

  return (
    <CodePreviewWrapper>
      {htmlCode.selected && (
        <ExpandCollapseButton
          className={!isCollapsed ? "expanded" : ""}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          title={isCollapsed ? "Expand code" : "Collapse code"}
        >
          <ChevronDownIcon />
        </ExpandCollapseButton>
      )}
      <CodePreviewPre
        title="Selected Element HTML Structure Preview"
        className={isCollapsed ? "collapsed" : ""}
        onClick={handleClick}
      >
        {htmlCode.selected ? (
          <CodePreviewCode dangerouslySetInnerHTML={createMarkup(htmlCode)} />
        ) : (
          <CodePreviewCode style={{ opacity: "0.3" }}>
            Element is not selected
          </CodePreviewCode>
        )}
      </CodePreviewPre>
    </CodePreviewWrapper>
  );
};


