import { CRUD, IId, ItemList } from "./item";
import { generateUniqueId } from "./utils";
import { MemoryList, addHours } from "./memory";

it("should assign time (one hour from now) to new memories", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  const result = memoryList.memorize(item1.id);
  expect(result.length).toBe(1);
  expect(result[0].itemId).toEqual(item1.id);
  expect(result[0].due).toBeTruthy();
  expect(
    Math.abs(
      Math.round((result[0].due.valueOf() - new Date().valueOf()) / 100000)
    )
  ).toEqual(0);
});

it("should get all the memories that are past the due time", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  memoryList.memorize(item1.id);
  memoryList.memorize(item2.id);
  expect(memoryList.getDueMemories()).toEqual([]);
  memoryList.update(memoryList.items[0].id, { due: addHours(new Date())(-1) });
  expect(memoryList.getDueMemories()[0]).toEqual(memoryList.items[0]);
});

it("should set deadline further if you remember item than if you dont", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  memoryList.memorize(item1.id);
  memoryList.memorize(item2.id);
  memoryList.remember(memoryList.items[0].id);
  expect(
    memoryList.items[0].due.valueOf() > memoryList.items[1].due.valueOf()
  ).toBeTruthy();
});

it("should keep a score that gets lower with forgetting, and increases as you remember", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  memoryList.memorize(item1.id);
  memoryList.memorize(item2.id);
  let score1 = memoryList.getScore(memoryList.items[0].id);
  let score2 = memoryList.getScore(memoryList.items[1].id);
  expect(score1 === score2).toBeTruthy();
  memoryList.remember(memoryList.items[0].id);
  score1 = memoryList.getScore(memoryList.items[0].id);
  score2 = memoryList.getScore(memoryList.items[1].id);
  expect(score1 > score2).toBeTruthy();
  memoryList.remember(memoryList.items[1].id);
  score1 = memoryList.getScore(memoryList.items[0].id);
  score2 = memoryList.getScore(memoryList.items[1].id);
  expect(score1 === score2).toBeTruthy();
  memoryList.forget(memoryList.items[0].id);
  score1 = memoryList.getScore(memoryList.items[0].id);
  score2 = memoryList.getScore(memoryList.items[1].id);
  expect(score1 < score2).toBeTruthy();
  memoryList.forget(memoryList.items[1].id);
  score1 = memoryList.getScore(memoryList.items[0].id);
  score2 = memoryList.getScore(memoryList.items[1].id);
  expect(score1 === score2).toBeTruthy();
});

it("should be such that higher score remembered items are farther in time than the lower ones", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  memoryList.memorize(item1.id);
  memoryList.memorize(item2.id);
  memoryList.items[0].score = 5;
  memoryList.items[1].score = 4;
  memoryList.remember(memoryList.items[0].id);
  memoryList.remember(memoryList.items[1].id);
  expect(
    memoryList.items[0].due.valueOf() > memoryList.items[1].due.valueOf()
  ).toBeTruthy();
});

it("should be such that higher score forgotten items are farther in time than the lower ones", () => {
  const item1 = { id: generateUniqueId(), name: "Item1" };
  const item2 = { id: generateUniqueId(), name: "Item2" };
  const itemList = new ItemList([item1, item2]);
  const memoryList = new MemoryList(itemList);
  memoryList.memorize(item1.id);
  memoryList.memorize(item2.id);
  memoryList.items[0].score = 5;
  memoryList.items[1].score = 4;
  memoryList.forget(memoryList.items[0].id);
  memoryList.forget(memoryList.items[1].id);
  expect(
    memoryList.items[0].due.valueOf() > memoryList.items[1].due.valueOf()
  ).toBeTruthy();
});

it("should not decrease score below 0");
