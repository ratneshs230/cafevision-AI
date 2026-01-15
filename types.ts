
export enum DesignStyle {
  MODERN = 'Modern',
  RUSTIC = 'Rustic',
  MINIMALIST = 'Minimalist',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian'
}

export interface CafeLayout {
  id: string;
  title: string;
  description: string;
  style: DesignStyle;
  imagePrompt: string;
  suggestedFeatures: string[];
}

export interface SiteAnalysis {
  dimensions: string;
  lighting: string;
  architecturalFeatures: string[];
  potentialChallenges: string[];
  vibeRecommendation: string;
}

export interface AppState {
  step: 'upload' | 'analysis' | 'layouts' | 'visualization';
  originalImage: string | null;
  analysis: SiteAnalysis | null;
  layouts: CafeLayout[];
  selectedLayout: CafeLayout | null;
  visualizedImage: string | null;
  isProcessing: boolean;
  error: string | null;
}
