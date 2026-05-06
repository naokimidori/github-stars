'use client';

import { useState, useEffect } from 'react';
import type { Repository } from './components/types';
import RepoDetailPanel from './components/RepoDetailPanel';

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

export default function GitHubStars() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    fetch('/api/github-stars')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('获取star失败，请刷新重试');
        setLoading(false);
      });
  }, []);

  const languages = [...new Set(repos.map((r) => r.language))].sort();
  const filtered = repos.filter((r) => {
    const matchSearch =
      !search ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchLang = !langFilter || r.language === langFilter;
    return matchSearch && matchLang;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <div className="text-zinc-400">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>⭐</span>
                <span>GitHub Stars</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {repos.length} 个收藏仓库
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/naokimidori"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                @naokimidori
                <span className="text-zinc-600">↗</span>
              </a>
              <a
                href="/logout"
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
              >
                退出
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              <input
                type="text"
                placeholder="搜索仓库..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer"
            >
              <option value="">全部语言</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-20 text-lg">没有找到匹配的仓库</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((repo) => (
              <button
                key={repo.fullName}
                onClick={() => setSelectedRepo(repo)}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all group text-left block w-full"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: getLangColor(repo.language) }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {repo.name}
                      </h3>
                      <span className="text-yellow-400 text-sm shrink-0 flex items-center gap-1">
                        ★ {repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-xs mt-0.5">{repo.owner}</p>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {repo.description || '暂无描述'}
                </p>

                <div className="flex items-center justify-between">
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getLangColor(repo.language) }}
                    />
                    {repo.language}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {new Date(repo.starredAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Detail Panel */}
      {selectedRepo && (
        <RepoDetailPanel
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}
