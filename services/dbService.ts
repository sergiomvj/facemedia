
import type { Creation } from '../types';

const DB_NAME = 'FaceMediaDB';
const STORE_NAME = 'creations';
const DB_VERSION = 2; // Bump version for schema change
const USER_ID_INDEX = 'userIdIndex';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Error opening DB', request.error);
            reject('Error opening DB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            let store: IDBObjectStore;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
            } else {
                store = (event.target as any).transaction.objectStore(STORE_NAME);
            }

            if (!store.indexNames.contains(USER_ID_INDEX)) {
                store.createIndex(USER_ID_INDEX, 'userId', { unique: false });
            }
        };
    });
};

export const addCreation = async (creationData: Omit<Creation, 'id'>): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const creationWithId: Creation = {
        ...creationData,
        id: Date.now(), // Use timestamp as a simple unique ID
    };

    return new Promise((resolve, reject) => {
        const request = store.add(creationWithId);
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error adding creation', request.error);
            reject('Error adding creation');
        };
    });
};

export const getCreations = async (userId: string): Promise<Creation[]> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(USER_ID_INDEX);

    return new Promise((resolve, reject) => {
        const request = index.getAll(userId);
        request.onsuccess = () => {
            // Sort by ID descending to show newest first
            resolve(request.result.sort((a, b) => b.id - a.id));
        };
        request.onerror = () => {
            console.error('Error getting creations', request.error);
            reject('Error getting creations');
        };
    });
};

export const deleteCreation = async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting creation', request.error);
            reject('Error deleting creation');
        };
    });
};