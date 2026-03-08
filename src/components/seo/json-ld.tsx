// Static JSON-LD structured data for SEO
// Content is a hardcoded constant — no user input flows into this component
const STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DiffLab",
  url: "https://difflab.dev",
  description:
    "Compare JSON, YAML, TOML, and code files side by side with instant diff visualization.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  browserRequirements: "Requires JavaScript",
  author: {
    "@type": "Person",
    name: "doguyilmaz",
    url: "https://doguyilmaz.com",
  },
});

export function JsonLd() {
  // dangerouslySetInnerHTML is required for JSON-LD script tags in React.
  // Safe: STRUCTURED_DATA is a compile-time constant with zero user input.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />;
}
