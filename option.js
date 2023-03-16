'use strict';

import { Options } from './module.js';

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

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
  if (isFirefox) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
    return new TextEncoder().encode(
      Object.entries(await browser.storage.local.get())
        .map(([key, value]) => key + JSON.stringify(value))
        .join('')
    ).length;
  }

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
<td>${new Date(createdAt).toLocaleString('en-GB')}</td>
<td>
<div class="btn-group" role="group">
  <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-${id}">Copy</button>
  <a role="button" class="btn btn-secondary btn-sm" href="${url}">Goto</a>
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

function applyColorScheme(scheme) {
  if (
    scheme === 'system' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-bs-theme', scheme);
  }
}

window.onload = async function () {
  let opt = new Options(chrome.storage.sync);
  // console.log(await opt.dump());
  const selectColor = document.getElementById('select-color');
  selectColor.value = await opt.getColorScheme();
  applyColorScheme(selectColor.value);
  selectColor.onchange = async function () {
    await opt.setColorScheme(selectColor.value);
    applyColorScheme(selectColor.value);
  };

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', async (e) => {
      const colorScheme = await opt.getColorScheme();
      if (colorScheme === 'system') {
        if (e.matches) {
          // set to dark
          applyColorScheme('dark');
        } else {
          // set to light
          applyColorScheme('light');
        }
      }
    });

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

  document.getElementById('input-size').value = humanSize(await textStats());
  const inputNotification = document.getElementById('input-notification');
  inputNotification.checked = await opt.getNotification();
  inputNotification.onclick = async function () {
    opt.setNotification(inputNotification.checked);
  };

  await refresh();
};
