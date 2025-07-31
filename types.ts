export enum Screen {
  WELCOME,
  CHAT,
  CONDITIONS,
  HISTORY,
  CONDITION_DETAIL,
  ADVICE,
  DOCTOR_PREP,
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export interface Condition {
  name: string;
  matchingSymptoms: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | string;
  description?: string;
}

export interface HistoryEntry {
  date: string;
  condition: string;
  severity: string;
}

export interface DoctorVisitPrep {
  questions: string[];
  preparation: string[];
  expectations: string[];
}
