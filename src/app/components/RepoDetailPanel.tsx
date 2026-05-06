'use client';

import { useEffect, useState } from 'react';
import type { Repository, StarHistory, AIAnalysis } from './types';

interface Props {
  repo: Repository;
  onClose: () => void;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Vue: '#41b883',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Default: '#8b949e',
};

function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || LANG_COLORS.Default;
}

function StarChart({ data }: { data: StarHistory[] }) {
  if (data.length < 2) return <p className="text-zinc-500 text-sm">暂无趋势数据</p>;

  const max = Math.max(...data.map((d) => d.count));
  const min = Math.min(...data.map((d) => d.count));
  const w = 320;
  const h = 80;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((d.count - min) / (max - min || 1)) * (h - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const areaPath = `M${points[0]} ${points.map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join(' ')} L${w - padding},${h - padding} L${padding},${h - padding} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 text-yellow-400">
      <defs>
        <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#starGrad)" />
      <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (w - padding * 2);
        const y = h - padding - ((d.count - min) / (max - min || 1)) * (h - padding * 2);
        return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />;
      })}
    </svg>
  );
}

export default function RepoDetailPanel({ repo, onClose }: Props) {
  const [history, setHistory] = useState<StarHistory[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'trend' | 'ai'>('info');

  useEffect(() => {
    setLoading(true);
    setHistory([]);
    setAnalysis(null);
    setActiveTab('info');

    // Fetch star history
    fetch(`/api/star-history?owner=${repo.owner}&repo=${repo.name}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setHistory(d);
      })
      .catch(() => setHistory([]));

    // Fetch AI analysis
    fetch(`/api/analyze?owner=${repo.owner}&repo=${repo.name}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setAnalysis(d);
      })
      .catch(() => setAnalysis(null));

    setLoading(false);
  }, [repo]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getLangColor(repo.language) }} />
            <h2 className="font-bold text-white truncate">{repo.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl leading-none p-1 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {(['info', 'trend', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-white border-b-2 border-zinc-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'info' ? '详情' : tab === 'trend' ? '趋势' : 'AI 分析'}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <p className="text-zinc-300 leading-relaxed">{repo.description || '暂无描述'}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 text-lg font-bold">{repo.stars.toLocaleString()}</div>
                  <div className="text-zinc-500 text-xs">Stars</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-blue-400 text-lg font-bold">{repo.language}</div>
                  <div className="text-zinc-500 text-xs">语言</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="text-zinc-300 text-sm font-medium">
                    {new Date(repo.starredAt).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="text-zinc-500 text-xs">收藏日期</div>
                </div>
              </div>

              <div>
                <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">收藏者</h3>
                <p className="text-zinc-300 text-sm">{repo.owner}</p>
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
              >
                在 GitHub 查看 ↗
              </a>
            </div>
          )}

          {/* Trend Tab */}
          {activeTab === 'trend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Star 增长趋势</span>
                {history.length >= 2 && (
                  <span className="text-green-400">
                    +{history[history.length - 1].count - history[0].count} ↑ 共 {history.length} 个数据点
                  </span>
                )}
              </div>
              {loading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <StarChart data={history} />
              )}
              <p className="text-zinc-600 text-xs">* 数据来自 GitHub Archive，可能存在延迟</p>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-yellow-400 rounded-full animate-spin" />
                  <span className="text-zinc-400 text-sm">AI 分析中...</span>
                </div>
              ) : analysis ? (
                <>
                  <div>
                    <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">技术栈</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.techStack.map((t) => (
                        <span key={t} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">项目亮点</h3>
                    <ul className="space-y-1">
                      {analysis.highlights.map((h, i) => (
                        <li key={i} className="text-zinc-300 text-sm flex gap-2">
                          <span className="text-yellow-400 shrink-0">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">适用场景</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suitableFor.map((s) => (
                        <span key={s} className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">一句话评价</h3>
                    <p className="text-zinc-200 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">暂无分析数据</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
