// ==UserScript==
// @name         Deadname-Remover
// @version      1.0.6
// @description  Replace old genders with new genders.
// @author       William Hayward & Ari Gibson
// @license      MIT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @namespace    https://github.com/arimgibson/Deadname-Remover
// @supportURL   https://github.com/arimgibson/Deadname-Remover/issues
// @require      https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.require.js
// @updateURL    https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.meta.js
// @downloadURL  https://github.com/arimgibson/Deadname-Remover/raw/main/deadname-remover.user.js
// ==/UserScript==

(function () {
  const settings = {
    prefGen: {
      gender: '',
    },
    oriGen: [
      {
        gender: '',
      },
    ],
    enabled: true,
    stealthMode: false,
    highlight: false,
  };
  GenderChangerstart(settings);
}());
