require("@nomicfoundation/hardhat-toolbox");

// Substitua esses valores pelas suas próprias informações
const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/c7cd8eb5ec2f43f58bc40672049b59db"; // URL do Infura/Alchemy
const PRIVATE_KEY = "c73d43c801a7fb341a42d18771c9f7da39f89d421056d73bbd8fd6a3b4285cea"; // Chave privada da sua carteira

module.exports = {
  solidity: "0.8.28", // Certifique-se de que a versão corresponde à dos seus contratos
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};