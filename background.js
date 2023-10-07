'use strict';

const ADD_TEXT_ID = 'add-text';
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

createMenus();

function createMenus() {
  let ctx = ['all'];
  // Firefox support more contexts
  if (isFirefox) {
    ctx = ['all', 'bookmark', 'tab'];
  }

  chrome.contextMenus.create({
    id: ADD_TEXT_ID,
    title: 'Add to Text Saver',
    type: 'normal',
    contexts: ctx,
  });
}

chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  let { pageUrl, srcUrl, selectionText } = item;
  // when selection is null, fallback to others.
  if (!selectionText) {
    selectionText = srcUrl || tab.title || pageUrl;
  }

  let uuid = crypto.randomUUID();
  const row = {
    [uuid]: {
      url: pageUrl,
      text: selectionText,
      createdAt: Date.now(),
    },
  };
  await chrome.storage.local.set(row);
  if (await getNotification()) {
    await chrome.notifications.create(null, {
      type: 'basic',
      title: pageUrl,
      contextMessage: 'Saved',
      message: selectionText,
      iconUrl: 'imgs/logo.png',
    });
  }
});

chrome.action.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});

// Firefox doesn't support module background.js directly
// So this fn is duplicated with Options
async function getNotification() {
  const key = 'enable-notification';
  const opt = await chrome.storage.sync.get({ [key]: false });
  return opt[key];
}
