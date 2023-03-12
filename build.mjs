import manifest from './manifest.json' assert { type: 'json' };
import { writeFileSync } from 'fs';

const overwrite = {
  background: {
    scripts: ['background.js'],
  },
  browser_specific_settings: {
    gecko: {
      id: 'liujiacai@yandex.com',
    },
  },
};

for (const [key, value] of Object.entries(overwrite)) {
  manifest[key] = value;
}

writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2));
