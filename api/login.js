import { generateRandomString, generateCodeChallenge } from './utils.mjs';

export default async function handler(req, res) {
  const state = generateRandomString(16);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  res.setHeader('Set-Cookie', [
    `spotify_auth_state=${state}; Path=/; HttpOnly; SameSite=Lax`,
    `spotify_code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax`
  ]);

  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state streaming';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.REDIRECT_URI,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}