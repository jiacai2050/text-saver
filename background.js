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

chrome.contextMenus.onClicked.addListener(async (item) => {
  let { pageUrl, selectionText } = item;
  // when selection is null, fallback to url
  if (!selectionText) {
    selectionText = pageUrl;
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
  await chrome.notifications.create(null, {
    type: 'basic',
    title: pageUrl,
    contextMessage: 'Saved',
    message: selectionText,
    iconUrl: 'imgs/logo.png',
  });
});

chrome.action.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});
