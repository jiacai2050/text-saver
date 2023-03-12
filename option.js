'use strict';

import { Options } from './module.js';

async function getTexts() {
  return await chrome.storage.local.get();
}

async function clearTexts() {
  return await chrome.storage.local.clear();
}

async function removeTexts(id) {
  return await chrome.storage.local.remove(id);
}

async function textStats() {
  return await chrome.storage.local.getBytesInUse(null);
}

function humanSize(size) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (i < units.length - 1 && size >= 1024) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

async function refresh() {
  let rows = [];
  for (const [id, { text, url, createdAt }] of Object.entries(
    await getTexts()
  )) {
    rows.push([id, text, url, createdAt]);
  }
  // sort by createdAt desc
  rows.sort((a, b) => b[3] - a[3]);
  let table = [];
  for (const row of rows) {
    let [id, text, url, createdAt] = row;
    table.push(`<tr>
<td id="text-${id}"></td>
<td>${new Date(createdAt).toLocaleString()}</td>
<td>
<div class="btn-group" role="group">
  <button type="button" class="btn btn-info btn-sm" id="btn-copy-${id}">Copy</button>
  <a role="button" class="btn btn-info btn-sm" href="${url}">Goto</a>
  <button type="button" class="btn btn-danger btn-sm" id="btn-delete-${id}">Delete</button>
</div>
</td>

</tr>`);
  }

  document.getElementById('text-list').innerHTML = table.join('');

  for (const row of rows) {
    let [id, text] = row;
    // use `textContent` to prevent XSS
    document.getElementById(`text-${id}`).textContent = text;
    document.getElementById(`btn-delete-${id}`).onclick = async function () {
      if (confirm('Are you sure?')) {
        await removeTexts(id);
        refresh();
      }
    };
    const copyButton = document.getElementById(`btn-copy-${id}`);
    copyButton.onclick = function () {
      navigator.clipboard.writeText(
        document.getElementById(`text-${id}`).innerHTML
      );
      copyButton.innerHTML = 'Copied';
      setTimeout(function () {
        copyButton.innerHTML = 'Copy';
      }, 1000);
    };
  }
}

window.onload = async function () {
  let opt = new Options(chrome.storage.sync);

  document.getElementById('btn-clear').onclick = async function () {
    if (confirm('Are you sure to clear all saved texts?')) {
      await clearTexts();
      await refresh();
    }
  };
  document.getElementById('btn-export').onclick = async function () {
    const { version, author, homepage_url } =
      await chrome.runtime.getManifest();
    const payload = {
      homepage: homepage_url,
      version: version,
      author: author,
      createdAt: new Date().toLocaleString(),
      texts: await getTexts(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      saveAs: true,
      filename: 'saved-texts.json',
    });
  };

  // console.log(await opt.dump());
  document.getElementById('input-size').value = humanSize(await textStats());
  const inputNotification = document.getElementById('input-notification');
  inputNotification.checked = await opt.getNotification();
  inputNotification.onclick = async function () {
    opt.setNotification(inputNotification.checked);
  };

  await refresh();
};
