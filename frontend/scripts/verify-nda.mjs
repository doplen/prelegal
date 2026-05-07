// Smoke test: builds the NDA with sample values, prints key markers.
// Run with: node --experimental-strip-types scripts/verify-nda.mjs
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildMutualNda, initialMutualNdaValues } from "../src/lib/nda.ts";

const repoRoot = path.resolve("..");
const coverPage = (await fs.readFile(path.join(repoRoot, "templates", "Mutual-NDA-coverpage.md"), "utf-8")).replace(/\r\n/g, "\n");
const standardTerms = (await fs.readFile(path.join(repoRoot, "templates", "Mutual-NDA.md"), "utf-8")).replace(/\r\n/g, "\n");

const values = {
  ...initialMutualNdaValues,
  effectiveDate: "2026-05-07",
  governingLaw: "Delaware",
  jurisdiction: "courts located in New Castle, DE",
  party1: { printName: "Alice Smith", title: "CEO", company: "Acme Inc", noticeAddress: "alice@acme.com", date: "2026-05-07" },
  party2: { printName: "Bob Jones", title: "CTO", company: "Beta LLC", noticeAddress: "bob@beta.com", date: "2026-05-07" },
};

const out = buildMutualNda(coverPage, standardTerms, values);

const checks = {
  "purpose substituted": out.includes("Evaluating whether to enter into a business relationship with the other party.") && !out.includes("[Evaluating"),
  "effective date substituted": out.includes("2026-05-07") && !out.includes("[Today"),
  "MNDA term filled": out.includes("Expires 1 year(s) from Effective Date"),
  "governing law substituted": !out.includes("[Fill in state]") && out.includes("Delaware"),
  "jurisdiction substituted": !out.includes("[Fill in city or county"),
  "table filled with party 1": out.includes("Alice Smith") && out.includes("Acme Inc"),
  "table filled with party 2": out.includes("Bob Jones") && out.includes("Beta LLC"),
  "spans stripped from standard terms": !out.includes('<span class="coverpage_link">'),
  "standard terms still reference Purpose": out.includes("for the Purpose"),
};

let fail = 0;
for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) fail++;
}
console.log(`\n${Object.keys(checks).length - fail} / ${Object.keys(checks).length} passed`);
process.exit(fail === 0 ? 0 : 1);
