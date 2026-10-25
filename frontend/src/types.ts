export type MeetingTemplate = 'general' | 'agile' | 'one_on_one' | 'sales' | 'webinar';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  probability: number;
}

export interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

export interface KeyTopic {
  title: string;
  summary: string;
}

export interface MeetingNotes {
  title: string;
  executive_summary: string;
  key_topics: KeyTopic[];
  action_items: ActionItem[];
  decisions: string[];
  sentiment: string;
}

export interface ProcessResponse {
  status: string;
  filename: string;
  template?: MeetingTemplate;
  transcription: {
    text: string;
    language: string;
    latency_ms: number;
    tokens_per_sec: number;
    words: WordTimestamp[];
    segments?: { start: number; end: number; text: string }[];
    engine: string;
  };
  meeting_notes: MeetingNotes;
}

export interface SavedMeetingSession {
  id: string;
  createdAt: string;
  filename: string;
  template: MeetingTemplate;
  audioUrl?: string;
  transcription: {
    text: string;
    language: string;
    latency_ms: number;
    tokens_per_sec: number;
    words: WordTimestamp[];
    segments?: { start: number; end: number; text: string }[];
    engine: string;
  };
  meeting_notes: MeetingNotes;
}
