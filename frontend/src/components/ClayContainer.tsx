import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Clock
} from 'lucide-react';
import type { WordTimestamp } from '../types';
import { CubeLoader } from './CubeLoader';

export type TimestampMode = 'none' | 'mmss' | 'seconds' | 'minute';

export interface ClayContainerProps {
  className?: string;
  style?: React.CSSProperties;
  transcriptText?: string;
  onTranscriptChange?: (text: string) => void;
  fileName?: string;
  words?: WordTimestamp[];
  segments?: { start: number; end: number; text: string }[];
}

function formatSecondsToMMSS(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTranscriptWithTimestamps(
  mode: TimestampMode,
  rawText: string,
  segments?: { start: number; end: number; text: string }[],
  words?: WordTimestamp[]
): string {
  if (mode === 'none') {
    return rawText;
  }

  // 1. Segments dari Whistle ASR
  if (segments && segments.length > 0) {
    if (mode === 'mmss') {
      return segments
        .map((s) => `[${formatSecondsToMMSS(s.start)}] ${s.text.trim()}`)
        .join('\n');
    }
    if (mode === 'seconds') {
      return segments
        .map((s) => `[${Math.floor(s.start)}s] ${s.text.trim()}`)
        .join('\n');
    }
    if (mode === 'minute') {
      const buckets: Record<number, string[]> = {};
      segments.forEach((s) => {
        const bucketIdx = Math.floor(s.start / 60);
        if (!buckets[bucketIdx]) buckets[bucketIdx] = [];
        buckets[bucketIdx].push(s.text.trim());
      });
      return Object.entries(buckets)
        .map(([idxStr, texts]) => {
          const idx = parseInt(idxStr, 10);
          const startMin = formatSecondsToMMSS(idx * 60);
          const endMin = formatSecondsToMMSS((idx + 1) * 60);
          return `[${startMin} - ${endMin}]\n${texts.join(' ')}`;
        })
        .join('\n\n');
    }
  }

  // 2. Fallback: kata demi kata dengan timestamp
  if (words && words.length > 0) {
    const chunks: { start: number; text: string }[] = [];
    let currentWords: string[] = [];
    let chunkStart = words[0].start;

    words.forEach((w, i) => {
      currentWords.push(w.word);
      const isEnd = /[.?!]$/.test(w.word);
      const isTimeGap = i < words.length - 1 && words[i + 1].start - chunkStart >= 8.0;

      if (isEnd || isTimeGap || i === words.length - 1) {
        chunks.push({ start: chunkStart, text: currentWords.join(' ') });
        currentWords = [];
        if (i < words.length - 1) chunkStart = words[i + 1].start;
      }
    });

    if (mode === 'mmss') {
      return chunks.map((c) => `[${formatSecondsToMMSS(c.start)}] ${c.text}`).join('\n');
    }
    if (mode === 'seconds') {
      return chunks.map((c) => `[${Math.floor(c.start)}s] ${c.text}`).join('\n');
    }
    if (mode === 'minute') {
      const buckets: Record<number, string[]> = {};
      chunks.forEach((c) => {
        const idx = Math.floor(c.start / 60);
        if (!buckets[idx]) buckets[idx] = [];
        buckets[idx].push(c.text);
      });
      return Object.entries(buckets)
        .map(([idxStr, texts]) => {
          const idx = parseInt(idxStr, 10);
          const startMin = formatSecondsToMMSS(idx * 60);
          const endMin = formatSecondsToMMSS((idx + 1) * 60);
          return `[${startMin} - ${endMin}]\n${texts.join(' ')}`;
        })
        .join('\n\n');
    }
  }

  // 3. Fallback: pisahkan kalimat dan estimasikan waktu
  const cleanRaw = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = cleanRaw.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [cleanRaw];
  let elapsed = 0;
  if (mode === 'mmss') {
    return sentences
      .map((sent) => {
        const tag = `[${formatSecondsToMMSS(elapsed)}]`;
        elapsed += Math.max(3, Math.round(sent.trim().split(/\s+/).length * 0.45));
        return `${tag} ${sent.trim()}`;
      })
      .join('\n');
  }
  if (mode === 'seconds') {
    return sentences
      .map((sent) => {
        const tag = `[${elapsed}s]`;
        elapsed += Math.max(3, Math.round(sent.trim().split(/\s+/).length * 0.45));
        return `${tag} ${sent.trim()}`;
      })
      .join('\n');
  }
  if (mode === 'minute') {
    return `[00:00 - 01:00]\n${cleanRaw}`;
  }

  return rawText;
}

export const ClayContainer: React.FC<ClayContainerProps> = ({
  className = '',
  style = {},
  transcriptText: externalText,
  onTranscriptChange,
  fileName = 'voxtum_transcript.txt',
  words,
  segments
}) => {
  const [internalText, setInternalText] = useState<string>('');
  const [timestampMode, setTimestampMode] = useState<TimestampMode>('none');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const rawBaseTextRef = useRef<string>('');

  const text = externalText !== undefined ? externalText : internalText;
  const hasContent = Boolean(text && text.trim().length > 0);

  // Sync external text into editor when updated
  useEffect(() => {
    if (externalText !== undefined) {
      if (!/^\[\d+.*\]/m.test(externalText)) {
        rawBaseTextRef.current = externalText;
      }
      const formatted = formatTranscriptWithTimestamps(timestampMode, externalText, segments, words);
      setInternalText(formatted);
      if (editorRef.current) {
        if (editorRef.current.innerHTML !== formatted && editorRef.current.innerText.trim() !== formatted.trim()) {
          editorRef.current.innerHTML = formatted.includes('<') ? formatted : formatted.replace(/\n/g, '<br/>');
        }
      }
    }
  }, [externalText, segments, words]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    if (onTranscriptChange) {
      onTranscriptChange(newHtml);
    } else {
      setInternalText(newHtml);
    }
  };

  const handleModeChange = (newMode: TimestampMode) => {
    setTimestampMode(newMode);
    const base = rawBaseTextRef.current || text.replace(/\[\d+[^\]]*\]\s*/g, '');
    const formatted = formatTranscriptWithTimestamps(newMode, base, segments, words);
    setInternalText(formatted);
    if (onTranscriptChange) {
      onTranscriptChange(formatted);
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = formatted.includes('<') ? formatted : formatted.replace(/\n/g, '<br/>');
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleInput();
    }
  };

  const handleCopy = () => {
    if (!editorRef.current && !text) return;
    const plainText = editorRef.current ? editorRef.current.innerText : text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!hasContent) return;
    const plainText = editorRef.current ? editorRef.current.innerText : text.replace(/<[^>]*>/g, '');
    const textToSave = plainText.trim() ? plainText : 'Empty transcription buffer.';
    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanFileName = fileName.endsWith('.txt') ? fileName : `${fileName.replace(/\.[^/.]+$/, '')}.txt`;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const plainTextContent = text.replace(/<[^>]*>/g, ' ');
  const wordCount = hasContent ? plainTextContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = hasContent ? plainTextContent.length : 0;
  const lines = hasContent ? (editorRef.current ? editorRef.current.innerText.split('\n') : text.split('\n')) : [];

  return (
    <div className={`relative select-none w-full h-full ${className}`} style={style}>
      <style>{`
        /* 4x8 Container: Solid Black Center with High-Definition 3D Depth on the Edges */
        .clay-black-monolith {
          background-color: #000000;
          box-sizing: border-box;
          border-radius: 0 !important;

          /* Outer border matching the 2px #f9f6fe grid lines */
          border: 2px solid #f9f6fe;

          /* 3D Chamfered / Beveled rim depth strictly along the perimeter edges */
          box-shadow:
            inset 0 3px 6px rgba(255, 255, 255, 0.40),
            inset 3px 0 6px rgba(255, 255, 255, 0.28),
            inset -3px 0 6px rgba(255, 255, 255, 0.28),
            inset 0 -3px 7px rgba(0, 0, 0, 0.95),
            inset 0 0 1px 2px rgba(249, 246, 254, 0.25),
            0 14px 28px rgba(0, 0, 0, 0.95),
            0 4px 10px rgba(0, 0, 0, 0.85);
        }

        /* Screen bezel: deeply recessed cavity with hard edge rim */
        .clay-screen-bezel {
          background-color: #000000;
          border-radius: 0 !important;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 3px 8px rgba(0, 0, 0, 0.95),
            inset 0 1px 3px rgba(0, 0, 0, 0.9),
            0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .terminal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .terminal-scrollbar::-webkit-scrollbar-track {
          background: #000000;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 0;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      {/* Main Container - strictly rounded-none with 3D perimeter rim */}
      <div className="clay-black-monolith w-full h-full p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden">
        {/* Recessed Screen Area */}
        <div className="clay-screen-bezel flex-1 flex flex-col overflow-hidden relative min-h-0 bg-black">
          {/* Screen Header Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-800/90 bg-[#06070a] select-none shrink-0 min-h-[42px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5 truncate">
                <span>Transcription Output</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400 font-mono text-[11px] sm:text-xs truncate font-normal">
                  {fileName}
                </span>
              </div>
            </div>

            {/* Quick Actions (Clear, Copy, Download) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {hasContent && (
                <button
                  type="button"
                  onClick={() => {
                    rawBaseTextRef.current = '';
                    setInternalText('');
                    if (onTranscriptChange) onTranscriptChange('');
                    if (editorRef.current) editorRef.current.innerHTML = '';
                  }}
                  className="px-2.5 py-1.5 min-h-[32px] text-xs font-mono border border-zinc-800 hover:border-zinc-600 bg-black text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  title="Clear text buffer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}

              {/* Copy Button */}
              {hasContent ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 sm:px-3 py-1.5 min-h-[32px] text-xs font-mono border border-zinc-700 hover:border-zinc-400 bg-zinc-900/90 text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  title="Copy text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy<span className="hidden sm:inline"> Text</span></span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-2.5 sm:px-3 py-1.5 min-h-[32px] text-xs border border-zinc-900 bg-black text-zinc-700 cursor-not-allowed flex items-center gap-1.5 opacity-40"
                  title="No text to copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy<span className="hidden sm:inline"> Text</span></span>
                </button>
              )}

              {/* Download .TXT Button */}
              {hasContent ? (
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 sm:px-3.5 py-1.5 min-h-[32px] text-xs font-semibold border border-white hover:border-zinc-200 bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                  title="Download text file (.txt)"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{downloadSuccess ? 'Downloaded!' : 'Download'}<span className="hidden sm:inline"> .TXT</span></span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-3 sm:px-3.5 py-1.5 min-h-[32px] text-xs font-semibold border border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed flex items-center gap-1.5 opacity-40"
                  title="No text available to download"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download<span className="hidden sm:inline"> .TXT</span></span>
                </button>
              )}
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black p-3 sm:p-4 text-xs sm:text-sm leading-relaxed text-zinc-200">
            {hasContent ? (
              <>
                {/* Rich Text Formatting Toolbar (B, I, U, H1, H2, List, Reset, and Timestamp Mode Selector) */}
                <div className="w-full rounded-none bg-[#090a0f] border border-zinc-800 p-1.5 sm:p-2 mb-2.5 flex items-center flex-wrap gap-1.5 select-none">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase px-1.5">
                    FORMAT:
                  </span>

                  {/* Bold (B) */}
                  <button
                    type="button"
                    onClick={() => executeCommand('bold')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Italic (I) */}
                  <button
                    type="button"
                    onClick={() => executeCommand('italic')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  {/* Underline (U) */}
                  <button
                    type="button"
                    onClick={() => executeCommand('underline')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-zinc-800 mx-0.5" />

                  {/* Heading 1 */}
                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', '<h1>')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Heading 1"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>

                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', '<h2>')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Heading 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Bullet List */}
                  <button
                    type="button"
                    onClick={() => executeCommand('insertUnorderedList')}
                    className="p-1.5 rounded-none border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-zinc-800 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => executeCommand('removeFormat')}
                    className="text-[11px] font-mono px-2 py-1 rounded-none border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors active:scale-95"
                    title="Clear Formatting"
                  >
                    Reset
                  </button>

                  {/* Timestamp Mode Segmented Controller */}
                  <div className="flex items-center gap-1 border-l border-zinc-800 pl-2 ml-1">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase px-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>TIMESTAMP:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleModeChange('none')}
                      className={`px-2 py-1 text-[11px] font-mono rounded-none border transition-colors ${
                        timestampMode === 'none'
                          ? 'border-white bg-white text-black font-semibold'
                          : 'border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white'
                      }`}
                      title="Plain text without timestamps"
                    >
                      Plain Text
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('mmss')}
                      className={`px-2 py-1 text-[11px] font-mono rounded-none border transition-colors ${
                        timestampMode === 'mmss'
                          ? 'border-white bg-white text-black font-semibold'
                          : 'border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white'
                      }`}
                      title="Minutes:Seconds format [00:01]"
                    >
                      [MM:SS]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('seconds')}
                      className={`px-2 py-1 text-[11px] font-mono rounded-none border transition-colors ${
                        timestampMode === 'seconds'
                          ? 'border-white bg-white text-black font-semibold'
                          : 'border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white'
                      }`}
                      title="Seconds format [1s, 5s...]"
                    >
                      [Seconds]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('minute')}
                      className={`px-2 py-1 text-[11px] font-mono rounded-none border transition-colors ${
                        timestampMode === 'minute'
                          ? 'border-white bg-white text-black font-semibold'
                          : 'border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white'
                      }`}
                      title="Group by 1 minute [00:00 - 01:00]"
                    >
                      [Per Minute]
                    </button>
                  </div>

                  <div className="ml-auto text-[11px] font-mono text-zinc-500 pr-1 sm:pr-2 flex items-center gap-2">
                    <span>{wordCount} words</span>
                    <span className="text-zinc-700 hidden sm:inline">•</span>
                    <span className="text-zinc-300 font-sans hidden sm:inline">Editable</span>
                  </div>
                </div>

                {/* Rich ContentEditable Text Buffer Container */}
                <div className="flex-1 flex overflow-hidden relative border border-zinc-900/80 bg-black">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    dangerouslySetInnerHTML={{ __html: text.includes('<') ? text : text.replace(/\n/g, '<br/>') }}
                    className="w-full h-full p-3.5 sm:p-4 overflow-y-auto bg-transparent text-zinc-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-zinc-700 terminal-scrollbar selection:bg-zinc-800 selection:text-white font-sans"
                    spellCheck={false}
                  />
                </div>
              </>
            ) : (
              /* Waiting State: 3D Monochrome Cube Loader & Friendly Guidance */
              <div className="flex-1 flex flex-col items-center justify-center py-8 select-none text-center px-4">
                <div className="my-4">
                  <CubeLoader size={76} />
                </div>
                <p className="mt-6 text-sm text-zinc-200 font-medium tracking-wide">
                  Waiting for audio transcription
                </p>
                <p className="mt-1.5 text-xs text-zinc-500 max-w-sm">
                  Upload or record audio in the studio above to generate your transcription here.
                </p>
              </div>
            )}
          </div>

          {/* Screen Status Bar */}
          <div className="px-3 sm:px-4 py-2 border-t border-zinc-900 bg-[#050508] flex items-center justify-between text-[11px] font-mono text-zinc-500 select-none shrink-0 min-h-[34px]">
            <div className="flex items-center gap-2 truncate">
              <span className="text-zinc-400 font-medium truncate">{fileName}</span>
              <span className="text-zinc-700">•</span>
              <span>{lines.length} lines</span>
              <span className="text-zinc-700">•</span>
              <span>{wordCount} words</span>
              <span className="text-zinc-700">•</span>
              <span>{charCount} characters</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline text-zinc-600">
                {timestampMode === 'none' ? 'Plain text document (.txt)' : `Timestamped [${timestampMode.toUpperCase()}] (.txt)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClayContainer;
