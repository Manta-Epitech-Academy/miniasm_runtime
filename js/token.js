/**
 * Completion tokens — proof that an exercise's tests actually ran and passed.
 *
 * The app is the only thing that knows whether a solution works, and a platform
 * embedding it needs something the participant can submit. So on success it
 * reveals a token derived from the exercise id and a secret supplied by whoever
 * embeds the app:
 *
 *     window.MiniASMTokenSecret = "<per-session secret>";
 *
 * The token is `asm{<first 12 hex of HMAC-SHA256(secret, "miniasm:<id>")>}`, and
 * the platform computes the same value server-side to set as the flag.
 *
 * **What this is and is not.** It is a real check that somebody got the tests to
 * pass in the normal flow, and — because the secret differs per session — last
 * year's answers are worthless this year. It is *not* unforgeable: everything
 * here runs in the browser, so a determined participant can read the secret and
 * compute the token without solving anything. That is inherent to a client-side
 * runtime (see the advisory-only rule in the platform's protocol), and the
 * honest use of it is a deterrent plus a record, not an exam.
 *
 * With no secret set, nothing is revealed and the app behaves exactly as it does
 * standalone.
 */
(function () {
  var PREFIX = 'miniasm:';

  function hex(buffer) {
    var out = '';
    var view = new Uint8Array(buffer);
    for (var i = 0; i < view.length; i++) {
      out += view[i].toString(16).padStart(2, '0');
    }
    return out;
  }

  /** Resolves to the token string, or null when the app is not embedded. */
  function tokenFor(exerciseId) {
    var secret = window.MiniASMTokenSecret;
    if (!secret) return Promise.resolve(null);
    var subtle = (window.crypto && window.crypto.subtle) || null;
    if (!subtle) return Promise.resolve(null);

    var encoder = new TextEncoder();
    return subtle
      .importKey('raw', encoder.encode(String(secret)),
                 { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(function (key) {
        return subtle.sign('HMAC', key, encoder.encode(PREFIX + exerciseId));
      })
      .then(function (signature) {
        return 'asm{' + hex(signature).slice(0, 12) + '}';
      })
      .catch(function () { return null; });
  }

  window.MiniASMToken = { tokenFor: tokenFor, PREFIX: PREFIX };
})();
