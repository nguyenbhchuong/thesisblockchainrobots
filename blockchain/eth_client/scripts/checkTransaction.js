const createKeccakHash = require("keccak");

// Function to remove argument names and spaces from method signature
const removeArgsFromMethod = (method) => {
  return method.replace(/\s*\w+\s*(,|\))/g, "$1");
};

const method = "updateTaskStatus(uint,uint)external"; // Adjusted method signature
const preparedMethod = removeArgsFromMethod(method).replace(/\s/g, "");

console.log(preparedMethod);

// Create Keccak hash of the prepared method signature
const keccakHashOfMethod = createKeccakHash("keccak256")
  .update(method)
  .digest();

console.log(
  createKeccakHash("keccak256").update(preparedMethod).digest("hex").slice(0, 8)
);

// Get the first 4 bytes (method ID)
const methodId = keccakHashOfMethod.slice(0, 4).toString("hex"); // Method ID
console.log(methodId); // Should output the correct method ID

// first 4 bytes
// const methodId = keccakHashOfMethod.slice(0, 4).toString("hex"); // edd8e1f6
// edd8e1f6
// b37b1000
// 60806040
