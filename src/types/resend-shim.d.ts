declare module "resend" {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(payload: Record<string, unknown>): Promise<{ data?: unknown; error?: unknown }>;
    };
  }
}
