'use strict';

export class Options {
  static keyNotification = 'enable-notification';
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

  // Mainly for testing
  async clear() {
    return await this.storage.clear(null);
  }
  async dump() {
    return await this.storage.get(null);
  }
}
