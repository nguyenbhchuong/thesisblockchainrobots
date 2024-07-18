import {
    Contract,
    ContractFactory
  } from "ethers"
  import { ethers } from "hardhat"
  import { ChipToken } from "../typechain-types"
  
  const main = async(): Promise<any> => {
    const deployers = await ethers.getSigners();

    deployers.forEach(async (deployer) => {
        console.log("Account address:", deployer.address);
        const balance = await deployer.provider.getBalance(deployer.address)
        console.log("Account balance:", balance.toString());
    })
  }
  
  main()
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })