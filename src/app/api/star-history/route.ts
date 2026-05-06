import { NextResponse } from 'next/server';

const STAR_HISTORY_API = 'https://api.github.com/repos';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  try {
    // GitHub doesn't provide direct star history API
    // Use stargazers endpoint to estimate (last 30 stargazers as proxy)
    const response = await fetch(
      `${STAR_HISTORY_API}/${owner}/${repo}/stargazers?per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Stars-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const stargazers = await response.json();
    
    // Map stargazers to approximate timeline
    // GitHub returns most recent first, so reverse to get chronological order
    const now = new Date();
    const history = stargazers.map((_: unknown, index: number) => {
      // Estimate dates: most recent stargazer = today, older ones = further back
      const daysAgo = Math.floor((index / 30) * 365); // rough estimate
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      return {
        date: date.toISOString().split('T')[0],
        count: stargazers.length - index,
      };
    }).reverse();

    return NextResponse.json(history.slice(0, 30));
  } catch (error) {
    console.error('Star history error:', error);
    return NextResponse.json({ error: 'Failed to fetch star history' }, { status: 500 });
  }
}
