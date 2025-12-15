export enum Genre {
  XUANHUAN = "玄幻",
  WUXIA = "武侠",
  URBAN = "都市",
  ROMANCE = "言情",
  ANCIENT_ROMANCE = "古言",
  SUSPENSE = "悬疑",
  MYSTERY = "推理",
  SCI_FI = "科幻",
  DOOMSDAY = "末世",
  REBIRTH = "重生",
  TRANSMIGRATION = "穿越",
  OTHER = "其他"
}

export interface Character {
  name: string;
  role: string;
  description: string;
  traits: string[];
}

export interface AnalysisResult {
  genre: Genre;
  title: string;
  logline: string;
  themes: string[];
  characters: Character[];
  pacing: string;
  targetAudience: string;
}

export interface EpisodePlan {
  episodeNumber: number;
  title: string;
  synopsis: string;
  keyEvents: string[];
  charactersInvolved: string[];
}

export interface ScriptContent {
  episodeNumber: number;
  content: string; // The actual script text (Markdown formatted)
}

export enum Step {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PLANNING = 'PLANNING',
  WRITING = 'WRITING',
  COMPLETE = 'COMPLETE'
}

export interface AppState {
  inputText: string;
  currentStep: Step;
  isProcessing: boolean;
  analysis: AnalysisResult | null;
  plan: EpisodePlan[];
  scripts: Record<number, string>; // Map episode number to script content
  selectedEpisodeId: number | null;
}