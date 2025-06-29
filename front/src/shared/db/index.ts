import Dexie, { type EntityTable } from 'dexie';

export interface Settings {
  id: number;
  key: string;
  value: string | number | boolean;
  updatedAt: Date;
}

export interface AudioDevice {
  id: number;
  deviceId: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
}

const db = new Dexie('SpeechGPTWebDB') as Dexie & {
  settings: EntityTable<Settings, 'id'>;
  audioDevices: EntityTable<AudioDevice, 'id'>;
};

// Schema definition
db.version(1).stores({
  settings: '++id, key, value, updatedAt',
  audioDevices: '++id, deviceId, label, isDefault, createdAt',
});

// Settings helper functions
export const settingsService = {
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const setting = await db.settings.where('key').equals(key).first();
    return setting ? (setting.value as T) : (defaultValue as T);
  },

  async set(key: string, value: string | number | boolean): Promise<void> {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      await db.settings.update(existing.id, { value, updatedAt: new Date() });
    } else {
      await db.settings.add({ key, value, updatedAt: new Date() } as Settings);
    }
  },

  async remove(key: string): Promise<void> {
    await db.settings.where('key').equals(key).delete();
  },

  async getAll(): Promise<Settings[]> {
    return await db.settings.toArray();
  },
};

// Audio devices helper functions
export const audioDevicesService = {
  async getAll(): Promise<AudioDevice[]> {
    return await db.audioDevices.toArray();
  },

  async getDefault(): Promise<AudioDevice | undefined> {
    return await db.audioDevices.where('isDefault').equals(true).first();
  },

  async setDefault(deviceId: string): Promise<void> {
    // Clear all defaults
    await db.audioDevices.toCollection().modify({ isDefault: false });
    // Set new default
    await db.audioDevices.where('deviceId').equals(deviceId).modify({ isDefault: true });
  },

  async addDevice(deviceId: string, label: string): Promise<void> {
    const existing = await db.audioDevices.where('deviceId').equals(deviceId).first();
    if (!existing) {
      await db.audioDevices.add({
        deviceId,
        label,
        isDefault: false,
        createdAt: new Date(),
      } as AudioDevice);
    }
  },

  async removeDevice(deviceId: string): Promise<void> {
    await db.audioDevices.where('deviceId').equals(deviceId).delete();
  },

  async clear(): Promise<void> {
    await db.audioDevices.clear();
  },
};

export default db;
