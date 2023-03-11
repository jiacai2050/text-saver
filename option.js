'use strict';

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

async function refresh() {
  let rows = [];
  for (const [id, {text, url, createdAt}] of Object.entries(await getTexts())) {
    rows.push([id, text, url, createdAt]);
  }
  // sort by createdAt desc
  rows.sort((a, b) => b[3] - a[3]);
  let table = [];
  for(const row of rows) {
    let [id, text, url, createdAt] = row;
    table.push(`<tr>
<td>${text}</td>
<td>${new Date(createdAt).toLocaleString()}</td>
<td>
<div class="btn-group" role="group">
  <a role="button" class="btn btn-info btn-sm" href="${url}">Goto</a>
  <button type="button" class="btn btn-danger btn-sm" id="btn-delete-${id}">Delete</button>
</div>
</td>

</tr>`);
  }

  document.getElementById('text-list').innerHTML = table.join("");

  for(const row of rows) {
    let [id] = row;
    document.getElementById(`btn-delete-${id}`).onclick = async function () {
      if(confirm("Are you sure?")) {
        await removeTexts(id);
        refresh();
      }
    };
  }
}

window.onload = async function () {
  document.getElementById('btn-clear').onclick = async function () {
    if (confirm("Are you sure to clear all texts?") ) {
      await clearTexts();
      await refresh();
    }
  };
  document.getElementById('btn-refresh').onclick = refresh;
  document.getElementById('btn-export').onclick = async function () {
    const allTexts = await getTexts();
    const payload = new Blob([JSON.stringify(allTexts, null, 2)], {type: 'application/json'});
    chrome.downloads.download(
      {
        url: URL.createObjectURL(payload),
        saveAs: true,
        filename: 'saved-texts.json'
      }
    )
  };

  await refresh();
};
