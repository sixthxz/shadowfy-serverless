export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const refresh_token = url.searchParams.get('refresh_token');

  const payload = {
    grant_type: 'refresh_token',
    refresh_token,
    client_id: process.env.SPOTIFY_CLIENT_ID
  };

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString()
  });

  const tokenJson = await tokenRes.json();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(tokenJson));
}