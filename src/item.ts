export interface IId {
  id: string;
}

export class CRUD<T extends IId> {
  constructor(public items: T[]) {}
  getItemById = (id: string) => this.items.find((item) => item.id === id);
  add = (item: T) => (this.items = [...this.items, item]);
  remove = (id: string) =>
    (this.items = this.items.filter((item) => item.id !== id));
  update = (id: string, newItem: Partial<T>) =>
    (this.items = this.items.map((item) => {
      if (item.id !== id) return item;
      return { ...item, ...newItem, id: item.id };
    }));
}

export interface IItem {
  id: string;
  name: string;
  score?: number;
}

export interface IItemList {
  items: IItem[];
  getItemById: (id: string) => IItem | undefined;
  add: (item: IItem) => void;
  remove: (id: string) => void;
  update: (id: string, newItem: Partial<IItem>) => void;
}

export class ItemList extends CRUD<IItem> {
  constructor(public items: IItem[] = []) {
    super(items);
  }
}

export class Filter {
  constructor(public itemList: IItemList) {}
  findAllByText = (text: string) =>
    this.itemList.items.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
}

export class HierarchyFilter extends Filter {
  constructor(public hierarchy: Hierarchy) {
    super(hierarchy.itemList);
  }
  findAllByText = (text: string) => {
    const itemsWithText = this.itemList.items.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    const itemsWithTextSet = new Set(itemsWithText);
    for (let item of itemsWithText) {
      const predecessors = this.hierarchy.getPredecessors(item.id);
      for (let predecessor of predecessors) {
        itemsWithTextSet.add(predecessor);
      }
    }
    return Array.from(itemsWithTextSet);
  };
}

export class Collapser {}

export class HierarchyListGenerator {
  constructor(
    public hierarchy: Hierarchy,
    public filter: HierarchyFilter,
    public collapse: Collapser
  ) {}
}

export class Hierarchy {
  constructor(
    public itemList: IItemList,
    public relationships: { [key: string]: string[] } = {}
  ) {}
  addChild = (id: string, child: IItem) => {
    this.itemList.add(child);
    this.relationships[id] = [
      ...(this.relationships[id] || []),
      child.id,
    ] as string[];
  };
  removeChild = (parentId: string, childId: string) => {
    const children = this.relationships[parentId];
    if (!children) return;
    this.itemList.remove(childId);
    this.relationships[parentId] = children.filter((id) => id === childId);
  };
  getChildren = (id: string) => {
    const childrenIds = this.relationships[id];
    if (!childrenIds) return [];
    return this.itemList.items.filter((item) => childrenIds.includes(item.id));
  };
  getParent = (id: string) => {
    const entry = Object.entries(this.relationships).find((entry) =>
      entry[1].includes(id)
    );
    if (!entry) return;
    return this.itemList.items.find((item) => item.id === entry[0]);
  };
  getPredecessors = (id: string) => {
    const recursive = (
      currentId: string,
      accumulator: IItem[] = []
    ): IItem[] => {
      const parent = this.getParent(currentId);
      if (!parent) return accumulator;
      accumulator.push(parent!);
      return recursive(parent.id, accumulator);
    };
    return recursive(id);
  };
  getDescendants = (id: string) => {
    const recursive = (currentId: string, accumulator: IItem[] = []) => {
      const children = this.getChildren(currentId);
      if (!children || !children.length) return accumulator;
      for (let child of children) {
        accumulator.push(child);
        recursive(child.id, accumulator);
      }
      return accumulator;
    };
    return recursive(id);
  };
}
