const TEMPLATES = {
  headline: [
    'Be the First to Experience {title}',
    'Unlock Exclusive Access to {title}',
    '{title} — Only for True Fans',
    'Get Early Access: {title}',
    'Join the {artist} Inner Circle'
  ],
  share_message: [
    "I just unlocked exclusive access to {artist}'s {title}! Join me and get rewards: {link}",
    "🔥 {artist} just dropped something insane. Get in before it's gone: {link}",
    "Real ones know. {artist} - {title}. Sign up & we both get rewarded: {link}"
  ],
  email_subject: [
    'You need to check this out',
    "Something exclusive from {artist}",
    "You're invited: {title}"
  ]
};

async function generateCopy({ type, artist_name, campaign_title, campaign_type, tone }) {
  // Try Claude API if configured
  if (process.env.CLAUDE_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Generate 3 ${type} options for a music fan campaign.
Artist: ${artist_name}
Campaign: ${campaign_title}
Type: ${campaign_type}
Tone: ${tone || 'exciting, exclusive, urgent'}

Return ONLY a JSON array of 3 strings, no other text.`
          }]
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content[0].text;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          return JSON.parse(match[0]);
        }
      }
    } catch (err) {
      console.error('AI copy generation failed, using templates:', err.message);
    }
  }

  // Fallback to templates
  const templates = TEMPLATES[type] || TEMPLATES.headline;
  return templates.map(t =>
    t.replace('{title}', campaign_title || 'New Release')
     .replace('{artist}', artist_name || 'the artist')
     .replace('{link}', '{link}')
  );
}

module.exports = { generateCopy };
