import { startGame, reiniciarJogo } from "./game.js";

// Elementos do DOM
const claimTokensButton = document.getElementById("claimTokens");
const connectWalletButton = document.getElementById("connectWallet");
const playGameButton = document.getElementById("playGame");
const userAddressElement = document.getElementById("userAddress"); // Elemento para exibir o endereço
const memoryGameContainer = document.getElementById("memory-game");
const gameDiv = document.querySelector('.jogo-da-memoria');
let isRequestingAccounts = false; // Variável para controlar o estado da solicitação
let userAddress = null; // Variável para armazenar o endereço do usuário

// Configurações dos contratos (incluídas diretamente aqui)
const hmaxAddress = "0x5c293FBA72d4d9C3D6c18A5EAcDDBF4bA7B4b1A5"; // Endereço do contrato HMAX
const gameManagerAddress = "0xBd558D62161B4ed82994Bc51ddfc7CeF2Ae60739"; // Endereço do contrato GameManager
const nftCollectionAddress = "0x7C2808C1a0f86fEDD7d7D748a59084A13C98d7d5"; // Substitua pelo endereço do contrato NFTCollection
const feeRecipient = "0x8C8c6f5E856195CB1601F94B5ae4159C7e929903"; // Endereço da carteira que recebe as taxas
const gameFee = ethers.utils.parseUnits("0.5", 18); // 0.5 HMAX (taxa do jogo)

async function switchToSepolia(){
    if(window.ethereum){
        try{
            //tentar mudar para rede sepolia
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: '0xaa36a7'}],
            });
            console.log('Mudou para rede Sepolia');
        }catch(error){
            //se a rede nao estiver configurada, tentar adicionar automaticamente
            if (error.code === 4902) {
                try{
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Ethereum Sepolia',
                            nativeCurrency:{
                                name:'SepoliaETH',
                                symbol:'ETH',
                                decimals:18,
                                },
                                rpcUrls:['https://sepolia.org'],
                                blockExplorerUrls:['https://sepolia.etherscan.io'],
                        }],
                    });
                    console.log("Rede Sepolia adicionada com Sucesso e conectada")
                    }catch(error){
                        console.error("Erro ao adicionar rede Sepolia", addError);
                        }
                    }else
                        {
                            console.error("Erro ao mudar para rede Sepolia", error);
                        }
                        }
                    }else
                        {
                            alert("Metamask nao encontrada, instale a extensao e tente novamente")
                        }

                            
        
            
        
    
}
window.onload = switchToSepolia;


// Função para conectar a carteira
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert("Por favor, instale o MetaMask!");
            return;
        }
        if (isRequestingAccounts) {
            alert("Já estamos processando a conexão com a carteira. Aguarde.");
            return;
        }
        isRequestingAccounts = true;
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        userAddress = await signer.getAddress();
        console.log("Carteira conectada:", userAddress);
        // Exibir o endereço da carteira conectada
        userAddressElement.textContent = `Carteira Conectada: ${userAddress}`;
        userAddressElement.style.display = "block"; // Exibe o elemento
        connectWalletButton.textContent = "Carteira Conectada";
    } catch (error) {
        console.error("Erro ao conectar a carteira:", error);
        alert("Erro ao conectar a carteira. Verifique o console.");
    } finally {
        isRequestingAccounts = false;
    }
}

// Função para reivindicar tokens
async function claimTokens() {
    try {
        if (!window.ethereum || !userAddress) {
            alert("Conecte sua carteira primeiro!");
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // Instância do contrato HMAX
        const hmaxContract = new ethers.Contract(
            hmaxAddress,
            [
                "function claimTokens() external",
                "function claimsCount(address) external view returns (uint256)",
                "function balanceOf(address) external view returns (uint256)",
            ],
            signer
        );
        // Verifica a quantidade de reivindicações
        const claimCount = await hmaxContract.claimsCount(userAddress);
        if (claimCount >= 5) {
            alert("Você já reivindicou tokens o máximo de vezes!");
            return;
        }
        console.log("Reivindicando tokens para:", userAddress);
        const tx = await hmaxContract.claimTokens();
        console.log("Reivindicação de tokens enviada:", tx.hash);
        await tx.wait();
        console.log("Tokens reivindicados com sucesso!");
        alert("Tokens reivindicados com sucesso!");
    } catch (error) {
        console.error("Erro ao reivindicar tokens:", error);
        alert("Sinto Muito você já reivindicou seus tokens.");
    }
}

// Função para transferir tokens para o contrato do jogo
async function transferTokensToGame() {
    try {
        if (!window.ethereum || !userAddress) {
            alert("Conecte sua carteira primeiro!");
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // Instância do contrato HMAX
        const hmaxContract = new ethers.Contract(
            hmaxAddress,
            [
                "function approve(address spender, uint256 amount) external returns (bool)",
                "function balanceOf(address) external view returns (uint256)",
            ],
            signer
        );
        // Instância do contrato do jogo
        const gameManagerContract = new ethers.Contract(
            gameManagerAddress,
            [
                "function receiveGameFee(address player, uint256 amount) external",
            ],
            signer
        );
        // Primeiro: Aprova que o contrato do jogo possa gastar os tokens do usuário
        const approveTx = await hmaxContract.approve(gameManagerAddress, gameFee);
        await approveTx.wait();
        // Segundo: Chama a função no contrato do jogo para receber os tokens
        const tx = await gameManagerContract.receiveGameFee(userAddress, gameFee);
        await tx.wait();
        console.log("Tokens transferidos para o contrato do jogo com sucesso!");
    } catch (error) {
        console.error("Erro ao transferir tokens para o contrato do jogo:", error);
        alert("Ocorreu um erro ao transferir tokens para o contrato do jogo. Verifique o console.");
    }
}

// Função para comprar NFT
async function buyNFT(tokenId) {
    try {
        if (!window.ethereum || !userAddress) {
            alert("Conecte sua carteira primeiro!");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const hmaxContract = new ethers.Contract(
            hmaxAddress,
            [
                "function approve(address spender, uint256 amount) external returns (bool)",
                "function allowance(address owner, address spender) external view returns (uint256)",
                "function balanceOf(address) external view returns (uint256)"
            ],
            signer
        );

        const nftCollectionContract = new ethers.Contract(
            nftCollectionAddress,
            [
                "function mint(uint256 id, uint256 amount) external",
                "function PRICE() external view returns (uint256)"
            ],
            signer
        );

        const amount = 1;
        const price = await nftCollectionContract.PRICE(); // Obtém o preço do contrato
        const userBalance = await hmaxContract.balanceOf(userAddress);
        const userAllowance = await hmaxContract.allowance(userAddress, nftCollectionAddress);

        if (userBalance.lt(price)) {
            alert("Saldo insuficiente de HMAX para comprar o NFT!");
            return;
        }

        if (userAllowance.lt(price)) {
            console.log("Aprovando HMAX para a compra do NFT...");
            const approveTx = await hmaxContract.approve(nftCollectionAddress, price);
            await approveTx.wait();
            console.log("Aprovação concluída.");
        }

        console.log(`Mintando NFT com ID ${tokenId}...`);
        const tx = await nftCollectionContract.mint(tokenId, amount);
        console.log("Transação enviada:", tx.hash);
        await tx.wait();
        console.log("NFT comprado com sucesso!");
        alert(`NFT com ID ${tokenId} comprado com sucesso!`);
    } catch (error) {
        console.error("Erro ao comprar NFT:", error);
        alert("Erro ao comprar NFT. Verifique o console.");
    }
}


// Função para executar o jogo
function executeGame() {
    startGame(memoryGameContainer); // Inicia o jogo
    transferTokensToGame(); // Transfere os tokens para o contrato do jogo
    gameDiv.style.display = "block"; // Mostra o tabuleiro do jogo
    playGameButton.disabled = true; // Desativa o botão "Jogar"
}

// Função para reiniciar o jogo
function restartGame() {
    reiniciarJogo(memoryGameContainer, playGameButton); // Reinicia o jogo
}

// Adicionando ouvintes de eventos aos botões
if (claimTokensButton) {
    claimTokensButton.addEventListener("click", claimTokens);
}
if (connectWalletButton) {
    connectWalletButton.addEventListener("click", connectWallet);
}
if (playGameButton) {
    playGameButton.addEventListener("click", () => {
        if (playGameButton.textContent === "Jogar Novamente") {
            restartGame(); // Reinicia o jogo
        } else {
            executeGame(); // Inicia o jogo
        }
    });
}

// Adicionando ouvintes de eventos aos botões de compra de NFT
document.getElementById("buyNFT").addEventListener("click", () => buyNFT(1)); // Comprar NFT 1
document.getElementById("buyNFT2").addEventListener("click", () => buyNFT(2)); // Comprar NFT 2
document.getElementById("buyNFT3").addEventListener("click", () => buyNFT(3)); // Comprar NFT 3
document.getElementById("buyNFT4").addEventListener("click", () => buyNFT(4)); // Comprar NFT 4