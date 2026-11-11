/**
 * CommandLine - a shell command to run, with a Copy button: how the panel
 * tells a person what fills a section it cannot fill itself.
 */

import React, { useState } from "react";
import { CommandCode, CommandCopyButton, CommandRow } from "./styles";

interface CommandLineProps {
  command: string;
  "data-testid"?: string;
}

export const CommandLine: React.FC<CommandLineProps> = ({ command, "data-testid": testId }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard refused (an insecure origin): the command stays selectable.
    }
  };
  return (
    <CommandRow data-testid={testId}>
      <CommandCode>{command}</CommandCode>
      <CommandCopyButton type="button" onClick={copy} title="Copy the command">
        {copied ? "Copied" : "Copy"}
      </CommandCopyButton>
    </CommandRow>
  );
};
