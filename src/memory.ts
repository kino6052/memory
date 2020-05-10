import { CRUD, IId, ItemList, IItem } from "./item";
import { generateUniqueId } from "./utils";

export interface IMemory extends IId {
  due: Date;
  itemId: string;
  score: number;
}

export const addHours = (date: Date) => (h: number) => {
  date.setTime(date.getTime() + h * 60 * 60 * 1000);
  return date;
};

export class MemoryList<T extends IId> extends CRUD<IMemory> {
  constructor(public crud: CRUD<T>, memories: IMemory[] = []) {
    super(memories);
  }
  memorize = (itemId: string) => {
    const date = new Date();
    return this.add({
      id: generateUniqueId(),
      due: date,
      score: 0,
      itemId,
    });
  };
  forgetCompletely = (itemId: string) => {
    const memory = this.items.find(({ itemId: id }) => id === itemId);
    if (!memory) return;
    this.remove(memory.id);
    this.crud.remove(itemId);
  };
  getDueMemories = () => {
    return this.items.filter((memory) => {
      console.warn(memory.itemId, memory.score);
      return memory.due.valueOf() < new Date().valueOf();
    });
  };
  private updateTimeBasedOnScore = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    const score = this.getScore(itemId);
    memory.due = addHours(memory.due)(score);
  };
  remember = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    memory.score = (memory.score || 0) + 1;
    this.updateTimeBasedOnScore(itemId);
  };
  forget = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    memory.score = (memory.score || 1) - 1;

    this.updateTimeBasedOnScore(itemId);
  };
  getScore = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return 0;
    return memory.score;
  };
}

export class ItemMemoryAdapter {
  constructor(public memoryList: MemoryList<IItem>) {}
  getDueItems = () => {
    const memories = this.memoryList.getDueMemories();
    const items = this.memoryList.crud.items.filter(({ id }) =>
      memories.map((memory) => memory.itemId).includes(id)
    );
    return items.reduce((acc, _, index) => {
      return [...acc, { ...items[index], id: memories[index].id }];
    }, [] as Array<IItem>);
  };
  addItem = (name: string) => {
    const item: IItem = {
      id: generateUniqueId(),
      name,
    };
    this.memoryList.crud.add(item);
    this.memoryList.memorize(item.id);
  };
  updateItem = (id: string, item: Partial<IItem>) => {
    this.memoryList.crud.update(id, item);
  };
  removeItem = (id: string) => {
    this.memoryList.forgetCompletely(id);
  };
}
