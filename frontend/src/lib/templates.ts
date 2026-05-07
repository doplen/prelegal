import { promises as fs } from "node:fs";
import path from "node:path";

const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

export async function loadMutualNdaTemplates(): Promise<{
  coverPage: string;
  standardTerms: string;
}> {
  const [coverPage, standardTerms] = await Promise.all([
    fs.readFile(path.join(TEMPLATES_DIR, "Mutual-NDA-coverpage.md"), "utf-8"),
    fs.readFile(path.join(TEMPLATES_DIR, "Mutual-NDA.md"), "utf-8"),
  ]);
  return {
    coverPage: coverPage.replace(/\r\n/g, "\n"),
    standardTerms: standardTerms.replace(/\r\n/g, "\n"),
  };
}
