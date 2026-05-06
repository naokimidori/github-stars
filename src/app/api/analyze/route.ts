import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function GET(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  try {
    // Fetch README
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Stars-App',
        },
      }
    );

    if (!readmeRes.ok) {
      throw new Error(`Failed to fetch README: ${readmeRes.status}`);
    }

    const readmeData = await readmeRes.json();
    const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    const readmeText = readmeContent.slice(0, 3000); // Limit to first 3000 chars

    const prompt = `分析以下 GitHub 项目，总结出技术栈、项目亮点、适用场景，并用一句话评价。

项目: ${owner}/${repo}
README 内容:
${readmeText}

请用 JSON 格式返回，包含以下字段（只返回 JSON，不要其他内容）：
{
  "techStack": ["技术1", "技术2"],
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "suitableFor": ["场景1", "场景2"],
  "summary": "一句话评价"
}`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json(analysis);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze repository' }, { status: 500 });
  }
}
