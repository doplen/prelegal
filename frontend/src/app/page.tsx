import { MutualNdaForm } from "@/components/MutualNdaForm";
import { loadMutualNdaTemplates } from "@/lib/templates";

export default async function Home() {
  const { coverPage, standardTerms } = await loadMutualNdaTemplates();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-dark-navy">Mutual NDA Builder</h1>
        <p className="max-w-2xl text-sm text-gray-text">
          Fill in the key details below. The complete Mutual Non-Disclosure Agreement (Common
          Paper standard, CC BY 4.0) is generated live on the right and downloadable as a markdown
          file.
        </p>
      </header>
      <MutualNdaForm coverPage={coverPage} standardTerms={standardTerms} />
    </main>
  );
}
