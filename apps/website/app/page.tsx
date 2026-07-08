import { brand } from "@astraguard/ui/tokens";

const pillars = [
  {
    title: "Check any project's live rating",
    body: "Every Stellar project gets a continuously updated trust score, backed by on-chain and off-chain signals."
  },
  {
    title: "Get instant risk verdicts",
    body: "The browser extension scans the transaction you're about to sign before your wallet ever prompts you."
  },
  {
    title: "Shop with verified merchants",
    body: "Merchants displaying the Astraguard badge are backed by an on-chain escrow and insurance pool."
  }
];

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "64px 24px",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <h1 style={{ color: brand.teal }}>Astraguard</h1>
      <p style={{ color: brand.slate, fontSize: 18 }}>
        Continuous trust-verification and consumer-protection for the Stellar ecosystem.
      </p>

      <section style={{ display: "grid", gap: 24, marginTop: 40 }}>
        {pillars.map((pillar) => (
          <article key={pillar.title}>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>{pillar.title}</h2>
            <p style={{ color: brand.slate, margin: 0 }}>{pillar.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
