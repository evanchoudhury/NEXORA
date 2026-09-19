// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NexoraPayment
 * @dev Secure on-chain payment receiver for NEXORA E-Commerce platform.
 * Supports native EVM cryptocurrency payments with cryptographic order reference tracking.
 */
contract NexoraPayment {
    address public owner;
    bool private locked;

    event PaymentReceived(
        string indexed orderNumber,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "NexoraPayment: Caller is not the owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "NexoraPayment: Reentrancy detected");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Execute a crypto payment for a specific NEXORA order
     * @param orderNumber The unique NEXORA order code (e.g. NEX-2026-XXXXX)
     */
    function payForOrder(string calldata orderNumber) external payable nonReentrant {
        require(msg.value > 0, "NexoraPayment: Payment amount must be greater than zero");
        require(bytes(orderNumber).length > 0, "NexoraPayment: Order number cannot be empty");

        emit PaymentReceived(orderNumber, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Fallback function to accept direct native currency transfers
     */
    receive() external payable {
        emit PaymentReceived("DIRECT_TRANSFER", msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Withdraw accumulated funds to platform merchant treasury
     * @param to Destination treasury address
     */
    function withdraw(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "NexoraPayment: Invalid recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "NexoraPayment: No funds available to withdraw");

        (bool success, ) = to.call{value: balance}("");
        require(success, "NexoraPayment: ETH transfer failed");

        emit FundsWithdrawn(to, balance, block.timestamp);
    }

    /**
     * @notice Check current contract ETH balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
