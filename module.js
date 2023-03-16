'use strict';

export class Options {
  static keyNotification = 'enable-notification';
  // system, light, dark
  static keyColor = 'color-scheme';

  constructor(storage) {
    this.storage = storage;
  }

  async getNotification() {
    const opt = await this.storage.get({ [Options.keyNotification]: false });
    return opt[Options.keyNotification];
  }

  async setNotification(enable) {
    return await this.storage.set({ [Options.keyNotification]: enable });
  }

  async getColorScheme() {
    const opt = await this.storage.get({ [Options.keyColor]: 'system' });
    return opt[Options.keyColor];
  }

  async setColorScheme(scheme) {
    return await this.storage.set({ [Options.keyColor]: scheme });
  }

  // Mainly for testing
  async clear() {
    return await this.storage.clear(null);
  }
  async dump() {
    return await this.storage.get(null);
  }
}
