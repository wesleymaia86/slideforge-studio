/**
 * Worker entrypoint — BullMQ processor bootstrap.
 * Full processor implementations to be provided by worker agent.
 */
async function main() {
  // TODO(worker-agent): Register queue processors for:
  //   - file-parsing: extract content from uploaded PPTX/PDF/DOCX
  //   - ai-pipeline: run AI enrichment on parsed artifacts
  //   - export: generate output files (PPTX, PDF, PNG)
  //   - notifications: send email/webhook notifications
  console.info("SlideForge Worker starting — awaiting full implementation");
}

void main();
