import { env } from "../../config/env";

type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

export const sendEmail = async (payload: EmailPayload) => {
  const from = payload.from ?? env.email.defaultFrom;
  if (env.email.mode === "log") {
    console.log("[email]", { ...payload, from });
  }
};
