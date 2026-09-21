export interface CvDocument {
  name: string;
  headline?: string;
  /** Rendered on one centered line, joined with " | " */
  contact: string[];
  summary?: string;
  skills: { label: string; items: string }[];
  experience: {
    company: string;
    dates: string;
    role: string;
    location?: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    description?: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    dates: string;
  }[];
}