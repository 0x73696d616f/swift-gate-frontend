// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;


contract testContract { 

    event ReceivedInfo(uint256, address, string, string, address, bool);
    constructor() payable {
    }


    function testReceiveVariables(uint256 tokenAmount,
                                  address tokenAddress, 
                                  string calldata selectedOrigin, 
                                  string calldata selectedDestination,
                                  address receiverAddress,
                                  bool  isSingleTransaction
                                     ) public{
        
          emit ReceivedInfo( tokenAmount,
                             tokenAddress, 
                             selectedOrigin, 
                             selectedDestination,
                             receiverAddress,
                             isSingleTransaction);
    }


}

