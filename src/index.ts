import { Subject } from "rxjs";
import { ItemList } from "./item";
import { ItemMemoryAdapter, MemoryList } from "./memory";
import { generateUniqueId } from "./utils";

const AddSubject = new Subject<string>();
const RememberSubject = new Subject<string>();
const ForgetSubject = new Subject<string>();

const RefreshSubject = new Subject();

const item1 = { id: generateUniqueId(), name: "Item1" };
const item2 = { id: generateUniqueId(), name: "Item2" };
const itemList = new ItemList([item1, item2]);
const memoryList = new MemoryList(itemList);
const itemMemoryAdapter = new ItemMemoryAdapter(memoryList);
memoryList.memorize(item1.id);
memoryList.memorize(item2.id);

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
  console.warn(memoryList.getDueMemories());
  itemMemoryAdapter
    .getDueItems()
    .map((item) => div.append(generateMemory(item.id, item.name)));
  return div;
};

document.addEventListener("keypress", (e) => {
  const el = document.getElementById("mem-input");
  if (!el) return;
  if (e.which === 13) {
    // @ts-ignore
    AddSubject.next(el?.value);
  }
});

document.addEventListener("click", (e) => {
  const { target } = e;
  if (!target) return;
  const el = target as HTMLElement;
  const isButton = el.tagName === "BUTTON";
  if (!isButton) return;
  const parentId = el.parentElement?.id;
  console.warn(parentId);
  if (el.classList[0] === "remember") {
    RememberSubject.next(parentId);
  } else if (el.classList[1] === "forget") {
    ForgetSubject.next(parentId);
  }
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
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  app.append(generatePage());
});

AddSubject.subscribe((value: string) => {
  itemMemoryAdapter.addItem(value);
  RefreshSubject.next();
});

RefreshSubject.next();

// @ts-ignore
window.itemMemoryAdapter = itemMemoryAdapter;
