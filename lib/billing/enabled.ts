// Self-hosted deployments run without Creem credentials: billing UI hides and
// generation quotas are lifted entirely.
export function isBillingEnabled(): boolean {
  return Boolean(process.env.CREEM_API_KEY);
}
