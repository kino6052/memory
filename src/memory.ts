import { CRUD, IId, ItemList, IItem } from "./item";
import { generateUniqueId, shuffle } from "./utils";

export interface IMemory extends IId {
  due: string;
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
      due: date.toISOString(),
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
    return this.items.filter(({ score }) => {
      const randomNumber = Math.random();
      const isDue = randomNumber <= this.scoreFunction(score);
      return isDue;
    });
  };
  private scoreFunction = (score: number) => {
    const probability = 1 / ((score || 1) ** 0.6 + 1);
    return probability;
  };
  private updateTimeBasedOnScore = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    const score = this.getScore(itemId);
    memory.due = addHours(new Date())(
      1.24 ** (score + 1) + 2 * Math.random()
    ).toISOString();
  };
  private updateTimeByNumberOfHours = (itemId: string, hours: number) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    memory.due = addHours(new Date())(hours * Math.random()).toISOString();
  };
  postpone = (itemId: string) => {
    const memory = this.getItemById(itemId);
    if (!memory) return;
    this.updateTimeByNumberOfHours(itemId, 2);
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
    memory.score = Math.round((memory.score || 1) / 2);
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
    const memories = this.memoryList.items;
    // const memoryItems = memories
    //   .sort((a, b) => a.score - b.score)
    //   .map((memory) => memory.itemId);
    const items = this.memoryList.crud.items;
    let scoreAcc = 0;
    const result = shuffle(
      items
        .reduce((acc, _, index) => {
          const { id = "", score = 0 } =
            memories.find((m) => m.itemId === items[index].id)! || {};
          return [...acc, { ...items[index], id, score }];
        }, [] as Array<IItem>)
        .filter(({ score }) => this.isItemDue(score || 0))
    );
    result.forEach(({ score }) => {
      scoreAcc += score || 0;
    });
    const averageScore = scoreAcc / items.length;
    console.warn(result);
    console.warn("Average Score", averageScore);
    return result;
  };
  private scoreFunction = (score: number) => {
    const probability = 1 / ((score || 1) ** 0.9 + 1);
    return probability;
  };
  isItemDue = (score: number) => {
    const randomNumber = Math.random();
    const isDue = randomNumber <= this.scoreFunction(score);
    return isDue;
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
