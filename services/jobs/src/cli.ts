import * as githubResync from "./githubResync";
import * as analyticsRollup from "./analyticsRollup";
import * as paymentReconcile from "./paymentReconcile";

const jobs: Record<string, { run: () => Promise<void> }> = {
  "github-resync": githubResync,
  "analytics-rollup": analyticsRollup,
  "payment-reconcile": paymentReconcile,
};

const jobName = process.argv[2];
const job = jobName ? jobs[jobName] : undefined;

if (!job) {
  console.error(`Usage: node cli.js <${Object.keys(jobs).join("|")}>`);
  process.exit(1);
}

job
  .run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`[${jobName}] failed:`, err);
    process.exit(1);
  });
