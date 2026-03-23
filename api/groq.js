export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, max_tokens, temperature } = req.body;

  // 수정됨: response.ok 체크 추가 — 4xx/5xx 에러 처리
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
