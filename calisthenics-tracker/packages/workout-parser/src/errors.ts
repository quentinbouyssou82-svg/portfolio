export class ParseMarkdownError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ParseMarkdownError";
  }
}
