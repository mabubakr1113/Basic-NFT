//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

contract RandomIPFSNFT is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable i_vrfCoordiantorV2;

    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subId;
    uint32 private immutable i_callBackGasLimit;
    uint16 private constant MINIMUM_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subId,
        uint32 callBackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordiantorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subId = subId;
        i_callBackGasLimit = callBackGasLimit;
    }

    function requestnFT() public returns (uint256 requestId) {
        requestId = i_vrfCoordiantorV2.requestRandomWords(
            i_gasLane,
            i_subId,
            MINIMUM_CONFIRMATIONS,
            i_callBackGasLimit,
            NUM_WORDS
        );
    }
}
