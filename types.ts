export interface QuizQuestion {
  id: string;
  text: { [key in Language]?: string } & { en: string };
  type: 'economic' | 'personal';
  weight: number;
}

export interface Answer {
  question: QuizQuestion;
  value: number;
}

export enum GameState {
  Welcome = 'WELCOME',
  Quiz = 'QUIZ',
  Form = 'FORM',
  Results = 'RESULTS',
  History = 'HISTORY',
  Admin = 'ADMIN',
}

export interface UserData {
  email: string;
  phone: string;
}

export interface Results {
  economic: number;
  personal: number;
  categoryKey: string;
}

export interface Submission {
  id: string;
  userData: UserData;
  answers: Answer[];
  results: Results;
  timestamp: string;
}

export type Language = 'en' | 'es' | 'pt-BR';