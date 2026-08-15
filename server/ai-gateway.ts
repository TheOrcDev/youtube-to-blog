import { BlogWorkflowError } from "./blog-errors.ts";

interface AiGatewayEnvironment {
  apiKey?: string;
  oidcToken?: string;
}

export function assertAiGatewayConfiguration({
  apiKey,
  oidcToken,
}: AiGatewayEnvironment): void {
  if (apiKey) {
    if (!apiKey.startsWith("vck_")) {
      throw new BlogWorkflowError("AI_NOT_CONFIGURED");
    }

    return;
  }

  if (!oidcToken) {
    throw new BlogWorkflowError("AI_NOT_CONFIGURED");
  }
}
