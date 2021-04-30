const groceryList = ['orange juice', 'bananas', 'coffee beans', 'brown rice', 'pasta', 'coconut oil', 'plantains'];
//shift() deletes first item of an array
groceryList.shift();
console.log(groceryList);
//unshift() adds an item at the beginning of array
groceryList.unshift('popcorn');
console.log(groceryList);
//slice() copies array with index range in brackets
console.log(groceryList.slice(1, 4));
console.log(groceryList);

const pastaIndex = groceryList.indexOf('pasta');

console.log(pastaIndex);