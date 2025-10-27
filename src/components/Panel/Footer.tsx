/**
 * Footer component - Displays "Powered by Infa" with link to documentation
 */

import React from "react";
import { FooterWrapper, FooterText, FooterLink } from "./styles";

export const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <FooterText>
        Powered by{" "}
        <FooterLink
          href="https://infa.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Infa
        </FooterLink>
        {" · "}
        <FooterLink
          href="https://infa.ai/docs/integrations/index"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </FooterLink>
        {" · "}
        <FooterLink
          href="https://github.com/infa-ai/Infa-storybook"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </FooterLink>
      </FooterText>
    </FooterWrapper>
  );
};
