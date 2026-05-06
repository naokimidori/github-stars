import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME || 'naokimidori';

const QUERY = `
{
  viewer {
    starredRepositories(first: 100, orderBy: {field: STARRED_AT, direction: DESC}) {
      nodes {
        nameWithOwner
        description
        url
        primaryLanguage {
          name
        }
        stargazerCount
      }
      edges {
        starredAt
      }
    }
  }
}
`;

export async function GET() {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    console.error('GitHub response status:', response.status);
    console.error('GitHub response:', JSON.stringify(data).substring(0, 500));

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const edges = data.data?.viewer?.starredRepositories?.edges || [];
    const nodes = data.data?.viewer?.starredRepositories?.nodes || [];

    const repos = edges.map((edge: { starredAt: string }, index: number) => {
      const node = nodes[index];
      const [owner, name] = node.nameWithOwner.split('/');
      return {
        name,
        owner,
        fullName: node.nameWithOwner,
        description: node.description || '',
        url: node.url,
        language: node.primaryLanguage?.name || 'Unknown',
        stars: node.stargazerCount || 0,
        starredAt: edge.starredAt,
      };
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error);
    return NextResponse.json({ error: 'Failed to fetch stars' }, { status: 500 });
  }
}
