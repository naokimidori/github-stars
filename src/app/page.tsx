'use client';

import { useState, useEffect } from 'react';

interface Repository {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  starredAt: string;
}

interface StarredRepo {
  nameWithOwner: string;
  description: string;
  url: string;
  primaryLanguage: { name: string } | null;
  stargazerCount: number;
}

interface StarEdge {
  starredAt: string;
}

export default function GitHubStars() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');

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
          <div className="text-4xl mb-4">⭐</div>
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
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">⭐ My GitHub Stars</h1>
              <p className="text-zinc-400 text-sm mt-1">
                {repos.length} 个收藏仓库
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/naokimidori"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors text-sm"
              >
                @naokimidori ↗
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
            <input
              type="text"
              placeholder="搜索仓库..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-64"
            />
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
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
          <div className="text-center text-zinc-500 py-20">没有找到匹配的仓库</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repo) => (
              <a
                key={repo.fullName}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                    {repo.name}
                  </h3>
                  <span className="text-yellow-400 text-sm shrink-0">★ {repo.stars.toLocaleString()}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-3">{repo.owner}</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {repo.description || '暂无描述'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                    {repo.language}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {new Date(repo.starredAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
