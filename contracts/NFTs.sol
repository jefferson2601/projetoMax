// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NFTCollection is ERC1155, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant PRICE = 800 * 10**18; // 800 HMAX
    uint256 public constant MAX_SUPPLY = 4000;
    uint256 public totalSupply;
    IERC20 public immutable hmaxToken; // Referência ao contrato do token HMAX

    mapping(uint256 => uint256) public nftMinted; // Registra quantos NFTs de cada ID já foram mintados

    event NFTMinted(address indexed buyer, uint256 indexed tokenId, uint256 amount);
    event HMAXTokenSet(address indexed tokenAddress);

    constructor(string memory uri, address hmaxAddress) ERC1155(uri) {
        require(hmaxAddress != address(0), "Invalid HMAX token address");
        hmaxToken = IERC20(hmaxAddress);
        emit HMAXTokenSet(hmaxAddress);
    }

    function mint(uint256 id, uint256 amount) external {
        require(totalSupply + amount <= MAX_SUPPLY, "Max supply reached");
        uint256 totalCost = PRICE * amount;

        // Verifica se o usuário tem saldo e permitiu o gasto de tokens
        require(hmaxToken.balanceOf(msg.sender) >= totalCost, "Insufficient HMAX balance");
        require(hmaxToken.allowance(msg.sender, address(this)) >= totalCost, "HMAX allowance too low");

        // Transfere HMAX para o contrato
        hmaxToken.safeTransferFrom(msg.sender, address(this), totalCost);

        // Realiza a mintagem do NFT
        _mint(msg.sender, id, amount, "");
        totalSupply += amount;
        nftMinted[id] += amount;

        emit NFTMinted(msg.sender, id, amount);
    }

    function withdraw() external onlyOwner {
        uint256 balance = hmaxToken.balanceOf(address(this));
        require(balance > 0, "No HMAX to withdraw");
        hmaxToken.safeTransfer(owner(), balance);
    }
}
