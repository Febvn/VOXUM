import React, { useState } from 'react';
import { ShinyText } from './react-bits';
import {
  Search,
  Key,
  CreditCard,
  Plug,
  FileText,
  MessageSquare,
  ArrowRight,
  X
} from 'lucide-react';

export interface HelpCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  articleCount: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  views: string;
  category: string;
  content: string;
}

const DEFAULT_CATEGORIES: HelpCategory[] = [
  {
    id: 'accounts',
    icon: <Key className="w-4 h-4 text-zinc-300" />,
    title: 'Accounts and access',
    description: 'Sign in, SSO, roles and invitations.',
    articleCount: 24
  },
  {
    id: 'billing',
    icon: <CreditCard className="w-4 h-4 text-zinc-300" />,
    title: 'Billing and plans',
    description: 'Invoices, seats, upgrades and refunds.',
    articleCount: 18
  },
  {
    id: 'integrations',
    icon: <Plug className="w-4 h-4 text-zinc-300" />,
    title: 'Integrations',
    description: 'Warehouses, webhooks and the API.',
    articleCount: 31
  },
  {
    id: 'reports',
    icon: <FileText className="w-4 h-4 text-zinc-300" />,
    title: 'Reports and exports',
    description: 'Scheduling, formats and delivery.',
    articleCount: 27
  }
];

const DEFAULT_ARTICLES: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'Why did my scheduled export arrive empty?',
    views: '4.2k',
    category: 'reports',
    content:
      'Scheduled exports only generate output when new audio transcriptions or telemetry events are recorded within the query time window. Check your trigger filter parameters in the settings panel.'
  },
  {
    id: 'art-2',
    title: 'Move a workspace to a different owner',
    views: '3.1k',
    category: 'accounts',
    content:
      'Organization owners can transfer workspace root privileges by visiting Organization Settings > Members > Transfer Ownership. The recipient must confirm via their verified corporate email.'
  },
  {
    id: 'art-3',
    title: 'Set up SAML with your identity provider',
    views: '2.8k',
    category: 'accounts',
    content:
      'VOXTUM supports Okta, Microsoft Entra ID, and Google Workspace via SAML 2.0. Export your metadata XML from your IdP dashboard and paste the ACS URL and Entity ID into Organization Settings.'
  },
  {
    id: 'art-4',
    title: 'Understand seat counts on the Pro plan',
    views: '2.4k',
    category: 'billing',
    content:
      'Pro plan seats are billed per active editor seat per month. Read-only viewers, API keys, and automated transcription agents do not count toward your monthly billed user limit.'
  }
];

export interface SupportSectionProps {
  id?: string;
  className?: string;
  onContactSupport?: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  id = 'support',
  className = '',
  onContactSupport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<HelpArticle | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const filteredArticles = DEFAULT_ARTICLES.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      setIsContactModalOpen(true);
    }
  };

  return (
    <section
      id={id}
      aria-label="Help and Support Center"
      className={`w-full bg-black text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-12 border-t border-zinc-800/80 font-['Geist',system-ui,-apple-system,sans-serif] select-none ${className}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-tight flex items-center justify-center">
            <ShinyText
              text="How can we help?"
              speed={2.5}
              color="#d4d4d8"
              shineColor="#ffffff"
              spread={120}
            />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Search the guides, or open a ticket and a person will reply. Median first
            response today is 11 minutes.
          </p>
        </div>

        {/* Search Bar (Strictly Rectangular / Boxy) */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="relative flex items-center rounded-none bg-[#0a0b10] border border-zinc-800 focus-within:border-zinc-500 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 ml-4 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, guides and answers"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 px-3.5 py-3 rounded-none focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 mr-2 text-zinc-500 hover:text-white rounded-none transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Topic Category Cards Grid (4 Columns on Desktop, Full Width) */}
        <div className="w-full rounded-none bg-[#0a0b10] border border-zinc-800 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            {DEFAULT_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.title.split(' ')[0].toLowerCase())}
                className="p-5 sm:p-6 flex flex-col justify-between gap-4 rounded-none hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:border-zinc-700 transition-colors shrink-0">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white group-hover:text-zinc-100 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="text-right pt-2 border-t border-zinc-900">
                  <span className="text-xs font-mono text-zinc-500">
                    {cat.articleCount} articles
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Read Most This Week (Strictly Square / Boxy / No Rounded Container) */}
        <div className="mb-8">
          <div className="text-[11px] font-mono font-semibold tracking-wider text-zinc-400 uppercase mb-3">
            READ MOST THIS WEEK
          </div>

          <div className="w-full rounded-none bg-[#0a0b10] border border-zinc-800 divide-y divide-zinc-800 shadow-xl overflow-hidden">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className="py-3.5 px-5 sm:px-6 flex items-center justify-between gap-4 text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <span className="truncate pr-2 font-normal">
                    {art.title}
                  </span>
                  <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 shrink-0 font-mono text-xs">
                    <span>{art.views}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                No matching articles found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Still stuck? Support Card (Strictly Square / Boxy / No Rounded Container) */}
        <div className="w-full rounded-none bg-[#0a0b10] border border-zinc-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-medium text-white tracking-tight">
                Still stuck?
              </div>
              <div className="text-xs text-zinc-400 mt-0.5 leading-snug">
                Support is online now, 09:00 to 21:00 UTC on weekdays.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContactClick}
            className="rounded-none bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-colors active:scale-95 shrink-0 self-start sm:self-auto text-center"
          >
            Contact support
          </button>
        </div>
      </div>

      {/* Article Detail Modal (Strictly Boxy / Rounded-None) */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-none bg-[#0c0d12] border border-zinc-700 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-none transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
              Guide · {activeArticle.views} views
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mb-4">
              {activeArticle.title}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal mb-6">
              {activeArticle.content}
            </p>
            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="rounded-none bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-4 py-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Dialog (Strictly Boxy / Rounded-None) */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-none bg-[#0c0d12] border border-zinc-700 p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-none transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white tracking-tight mb-1">
              Contact VOXTUM Support
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Median first response today is 11 minutes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Support request submitted. Our team will contact you shortly.');
                setIsContactModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full bg-[#12141a] border border-zinc-800 text-sm text-white px-3 py-2.5 rounded-none focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your question"
                  className="w-full bg-[#12141a] border border-zinc-800 text-sm text-white px-3 py-2.5 rounded-none focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
                  Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help your team?"
                  className="w-full bg-[#12141a] border border-zinc-800 text-sm text-white px-3 py-2.5 rounded-none focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="rounded-none bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs px-4 py-2 transition-colors border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-none bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-5 py-2 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SupportSection;

