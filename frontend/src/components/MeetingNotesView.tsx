import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Layers,
  Award,
  Download,
  Calendar,
  User,
  Plus,
  Trash2,
  Printer,
  Check
} from 'lucide-react';
import type { MeetingNotes, ActionItem } from '../types';
import { SpotlightCard, DecryptedText } from './react-bits';

interface MeetingNotesViewProps {
  notes: MeetingNotes;
  rawTranscript: string;
  onUpdateNotes?: (updatedNotes: MeetingNotes) => void;
}

export const MeetingNotesView: React.FC<MeetingNotesViewProps> = ({ notes, rawTranscript, onUpdateNotes }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'topics' | 'decisions'>('summary');
  const [actionItems, setActionItems] = useState<ActionItem[]>(notes.action_items || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const toggleTask = (index: number) => {
    const updated = [...actionItems];
    updated[index].completed = !updated[index].completed;
    setActionItems(updated);
    if (onUpdateNotes) onUpdateNotes({ ...notes, action_items: updated });
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newItem: ActionItem = {
      task: newTaskText.trim(),
      assignee: newTaskAssignee.trim() || 'Team',
      deadline: 'ASAP',
      priority: 'Medium',
      completed: false
    };
    const updated = [...actionItems, newItem];
    setActionItems(updated);
    setNewTaskText('');
    setNewTaskAssignee('');
    if (onUpdateNotes) onUpdateNotes({ ...notes, action_items: updated });
  };

  const deleteTask = (index: number) => {
    const updated = actionItems.filter((_, i) => i !== index);
    setActionItems(updated);
    if (onUpdateNotes) onUpdateNotes({ ...notes, action_items: updated });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const downloadMarkdown = () => {
    const md = `# ${notes.title}
*Sentiment: ${notes.sentiment}*

## Executive Summary
${notes.executive_summary}

## Key Discussion Topics
${notes.key_topics.map((t) => `### ${t.title}\n${t.summary}`).join('\n\n')}

## Action Items & Next Steps
${actionItems.map((a) => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Owner: ${a.assignee} | Due: ${a.deadline} | Priority: ${a.priority})`).join('\n')}

## Key Decisions
${notes.decisions.map((d) => `- ${d}`).join('\n')}

---
### Full Transcript
${rawTranscript}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting_notes_${Date.now()}.md`;
    link.click();
  };

  const copyForPlatform = (platform: 'notion' | 'slack' | 'whatsapp') => {
    let text = '';
    if (platform === 'notion') {
      text = `[MEETING NOTES] ${notes.title}\n\nSUMMARY:\n${notes.executive_summary}\n\nACTION ITEMS:\n${actionItems
        .map((a) => `- [${a.completed ? 'x' : ' '}] ${a.task} (@${a.assignee} - ${a.deadline})`)
        .join('\n')}\n\nDECISIONS:\n${notes.decisions.map((d) => `- ${d}`).join('\n')}`;
    } else if (platform === 'slack') {
      text = `*[MEETING NOTES] ${notes.title}*\n\n*Summary:*\n>${notes.executive_summary}\n\n*Action Items:*\n${actionItems
        .map((a) => `• ${a.completed ? '~' : ''}${a.task}${a.completed ? '~' : ''} _(Owner: ${a.assignee}, Due: ${a.deadline})_`)
        .join('\n')}\n\n*Decisions:*\n${notes.decisions.map((d) => `• ${d}`).join('\n')}`;
    } else {
      text = `*[MEETING NOTES] ${notes.title}*\n\n*SUMMARY:*\n${notes.executive_summary}\n\n*ACTION ITEMS:\n${actionItems
        .map((a) => `- *${a.task}* (${a.assignee} - ${a.deadline})`)
        .join('\n')}\n\n*DECISIONS:\n${notes.decisions.map((d) => `- ${d}`).join('\n')}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedFormat(platform);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(255, 255, 255, 0.08)"
      className="bg-slate-900/90 rounded-none border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 print:border-none print:shadow-none print:p-0"
    >
      {/* Executive Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 sm:pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-none bg-white/10 border border-white/20 text-white">
              <DecryptedText text="EXECUTIVE SYNTHESIS" speed={30} animateOn="view" className="text-white font-mono" />
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-none bg-blue-950/60 text-blue-400 border border-blue-500/30">
              SENTIMENT: {notes.sentiment}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold font-mono text-white tracking-tight break-words">{notes.title}</h2>
        </div>

        {/* Action Controls & Export Bar */}
        <div className="flex flex-wrap items-center gap-2 print:hidden font-mono text-xs w-full sm:w-auto">
          {/* Quick Copy Platform Group */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-950 p-1 rounded-none border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => copyForPlatform('whatsapp')}
              className="text-[10px] sm:text-[11px] px-2 py-1.5 rounded-none hover:bg-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-1"
              title="Copy for WhatsApp"
            >
              {copiedFormat === 'whatsapp' ? (
                <>
                  <Check className="size-3 text-white" />
                  <span className="text-white font-semibold">COPIED</span>
                </>
              ) : (
                'WHATSAPP'
              )}
            </button>
            <button
              onClick={() => copyForPlatform('slack')}
              className="text-[10px] sm:text-[11px] px-2 py-1.5 rounded-none hover:bg-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-1"
              title="Copy for Slack"
            >
              {copiedFormat === 'slack' ? (
                <>
                  <Check className="size-3 text-white" />
                  <span className="text-white font-semibold">COPIED</span>
                </>
              ) : (
                'SLACK'
              )}
            </button>
            <button
              onClick={() => copyForPlatform('notion')}
              className="text-[10px] sm:text-[11px] px-2 py-1.5 rounded-none hover:bg-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-1"
              title="Copy for Notion"
            >
              {copiedFormat === 'notion' ? (
                <>
                  <Check className="size-3 text-white" />
                  <span className="text-white font-semibold">COPIED</span>
                </>
              ) : (
                'NOTION'
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintPDF}
              className="flex-1 sm:flex-none text-[11px] sm:text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium"
              title="Print or Save PDF"
            >
              <Printer className="size-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={downloadMarkdown}
              className="flex-1 sm:flex-none text-[11px] sm:text-xs flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-none bg-white hover:bg-zinc-200 text-black font-bold transition-all shadow-md shadow-black/40"
            >
              <Download className="size-3.5" />
              <span>MARKDOWN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Scrollable on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-slate-950 rounded-none border border-slate-800/80 w-full sm:w-fit print:hidden font-mono text-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
            activeTab === 'summary'
              ? 'bg-white text-black border border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="size-3.5" />
          <span>SUMMARY</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
            activeTab === 'actions'
              ? 'bg-white text-black border border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="size-3.5" />
          <span>ACTION ITEMS ({actionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
            activeTab === 'topics'
              ? 'bg-white text-black border border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="size-3.5" />
          <span>TOPICS</span>
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all shrink-0 ${
            activeTab === 'decisions'
              ? 'bg-white text-black border border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="size-3.5" />
          <span>DECISIONS</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-950/60 rounded-none p-4 sm:p-6 border border-slate-800/80 min-h-60">
        {activeTab === 'summary' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                EXECUTIVE BRIEFING &amp; CONTEXT
              </h4>
              <span className="text-[10px] font-mono text-zinc-300">VERIFIED</span>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
              {notes.executive_summary}
            </p>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono">
              <h4 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                TASK MATRIX &amp; ACTIONABLE DELIVERABLES
              </h4>
              <span className="text-[10px] sm:text-[11px] text-slate-500">
                {actionItems.filter((a) => a.completed).length}/{actionItems.length} COMPLETED
              </span>
            </div>

            {/* Input Add New Task */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900 p-2 rounded-none border border-slate-800 print:hidden font-mono">
              <input
                type="text"
                placeholder="New task description..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Owner (e.g. Alex)"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1 sm:w-36 bg-slate-950 px-3 py-1.5 rounded-none text-xs text-white placeholder:text-slate-500 border border-slate-800 focus:outline-none"
                />
                <button
                  onClick={addTask}
                  className="px-3.5 py-1.5 rounded-none bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center justify-center gap-1 transition-all shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>ADD</span>
                </button>
              </div>
            </div>

            {/* List Action Items */}
            <div className="space-y-2.5">
              {actionItems.length > 0 ? (
                actionItems.map((item, idx) => {
                  const done = item.completed || false;
                  return (
                    <SpotlightCard
                      key={idx}
                      spotlightColor="rgba(255, 255, 255, 0.08)"
                      className={`flex items-start justify-between gap-2.5 p-3 sm:p-3.5 rounded-none border transition-all ${
                        done
                          ? 'bg-slate-900/30 border-slate-800/40 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="flex items-start gap-2.5 sm:gap-3 flex-1 cursor-pointer select-none min-w-0"
                        onClick={() => toggleTask(idx)}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => {}}
                          className="mt-1 size-3.5 sm:size-4 rounded-none bg-slate-950 border-slate-700 text-white focus:ring-0 cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-medium break-words ${done ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {item.task}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <User className="size-3 text-white shrink-0" />
                              <span className="truncate max-w-[100px]">{item.assignee || 'Team'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-blue-400 shrink-0" />
                              <span>{item.deadline || 'ASAP'}</span>
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-none text-[9px] font-semibold uppercase ${
                                item.priority === 'High'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : item.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.priority || 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors print:hidden shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </SpotlightCard>
                  );
                })
              ) : (
                <p className="text-xs font-mono text-slate-500">No action items recorded.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {notes.key_topics && notes.key_topics.length > 0 ? (
              notes.key_topics.map((t, idx) => (
                <SpotlightCard
                  key={idx}
                  spotlightColor="rgba(255, 255, 255, 0.08)"
                  className="p-3.5 sm:p-4 rounded-none bg-slate-900 border border-slate-800 space-y-1.5"
                >
                  <h5 className="text-xs sm:text-sm font-semibold font-mono text-white">{t.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{t.summary}</p>
                </SpotlightCard>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500">No distinct topics recorded.</p>
            )}
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
              LOG OF AGREEMENTS &amp; FINAL DECISIONS
            </h4>
            {notes.decisions && notes.decisions.length > 0 ? (
              notes.decisions.map((d, idx) => (
                <SpotlightCard
                  key={idx}
                  spotlightColor="rgba(255, 255, 255, 0.08)"
                  className="flex items-start gap-2.5 p-3 rounded-none bg-slate-900/60 border border-slate-800"
                >
                  <div className="size-4.5 rounded-none bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3 text-white" />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{d}</p>
                </SpotlightCard>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500">No formal agreements recorded.</p>
            )}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};

export default MeetingNotesView;
