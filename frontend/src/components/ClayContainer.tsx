import React, { useState, useRef } from 'react';
import { Download, Copy, Check, RotateCcw, FileText } from 'lucide-react';
import { CubeLoader } from './CubeLoader';

export interface ClayContainerProps {
  className?: string;
  style?: React.CSSProperties;
  transcriptText?: string;
  onTranscriptChange?: (text: string) => void;
  fileName?: string;
}

export const ClayContainer: React.FC<ClayContainerProps> = ({
  className = '',
  style = {},
  transcriptText: externalText,
  onTranscriptChange,
  fileName = 'voxtum_transcript.txt',
}) => {
  const [internalText, setInternalText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const text = externalText !== undefined ? externalText : internalText;
  const hasContent = Boolean(text && text.trim().length > 0);

  const handleTextChange = (newText: string) => {
    if (onTranscriptChange) {
      onTranscriptChange(newText);
    } else {
      setInternalText(newText);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!hasContent) return;
    const textToSave = text.trim() ? text : 'Empty transcription buffer.';
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

  const wordCount = hasContent ? text.trim().split(/\s+/).length : 0;
  const charCount = hasContent ? text.length : 0;
  const lines = hasContent ? text.split('\n') : [];

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
            /* Directional specular rim highlights (top & left) */
            inset 0 2px 0 rgba(255, 255, 255, 0.65),
            inset 2px 0 0 rgba(255, 255, 255, 0.45),

            /* Directional shadow rims (right & bottom) */
            inset -2px 0 0 rgba(0, 0, 0, 0.85),
            inset 0 -3px 0 rgba(0, 0, 0, 0.95),

            /* 3D bevel lighting slopes hugging the edges */
            inset 0 12px 22px rgba(255, 255, 255, 0.15),
            inset 12px 0 22px rgba(255, 255, 255, 0.08),
            inset -12px 0 22px rgba(0, 0, 0, 0.92),
            inset 0 -16px 28px rgba(0, 0, 0, 0.98);
        }

        .terminal-inner-frame {
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 0 !important;
          background: #020203;
        }

        /* Custom Scrollbar */
        .terminal-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .terminal-scrollbar::-webkit-scrollbar-track {
          background: #040406;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 0px;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      {/* 4x8 Container with 3D Bevel Rim & Clean Text Viewer */}
      <div className="clay-black-monolith w-full h-full p-2 sm:p-2.5">
        <div className="terminal-inner-frame w-full h-full flex flex-col justify-between overflow-hidden">
          
          {/* Header Bar: Clean Title + Intuitive Action Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 border-b border-zinc-800 bg-[#09090d] select-none">
            {/* Left: Document Title */}
            <div className="flex items-center gap-2 text-zinc-300 min-w-0">
              <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="font-semibold text-zinc-200 tracking-tight text-xs sm:text-sm truncate">
                Transcription Output
              </span>
              <span className="text-zinc-600 hidden md:inline">/</span>
              <span className="text-zinc-400 text-xs hidden md:inline font-mono truncate max-w-[200px]">
                {fileName}
              </span>
            </div>

            {/* Right: Plain Intuitive Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Clear Button (only shown when content is present) */}
              {hasContent && (
                <button
                  type="button"
                  onClick={() => handleTextChange('')}
                  className="px-2.5 py-1.5 min-h-[32px] text-xs border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
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
                  className="px-2.5 sm:px-3 py-1.5 min-h-[32px] text-xs border border-zinc-700 hover:border-zinc-500 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                  title="Copy text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-white font-medium">Copied!</span>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-black p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-zinc-200">
            {hasContent ? (
              <>
                {/* Clean Status Meta Header */}
                <div className="select-none pb-2.5 border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-400 inline-block"></span>
                    <span className="text-zinc-200 font-medium">Ready</span>
                    <span className="text-zinc-700">•</span>
                    <span>{lines.length} lines</span>
                    <span className="text-zinc-700">•</span>
                    <span>{wordCount} words</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 hidden sm:block">
                    Editable text buffer
                  </div>
                </div>

                {/* Line Numbers Gutter & Interactive Text Buffer */}
                <div className="flex-1 flex pt-3 overflow-hidden relative">
                  <div className="select-none pr-3.5 py-1 text-right font-mono text-xs text-zinc-700 border-r border-zinc-900/80 w-10 shrink-0 hidden sm:block">
                    {lines.map((_, i) => (
                      <div key={i} className="leading-6">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 h-full flex flex-col pl-3 sm:pl-4 overflow-hidden relative">
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Transcript will appear here once audio is processed..."
                      className="w-full h-full bg-transparent text-zinc-200 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none terminal-scrollbar selection:bg-zinc-700 selection:text-white"
                      spellCheck={false}
                    />
                  </div>
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

          {/* Status Bar: Clean Document Summary */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-1.5 border-t border-zinc-800 bg-[#08080c] text-xs select-none">
            {hasContent ? (
              <>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-200 font-medium">{fileName}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{lines.length} lines</span>
                  <span className="text-zinc-600">•</span>
                  <span>{wordCount} words</span>
                  <span className="text-zinc-600">•</span>
                  <span>{charCount} characters</span>
                </div>

                <div className="text-zinc-500 text-[11px]">
                  Plain text document (.txt)
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-zinc-400">Ready</span>
                  <span className="text-zinc-700">•</span>
                  <span>No audio processed yet</span>
                </div>

                <div className="text-zinc-600 text-[11px]">
                  Awaiting input
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClayContainer;
