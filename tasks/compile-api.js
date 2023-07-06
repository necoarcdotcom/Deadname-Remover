import { build } from 'esbuild';
import fs from 'fs-extra';
import pjson from '../package.json';
import types from '../src/types';

async function api() {
  await fs.remove('gender-remover.require.js');
  await fs.remove('gender-remover.meta.js');
  await fs.remove('gender-remover.user.js');

  const settings = JSON.stringify(types.DEFAULT_SETTINGS, null, '\t').split('\n');
  for (let x = 0, len = settings.length; x < len; x++) {
    settings[x] = `\t${settings[x].replace(/.+?(?=:)/g, (m$) => m$.replace(/"/g, ''))}`;
  }

  await build({
    entryPoints: ['src/inject/inject.ts'],
    outfile: 'gender-remover.require.js',
    format: 'iife',
    globalName: 'GenderRemover',
    minifySyntax: true,
    bundle: true,
    sourcemap: false,
  });

  const indent = ' '.repeat(4);

  const data = [
    '// ==UserScript==',
    '// @name         Gender-Changer',
    `// @version      ${pjson.version}`,
    '// @description  Replaces your birth gender with a gender of your choice.',
    '// @author       gumidotnet',
    '// @license      MIT',
    '// @match        *://*/*',
    '// @grant        none',
    '// @run-at       document-start',
    '// @namespace    https://github.com/WillHayCode/Deadname-Remover',
    '// @supportURL   https://github.com/WillHayCode/Deadname-Remover/issues',
    '// @require      https://github.com/WillHayCode/Deadname-Remover/blob/main/deadname-remover.require.js',
    '// @updateURL    https://github.com/WillHayCode/Deadname-Remover/blob/main/deadname-remover.meta.js',
    '// @downloadURL  https://github.com/WillHayCode/Deadname-Remover/blob/main/deadname-remover.user.js',
    '// ==/UserScript==',
    '',
    '(function() {',
    `${indent}'use strict';`,
    `${indent}const settings = ${settings.join('\n')}`,
    `${indent}GenderRemover.start(settings);`,
    '})();',
    '',
  ].join('\n');
  await fs.writeFile('gender-remover.user.js', data, { encoding: 'utf8' });

  const metaData = [
    '// ==UserScript==',
    '// @name        Gender-Changer',
    `// @version     ${pjson.version}`,
    '// @namespace   https://github.com/WillHayCode/Deadname-Remover',
    '// ==/UserScript==',
    '',
  ].join('\n');
  await fs.writeFile('gender-remover.meta.js', metaData, { encoding: 'utf8' });

  await fs.remove('types.js');
}

api();
