import { generateUniqueId } from "./utils";
import { ItemList, Hierarchy, Filter } from "./item";

describe("Hierarchy List", () => {
  it("should get parent and child nodes", () => {
    const parent = {
      id: generateUniqueId(),
      name: "Item1",
    };
    const child = {
      id: generateUniqueId(),
      name: "Item2",
    };
    const itemList = new ItemList([parent]);
    const hierarchy = new Hierarchy(itemList);
    hierarchy.addChild(parent.id, child);
    expect(hierarchy.getChildren(parent.id)).toEqual([child]);
    expect(hierarchy.getParent(child.id)).toEqual(parent);
    expect(hierarchy.getChildren(child.id)).toEqual([]);
    expect(hierarchy.getParent(parent.id)).toEqual(undefined);
  });

  it("should remove child", () => {
    const parent = {
      id: generateUniqueId(),
      name: "Item1",
    };
    const child = {
      id: generateUniqueId(),
      name: "Item2",
    };
    const itemList = new ItemList([parent]);
    const hierarchy = new Hierarchy(itemList);
    hierarchy.addChild(parent.id, child);
    expect(hierarchy.itemList.getItemById(child.id)).toBeTruthy();
    hierarchy.removeChild(parent.id, child.id);
    expect(hierarchy.getChildren(parent.id)).toEqual([]);
    expect(hierarchy.itemList.getItemById(child.id)).toBeFalsy();
    hierarchy.removeChild(generateUniqueId(), generateUniqueId());
  });

  it("should get all predecessor nodes", () => {
    const nodes = [
      {
        id: generateUniqueId(),
        name: "Item1",
      },
      {
        id: generateUniqueId(),
        name: "Item2",
      },
      {
        id: generateUniqueId(),
        name: "Item3",
      },
      {
        id: generateUniqueId(),
        name: "Item4",
      },
    ];
    const itemList = new ItemList([nodes[0]]);
    const hierarchy = new Hierarchy(itemList);
    hierarchy.addChild(nodes[0].id, nodes[1]);
    hierarchy.addChild(nodes[0].id, nodes[2]);
    hierarchy.addChild(nodes[1].id, nodes[3]);
    expect(hierarchy.getPredecessors(nodes[3].id)).toEqual([
      nodes[1],
      nodes[0],
    ]);
    expect(hierarchy.getPredecessors(nodes[2].id)).toEqual([nodes[0]]);
  });
  it("should get all descendant nodes", () => {
    const nodes = [
      {
        id: generateUniqueId(),
        name: "Item1",
      },
      {
        id: generateUniqueId(),
        name: "Item2",
      },
      {
        id: generateUniqueId(),
        name: "Item3",
      },
      {
        id: generateUniqueId(),
        name: "Item4",
      },
    ];
    const itemList = new ItemList([nodes[0]]);
    const hierarchy = new Hierarchy(itemList);
    hierarchy.addChild(nodes[0].id, nodes[1]);
    hierarchy.addChild(nodes[0].id, nodes[2]);
    hierarchy.addChild(nodes[1].id, nodes[3]);
    expect(
      hierarchy
        .getDescendants(nodes[0].id)
        .map((i) => i.id)
        .sort()
    ).toEqual([nodes[1], nodes[2], nodes[3]].map((i) => i.id).sort());
    expect(hierarchy.getDescendants(nodes[2].id)).toEqual([]);
  });
});

describe("Filter List", () => {
  it("should find all the occurances of name", () => {
    const items = [
      { id: generateUniqueId(), name: "Item1" },
      { id: generateUniqueId(), name: "ITem2" },
      { id: generateUniqueId(), name: "item3" },
      { id: generateUniqueId(), name: "Item4" },
      { id: generateUniqueId(), name: "tem60" },
      { id: generateUniqueId(), name: "Stuff" },
      { id: generateUniqueId(), name: "ITEM100" },
    ];
    const itemList = new ItemList(items);
    const filter = new Filter(itemList);
    expect(filter.findAllByText("ITEM")).toEqual([
      items[0],
      items[1],
      items[2],
      items[3],
      items[6],
    ]);
  });
});

describe("Item List", () => {
  it("should get item by id", () => {
    const item1 = { id: generateUniqueId(), name: "Item1" };
    const item2 = { id: generateUniqueId(), name: "Item2" };
    const itemList = new ItemList([item1, item2]);
    expect(itemList.getItemById(item1.id)).toEqual(item1);
    expect(itemList.getItemById(item2.id)).toEqual(item2);
  });

  it("should add item", () => {
    const item1 = { id: generateUniqueId(), name: "Item1" };
    const item2 = { id: generateUniqueId(), name: "Item2" };
    const itemList = new ItemList();
    itemList.add(item1);
    itemList.add(item2);
    expect(itemList.getItemById(item1.id)).toEqual(item1);
    expect(itemList.getItemById(item2.id)).toEqual(item2);
    expect(itemList.getItemById(generateUniqueId())).toBeFalsy();
  });

  it("should remove item", () => {
    const item1 = { id: generateUniqueId(), name: "Item1" };
    const item2 = { id: generateUniqueId(), name: "Item2" };
    const itemList = new ItemList([item1, item2]);
    itemList.remove(item1.id);
    expect(itemList.getItemById(item1.id)).toBeFalsy();
    expect(itemList.getItemById(item2.id)).toEqual(item2);
  });

  it("should update item", () => {
    const item1 = { id: generateUniqueId(), name: "Item1" };
    const item2 = { id: generateUniqueId(), name: "Item2" };
    const itemList = new ItemList([item1, item2]);
    itemList.update(item1.id, { name: "Updated Item" });
    expect(itemList.getItemById(item1.id)?.name).toEqual("Updated Item");
    expect(itemList.getItemById(item2.id)).toEqual(item2);
  });
});
