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

export const shuffle = <T>(array: Array<T>) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const generateUniqueId = () => generateId(5, 5);
