import { UserSettings, DEFAULT_SETTINGS, Gender } from '../types';
import { domAction } from './dom';

const cachedWords = new Map<string, string>();
let observer: MutationObserver = null;
let prefGen: Gender = null;
let oriGen: Gender[] = null;
let newWords: string[] = [];
let oldWords: string[] = [];
let revert = false;
let highlight: boolean;

export function start(settings: UserSettings = DEFAULT_SETTINGS) {
  cleanUp();
  if (!settings.enabled) {
    return;
  }
  highlight = settings.highlight;
  prefGen = settings.prefGen;
  oriGen = settings.oriGen;
  initalizeWords();
  replaceDOMWithNewWords();
}

function cleanUp() {
  if (newWords.length === 0 || oldWords.length === 0) {
    return;
  }
  observer && observer.disconnect();
  revert = true;
  [newWords, oldWords] = [oldWords, newWords];
  replaceDOMWithNewWords();
  [newWords, oldWords] = [oldWords, newWords];
  revert = false;
  cachedWords.clear();
}

function initalizeWords() {
  newWords = [];
  oldWords = [];
  const isPreferredGender = !!prefGen.gender;
  for (let x = 0, len = oriGen.length; x < len; x++) {
    const isOriginalGender = !!oriGen[x].gender;
    if (
      isPreferredGender && isOriginalGender
    ) {
      const fullPreffered = `${prefGen.gender}`;
      const fullOriginal = `${oriGen[x].gender}`;
      newWords.push(fullPreffered);
      oldWords.push(fullOriginal);
    }

    if (isPreferredGender && isOriginalGender) {
      newWords.push(prefGen.gender);
      oldWords.push(oriGen[x].gender);
    }

    if (
      isPreferredGender && isOriginalGender
    ) {
      newWords.push(prefGen.gender);
      oldWords.push(oriGen[x].gender);
    }
  }
}

const acceptableCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_あいおえうかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆらりるれろわをんアイオエウカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンー１２３４５６７８９０－｜￥・／｜「」【】『』＜＞ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＺ';　// i fcking hate full-width characters -__-

function replaceText(text: string, isTitle?: boolean) {
  let currentIndex = 0;
  let index: number; let
    end: number;
  const getIndex = (searchString: string, position?: number) => index = text.toLowerCase().indexOf(searchString, position);
  const getNextIndex = (position: number) => {
    index = getIndex(oldWords[currentIndex], position);
    while (index === -1) {
      if (currentIndex + 1 === oldWords.length) {
        return false;
      }
      currentIndex++;
      index = getIndex(oldWords[currentIndex]);
    }
    return true;
  };
  oldWords = oldWords.map((oldText) => oldText.toLowerCase());
  if (highlight && !isTitle) {
    if (revert) {
      oldWords = oldWords.map((text) => `<mark replaced="">${text}</mark>`);
    } else {
      newWords = newWords.map((text) => (text.includes('replaced') ? text : `<mark replaced="">${text}</mark>`));
    }
  }
  const oldTextsLen = oldWords.map((word) => word.length);
  while (getNextIndex(end)) {
    end = index + oldTextsLen[currentIndex];
    if (acceptableCharacters.indexOf(text[end]) === -1 && acceptableCharacters.indexOf(text[index - 1]) === -1) {
      text = text.substring(0, index) + newWords[currentIndex] + text.substring(end);
    }
  }
  return text;
}

function checkNodeForReplacement(node: Node) {
  if (!node || (!revert && (node as any).replaced)) {
    return;
  }
  if (revert) {
    if (highlight) {
      const cachedText = cachedWords.get((node as HTMLElement).innerHTML);
      if (cachedText) {
        (node as HTMLElement).innerHTML = cachedText.toString();
      }
    } else {
      const cachedText = cachedWords.get(node.nodeValue);
      if (cachedText) {
        node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
      }
    }
    return;
  }
  if (node.nodeType === 3) {
    const oldText = node.nodeValue;
    let newText = node.nodeValue;
    newText = replaceText(newText, false);
    if (newText !== oldText) {
      cachedWords.set(newText, oldText);
      if (node.parentElement) {
        node.parentElement.innerHTML = newText;
      }
    }
  } else if (node.hasChildNodes()) {
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      checkNodeForReplacement(node.childNodes[i]);
    }
  }
}

function setupListener() {
  observer = new MutationObserver((mutations: Array<MutationRecord>) => {
    for (let i = 0, len = mutations.length; i < len; i++) {
      const mutation: MutationRecord = mutations[i];
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node: Node) => {
          checkNodeForReplacement(node);
        });
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

function checkElementForTextNodes() {
  if (revert && highlight) {
    const elements = document.body.querySelectorAll('mark[replaced]');
    for (let i = 0, len = elements.length; i < len; i++) {
      checkNodeForReplacement(elements[i].parentElement);
    }
  }
  const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
  let currentTextNode: Node;
  while ((currentTextNode = iterator.nextNode())) {
    checkNodeForReplacement(currentTextNode);
  }
  !revert && setupListener();
}

function replaceDOMWithNewWords() {
  document.title = replaceText(document.title, true);
  domAction(() => checkElementForTextNodes());
}
