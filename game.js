// Variáveis globais do jogo
let cards = [];
let flippedCards = [];
let matchedPairs = 0;

// Função para iniciar ou reiniciar o jogo
export async function startGame(memoryGameContainer) {
    // Validar conexão com MetaMask antes de iniciar o jogo
    const isWalletConnected = await checkMetaMask();
    if (!isWalletConnected) {
        alert("Conecte sua carteira MetaMask para jogar!");
        return;
    }

    // Resetando as variáveis
    flippedCards = [];
    matchedPairs = 0;

    // Limpar o tabuleiro
    if (memoryGameContainer) {
        memoryGameContainer.innerHTML = "";
    } else {
        console.error("Elemento 'memoryGameContainer' não encontrado no DOM.");
        return;
    }

    // Criar cartas (4 pares)
    const images = [
        "./img/image1.jpeg",
        "./img/image2.jpeg",
        "./img/image3.jpeg",
        "./img/image4.jpeg",
    ];
    cards = [...images, ...images].sort(() => Math.random() - 0.5); // Embaralha as cartas

    // Renderizar cartas
    cards.forEach((image, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = image;
        card.dataset.index = index;

        // Adiciona um evento de clique para virar a carta
        card.addEventListener("click", () => flipCard(card));
        memoryGameContainer.appendChild(card);
    });
}

// Função para virar a carta
function flipCard(card) {
    // Verifica se a carta já foi virada ou é uma carta correspondente
    if (
        flippedCards.length === 2 ||
        card.classList.contains("matched") ||
        flippedCards.includes(card)
    )
        return;

    // Virar a carta
    card.style.backgroundImage = `url(${card.dataset.image})`;
    card.style.backgroundSize = "cover";
    flippedCards.push(card);

    // Verificar correspondência
    if (flippedCards.length === 2) {
        const [firstCard, secondCard] = flippedCards;

        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            matchedPairs++;

            // Verificar se o jogo terminou
            if (matchedPairs === cards.length / 2) {
                setTimeout(() => {
                    if (confirm("Parabéns! Você encontrou todos os pares! Deseja jogar novamente?")) {
                        reiniciarJogo(document.getElementById("memory-game"), document.getElementById("playGame"));
                    }
                }, 500);
            }
        } else {
            // Desvirar as cartas após 1 segundo
            setTimeout(() => {
                firstCard.style.backgroundImage = "";
                secondCard.style.backgroundImage = "";
            }, 1000);
        }
        flippedCards = [];
    }
}

// Função para reiniciar o jogo
export async function reiniciarJogo(memoryGameContainer, playGameButton) {
    if (!confirm("Tem certeza de que deseja começar um novo jogo?")) return;

    // Validar conexão com MetaMask antes de reiniciar o jogo
    const isWalletConnected = await checkMetaMask();
    if (!isWalletConnected) {
        alert("Conecte sua carteira MetaMask para iniciar um novo jogo!");
        return;
    }

    // Limpar o tabuleiro
    if (memoryGameContainer) {
        memoryGameContainer.innerHTML = "";
    } else {
        console.error("Elemento 'memoryGameContainer' não encontrado no DOM.");
        return;
    }

    // Redefinir variáveis globais
    cards = [];
    flippedCards = [];
    matchedPairs = 0;

    // Exibir o botão "Jogar"
    if (playGameButton) {
        playGameButton.textContent = "Jogar";
        playGameButton.style.display = "block";
        playGameButton.disabled = false; // Habilita o botão novamente
    }

    // Iniciar um novo jogo
    startGame(memoryGameContainer);
}

// Função para verificar conexão com a carteira MetaMask
async function checkMetaMask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            return accounts.length > 0;
        } catch (error) {
            console.error("Erro ao conectar à MetaMask:", error);
            return false;
        }
    } else {
        alert("MetaMask não detectado. Instale a extensão para jogar.");
        return false;
    }
}
