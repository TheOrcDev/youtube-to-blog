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
      throw new Error(
        "AI generation is not configured with a valid AI_GATEWAY_API_KEY. Create a Vercel AI Gateway key beginning with vck_, or remove the invalid key and configure VERCEL_OIDC_TOKEN."
      );
    }

    return;
  }

  if (!oidcToken) {
    throw new Error(
      "AI generation is not configured. Set AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN."
    );
  }
}
