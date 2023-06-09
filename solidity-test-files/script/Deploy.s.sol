// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { Helpers } from "../common/helper.sol";

import { testContract } from "../src/testContract.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        testContract tCObject = Helpers.deployTestContract();
        console.log(address(tCObject));
        vm.stopBroadcast();
    }


}
