let CLIENT_ID = '79d7c3b9bf274a23ae5c0ccdb1ce7dbe';
let REDIRECT_URI = 'https://shadowfy-serverless.vercel.app/api/callback';
let authInProgress = false;

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function redirectToAuthCodeFlow() {
  if (authInProgress) return;
  authInProgress = true;

  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('verifier', codeVerifier);

  const args = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  window.location = `https://accounts.spotify.com/authorize?${args}`;
}