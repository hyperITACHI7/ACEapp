// pdf-parse ships no types and its default export shape varies by bundler; require() keeps it simple.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

export interface ParsedExperience {
  role: string;
  org: string;
  dates: string;
  description: string;
}

export interface ParsedResumeFields {
  name?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  experience?: ParsedExperience[];
}

const EMAIL_PATTERN = /[^\s]+@[^\s]+\.[a-z]{2,}/i;
const PHONE_PATTERN = /(\+?\d[\d\s().-]{7,}\d)/;
const SECTION_HEADERS = {
  experience: /^(experience|work experience|employment history)\s*$/i,
  skills: /^(skills|technical skills)\s*$/i,
  education: /^(education)\s*$/i,
};
const DATE_RANGE_PATTERN = /((19|20)\d{2})\s*[-–—to]+\s*((19|20)\d{2}|present|current)/i;

function stripPiiLines(lines: string[]): string[] {
  // Only headline/bio/experience/skills are ever mapped into the schema — email/phone/address
  // lines are dropped here so no contact/ID PII can end up in a publicly rendered field
  // (edge_case.md §1). PHONE_PATTERN is deliberately broad (any long digit run), which also
  // matches a "2021-2024" style year range — nearly every experience-entry line has one, so a
  // line is only treated as a phone number if it ISN'T also a date range.
  return lines.filter((line) => !EMAIL_PATTERN.test(line) && !(PHONE_PATTERN.test(line) && !DATE_RANGE_PATTERN.test(line)));
}

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = { header: [] };
  let current = "header";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const matchedKey = Object.entries(SECTION_HEADERS).find(([, re]) => re.test(line))?.[0];
    if (matchedKey) {
      current = matchedKey;
      sections[current] = sections[current] ?? [];
      continue;
    }
    sections[current] = sections[current] ?? [];
    sections[current].push(line);
  }
  return sections;
}

function parseSkills(lines: string[] | undefined): string[] {
  if (!lines || lines.length === 0) return [];
  return lines
    .join(", ")
    .split(/[,•|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 40);
}

function parseExperience(lines: string[] | undefined): ParsedExperience[] {
  if (!lines || lines.length === 0) return [];
  // Group consecutive lines into blocks, breaking on a line that looks like a new entry
  // (contains a date range) rather than assuming blank-line separation, since PDF text
  // extraction often collapses blank lines.
  const blocks: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (DATE_RANGE_PATTERN.test(line) && current.length > 0) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);

  return blocks.slice(0, 10).map((block) => {
    const dateLine = block.find((l) => DATE_RANGE_PATTERN.test(l)) ?? "";
    const dateMatch = dateLine.match(DATE_RANGE_PATTERN);
    const dates = dateMatch ? dateMatch[0] : "";
    const headerLine = block[0] ?? "";
    const [rolePart, orgPart] = headerLine.split(/ at | @ | - /i);
    return {
      role: (rolePart ?? headerLine).trim().slice(0, 100),
      org: (orgPart ?? "").trim().slice(0, 100),
      dates,
      description: block.slice(1).join(" ").slice(0, 500),
    };
  });
}

/**
 * Best-effort only: if extraction yields little/nothing, callers should treat the result as
 * "proceed to manual entry", never as an error (edge_case.md §1).
 */
export async function parseResume(buffer: Buffer): Promise<ParsedResumeFields> {
  let text: string;
  try {
    const result = await pdfParse(buffer);
    text = result.text ?? "";
  } catch {
    return {};
  }

  const rawLines = text.split("\n").map((l: string) => l.trim());
  const lines = stripPiiLines(rawLines.filter((l: string) => l.length > 0));
  if (lines.length === 0) return {};

  const sections = splitSections(lines);
  const headerLines = sections.header ?? [];

  const name = headerLines[0]?.slice(0, 100);
  const headline = headerLines[1]?.slice(0, 150);
  const bio = headerLines.slice(2, 6).join(" ").slice(0, 600) || undefined;

  return {
    name,
    headline,
    bio,
    skills: parseSkills(sections.skills),
    experience: parseExperience(sections.experience),
  };
}
