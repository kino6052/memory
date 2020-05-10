const getRandomNumbers = (length: number) => {
  const value = Array.from(
    Math.round(Math.random() * Math.pow(10, length)).toString()
  ).reverse();
  return new Array(length)
    .fill("0")
    .map((v, i) => value[i] || v)
    .reverse()
    .join("");
};

const generateId = (amount: number, length: number) =>
  new Array(amount)
    .fill(0)
    .map((a, i, b) => `${i && "-"}${getRandomNumbers(length)}`)
    .join("");

export const generateUniqueId = () => generateId(5, 5);
