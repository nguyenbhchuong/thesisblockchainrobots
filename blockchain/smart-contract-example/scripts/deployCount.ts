import {
    Contract,
    ContractFactory
  } from "ethers"
  import { ethers } from "hardhat"
  
  const main = async(): Promise<any> => {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const balance = await deployer.provider.getBalance(deployer.address)
    console.log("Account balance:", balance.toString());
  
    const Counter: ContractFactory = await ethers.getContractFactory("Counter")
    const counter: Contract = await Counter.deploy() as Contract
  
    const address =  await counter.getAddress()
    console.log(`Counter deployed to: ${address}`)
  }
  
  main()
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })