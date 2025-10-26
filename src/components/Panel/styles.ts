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
  borderBottom: `1px solid ${theme.color.border}`,
  paddingBottom: "0.5rem",
}));

export const ToggleButton = styled.button<{ active: boolean }>(
  ({ theme, active }) => ({
    padding: "0.5rem 1rem",
    border: "none",
    background: active ? theme.color.secondary : "transparent",
    color: active ? "#fff" : theme.color.defaultText,
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: active ? theme.color.secondary : theme.background.hoverable,
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

export const ComponentTitle = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: "16px",
  fontWeight: 600,
  color: theme.color.defaultText,
  marginBottom: "0.5rem",
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

export const SectionTitle = styled.h4(({ theme }) => ({
  margin: "1.5rem 0 0.75rem 0",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
}));

export const ComponentViewsGrid = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const ComponentViewCardWrapper = styled.div(({ theme }) => ({
  padding: "1rem",
  background: theme.background.hoverable,
  borderRadius: "6px",
  border: `1px solid ${theme.color.border}`,
}));

export const ViewCardTitle = styled.h5(({ theme }) => ({
  margin: 0,
  fontSize: "13px",
  fontWeight: 600,
  color: theme.color.defaultText,
  marginBottom: "0.75rem",
}));

export const Screenshot = styled.img(({ theme }) => ({
  width: "100%",
  maxHeight: "200px",
  objectFit: "cover",
  borderRadius: "4px",
  border: `1px solid ${theme.color.border}`,
  marginBottom: "0.75rem",
  display: "block",
}));

export const CodeCapture = styled.pre(({ theme }) => ({
  margin: "0.75rem 0",
  padding: "0.75rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "11px",
  fontFamily: "monospace",
  overflow: "auto",
  maxHeight: "100px",
  lineHeight: 1.4,
  color: theme.color.defaultText,
}));

export const UrlDisplay = styled.div(({ theme }) => ({
  fontSize: "11px",
  color: theme.color.mediumdark,
  marginBottom: "0.75rem",
  wordBreak: "break-all",
}));

export const ViewInPageButton = styled.a(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.5rem 0.75rem",
  background: theme.color.secondary,
  color: "#fff",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.2s ease",
  "&:hover": {
    background: theme.color.secondary,
    opacity: 0.9,
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

export const PageUrl = styled.div(({ theme }) => ({
  fontSize: "12px",
  color: theme.color.mediumdark,
  marginBottom: "0.75rem",
  fontFamily: "monospace",
  fontWeight: 500,
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
