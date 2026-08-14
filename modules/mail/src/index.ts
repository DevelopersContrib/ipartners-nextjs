export type { MailProvider, AppSendEmailArgs, AppSendEmailOptions, SendEmailFn } from "./types";
export {
  emailProvider,
  emailConfigured,
  sesRegion,
  defaultFromEmail,
  sendViaSes,
} from "./send";
export { createAppSendEmail } from "./create";
