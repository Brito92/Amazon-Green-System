// @ts-nocheck
export type E2ECredentials = {
  email: string;
  password: string;
};

export function getE2ECredentials(): E2ECredentials | null {
  const email = process.env.E2E_EMAIL?.trim();
  const password = process.env.E2E_PASSWORD?.trim();

  if (!email || !password) return null;

  return { email, password };
}
