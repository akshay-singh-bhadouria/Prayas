export type AIProvider = 'openai' | 'gemini' | 'groq';

function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'gemini' || provider === 'groq') return provider;
  return 'openai';
}

export async function callAI({
  system,
  prompt,
  temperature = 0.5,
  image
}: {
  system: string;
  prompt: string;
  temperature?: number;
  image?: { data: string; mimeType: string };
}) {
  const provider = getProvider();
  const userAgent = 'prayas';

  if (provider === 'gemini') {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY missing');

    const runGenerate = async (modelId: string) => {
      const parts: Array<{
        text?: string;
        inlineData?: { data: string; mimeType: string };
      }> = [{ text: `${system}\n\n${prompt}` }];
      if (image?.data) {
        parts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType || 'image/jpeg'
          }
        });
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature }
          })
        }
      );

      const raw = await res.text();
      if (!res.ok) {
        const error = new Error(
          `Gemini error: ${res.status}${raw ? ` - ${raw}` : ''}`
        ) as Error & { status?: number };
        error.status = res.status;
        throw error;
      }

      const data = raw ? JSON.parse(raw) : {};
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    };

    const pickFallbackModel = async () => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { headers: { 'User-Agent': userAgent } }
      );
      if (!res.ok) {
        const details = await res.text();
        throw new Error(
          `Gemini models.list error: ${res.status}${
            details ? ` - ${details}` : ''
          }`
        );
      }
      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models : [];
      const generateModels = models.filter((m) =>
        (m.supportedGenerationMethods || []).includes('generateContent')
      );
      if (!generateModels.length) {
        throw new Error(
          'Gemini error: No generateContent models available for this API key.'
        );
      }

      const preferred = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-pro',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini'
      ];

      const names = generateModels
        .map((m) => (typeof m.name === 'string' ? m.name : ''))
        .filter(Boolean);

      for (const pref of preferred) {
        const match = names.find((name) => name.includes(pref));
        if (match) return match.replace(/^models\//, '');
      }

      const fallback = names[0].replace(/^models\//, '');
      return fallback;
    };

    try {
      return await runGenerate(model);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        const fallbackModel = await pickFallbackModel();
        if (fallbackModel && fallbackModel !== model) {
          return await runGenerate(fallbackModel);
        }
      }
      throw error;
    }
  }

  if (image?.data) {
    throw new Error('Image input is only supported with Gemini.');
  }

  if (provider === 'groq') {
    const model = process.env.GROQ_MODEL || 'llama3-70b-8192';
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY missing');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'User-Agent': userAgent
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!res.ok) {
      const details = await res.text();
      throw new Error(
        `Groq error: ${res.status}${details ? ` - ${details}` : ''}`
      );
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'User-Agent': userAgent
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(
      `OpenAI error: ${res.status}${details ? ` - ${details}` : ''}`
    );
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
