import React, { useState } from 'react';
import { X, Clock, Trash2, Search, ArrowRight, Calendar, FileText } from 'lucide-react';
import { SpotlightCard, DecryptedText } from './react-bits';
import type { SavedMeetingSession } from '../types';

interface MeetingHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedMeetings: SavedMeetingSession[];
  onSelectMeeting: (session: SavedMeetingSession) => void;
  onDeleteMeeting: (id: string) => void;
  onClearAll: () => void;
}

export const MeetingHistoryDrawer: React.FC<MeetingHistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedMeetings,
  onSelectMeeting,
  onDeleteMeeting,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedMeetings.filter(
    (m) =>
      m.meeting_notes.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.transcription.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 sm:size-9 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">
                <DecryptedText text="SESSION ARCHIVE" speed={25} animateOn="view" className="text-white font-mono" />
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">{savedMeetings.length} sessions indexed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search & Bulk Action */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="size-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sessions or transcripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          {savedMeetings.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Purge session archive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>

        {/* Meeting List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <SpotlightCard
                key={item.id}
                spotlightColor="rgba(16, 185, 129, 0.15)"
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all group space-y-2 cursor-pointer"
                onClick={() => {
                  onSelectMeeting(item);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 font-mono">
                    {item.meeting_notes.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMeeting(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                  {item.meeting_notes.executive_summary}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                    </span>
                    <span className="uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {item.transcription.language}
                    </span>
                  </div>
                  <span className="text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold">
                    <span>LOAD</span>
                    <ArrowRight className="size-2.5" />
                  </span>
                </div>
              </SpotlightCard>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2 font-mono">
              <FileText className="size-8 mx-auto opacity-30" />
              <p>NO ARCHIVED SESSIONS FOUND</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHistoryDrawer;
