// recursively converts the keys of an object from snake_case to camelCase
function convertKeysToCamelCase(obj) {
  const newObj = {};
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((value) => convertKeysToCamelCase(value));
  }
  Object.entries(obj).forEach(([key, value]) => {
    if (
      Array.isArray(value) ||
      (value !== null &&
        typeof value === "object" &&
        value.constructor === Object)
    ) {
      value = convertKeysToCamelCase(value);
    }
    let newKey = key.replace(/_id/g, "ID");
    newKey = newKey.replace(/_\w/g, (match) =>
      match.replace("_", "").toUpperCase()
    );
    newObj[newKey] = value;
  });
  return newObj;
}

module.exports = {
  convertKeysToCamelCase,
};
