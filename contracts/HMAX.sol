// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HMAX is ERC20, Ownable {
    // Variáveis imutáveis (calculadas no construtor)
    uint256 public immutable INITIAL_SUPPLY; // Suprimento inicial total
    uint256 public immutable CLAIM_AMOUNT;   // Quantidade de tokens reivindicáveis
    uint256 public immutable MAX_CLAIMS;    // Número máximo de reivindicações por usuário

    // Mapeamento para rastrear quantas vezes cada usuário reivindicou tokens
    mapping(address => uint256) public claimsCount;

    // Construtor: Define o nome do token, símbolo e distribui o suprimento inicial
    constructor() ERC20("HMAX", "HMAX") Ownable(msg.sender) {
        INITIAL_SUPPLY = 1_000_000 * 10**decimals(); // 1 milhão de tokens
        CLAIM_AMOUNT = 10 * 10**decimals();         // 10 tokens por reivindicação
        MAX_CLAIMS = 5;                            // 5 reivindicações por usuário

        // Cunha o suprimento inicial para o proprietário do contrato
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Função para reivindicar tokens
    function claimTokens() external {
        require(claimsCount[msg.sender] < MAX_CLAIMS, "Maximo de reivindicacoes atingido"); // Verifica se o usuário já atingiu o limite
        claimsCount[msg.sender]++; // Incrementa a contagem de reivindicações do usuário
        _mint(msg.sender, CLAIM_AMOUNT); // Cunha os tokens para o usuário
    }
}
