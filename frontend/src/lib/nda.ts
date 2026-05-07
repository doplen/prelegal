export type PartyValues = {
  printName: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
};

export type MutualNdaValues = {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "fixed" | "perpetual";
  mndaTermYears: string;
  confidentialityTermType: "fixed" | "perpetual";
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  party1: PartyValues;
  party2: PartyValues;
};

export const initialMutualNdaValues: MutualNdaValues = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermType: "fixed",
  mndaTermYears: "1",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  party1: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
  party2: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
};

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

function fillCoverPage(template: string, v: MutualNdaValues): string {
  let out = template;

  out = out.replace(
    "[Evaluating whether to enter into a business relationship with the other party.]",
    v.purpose.trim() || "[Purpose not provided]",
  );

  out = out.replace("[Today’s date]", v.effectiveDate.trim() || "[Effective date not provided]");

  const mndaTermYears = v.mndaTermYears.trim() || "1";
  const oldMndaTerm =
    "- [x]     Expires [1 year(s)] from Effective Date.\n- [ ]     Continues until terminated in accordance with the terms of the MNDA.";
  const newMndaTerm =
    v.mndaTermType === "fixed"
      ? `- [x]     Expires ${mndaTermYears} year(s) from Effective Date.\n- [ ]     Continues until terminated in accordance with the terms of the MNDA.`
      : `- [ ]     Expires ___ year(s) from Effective Date.\n- [x]     Continues until terminated in accordance with the terms of the MNDA.`;
  out = out.replace(oldMndaTerm, newMndaTerm);

  const confTermYears = v.confidentialityTermYears.trim() || "1";
  const oldConfTerm =
    "- [x]     [1 year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.\n- [ ]     In perpetuity.";
  const newConfTerm =
    v.confidentialityTermType === "fixed"
      ? `- [x]     ${confTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.\n- [ ]     In perpetuity.`
      : `- [ ]     ___ year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.\n- [x]     In perpetuity.`;
  out = out.replace(oldConfTerm, newConfTerm);

  out = out.replace("[Fill in state]", v.governingLaw.trim() || "[State not provided]");
  out = out.replace(
    "[Fill in city or county and state, i.e. “courts located in New Castle, DE”]",
    v.jurisdiction.trim() || "[Jurisdiction not provided]",
  );

  const oldTable = `|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Signature | | |
| Print Name | |
| Title | | |
| Company | | |
| Notice Address <label>Use either email or postal address</label> | | |
| Date | | |`;

  const p1 = v.party1;
  const p2 = v.party2;
  const newTable = `|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Signature | | |
| Print Name | ${escapeCell(p1.printName)} | ${escapeCell(p2.printName)} |
| Title | ${escapeCell(p1.title)} | ${escapeCell(p2.title)} |
| Company | ${escapeCell(p1.company)} | ${escapeCell(p2.company)} |
| Notice Address | ${escapeCell(p1.noticeAddress)} | ${escapeCell(p2.noticeAddress)} |
| Date | ${escapeCell(p1.date)} | ${escapeCell(p2.date)} |`;

  out = out.replace(oldTable, newTable);

  return out;
}

function cleanStandardTerms(template: string): string {
  return template.replace(/<span class="coverpage_link">([^<]+)<\/span>/g, "$1");
}

export function buildMutualNda(
  coverPage: string,
  standardTerms: string,
  values: MutualNdaValues,
): string {
  return `${fillCoverPage(coverPage, values)}\n\n---\n\n${cleanStandardTerms(standardTerms)}`;
}
