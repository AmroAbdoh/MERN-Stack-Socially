export const SECURITY_QUESTIONS = [
  "Where were you born?",
  "Where did you study?",
  "What was the name of your first school?",
  "What is the name of your favorite childhood place?",
  "What was your childhood nickname?",
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];
