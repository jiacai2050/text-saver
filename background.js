'use strict';

const ADD_NOTE_ID  = 'add-to-notes';
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: ADD_NOTE_ID,
    title: 'Add to Text Saver',
    type: 'normal',
    contexts: ['selection', 'page']
  });
});

chrome.contextMenus.onClicked.addListener(async (item) => {
  let {pageUrl, selectionText} = item;
  console.log(`item: ${pageUrl}, tab: ${selectionText}`);
  // when selection is null, fallback to url
  if(!selectionText) {
    selectionText = pageUrl;
  }

  let uuid = crypto.randomUUID();
  const now = Date.now();
  const row = {
    [uuid]: {
      'url': pageUrl,
      'text': selectionText,
      'createdAt': now,
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

chrome.action.onClicked.addListener(function() {
    chrome.runtime.openOptionsPage();
});
