import { Gender, UserSettings, DEFAULT_SETTINGS } from '../types';

const port = chrome.runtime.connect({ name: 'popup' });
// remove counter bc its unneeded (maybe)
let oriGenCounter = 0;
let counter = 0;
let settings: UserSettings = null;

function getRequestId() {
  return ++counter;
}

function sendRequest(request, executor: (response, resolve: (data?) => void) => void) {
  const id = getRequestId();
  return new Promise((resolve) => {
    const listener = ({ id: responseId, ...response }) => {
      if (responseId === id) {
        executor(response, resolve);
        port.onMessage.removeListener(listener);
      }
    };
    port.onMessage.addListener(listener);
    port.postMessage({ ...request, id });
  });
}

function getData() {
  return sendRequest({ type: 'get-data' }, ({ data }, resolve) => resolve(data));
}

export function isSettingsReady() {
  return settings != null;
}

const readyStateListeners = new Set<() => void>();

export function addSettingsListener(listener: () => void) {
  readyStateListeners.add(listener);
}

getData().then(($settings: UserSettings) => {
  settings = $settings;
  readyStateListeners.forEach((listener) => listener());
  readyStateListeners.clear();
});

function saveCurrentoriGen(index: number) {
  const oriGen: Gender = {
    gender: (document.getElementById('txtogGen') as HTMLInputElement).value.trim(),
  };
  if (oriGen.gender) {
    settings.oriGen[index] = oriGen;
  } else {
    settings.oriGen.splice(index, 1);
  }
}

function loadDOM() {
  (document.getElementById('txtPrefGen') as HTMLInputElement).value = settings.prefGen.gender;

  (document.getElementById('txtogGen') as HTMLInputElement).value = settings.oriGen[oriGenCounter].gender;

  (document.getElementById('stealth-option') as HTMLInputElement).checked = settings.stealthMode;
  (document.getElementById('highlight-option') as HTMLInputElement).checked = settings.highlight;

  renderoriGen(0, 0);
}

function changeSettings($settings: Partial<UserSettings>) {
  port.postMessage({ type: 'save-data', data: $settings });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isSettingsReady()) {
    addSettingsListener(() => loadDOM());
  } else {
    loadDOM();
  }
});

const saveSettings = () => {
  const prefGen: Gender = {
    gender: (document.getElementById('txtPrefGen') as HTMLInputElement).value.trim(),
  };

  saveCurrentoriGen(oriGenCounter);

  const $settings: Partial<UserSettings> = {
    prefGen,
    oriGen: settings.oriGen,
    stealthMode: settings.stealthMode,
    highlight: settings.highlight,
  };

  changeSettings($settings);

  document.getElementById('deadnames').classList.add('hide');
};
document.getElementById('btnSave').addEventListener('click', saveSettings);

const coll = document.getElementsByClassName('hide');

for (let i = 0, len = coll.length; i < len; i++) {
  coll[i].addEventListener('click', (event: MouseEvent) => {
    const content = (event.target as HTMLInputElement).nextElementSibling as HTMLElement;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = 'max-content';
    }
  });
}

const leftArrow = document.querySelector('.leftArrow');
const rightArrow = document.querySelector('.rightArrow');
leftArrow.addEventListener('click', () => {
  renderoriGen(oriGenCounter, --oriGenCounter);
});

rightArrow.addEventListener('click', () => {
  renderoriGen(oriGenCounter, ++oriGenCounter);
});

(document.getElementById('stealth-option') as HTMLInputElement).addEventListener('change', (e: Event) => {
  settings.stealthMode = (e.target as HTMLInputElement).checked;
});

(document.getElementById('highlight-option') as HTMLInputElement).addEventListener('change', (e: Event) => {
  settings.highlight = (e.target as HTMLInputElement).checked;
});

function onChangeInput() {
  function changeInput() {
    const oriGend: Gender = {
      gender: (document.getElementById('txtogGen') as HTMLInputElement).value.trim(),
    };
    if (oriGend.gender) {
      rightArrow.classList.toggle('active', true);
    } else {
      saveCurrentoriGen(oriGenCounter);
      renderoriGen(oriGenCounter, oriGenCounter, { disableSave: true });
    }
  }
  (document.getElementById('txtogGen') as HTMLInputElement).addEventListener('change', changeInput);
}
// if this even works i'll be damned, i deadass have no clue what im doing

onChangeInput();

function renderoriGen(oldIndex: number, newIndex: number, options: { disableSave: boolean } = { disableSave: false }) {
  if (!options.disableSave) {
    saveCurrentoriGen(oldIndex);
  }
  if (newIndex === 0) {
    leftArrow.classList.toggle('active', false);
  } else {
    leftArrow.classList.toggle('active', true);
  }
  if (newIndex === settings.oriGen.length) {
    settings.oriGen.push(DEFAULT_SETTINGS.oriGen[0]);
    rightArrow.classList.toggle('active', false);
  } else {
    rightArrow.classList.toggle('active', true);
  }
  (document.getElementById('txtogGen') as HTMLInputElement).value = settings.oriGen[newIndex].gender;
}