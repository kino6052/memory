import { CRUD, IItem, IId } from "./item";
import Dexie from "dexie";
import { IMemory } from "./memory";

export interface IConverter<T extends IId> {
  list: CRUD<T>;
  backend: IBackend;
  save: () => string;
  load: (cb: (value: T[]) => void) => void;
}

export interface IBackend {
  save: (value: string) => string;
  load: (cb: (value: string) => void) => void;
  clear: () => void;
}

export class Backend implements IBackend {
  constructor(public value: string) {}
  save(value: string) {
    this.value = value;
    return this.value;
  }
  load() {
    return this.value;
  }
  clear() {}
}

export class LocalStorageBackend implements IBackend {
  constructor(public value: string) {}
  save(value: string) {
    this.value = value;
    localStorage.setItem("test", this.value);
    return this.value;
  }
  load() {
    return localStorage.getItem("test") || "";
  }
  clear() {}
}

export class DexieMemoryBackend implements IBackend {
  db: Dexie;
  constructor(public value: string) {
    this.db = new Dexie("memory-db");
    this.db.version(1).stores({
      memories: "id,due,score,itemId"
    });
    // @ts-ignore
    window.memDb = this.db;
  }
  save = (value: string) => {
    this.value = value;
    try {
      const memories = JSON.parse(this.value);
      // // @ts-ignore
      // this.db.memories.clear().then(() => {
      // @ts-ignore
      this.db.memories.bulkPut(memories).catch((e: {}) => {
        console.warn(e);
      });
      // .then(console.warn);
      // });
    } catch (e) {
      console.warn(e);
    }
    return this.value;
  };
  load = (cb: (value: string) => void) => {
    try {
      // @ts-ignore
      this.db.memories
        .toArray()
        .then((v: IMemory[]) => {
          cb(JSON.stringify(v));
        })
        .catch((e: {}) => {
          console.warn(e);
          cb("[]");
        });
    } catch (e) {
      console.warn(e);
      cb("[]");
    }
  };
  clear = () => {
    try {
      // @ts-ignore
      this.db.memories
        .clear()
        // .then(console.warn)
        .catch(console.warn);
    } catch (e) {
      console.warn(e);
    }
  };
}

export class DexieItemsBackend implements IBackend {
  db: Dexie;
  constructor(public value: string) {
    this.db = new Dexie("item-db");
    this.db.version(1).stores({
      items: "id,name"
    });
    // @ts-ignore
    window.itemDb = this.db;
  }
  save = (value: string) => {
    this.value = value;
    try {
      const items = JSON.parse(this.value);
      // console.warn("Items", items);
      // @ts-ignore
      // this.db.items.clear().then(() => {
      // @ts-ignore
      this.db.items.bulkPut(items).catch(console.warn);
      // .then(console.warn);
      // });
    } catch (e) {
      console.warn(e);
    }
    return this.value;
  };
  load = (cb: (value: string) => void) => {
    try {
      // @ts-ignore
      this.db.items
        .toArray()
        .then((v: IItem[]) => {
          cb(JSON.stringify(v));
        })
        .catch((e: {}) => {
          console.warn(e);
          cb("[]");
        });
    } catch (e) {
      console.warn(e);
      cb("[]");
    }
  };
  clear = () => {
    try {
      // @ts-ignore
      this.db.items
        .clear()
        // .then(console.warn)
        .catch(console.warn);
    } catch (e) {
      console.warn(e);
    }
  };
}

export class PersistenceAdapter<T extends IId> implements IConverter<T> {
  constructor(public list: CRUD<T>, public backend: IBackend) {}
  save() {
    const value = JSON.stringify(this.list.items);
    this.backend.save(value);
    return value;
  }
  load(cb: (value: T[]) => void) {
    try {
      this.backend.load((v: string) => {
        const items = JSON.parse(v);
        cb(items);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
