import { generateRandomString, generateCodeChallenge } from './utils.mjs';

export default async function handler(req, res) {
  const generateRandomString = (length) => {
    return [...Array(length)].map(() => Math.random().toString(36)[2]).join('');
  };

  const codeVerifier = generateRandomString(64);
  const state = generateRandomString(16);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  res.setHeader('Set-Cookie', [
    `spotify_auth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`,
    `spotify_code_verifier=${codeVerifier}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`
  ]);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state',
    redirect_uri: process.env.REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
