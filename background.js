'use strict';

const ADD_TEXT_ID = 'add-text';
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: ADD_TEXT_ID,
    title: 'Add to Text Saver',
    type: 'normal',
    contexts: ['selection', 'page'],
  });
});

chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  let { pageUrl, selectionText } = item;
  // when selection is null, fallback to title of current tab
  // if title is also null, fallback to pageUrl
  if (!selectionText) {
    selectionText = tab.title || pageUrl;
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
