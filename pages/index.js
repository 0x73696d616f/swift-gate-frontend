import { useState, useEffect } from "react";
import { Dropdown, Button, Switch, Input, Grid } from "@nextui-org/react";
import React from "react";
import { Bridge1Icon } from "../utils/bridge1icon";
import { Bridge2Icon } from "../utils/bridge2icon";
import { Bridge3Icon } from "../utils/bridge3icon";
import abi from "../solidity-test-files/out/testContract.sol/testContractAbi.json";

import { ethers } from "ethers";

import NextLink from "next/link";
import Link from "next/link";
import Metamask from "../component/metamask";

const Index = () => {
  const [haveMetamask, sethaveMetamask] = useState(true);
  
  const [client, setclient] = useState({
    isConnected: false,
  });

  const [selectedOrigin, setSelectedOrigin] = useState(new Set());
  const [selectedDestination, setSelectedDestination] = useState(new Set());
  
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isSingleTransaction, setIsSingleTransaction] = useState(false);

  const selectedValueOrigin = React.useMemo(
    () => Array.from(selectedOrigin).join(", ").replaceAll("_", " "),
    [selectedOrigin],
  );

  const selectedValueDestination = React.useMemo(
    () => Array.from(selectedDestination).join(", ").replaceAll("_", " "),
    [selectedDestination]
  );

  const checkConnection = async () => {
    const { ethereum } = window;
    if (ethereum) {
      sethaveMetamask(true);
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setclient({
          isConnected: true,
          address: accounts[0],
        });
      } else {
        setclient({
          isConnected: false,
        });
      }
    } else {
      sethaveMetamask(false);
    }
  };

  const connectWeb3 = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setclient({
        isConnected: true,
        address: accounts[0],
      });
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  };

  const showGoButton = selectedOrigin.size > 0 && selectedDestination.size > 0;

  useEffect(() => {
    checkConnection();
  }, []);

  const handleTokenAddressChange = (event) => {
    setTokenAddress(event.target.value);
  };

  const handleTokenAmountChange = (event) => {
    setTokenAmount(event.target.value);
  };

  const handleReceiverAddressChange = (event) => {
    setReceiverAddress(event.target.value);
  };

  const handleSingleTransactionChange = (checked) => {
    setIsSingleTransaction(checked);
  };

  // Interact with smart contract

  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const contractAddress = "0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f";
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const handleBridgeButtonClick = async () => {
    try {
      const signer = provider.getSigner();
      const senderAddress = await signer.getAddress();

      // Make the contract call
      const tx = await contract.testReceiveVariables(
        tokenAmount,
        tokenAddress, 
        selectedOrigin, 
        selectedDestination,
        receiverAddress,
        isSingleTransaction
         );
      await tx.wait();

      console.log('Transaction successful!');
    } catch (error) {
      console.error('Error calling smart contract function:', error);
    }
  };



  return (
    <>
      {/* Navbar */}
      <nav className="fren-nav d-flex">
        <div className="d-flex" style={{ marginLeft: "auto" }}>
          <div>
            <button className="btn connect-btn" onClick={connectWeb3}>
              {client.isConnected ? (
                <>
                  {client.address.slice(0, 4)}...
                  {client.address.slice(38, 42)}
                </>
              ) : (
                <>Connect Wallet</>
              )}
            </button>
          </div>
          <div>
            <Link href="https://twitter.com/threesigma_xyz">
              <button className="btn tw-btn">TW</button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Navbar end */}

      <section className="container d-flex">
        <main>
          <h1 className="main-title">SwiftGate ⛩️</h1>

          <p className="main-desc">
            SwiftGate is a bridging protocol that allows users to bridge their assets between different chains with minimal costs. 
             <br />
          </p>

          {/* ---- */}
          <p>
            {!haveMetamask ? (
              <Metamask />
            ) : client.isConnected ? (
              <>
                <br />
                You're connected ✅

                {/* Select bridges */}
                <Grid.Container gap={2} justify="center">
                  <div className="bridge-dropdowns">
                  <Grid>
                    <Dropdown>
                      <Dropdown.Button auto color="secondary">Origin Chain {selectedValueOrigin}</Dropdown.Button>
                      <Dropdown.Menu 
                        aria-label="OriginActions"
                        selectionMode="single"
                        selectedKeys={selectedOrigin}
                        onSelectionChange={setSelectedOrigin}>
                        <Dropdown.Item 
                          key="Origin: bridge 1"
                          icon={<Bridge1Icon size={22} fill="var(--nextui-colors-secondary)" />}
                         ><NextLink href="/">bridge 1</NextLink></Dropdown.Item>
                        <Dropdown.Item 
                          key="Origin: bridge 2"
                          icon={<Bridge2Icon size={22} fill="var(--nextui-colors-secondary)" />}
                          ><NextLink href="/">bridge 2</NextLink></Dropdown.Item>
                        <Dropdown.Item 
                          key="Origin: bridge 3"
                          icon={<Bridge3Icon size={22} fill="var(--nextui-colors-secondary)" />}
                          ><NextLink href="/">bridge 3</NextLink></Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    </Grid>

                    <Grid>
                    <Dropdown>
                      <Dropdown.Button auto color="secondary">Destination Chain {selectedValueDestination}</Dropdown.Button>
                      <Dropdown.Menu 
                        aria-label="DestinationActions"
                        selectionMode="single"
                        selectedKeys={selectedDestination}
                        onSelectionChange={setSelectedDestination}>
                        <Dropdown.Item 
                          key="bridge 1"
                          icon={<Bridge1Icon size={22} fill="var(--nextui-colors-secondary)" />}
                         ><NextLink href="/">bridge 1</NextLink></Dropdown.Item>
                        <Dropdown.Item 
                          key="Origin: bridge 2"
                          icon={<Bridge2Icon size={22} fill="var(--nextui-colors-secondary)" />}
                          ><NextLink href="/">bridge 2</NextLink></Dropdown.Item>
                        <Dropdown.Item 
                          key="Origin: bridge 3"
                          icon={<Bridge3Icon size={22} fill="var(--nextui-colors-secondary)" />}
                          ><NextLink href="/">bridge 3</NextLink></Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    </Grid>
                  </div>
                </Grid.Container>

                {/* Select token & amount */}
                <Grid.Container justify="center" gap={2}>
                <Grid>
                  <Input labelLeft="Token Address" type="text" size="md" color="primary" value={tokenAddress} onChange={handleTokenAddressChange} />     
                </Grid>

                <Grid>
                  <Input labelLeft="Token Amount" type="number" size="md" color="primary" value={tokenAmount} onChange={handleTokenAmountChange} />     
                </Grid>
                </Grid.Container>

                {/* Select address of receiver and if it is a single transaction */}
                <Grid.Container justify="center" gap={2}>
                <Grid>
                  <Input labelLeft="Receiver Address" type="text" size="md" color="primary" value={receiverAddress} onChange={handleReceiverAddressChange} />     
                </Grid>

                <Grid>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px" }}>Single Transaction</span>
                    <Switch initialChecked={isSingleTransaction} checked={isSingleTransaction} onChange={handleSingleTransactionChange} />
                </div>
                </Grid>
              </Grid.Container>


              {/* Go Button*/}
                {showGoButton && (
                  <div className="go-button">
                    <Button 
                    auto 
                    color="primary" 
                    css={{ px: "$13" } }
                    onPress={handleBridgeButtonClick}
                    >
                      Bridge
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <br />
                <button className="btn connect-btn" onClick={connectWeb3}>
                  Connect Wallet
                </button>
              </>
              
            )}
          </p>
          {/* ---- */}
        </main>
      </section>

      <style jsx>{`
        .bridge-dropdowns {
          display: flex;
        }

        .go-button {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .gap {
          gap: 10px;
        }
      `}</style>
    </>
  );
};

export default Index;
