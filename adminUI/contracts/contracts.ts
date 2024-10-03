const ethers = require("ethers");

const contractABI: any = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "int256",
        name: "check",
        type: "int256",
      },
    ],
    name: "Check",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "check",
        type: "uint256",
      },
    ],
    name: "CheckU",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "freeBotsID",
        type: "uint256[]",
      },
    ],
    name: "DoneFindingFreeBots",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "unassignedTasksID",
        type: "uint256[]",
      },
    ],
    name: "DoneFindingNewTasks",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "validatingTasksID",
        type: "uint256[]",
      },
    ],
    name: "DoneFindingValidatingTasks",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "good",
        type: "string",
      },
      {
        internalType: "string",
        name: "origin",
        type: "string",
      },
      {
        internalType: "string",
        name: "destination",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timeIssued",
        type: "uint256",
      },
    ],
    name: "addTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str1",
        type: "string",
      },
      {
        internalType: "string",
        name: "str2",
        type: "string",
      },
    ],
    name: "compare",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwnTask",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "good",
            type: "string",
          },
          {
            internalType: "string",
            name: "origin",
            type: "string",
          },
          {
            internalType: "string",
            name: "destination",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "assigner",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "validator",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeIssued",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeStarted",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeDelivered",
            type: "uint256",
          },
        ],
        internalType: "struct TaskManager.Task",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "readRobots",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "node_address",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "status",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "credit",
            type: "uint256",
          },
        ],
        internalType: "struct TaskManager.Robot[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "readTasks",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "good",
            type: "string",
          },
          {
            internalType: "string",
            name: "origin",
            type: "string",
          },
          {
            internalType: "string",
            name: "destination",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "assigner",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "validator",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeIssued",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeStarted",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeDelivered",
            type: "uint256",
          },
        ],
        internalType: "struct TaskManager.Task[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string[]",
        name: "goods",
        type: "string[]",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
    ],
    name: "reportGoods",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "robots",
    outputs: [
      {
        internalType: "address",
        name: "node_address",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "status",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "credit",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "roundRobin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tasks",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "good",
        type: "string",
      },
      {
        internalType: "string",
        name: "origin",
        type: "string",
      },
      {
        internalType: "string",
        name: "destination",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "assigner",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "validator",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeIssued",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeStarted",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeDelivered",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "taskID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeStamp",
        type: "uint256",
      },
    ],
    name: "updateTaskStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051";

// export const getContract = () => {
//   if (!window.ethereum)
//     throw new Error("No crypto wallet found. Please install it.");

//   const provider = new ethers.providers.JsonRpcProvider(
//     "http://127.0.0.1:32781"
//   );
//   const signer = provider.getSigner(
//     "0xf93Ee4Cf8c6c40b329b0c0626F28333c132CF241"
//   );
//   console.log("signer", signer);
//   return new ethers.Contract(contractAddress, contractABI, signer);
// };

export const getContract = async () => {
  if (!window.ethereum)
    throw new Error("No crypto wallet found. Please install it.");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};
