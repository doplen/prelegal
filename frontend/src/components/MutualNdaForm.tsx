"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  buildMutualNda,
  initialMutualNdaValues,
  type MutualNdaValues,
  type PartyValues,
} from "@/lib/nda";

type Props = {
  coverPage: string;
  standardTerms: string;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-primary focus:outline-none focus:ring-1 focus:ring-blue-primary";

const labelClass = "text-sm font-medium text-zinc-700";

export function MutualNdaForm({ coverPage, standardTerms }: Props) {
  const [values, setValues] = useState<MutualNdaValues>(initialMutualNdaValues);

  const filled = useMemo(
    () => buildMutualNda(coverPage, standardTerms, values),
    [coverPage, standardTerms, values],
  );

  function update<K extends keyof MutualNdaValues>(key: K, value: MutualNdaValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateParty(party: "party1" | "party2", key: keyof PartyValues, value: string) {
    setValues((prev) => ({ ...prev, [party]: { ...prev[party], [key]: value } }));
  }

  function downloadMarkdown() {
    const blob = new Blob([filled], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const company = values.party1.company.trim().replace(/[^a-zA-Z0-9-_]+/g, "-");
    const fileName = company ? `Mutual-NDA-${company}.md` : "Mutual-NDA.md";
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <Section title="Agreement Details">
          <Field label="Purpose">
            <textarea
              className={fieldClass}
              rows={2}
              value={values.purpose}
              onChange={(e) => update("purpose", e.target.value)}
            />
          </Field>
          <Field label="Effective Date">
            <input
              type="date"
              className={fieldClass}
              value={values.effectiveDate}
              onChange={(e) => update("effectiveDate", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="MNDA Term">
          <div className="flex items-center gap-3">
            <select
              className={fieldClass}
              value={values.mndaTermType}
              onChange={(e) =>
                update("mndaTermType", e.target.value as MutualNdaValues["mndaTermType"])
              }
            >
              <option value="fixed">Expires after a fixed number of years</option>
              <option value="perpetual">Continues until terminated</option>
            </select>
            {values.mndaTermType === "fixed" && (
              <input
                type="number"
                min={1}
                className={`${fieldClass} max-w-24`}
                value={values.mndaTermYears}
                onChange={(e) => update("mndaTermYears", e.target.value)}
              />
            )}
          </div>
        </Section>

        <Section title="Term of Confidentiality">
          <div className="flex items-center gap-3">
            <select
              className={fieldClass}
              value={values.confidentialityTermType}
              onChange={(e) =>
                update(
                  "confidentialityTermType",
                  e.target.value as MutualNdaValues["confidentialityTermType"],
                )
              }
            >
              <option value="fixed">Fixed number of years</option>
              <option value="perpetual">In perpetuity</option>
            </select>
            {values.confidentialityTermType === "fixed" && (
              <input
                type="number"
                min={1}
                className={`${fieldClass} max-w-24`}
                value={values.confidentialityTermYears}
                onChange={(e) => update("confidentialityTermYears", e.target.value)}
              />
            )}
          </div>
        </Section>

        <Section title="Governing Law &amp; Jurisdiction">
          <Field label="Governing Law (state)">
            <input
              type="text"
              className={fieldClass}
              placeholder="e.g. Delaware"
              value={values.governingLaw}
              onChange={(e) => update("governingLaw", e.target.value)}
            />
          </Field>
          <Field label="Jurisdiction">
            <input
              type="text"
              className={fieldClass}
              placeholder='e.g. courts located in New Castle, DE'
              value={values.jurisdiction}
              onChange={(e) => update("jurisdiction", e.target.value)}
            />
          </Field>
        </Section>

        <PartySection
          label="Party 1"
          values={values.party1}
          onChange={(key, value) => updateParty("party1", key, value)}
        />
        <PartySection
          label="Party 2"
          values={values.party2}
          onChange={(key, value) => updateParty("party2", key, value)}
        />

        <button
          type="button"
          onClick={downloadMarkdown}
          className="w-full rounded-md bg-purple-secondary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-secondary/90 focus:outline-none focus:ring-2 focus:ring-purple-secondary focus:ring-offset-2"
        >
          Download Mutual NDA (.md)
        </button>
      </form>

      <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-baseline justify-between border-b border-zinc-200 pb-3">
          <h2 className="text-base font-semibold text-dark-navy">Live Preview</h2>
          <span className="text-xs text-gray-text">Common Paper Mutual NDA v1.0</span>
        </header>
        <div className="prose prose-sm max-w-none text-zinc-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{filled}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-dark-navy">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function PartySection({
  label,
  values,
  onChange,
}: {
  label: string;
  values: PartyValues;
  onChange: (key: keyof PartyValues, value: string) => void;
}) {
  return (
    <Section title={label}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Print Name">
          <input
            type="text"
            className={fieldClass}
            value={values.printName}
            onChange={(e) => onChange("printName", e.target.value)}
          />
        </Field>
        <Field label="Title">
          <input
            type="text"
            className={fieldClass}
            value={values.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input
            type="text"
            className={fieldClass}
            value={values.company}
            onChange={(e) => onChange("company", e.target.value)}
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={fieldClass}
            value={values.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notice Address (email or postal)">
            <input
              type="text"
              className={fieldClass}
              value={values.noticeAddress}
              onChange={(e) => onChange("noticeAddress", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </Section>
  );
}
