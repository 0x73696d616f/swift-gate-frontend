import { useState, useEffect } from "react";
import { Progress, Dropdown, Button, Switch, Input, Grid, Loading } from "@nextui-org/react";
import React from "react";
import Image from 'next/image';
import optimismLogo from '../public/logos/optimism-ethereum-op-logo.png';
import taikoLogo from '../public/logos/taiko.png';
import gnosisLogo from '../public/logos/gnosis.png';
import scrollLogo from '../public/logos/scroll.png';
import mantleLogo from '../public/logos/mantle.jpg';
import swiftGateLogo from '../public/logos/swiftGateLogo.png';

import abiSG from "../contracts-abi/swiftGateABI.json";
import abiGnosisToken from "../contracts-abi/gnosisTokenABI.json";

import { ethers } from "ethers";

import NextLink from "next/link";
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
  const [isTxRunning, setTxRunning] = useState(false);

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

  useEffect(() => {
    checkConnection();
  }, [isTxRunning]);

  const handleTokenAddressChange = (event) => {
    setTokenAddress(event.target.value);
  };

  const handleTokenAmountChange = (event) => {
    setTokenAmount(event.target.value);
  };

  const handleReceiverAddressChange = (event) => {
    setReceiverAddress(event.target.value);
  };

  const handleSingleTransactionChange = () => {
    setIsSingleTransaction(!isSingleTransaction);
  };

  const handleBridgeButtonClick = async () => {
    let originChain;
    console.log("Button clicked");
    try {
      if (typeof window === undefined) return;
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length <= 0) return;
      setTxRunning(true);

      // Connect to provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Ensure connected to correct chain
      const metamaskConnectedChain = await provider.getNetwork();
      if (getSGChainIdFromGlobalChainId(metamaskConnectedChain.chainId) != getChainIdSwiftGate(selectedOrigin.currentKey)) console.error("Not connected to the origin chain.", metamaskConnectedChain, getChainIdSwiftGate(selectedOrigin.currentKey));

      // Connect to smart contract
      const signer = provider.getSigner();
      const swiftGateAddress = "0xB84f07612F4bfEc42E042b6CDD26df496b3d397f"; // the swiftGate address is always the same across all chains
      originChain = new ethers.Contract(swiftGateAddress, abiSG, signer);

      // Approve tokens
      console.log("Waiting approval");
      const tokenContract = new ethers.Contract(tokenAddress, abiGnosisToken, signer);
      const tx = await tokenContract.approve(swiftGateAddress, tokenAmount);
      await tx.wait();

      // Send transaction
      const dstChain = getChainIdSwiftGate(selectedDestination.currentKey);
      console.log("Sending Transaction. Arguments: ", tokenAddress, tokenAmount, receiverAddress, dstChain, isSingleTransaction);
      tx = await originChain.swiftSend(tokenAddress, tokenAmount, receiverAddress, dstChain, isSingleTransaction);
      await tx.wait();

      console.log('Transaction successful!');
      setTxRunning(false);

    } catch (error) {
      console.error('Error calling smart contract function:', error);
    }
  };

  const handleFaucetButtonClick = async () => {
    let token;

    if (typeof window === undefined) return;
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length <= 0) return;
    setTxRunning(true);
    // Connect to provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Ensure connected to correct chain
    const metamaskConnectedChain = await provider.getNetwork();
    if (getSGChainIdFromGlobalChainId(metamaskConnectedChain.chainId) != getChainIdSwiftGate(selectedOrigin.currentKey)) console.error("Not connected to the origin chain.", metamaskConnectedChain, getChainIdSwiftGate(selectedOrigin.currentKey));

    // Connect to smart contract
    const signer = provider.getSigner();
    token = new ethers.Contract(tokenAddress, abiGnosisToken, signer);

    // Send transaction -> call faucet
    console.log("Sending Transaction");
    const tx = await token.faucet();
    await tx.wait();
    setTxRunning(false);
  };


  return (
    <>
      {/* Navbar */}
      <nav className="fren-nav d-flex">
        {isTxRunning &&
          <div  style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}><Loading color="secondary" textColor="secondary" size="xl" type="points"> Waiting for transaction</Loading></div>
        }
        <div className="d-flex" style={{ marginLeft: "auto" }}>

          <Grid.Container gap={2}>
            <Grid>
              <div>
                <Button className="btn connect-btn" color="secondary" onClick={connectWeb3} auto>
                  {client.isConnected ? (
                    <>
                      {client.address.slice(0, 4)}...
                      {client.address.slice(38, 42)}
                    </>
                  ) : (
                    <>Connect Wallet</>
                  )}
                </Button>
              </div>
            </Grid>

            <Grid>
              <div>
                <Button color="secondary" as="a" href="https://twitter.com/threesigma_xyz" auto>Twitter</Button>
              </div>
            </Grid>

            <Grid>
              <div>
                <Button color="secondary" as="a" href="https://0x73696d616f.github.io/swift-gate-contracts/index.html" auto>Docs</Button>
              </div>
            </Grid>

            <Grid>
              <div>
                <Button color="secondary" as="a" href="https://github.com/0x73696d616f/swift-gate-contracts/blob/master/README.md" auto>Token Addr List</Button>
              </div>
            </Grid>
          </Grid.Container>
        </div>

      </nav>
      {/* Navbar end */}

      <section className="container d-flex">
        <main>
          <h1 className="main-title">SwiftGate <Image
            width={80}
            height={80}
            src={swiftGateLogo}
            alt="SwiftGate Logo"
            objectFit="cover"
          />
          </h1>

          <p className="main-desc">
            Bridge your assets between different chains with minimal cost.
            <br />
          </p>

          {/* ---- */}
          <p>
            {!haveMetamask ? (
              <Metamask />
            ) : client.isConnected ? (
              <>
                <br />
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
                            key=" : Optimism"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={optimismLogo}
                                alt="Optimism Logo"
                                objectFit="cover"
                              />
                            }
                          ><NextLink href="/">Optimism</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Taiko"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={taikoLogo}
                                alt="Taiko Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Taiko</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Scroll"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={scrollLogo}
                                alt="Scroll Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Scroll</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Mantle"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={mantleLogo}
                                alt="Mantle Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Mantle</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Chiado"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={gnosisLogo}
                                alt="Gnosis Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Chiado</NextLink></Dropdown.Item>
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
                            key=" : Optimism"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={optimismLogo}
                                alt="Optimism Logo"
                                objectFit="cover"
                              />
                            }
                          ><NextLink href="/">Optimism</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Taiko"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={taikoLogo}
                                alt="Taiko Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Taiko</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Scroll"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={scrollLogo}
                                alt="Scroll Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Scroll</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Mantle"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={mantleLogo}
                                alt="Mantle Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Mantle</NextLink></Dropdown.Item>
                          <Dropdown.Item
                            key=" : Chiado"
                            icon={
                              <Image
                                width={20}
                                height={20}
                                src={gnosisLogo}
                                alt="Chiado Logo"
                                objectFit="cover"
                              />
                            }                          ><NextLink href="/">Chiado</NextLink></Dropdown.Item>
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
                      <Switch initialChecked={false} color="secondary" checked={isSingleTransaction} onChange={handleSingleTransactionChange} />
                    </div>
                  </Grid>
                </Grid.Container>


                {/* Go Button*/}
                <Grid.Container justify="center" gap={2}>
                  <Grid>
                    <div className="go-button">
                      <Button
                        auto
                        color="secondary"
                        css={{ px: "$13" }}
                        onPress={handleBridgeButtonClick}
                      >
                        Bridge
                      </Button>
                    </div>
                  </Grid>

                  <Grid>
                    <div className="go-button">
                      <Button
                        auto
                        color="secondary"
                        css={{ px: "$13" }}
                        onPress={handleFaucetButtonClick}
                      >
                        Faucet
                      </Button>
                    </div>
                  </Grid>
                </Grid.Container>

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
          gap: 8px;
        }

        .gap {
          gap: 8px;
        }
      `}</style>
    </>
  );
};

function getChainIdSwiftGate(str) {
  let value = 0;

  // Convert string to a Uint16Array
  switch (str) {

    case " : Optimism":
      value = "1";
      break;

    case " : Chiado":
      value = "3";
      break;
    case " : Scroll":
      value = "2";
      break;

    case " : Mantle":
      value = "4";
      break;

    case " : Taiko":
      value = "5";
      break;

    default:
      console.error('Error! Cannot get chainId from key selector ', str);
      console.log(str);
  }
  return value;
}

function getSGChainIdFromGlobalChainId(chainIdGlobal) {
  let value = 0;

  // Convert string to a Uint16Array
  switch (chainIdGlobal) {
    case 10200: // Gnosis Chiado
      value = 3;
      break;

    case 534353: // Scroll Alpha
      value = 2;
      break;

    case 420: // Optimism
      value = 1;
      break;

    case 5001: // Mantle
      value = 4;
      break;

    case 167005: // Taiko
      value = 5;
      break;

    default:
      console.log('Error!  Global ChainId not known. Received: ', chainIdGlobal);
  }
  return value;
}


export default Index;
