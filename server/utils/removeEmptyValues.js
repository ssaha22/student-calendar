// removes object properties that have a value of null or undefined
function removeEmptyValues(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

module.exports = removeEmptyValues;
