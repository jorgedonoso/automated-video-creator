import { select } from "@clack/prompts";
import { loadTemplates, main } from "./helpers/templateLogic.js";

// Load options, user selection and start edit.
async function run() {
  const availableTemplates = await loadTemplates();

  const templateSelected = await select({
    message: "Pick a template:",
    options: availableTemplates.map((t) => ({
      value: t,
      label: t.label,
      hint: t.hint,
    })),
  });

  await main(templateSelected);
}

run().catch(console.error);
