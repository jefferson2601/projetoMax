// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameManager is Ownable {
    IERC20 public hmaxToken;
    address public feeRecipient; // Carteira para receber as taxas
    
    // Construtor: Define o endereço do token HMAX e o destinatário da taxa
    constructor(address _hmaxTokenAddress, address _feeRecipient) Ownable(msg.sender) {
        hmaxToken = IERC20(_hmaxTokenAddress);
        feeRecipient = _feeRecipient;
    }
    
    // Função para receber a taxa do jogo em HMAX
    function receiveGameFee(address player, uint256 amount) external {
      // transferindo o valor aprovado pelo usuario para o contrato.
      require(hmaxToken.transferFrom(player, address(this), amount), "Falha na transferencia"); //transferindo para o contrato o valor da taxa.
    }

    // Função para retirar os tokens HMAX acumulados no contrato
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(hmaxToken.balanceOf(address(this)) >= amount, "Saldo insuficiente no contrato");
        hmaxToken.transfer(feeRecipient, amount);
    }
}
