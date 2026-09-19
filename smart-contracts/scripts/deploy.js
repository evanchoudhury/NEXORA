const hre = require("hardhat");

async function main() {
  console.log("Deploying NexoraPayment smart contract to:", hre.network.name);

  const NexoraPayment = await hre.ethers.getContractFactory("NexoraPayment");
  const contract = await NexoraPayment.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✓ NexoraPayment deployed successfully at:", address);
  console.log("Update PAYMENT_RECEIVER_ADDRESS in backend/.env with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
