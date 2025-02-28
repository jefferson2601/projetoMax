const hre = require("hardhat");

async function main() {
  // Obtenha os contratos compilados
  const HMAX = await hre.ethers.getContractFactory("HMAX"); // Contrato HMAX
  const GameManager = await hre.ethers.getContractFactory("GameManager"); // Contrato GameManager
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection"); // Contrato NFTCollection

  // Implante o contrato HMAX
  console.log("Implantando HMAX...");
  const hmax = await HMAX.deploy(); // Remove .deployed()
  await hmax.waitForDeployment(); // Aguarda a implantação (nova API do ethers v6)
  console.log("HMAX implantado no endereço:", await hmax.getAddress());

  // Endereços para o GameManager
  const feeRecipient = "0x8C8c6f5E856195CB1601F94B5ae4159C7e929903"; // Substitua pelo endereço da carteira que receberá as taxas

  // Implante o contrato GameManager
  console.log("Implantando GameManager...");
  const gameManager = await GameManager.deploy(await hmax.getAddress(), feeRecipient); // Remove .deployed()
  await gameManager.waitForDeployment(); // Aguarda a implantação (nova API do ethers v6)
  console.log("GameManager implantado no endereço:", await gameManager.getAddress());

  // Parâmetros para o contrato NFTCollection
  const uri = "ipfs://QmXA1woweT8BkCdLirciT59mzCkUfyS9oRZsLZJkAxZB1V/"; // CID base dos metadados no IPFS
  const hmaxAddress = await hmax.getAddress(); // Endereço do token HMAX implantado

  // Implante o contrato NFTCollection
  console.log("Implantando NFTCollection...");
  const nftCollection = await NFTCollection.deploy(uri, hmaxAddress);
  await nftCollection.waitForDeployment(); // Aguarda a implantação (nova API do ethers v6)
  console.log("NFTCollection implantado no endereço:", await nftCollection.getAddress());
}

// Chamada da função principal
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });