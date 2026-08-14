import { sendViaSes } from "./send";
import type { AppSendEmailArgs, AppSendEmailOptions, SendEmailFn } from "./types";

/** Unified send adapter — AWS SES only. */
export function createAppSendEmail(opts: AppSendEmailOptions = {}): SendEmailFn {
  return async (args: AppSendEmailArgs) => {
    await sendViaSes(args, {
      region: opts.region,
      accessKeyId: opts.accessKeyId,
      secretAccessKey: opts.secretAccessKey,
    });
  };
}
