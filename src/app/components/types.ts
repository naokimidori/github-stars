export interface Repository {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  starredAt: string;
}

export interface StarHistory {
  date: string;
  count: number;
}

export interface AIAnalysis {
  techStack: string[];
  highlights: string[];
  suitableFor: string[];
  summary: string;
}
