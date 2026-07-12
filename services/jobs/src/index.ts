import * as githubResync from "./githubResync";
import * as analyticsRollup from "./analyticsRollup";
import * as paymentReconcile from "./paymentReconcile";

export const jobs = {
  "github-resync": githubResync,
  "analytics-rollup": analyticsRollup,
  "payment-reconcile": paymentReconcile,
} as const;

export type JobName = keyof typeof jobs;
