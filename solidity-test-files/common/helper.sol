// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

import { testContract } from "../src/testContract.sol";

library Helpers { 
    function deployTestContract() external returns(testContract) {
        testContract testContractObject_ = new testContract();
        return testContractObject_;
    }
}