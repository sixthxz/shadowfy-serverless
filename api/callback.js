export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code') || null;
  const codeVerifier = req.headers.cookie?.match(/spotify_code_verifier=([^;]+)/)?.[1] || null;

  const authData = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier
  };

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(authData).toString()
  });

  const tokenJson = await tokenRes.json();

  if (tokenJson.error) {
    return res.redirect('/#' + new URLSearchParams({ error: 'invalid_token' }).toString());
  }

  const params = new URLSearchParams({
    access_token: tokenJson.access_token,
    refresh_token: tokenJson.refresh_token,
    expires_in: tokenJson.expires_in
  });

  res.redirect('/player?' + params.toString());
}
