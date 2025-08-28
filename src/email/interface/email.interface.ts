export interface IEmailInput {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
  variables?: any;
}

export interface ICreateTemplate {
  name: string;
  subject: string;
  from: string;
  templateId: string;
  slug: string;
}

export interface IEmailPayload {
  userId: string;
  amount: number;
  [x: string]: string | number;
}
