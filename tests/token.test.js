/**
 * Completion tokens (js/token.js).
 *
 * The platform computes the same value server-side to use as the flag, so the
 * derivation is a contract between two codebases: exercise id + secret in,
 * `asm{12 hex}` out. These tests are what keeps the two ends honest.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function load() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'token.js'), 'utf8');
  const window = { crypto: { subtle: crypto.webcrypto.subtle } };
  global.window = window;
  global.TextEncoder = TextEncoder;
  new Function('window', src)(window);
  return window;
}

const expected = (secret, id) =>
  'asm{' + crypto.createHmac('sha256', secret).update('miniasm:' + id)
    .digest('hex').slice(0, 12) + '}';

describe('completion tokens', () => {
  test('nothing is revealed when the app is not embedded', async () => {
    const w = load();
    await expect(w.MiniASMToken.tokenFor(3)).resolves.toBeNull();
  });

  test('matches HMAC-SHA256(secret, "miniasm:<id>") truncated to 12 hex', async () => {
    const w = load();
    w.MiniASMTokenSecret = 'session-secret';
    await expect(w.MiniASMToken.tokenFor(3))
      .resolves.toBe(expected('session-secret', 3));
  });

  test('a different exercise gives a different token', async () => {
    const w = load();
    w.MiniASMTokenSecret = 'session-secret';
    const [a, b] = await Promise.all([w.MiniASMToken.tokenFor(3),
                                      w.MiniASMToken.tokenFor(4)]);
    expect(a).not.toBe(b);
  });

  test('a different session gives a different token — last year\'s answers are worthless', async () => {
    const w = load();
    w.MiniASMTokenSecret = 'session-a';
    const a = await w.MiniASMToken.tokenFor(3);
    w.MiniASMTokenSecret = 'session-b';
    const b = await w.MiniASMToken.tokenFor(3);
    expect(a).not.toBe(b);
  });
});
