import { useState, useEffect } from "react";
import { Dropdown, Button, Loading } from "@nextui-org/react";
import React from "react";
import { Bridge1Icon } from "../utils/bridge1icon";
import { Bridge2Icon } from "../utils/bridge2icon";
import { Bridge3Icon } from "../utils/bridge3icon";

import NextLink from "next/link";
import Link from "next/link";
import Metamask from "../component/metamask";

const Index = () => {
  const [haveMetamask, sethaveMetamask] = useState(true);
  
  const [client, setclient] = useState({
    isConnected: false,
  });

  const [selectedOrigin, setSelectedOrigin] = React.useState(new Set());
  const [selectedDestination, setSelectedDestination] = React.useState(new Set());

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
                <h2>You're connected ✅</h2>
                <div className="bridge-dropdowns-container" style={{ marginTop: "20px",  marginBottom: "20px" }}>
                  <div className="bridge-dropdowns">
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
                  </div>
                </div>

                {showGoButton && (
                  <div className="go-button">
                    <Button auto color="primary" css={{ px: "$13" }}>
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
        .bridge-dropdowns-container {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        
        .bridge-dropdowns {
          display: flex;
          gap: 10px;
        }

        .go-button {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
      `}</style>
    </>
  );
};

export default Index;
