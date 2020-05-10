import { Subject, forkJoin } from "rxjs";
import { ItemList, IItem } from "./item";
import { ItemMemoryAdapter, MemoryList, IMemory } from "./memory";
import { generateUniqueId } from "./utils";
import {
  PersistenceAdapter,
  DexieMemoryBackend,
  DexieItemsBackend,
} from "./perisistence";
import { bindCallback } from "rxjs";

const AddSubject = new Subject<string>();
const RememberSubject = new Subject<string>();
const ForgetSubject = new Subject<string>();

const RefreshSubject = new Subject();

const itemList = new ItemList([]);
const memoryList = new MemoryList(itemList);
const itemMemoryAdapter = new ItemMemoryAdapter(memoryList);

const persistenceAdapterMemory = new PersistenceAdapter<IMemory>(
  memoryList,
  new DexieMemoryBackend("")
);

const persistenceAdapterItems = new PersistenceAdapter<IItem>(
  memoryList.crud,
  new DexieItemsBackend("")
);

const init = (cb: (memories: IMemory[], items: IItem[]) => void) => {
  const __memories = bindCallback(
    persistenceAdapterMemory.load.bind(persistenceAdapterMemory)
  )();
  const __items = bindCallback(
    persistenceAdapterItems.load.bind(persistenceAdapterItems)
  )();
  forkJoin(__memories, __items).subscribe((value) => cb(value[0], value[1]));
};

// @ts-ignore
window.itemMemoryAdapter = itemMemoryAdapter;

const generateMemoryInput = () => {
  const Label = document.createElement("label");
  Label.innerText = "Memory Input";
  const MemoryInput = document.createElement("input");
  MemoryInput.setAttribute("id", "mem-input");
  const Wrapper = document.createElement("div");
  Wrapper.appendChild(Label);
  Wrapper.appendChild(MemoryInput);
  return Wrapper;
};

const generateMemory = (id: string, name: string) => {
  const Heading = document.createElement("b");
  Heading.innerText = name;
  const Content = document.createElement("p");
  const RememberButton = document.createElement("button");
  RememberButton.innerText = "Remember";
  RememberButton.setAttribute("class", "remember");
  const ForgetButton = document.createElement("button");
  ForgetButton.innerText = "Forget";
  ForgetButton.setAttribute("class", "forget");
  const Wrapper = document.createElement("div");
  Wrapper.setAttribute("id", id);
  Wrapper.setAttribute("class", "memory");
  Wrapper.appendChild(Heading);
  Wrapper.appendChild(Content);
  Wrapper.appendChild(RememberButton);
  Wrapper.appendChild(ForgetButton);
  return Wrapper;
};

const generatePage = () => {
  const div = document.createElement("div");
  div.append(generateMemoryInput());
  itemMemoryAdapter
    .getDueItems()
    .map((item) => div.append(generateMemory(item.id, item.name)));
  return div;
};

const refreshPage = () => {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  app.append(generatePage());
};

document.addEventListener("keypress", (e) => {
  const el = document.getElementById("mem-input");
  if (!el) return;
  if (e.which === 13) {
    // @ts-ignore
    AddSubject.next(el?.value);
  }
});

const onButtonClick = (el: HTMLElement) => {
  const isButton = el.tagName === "BUTTON";
  if (!isButton) return;
  const parentId = el.parentElement?.id;
  console.warn(parentId);
  if (el.classList[0] === "remember") {
    RememberSubject.next(parentId);
  } else if (el.classList[1] === "forget") {
    ForgetSubject.next(parentId);
  }
};

document.addEventListener("click", (e) => {
  const { target } = e;
  if (!target) return;
  onButtonClick(target as HTMLElement);
});

RememberSubject.subscribe((itemId: string) => {
  itemMemoryAdapter.memoryList.remember(itemId);
  RefreshSubject.next();
});

ForgetSubject.subscribe((itemId: string) => {
  itemMemoryAdapter.memoryList.forget(itemId);
  RefreshSubject.next();
});

RefreshSubject.subscribe(() => {
  refreshPage();
});

AddSubject.subscribe((value: string) => {
  itemMemoryAdapter.addItem(value);
  persistenceAdapterItems.save();
  persistenceAdapterMemory.save();
  RefreshSubject.next();
});

init((memories, items) => {
  console.warn("test", memories, items);
  itemList.items = items;
  memoryList.items = memories;
  RefreshSubject.next();
});
