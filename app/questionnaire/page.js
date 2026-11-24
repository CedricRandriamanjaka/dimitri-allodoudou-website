import SurveyForm from "@/components/SurveyForm";

export const metadata = {
  title: "Questionnaire — PEEMENTE",
  description: "Dis-nous ce que tu veux vraiment. On le crée pour toi.",
  alternates: { canonical: "/questionnaire" },
};

export default function QuestionnairePage() {
  return (
    <>
      <div className="bg-stage tf-bg" aria-hidden="true" />
      <div className="shell">
        <header className="topbar">
          <a className="logo" href="/" aria-label="PEEMENTE">
            <img src="/logo.png" alt="" width={48} height={48} />
            <span>Peemente</span>
          </a>
        </header>
        <main>
          <SurveyForm />
        </main>
        <footer>
          <p>© {new Date().getFullYear()} Peemente · La Réunion</p>
        </footer>
      </div>
    </>
  );
}
