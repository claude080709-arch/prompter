export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 수정됨: GROQ_API_KEY 미설정 시 명확한 에러 반환
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: { message: 'GROQ_API_KEY가 설정되지 않았습니다.' } });
  }

  const { messages, max_tokens, temperature } = req.body;

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens,
        temperature
      })
    });
  } catch (e) {
    return res.status(502).json({ error: { message: 'Groq API 연결 실패: ' + e.message } });
  }

  // 수정됨: 4xx/5xx 에러 시 적절한 메시지 반환
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || `Groq API 오류 (${response.status})`;
    return res.status(response.status).json({ error: { message } });
  }

  const data = await response.json();
  res.status(200).json(data);
}
