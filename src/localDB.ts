import Dexie, { Table } from 'dexie';

export interface ApiCache {
  endpoint: string;
  data: any;
  timestamp: number;
}

export interface SyncQueue {
  id?: number;
  endpoint: string;
  method: string;
  data: any;
  createdAt: number;
}

export class AppDatabase extends Dexie {
  cache!: Table<ApiCache, string>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      cache: 'endpoint',
      syncQueue: '++id, endpoint, method, createdAt'
    });
  }
}

export const localDB = new AppDatabase();
