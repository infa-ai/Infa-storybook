/**
 * Styled components for Panel and its sub-components
 */

import { styled } from "storybook/theming";

export const PanelContent = styled.div(({ theme }) => ({
  padding: "1.5rem",
  background: theme.background.content,
  minHeight: "200px",
}));

export const ViewToggleContainer = styled.div(({ theme }) => ({
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
  alignItems: "center",
}));

// Segmented control container for tab-like buttons
export const SegmentedControl = styled.div(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.base === "light"
    ? "rgba(0, 0, 0, 0.05)" // muted background for light theme
    : "rgba(255, 255, 255, 0.05)", // muted background for dark theme
  borderRadius: "8px",
  padding: "3px",
  height: "36px",
  width: "fit-content",
}));

export const ToggleButton = styled.button<{ active: boolean }>(
  ({ theme, active }) => ({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "calc(100% - 2px)",
    flex: 1,
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    border: "1px solid transparent",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

    // Active state
    background: active
      ? theme.background.content
      : "transparent",
    color: active
      ? theme.color.defaultText
      : theme.color.mediumdark,
    boxShadow: active
      ? theme.base === "light"
        ? "0 1px 2px rgba(0, 0, 0, 0.05)"
        : "0 1px 2px rgba(0, 0, 0, 0.2)"
      : "none",
    borderColor: active
      ? theme.base === "light"
        ? "rgba(0, 0, 0, 0.06)"
        : theme.color.border
      : "transparent",

    // Disabled state
    "&:disabled": {
      pointerEvents: "none",
      opacity: 0.5,
    },

    // Hover state (only for inactive buttons)
    "&:hover:not(:disabled)": {
      color: active ? theme.color.defaultText : theme.color.lightest,
    },

    // Focus visible state
    "&:focus-visible": {
      outline: `2px solid ${theme.color.secondary}`,
      outlineOffset: "2px",
    },
  }),
);

export const ComponentSection = styled.div({
  marginBottom: "2rem",
});

export const ComponentHeaderWrapper = styled.div(({ theme }) => ({
  marginBottom: "1rem",
  paddingBottom: "1rem",
  borderBottom: `1px solid ${theme.color.border}`,
}));

export const ComponentTitleRow = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.5rem",
});

export const ComponentTitle = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: "16px",
  fontWeight: 600,
  color: theme.color.defaultText,
  flex: 1,
}));

export const CollapseButton = styled.button(({ theme }) => ({
  background: "none",
  border: "none",
  padding: "0.25rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.color.mediumdark,
  borderRadius: "4px",
  transition: "all 0.2s ease",
  width: "24px",
  height: "24px",
  flexShrink: 0,
  "&:hover": {
    background: theme.background.hoverable,
    color: theme.color.defaultText,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.color.secondary}`,
    outlineOffset: "2px",
  },
  "& svg": {
    width: "16px",
    height: "16px",
  },
}));

export const ComponentDescription = styled.p(({ theme }) => ({
  margin: "0.5rem 0",
  fontSize: "13px",
  color: theme.color.defaultText,
  lineHeight: 1.5,
}));

export const ExternalLinksContainer = styled.div({
  display: "flex",
  gap: "1rem",
  marginTop: "0.75rem",
  flexWrap: "wrap",
});

export const ExternalLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontSize: "13px",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  "&:hover": {
    textDecoration: "underline",
  },
}));

export const ExternalLinkIcon = styled.span(({ theme }) => ({
  width: "16px",
  height: "16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  opacity: 0.7,
}));

export const LabelsContainer = styled.div({
  display: "flex",
  gap: "0.5rem",
  marginTop: "0.75rem",
  flexWrap: "wrap",
});

export const Label = styled.span<{ bgColor?: string }>(({ theme, bgColor }) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: 500,
  backgroundColor: bgColor || theme.color.mediumdark,
  color: "#fff",
}));

export const SectionTitleRow = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "1.5rem 0 0.75rem 0",
});

export const ControlsGroup = styled.div({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const SectionTitle = styled.h4(({ theme }) => ({
  margin: 0,
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
}));

export const ComponentViewsGrid = styled.div({
  display: "grid",
  alignContent: "start",
  gap: "1rem",
  // CSS custom properties for responsive column sizing
  "--column-gap": "12px",
  "--min-column-width": "300px",
  "--max-column-count": "3",
  "--total-gap-width": "calc((var(--max-column-count) - 1) * var(--column-gap))",
  "--max-column-width": "calc((100% - var(--total-gap-width)) / var(--max-column-count))",
  gridTemplateColumns: "repeat(auto-fill, minmax(max(var(--min-column-width), var(--max-column-width)), 1fr))",

  // Responsive adjustments
  "@media (min-width: 720px)": {
    "--column-gap": "16px",
  },
  "@media (min-width: 840px)": {
    "--min-column-width": "360px",
  },
  "@media (min-width: 1280px)": {
    "--min-column-width": "394px",
  },
});

export const ComponentViewCardWrapper = styled.div(({ theme }) => ({
  padding: 0,
  background: theme.background.bar,
  borderRadius: "4px",
}));

export const PageUrl = styled.div(({ theme }) => ({
  fontSize: "12px",
  color: theme.color.mediumdark,
  fontFamily: "monospace",
  fontWeight: 500,
}));

export const ViewCardTitle = styled.h5(({ theme }) => ({
  margin: 0,
  fontSize: "13px",
  fontWeight: 600,
  color: theme.color.defaultText,
}));

export const XPathContainer = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "6px",
  gap: "0.5rem",
});

export const XPathText = styled.span(({ theme }) => ({
  fontSize: "11px",
  fontFamily: "monospace",
  color: theme.color.mediumdark,
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

export const XPathArrowButton = styled.a(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  textDecoration: "none",
  flexShrink: 0,
  padding: "0.5rem",
  borderRadius: "4px",
  background: theme.color.secondary,
  transition: "all 0.2s ease",
  minWidth: "32px",
  minHeight: "32px",
  "&:hover": {
    background: theme.color.darker,
    transform: "scale(1.05)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  "& svg": {
    width: "16px",
    height: "16px",
  },
}));

export const Screenshot = styled.img(({ theme }) => ({
  width: "100%",
  maxHeight: "200px",
  objectFit: "cover",
  borderRadius: "4px",
  marginBottom: "0.75rem",
  display: "block",
}));

export const CodeCapture = styled.pre(({ theme }) => ({
  margin: "0.75rem 0",
  padding: "0.75rem",
  background: theme.background.app,
  borderRadius: "8px",
  fontSize: "11px",
  fontFamily: "monospace",
  overflow: "auto",
  maxHeight: "100px",
  lineHeight: 1.4,
  color: theme.color.defaultText,
}));

export const UrlDisplay = styled.a(({ theme }) => ({
  fontSize: "12px",
  color: theme.color.mediumdark,
  textDecoration: "none",
  transition: "color 0.2s ease",
  "&:hover": {
    color: theme.color.secondary,
    textDecoration: "underline",
  },
}));

export const ViewInPageButton = styled.a(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.5rem 0.75rem",
  background: theme.color.mediumdark,
  color: theme.color.lightest,
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.2s ease",
  "&:hover": {
    background: theme.color.darker,
  },
}));

export const ViewMoreButton = styled.button(({ theme }) => ({
  padding: "0.75rem",
  width: "100%",
  border: `1px solid ${theme.color.border}`,
  background: "transparent",
  color: theme.color.defaultText,
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "0.5rem",
  transition: "all 0.2s ease",
  "&:hover": {
    background: theme.background.hoverable,
  },
}));

export const DomainSection = styled.div({
  marginBottom: "2rem",
});

export const DomainHeader = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1rem",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
  paddingBottom: "0.5rem",
  borderBottom: `1px solid ${theme.color.border}`,
}));

export const PageSection = styled.div(({ theme }) => ({
  marginBottom: "1.5rem",
  paddingLeft: "1rem",
  borderLeft: `2px solid ${theme.color.border}`,
}));


export const EmptyStateWrapper = styled.div(({ theme }) => ({
  textAlign: "center",
  padding: "3rem 2rem",
  color: theme.color.mediumdark,
}));

export const EmptyStateTitle = styled.h3(({ theme }) => ({
  margin: "0 0 0.5rem 0",
  fontSize: "16px",
  color: theme.color.defaultText,
}));

export const EmptyStateText = styled.p(({ theme }) => ({
  margin: "0.5rem 0",
  fontSize: "14px",
  lineHeight: 1.6,
}));

export const CodeExample = styled.pre(({ theme }) => ({
  marginTop: "1rem",
  padding: "1rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "12px",
  textAlign: "left",
  overflow: "auto",
  maxWidth: "600px",
  margin: "1rem auto",
}));

export const DocsLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
}));

export const FooterWrapper = styled.div(({ theme }) => ({
  marginTop: "2rem",
  paddingTop: "1rem",
  textAlign: "left",
}));

export const SyncStatusContainer = styled.div({
  marginBottom: "1rem",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
});

export const SyncStatusText = styled.p(({ theme }) => ({
  margin: 0,
  fontSize: "13px",
  color: theme.color.mediumdark,
}));

export const SyncButton = styled.button(({ theme }) => ({
  padding: "0.5rem 1rem",
  border: `1px solid ${theme.color.border}`,
  background: "transparent",
  color: theme.color.defaultText,
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  outline: "none",
  "&:hover": {
    background: theme.background.hoverable,
    borderColor: theme.color.secondary,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.color.secondary}`,
    outlineOffset: "2px",
  },
}));

export const FooterTip = styled.p(({ theme }) => ({
  margin: 0,
  marginBottom: "1rem",
  fontSize: "13px",
  color: theme.color.mediumdark,
  lineHeight: 1.5,
}));

export const FooterText = styled.p(({ theme }) => ({
  margin: 0,
  fontSize: "12px",
  color: theme.color.mediumdark,
}));

export const FooterLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
}));

export const ViewMoreTextButton = styled.button(({ theme }) => ({
  background: "none",
  border: "none",
  color: theme.color.tertiary,
  cursor: "pointer",
  fontSize: "12px",
  padding: "0.25rem 0",
  marginTop: "0.15rem",
  fontWeight: 500,
  opacity: 0.8,
  transition: "opacity 0.2s ease",
  "&:hover": {
    opacity: 1,
  },
}));

export const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>(
  ({ theme, variant = "secondary" }) => ({
    padding: "0.5rem 1rem",
    border: variant === "primary" ? "none" : `1px solid ${theme.color.border}`,
    background: variant === "primary" ? theme.color.secondary : "transparent",
    color: variant === "primary" ? "#fff" : theme.color.defaultText,
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover:not(:disabled)": {
      background: variant === "primary" ? theme.color.darker : theme.background.hoverable,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),
);

export const ButtonGroup = styled.div({
  display: "flex",
  gap: "0.5rem",
  marginLeft: "auto",
});

export const ModalOverlay = styled.div({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
});

export const ModalContent = styled.div(({ theme }) => ({
  background: theme.background.content,
  borderRadius: "8px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
}));

export const ModalHeader = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.5rem",
  borderBottom: `1px solid ${theme.color.border}`,
}));

export const ModalTitle = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: "18px",
  fontWeight: 600,
  color: theme.color.defaultText,
}));

export const ModalCloseButton = styled.button(({ theme }) => ({
  background: "none",
  border: "none",
  fontSize: "28px",
  lineHeight: 1,
  cursor: "pointer",
  color: theme.color.mediumdark,
  padding: 0,
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  transition: "all 0.2s ease",
  "&:hover": {
    background: theme.background.hoverable,
    color: theme.color.defaultText,
  },
}));

export const ModalBody = styled.div({
  padding: "1.5rem",
});

export const ModalSection = styled.div({
  marginBottom: "1.5rem",
  "& h4": {
    margin: "0 0 0.75rem 0",
    fontSize: "14px",
    fontWeight: 600,
  },
  "& p": {
    margin: "0.5rem 0",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  "&:last-child": {
    marginBottom: 0,
  },
});

export const ModalCode = styled.code(({ theme }) => ({
  display: "block",
  padding: "0.75rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "13px",
  fontFamily: "monospace",
  color: theme.color.defaultText,
  marginTop: "0.5rem",
}));

export const ModalLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
}));

// CodePreview styles - adapted from original CodePreview.scss
export const CodePreviewWrapper = styled.div(({ theme }) => ({
  position: "relative",
  width: "100%",
  "&:hover button": {
    opacity: 1,
    backgroundColor: theme.background.hoverable,
  },
}));

export const CodePreviewPre = styled.pre<{ className?: string }>(
  ({ theme }) => ({
    backgroundColor: theme.background.app,
    padding: "0.5rem 1rem 0.5rem",
    borderRadius: "4px",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordBreak: "break-all",
    maxWidth: "100%",
    width: "100%",
    boxSizing: "border-box",
    overflowX: "auto",
    overflowY: "auto",
    position: "relative",
    maxHeight: "360px",
    margin: 0,
    fontSize: "11px",
    fontFamily: "monospace",
    "&.collapsed": {
      height: "34px",
      overflow: "hidden",
      cursor: "pointer",
      position: "relative",
      backgroundColor: theme.background.app,
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "16px",
        background: `linear-gradient(to bottom, transparent, ${theme.background.app})`,
        pointerEvents: "none",
        opacity: 1,
        transition: "opacity 0.2s",
      },
      "&:hover": {
        backgroundColor: theme.background.app,
        transition: "background-color 0.2s",
        "&::after": {
          opacity: 0,
          transition: "opacity 0.2s",
        },
      },
    },
  })
);

export const CodePreviewCode = styled.code(({ theme }) => ({
  color: theme.color.defaultText,
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  overflowWrap: "break-word",
  wordBreak: "break-all",
  whiteSpace: "pre-wrap",
  fontSize: "11px",
  fontFamily: "monospace",
  "& .html-tag": {
    color: theme.base === "light" ? "#24a148" : "#42be65", // success color
  },
  "& .html-attribute": {
    color: theme.base === "light" ? "#f1c21b" : "#f1c21b", // warning color
  },
  "& .html-value": {
    color: theme.color.secondary,
  },
  "& .code-navigation-button": {
    display: "inline-flex",
    position: "relative",
    padding: "4px 4px !important",
    alignItems: "center",
    gap: "4px",
    borderRadius: "4px",
    backgroundColor: theme.background.bar,
    border: `1px solid ${theme.color.border}`,
    verticalAlign: "middle",
    cursor: "pointer",
    marginTop: "-2px",
    "&:hover": {
      backgroundColor: theme.background.hoverable,
      borderColor: theme.color.secondary,
      "& path": {
        fill: theme.color.defaultText,
      },
    },
  },
}));

export const ExpandCollapseButton = styled.button(({ theme }) => ({
  position: "absolute",
  top: "5px",
  right: "5px",
  backgroundColor: "transparent",
  borderRadius: "4px",
  width: "24px",
  height: "24px",
  padding: "4px",
  opacity: 0.7,
  transition: "opacity 0.15s, background-color 0.2s",
  cursor: "pointer",
  zIndex: 20,
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.color.defaultText,
  "&:hover": {
    opacity: 1,
    backgroundColor: theme.background.hoverable,
  },
  "& svg": {
    transformOrigin: "center",
    transition: "transform 0.2s",
    width: "16px",
    height: "16px",
  },
  "&.expanded svg": {
    transform: "rotate(180deg)",
  },
}));

// GroupBy dropdown styles
export const GroupByDropdown = styled.div({
  position: "relative",
});

export const GroupByButton = styled.button(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.375rem 0.75rem",
  fontSize: "12px",
  fontWeight: 500,
  border: `1px solid ${theme.color.border}`,
  background: "transparent",
  color: theme.color.defaultText,
  borderRadius: "4px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    background: theme.background.hoverable,
    borderColor: theme.color.secondary,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.color.secondary}`,
    outlineOffset: "2px",
  },
  "& svg": {
    transition: "transform 0.2s ease",
  },
}));

export const GroupByMenu = styled.div(({ theme }) => ({
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  minWidth: "180px",
  background: theme.background.content,
  border: `1px solid ${theme.color.border}`,
  borderRadius: "4px",
  boxShadow: theme.base === "light"
    ? "0 4px 12px rgba(0, 0, 0, 0.1)"
    : "0 4px 12px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
  overflow: "hidden",
}));

export const GroupByMenuItem = styled.button<{ active?: boolean }>(
  ({ theme, active }) => ({
    display: "block",
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "12px",
    textAlign: "left",
    background: active ? theme.background.hoverable : "transparent",
    color: active ? theme.color.defaultText : theme.color.mediumdark,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: theme.background.hoverable,
      color: theme.color.defaultText,
    },
    "&:first-child": {
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
    },
    "&:last-child": {
      borderBottomLeftRadius: "4px",
      borderBottomRightRadius: "4px",
    },
  })
);

// Group header styles for domain/page grouping
export const GroupHeader = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.5rem",
}));

export const GroupHeaderButton = styled.button(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  padding: "0.25rem",
  cursor: "pointer",
  color: theme.color.mediumdark,
  borderRadius: "4px",
  transition: "all 0.2s ease",
  width: "20px",
  height: "20px",
  flexShrink: 0,
  "&:hover": {
    background: theme.background.hoverable,
    color: theme.color.defaultText,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.color.secondary}`,
    outlineOffset: "2px",
  },
  "& svg": {
    width: "12px",
    height: "12px",
  },
}));

export const GroupHeaderTitle = styled.span<{ isPage?: boolean }>(
  ({ theme, isPage }) => ({
    flex: 1,
    fontSize: "13px",
    fontWeight: 600,
    color: theme.color.defaultText,
    fontFamily: isPage ? "monospace" : "inherit",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  })
);

export const GroupContent = styled.div({
  marginTop: "0.5rem",
});

export const PageInfoContainer = styled.div(({ theme }) => ({
  display: "flex",
  gap: "1rem",
  marginBottom: "1rem",
  padding: "0.75rem",
  background: theme.base === "light"
    ? "rgba(0, 0, 0, 0.02)"
    : "rgba(255, 255, 255, 0.02)",
  borderRadius: "6px",
}));

export const PageInfoImage = styled.img({
  width: "128px",
  height: "auto",
  borderRadius: "4px",
  objectFit: "cover",
  flexShrink: 0,
});

export const PageInfoContent = styled.div({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const PageInfoLabel = styled.div(({ theme }) => ({
  fontSize: "11px",
  fontWeight: 600,
  color: theme.color.mediumdark,
  marginBottom: "0.25rem",
}));

export const PageInfoUrl = styled.div(({ theme }) => ({
  fontSize: "12px",
  fontFamily: "monospace",
  color: theme.color.defaultText,
  wordBreak: "break-all",
}));

