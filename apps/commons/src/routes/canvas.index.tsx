import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "../components/aurora/AppShell";
import { Conversation } from "../components/aurora/Conversation";
export const Route = createFileRoute("/canvas/")({
  component: ExperienceEntry,
});
function ExperienceEntry() {
  return (
    <AppLayout
      aside={
        <Conversation
          reference={false}
          onReference={() => {}}
          query="Mein Mac erkennt meinen Bilderrahmen nicht."
        />
      }
    >
      <section>
        <div className="canvas-head">
          <h1>Menschliche Erfahrung</h1>
        </div>
        <article className="card">
          <div className="card-h">
            <h2>Mein Mac erkennt meinen Bilderrahmen nicht.</h2>
          </div>
          <p>
            Die Photo-Frame-Untersuchung ist noch nicht angelegt. Im erfassten
            Quellenbestand kannst du Erfahrungen und ihre Bedingungen finden.
          </p>
          <p>
            <Link
              to="/find"
              search={{ query: "Mac USB frame" }}
              className="btn btn-acc"
            >
              Erfahrungen finden
            </Link>
          </p>
        </article>
      </section>
    </AppLayout>
  );
}
