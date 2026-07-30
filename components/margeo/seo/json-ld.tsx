type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

/** Server-safe JSON-LD script for LLM / search engines. */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
