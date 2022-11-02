import React, { useContext, useEffect, useState } from "react";
import useAccounts from "../../hooks/useAccount";
import useWalletProvider from "../../hooks/useWalletProvider";
import { ThemeContext } from "styled-components";
import { Wallet } from "../../context/AccountProvider";
import { isSameAddress } from "../../utils/wallet";
import {
  Button,
  Container,
  Heading3,
  OverlayButton,
  Typo1,
  Typo2,
} from "../index";
import Column from "../Column";
import Row from "../Row";
import copySymbol from "../../assets/img/symbols/Copy.svg";
import crossSymbol from "../../assets/img/symbols/Cross.svg";
import jsonSymbol from "../../assets/img/symbols/Download.svg";
import Spacer from "../Spacer";
import syncSymbol from "../../assets/img/symbols/Sync.svg";
import WalletSelectView from "./WalletSelectView";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useInjectedWallet } from "../../hooks/useConnectWallet";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useSettings from "../../hooks/useSettings";
import useFantomNative from "../../hooks/useFantomNative";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToUnit,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import useFantomApiData from "../../hooks/useFantomApiData";
import FormattedValue from "../FormattedBalance";
import useModal from "../../hooks/useModal";
import Modal from "../Modal";
import { AccessWallet } from "../../containers/Onboarding/Onboarding";
import { Context } from "../../context/ModalProvider";
import FadeInOut from "../AnimationFade";
import useAccountSnapshot from "../../hooks/useAccountSnapshot";
import { useSoftwareWallet } from "../../hooks/useSoftwareWallet";
import ModalTitle from "../ModalTitle";
import ModalContent from "../ModalContent";
import InputTextBox from "../InputText/InputTextBox";

const EncryptModal: React.FC<any> = ({ onDismiss, wallet }) => {
  const { encryptWallet } = useSoftwareWallet();
  const [data, setData] = useState(null);
  const [password, setPassword] = useState("");
  const handleCreateKeyJSON = async (wallet: any) => {
    const JSONData = await encryptWallet(
      wallet.walletProvider.signer,
      password
    );
    return JSON.parse(JSONData);
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const validatePasswordRequirements = (value: string) => {
    setError("");
    if (value.length >= 8 && !/[A-Z]/.test(value)) {
      setError("Your chosen password does not meet all requirements");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (validatePasswordRequirements(password)) {
      handleCreateKeyJSON(wallet).then((data) => setData(data));
    }
  }, [password]);

  return (
    <Modal>
      <ModalTitle text="Create Encypted Wallet JSON file" />
      <ModalContent style={{ maxWidth: "30rem" }}>
        <Typo2
          style={{
            width: "100%",
            textAlign: "center",
            whiteSpace: "break-spaces",
          }}
        >
          Set your password. Password requirements: minimum 8 characters long
          with at minimum 1 uppercase letter
        </Typo2>
        <Spacer size="sm" />
        <InputTextBox
          placeholder="encrypt with password"
          text={password}
          setText={setPassword}
          maxLength={20}
        />
        <Typo2 style={{ color: "red", height: "1rem" }}>{error}</Typo2>
      </ModalContent>
      <Spacer size="md" />
      <Row style={{ width: "100%", justifyContent: "center", gap: "5rem" }}>
        {data ? (
          !password || password.length < 8 || error ? (
            <Button style={{ flex: 1 }} variant="primary" disabled>
              Download file
            </Button>
          ) : (
            <a
              style={{
                flex: 1,
                textDecoration: "none",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                backgroundColor: "#1969FF",
                borderRadius: "8px",
                padding: "14px 24px",
                textAlign: "center",
              }}
              type="button"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data)
              )}`}
              download={`your-fWallet-file-${(Date.now() / 1000).toFixed(
                0
              )}.json`}
              onClick={() => {
                setIsDownloading(true);
                setTimeout(() => onDismiss(), 1000);
              }}
            >
              {isDownloading ? "Downloading..." : "Download File"}
            </a>
          )
        ) : (
          <Button style={{ flex: 1 }} variant="primary" disabled>
            Loading...
          </Button>
        )}
        <OverlayButton style={{ flex: 1 }} onClick={() => onDismiss()}>
          <Heading3 style={{ color: "#765cde" }}>Close</Heading3>
        </OverlayButton>
      </Row>
    </Modal>
  );
};

const WalletSelect: React.FC<any> = ({
  handleClose,
  activeWallet,
  setWarning,
  setRequiredAccount,
}) => {
  const { onDismiss } = useContext(Context);
  const context = useWeb3React<Web3Provider>();
  const { account, dispatchAccount } = useAccounts();
  const { settings } = useSettings();
  const { getBalance } = useFantomNative();
  const { dispatchWalletContext } = useWalletProvider();
  const { apiData } = useFantomApiData();
  const { activateInjected } = useInjectedWallet();
  const { accountSnapshots } = useAccountSnapshot();
  const { color } = useContext(ThemeContext);
  const [copied, setCopied] = useState(null);
  const [encryptWallet, setEncryptWallet] = useState(null);

  const [totalFtmBalance, setTotalFtmBalance] = useState(0);
  const [totalFtmValue, setTotalFtmValue] = useState(0);
  const [totalAssetsValue, setTotalAssetsValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const tokenPrice =
    apiData[FantomApiMethods.getTokenPrice]?.data?.price?.price;
  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });

  const [onPresentOnboardingModal] = useModal(
    <Modal>
      <AccessWallet setFlow={console.log} addWallet onDismiss={onDismiss} />
    </Modal>,
    "access-wallet-modal"
  );

  useEffect(() => {
    if (account.wallets.length) {
      const balancePromises = account.wallets.map((wallet: any) =>
        getBalance(wallet.address)
      );
      Promise.all(balancePromises).then((balances) => {
        const totalFTM = (balances as BigNumber[]).reduce((accum, current) => {
          return accum + weiToUnit(current);
        }, 0);

        setTotalFtmBalance(totalFTM);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.wallets]);

  useEffect(() => {
    if (totalFtmBalance && tokenPrice) {
      setTotalFtmValue(totalFtmBalance * tokenPrice);
    }
  }, [totalFtmBalance, tokenPrice]);

  useEffect(() => {
    if (accountSnapshots) {
      const totalAssets = account.wallets.reduce(
        (accumulator: any, current: any) => {
          // calculate total worth over all wallets
          if (accountSnapshots[current.address]) {
            const walletAssetValue =
              accountSnapshots[current.address].walletAssetValue[
                settings.currency
              ];
            return accumulator + walletAssetValue;
          }
          return accumulator;
        },
        0
      );
      setTotalAssetsValue(totalAssets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.wallets, accountSnapshots]);

  useEffect(() => {
    setTotalValue(totalFtmValue + totalAssetsValue);
  }, [totalFtmValue, totalAssetsValue]);

  const handleSwitchWallet = async (wallet: Wallet) => {
    if (
      activeWallet.address &&
      activeWallet.address.toLowerCase() === wallet.address.toLowerCase()
    ) {
      return;
    }

    if (wallet.providerType === "browser") {
      if (
        wallet.address.toLowerCase() !==
        (window as any).ethereum.selectedAddress.toLowerCase()
      ) {
        setWarning(
          `Please select account ${wallet.address} in web3 wallet to continue`
        );
        setRequiredAccount(wallet.address);
        return;
      }
      return activateInjected();
    }

    if (context?.active) {
      context.deactivate();
    }

    return dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...wallet.walletProvider,
        providerType: wallet.providerType,
      },
    });
  };

  const handleStartEncryptJSON = (wallet: any) => {
    setEncryptWallet(wallet);
  };

  const [onPresentEncryptJSONModal] = useModal(
    <EncryptModal wallet={encryptWallet} />,
    "encypt-json-modal"
  );

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(address);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    });
  };

  const handleDelete = (address: string) => {
    const { deactivate } = context;

    dispatchAccount({
      type: "removeWallet",
      address,
    });

    if (activeWallet && activeWallet.providerType === "hardware") {
      activeWallet.signer.closeTransport();
    }

    if (activeWallet && isSameAddress(address, activeWallet.address)) {
      dispatchWalletContext({
        type: "reset",
      });

      // Switch to other account (if exist);
      if (account.wallets.length > 1) {
        handleSwitchWallet(
          isSameAddress(account.wallets[0].address, address)
            ? account.wallets[1]
            : account.wallets[0]
        );
      }
    }

    if (activeWallet && activeWallet.providerType === "browser") {
      deactivate();
    }
  };

  const handleLogout = () => {
    const { deactivate } = context;

    if (activeWallet && activeWallet.providerType === "browser") {
      deactivate();
    }

    dispatchWalletContext({ type: "reset" });
    dispatchAccount({ type: "reset" });
  };

  useEffect(() => {
    if (encryptWallet) {
      onPresentEncryptJSONModal();
    }
  }, [encryptWallet]);

  return (
    <FadeInOut>
      <Container padding="0">
        <Column style={{ padding: "1rem 2rem" }}>
          <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
            Connected
          </Typo2>
          {account.wallets.length ? (
            account.wallets.map((wallet: Wallet) => {
              const isActive =
                activeWallet.address &&
                wallet.address.toLowerCase() ===
                  activeWallet.address.toLowerCase();
              return (
                <Row key={wallet.address}>
                  <OverlayButton
                    style={{ marginTop: ".8rem" }}
                    onClick={() => {
                      handleSwitchWallet(wallet).then(handleClose());
                    }}
                  >
                    <WalletSelectView wallet={wallet} isActive={isActive} />
                  </OverlayButton>
                  <Row
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {wallet.providerType === "software" && (
                      <OverlayButton
                        onClick={() => handleStartEncryptJSON(wallet)}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            alt=""
                            style={{
                              height: "20px",
                              width: "20px",
                              marginRight: ".3rem",
                            }}
                            src={jsonSymbol}
                          />
                        </div>
                      </OverlayButton>
                    )}
                    <OverlayButton onClick={() => handleCopy(wallet.address)}>
                      <div style={{ position: "relative" }}>
                        <img
                          alt=""
                          style={{
                            height: "16px",
                            width: "16px",
                            marginRight: ".5rem",
                          }}
                          src={copySymbol}
                        />
                        {copied === wallet.address && (
                          <div
                            style={{
                              position: "absolute",
                              left: "-.7rem",
                              top: "-1rem",
                              fontSize: "12px",
                            }}
                          >
                            copied
                          </div>
                        )}
                      </div>
                    </OverlayButton>
                    <OverlayButton onClick={() => handleDelete(wallet.address)}>
                      <img
                        alt=""
                        style={{
                          height: "16px",
                          width: "16px",
                        }}
                        src={crossSymbol}
                      />
                    </OverlayButton>
                  </Row>
                </Row>
              );
            })
          ) : (
            <Typo1 style={{ paddingTop: ".8rem", fontWeight: "bold" }}>
              No wallet connected
            </Typo1>
          )}
        </Column>
        <Spacer size="xs" />
        <Column
          style={{
            borderTop: "1px solid rgba(58,72,97,1)",
            padding: "1rem 2rem",
          }}
        >
          <Column>
            <Typo2
              style={{
                color: color.greys.grey(),
                fontWeight: "bold",
                paddingBottom: ".4rem",
              }}
            >
              Total FTM balance
            </Typo2>
            <FormattedValue
              fontSize="16px"
              fontWeight="bold"
              formattedValue={toFormattedBalance(totalFtmBalance)}
              tokenSymbol="FTM"
            />
          </Column>
          <Spacer size="xs" />
          <Column>
            <Typo2
              style={{
                color: color.greys.grey(),
                fontWeight: "bold",
                paddingBottom: ".4rem",
              }}
            >
              Total asset value
            </Typo2>
            <FormattedValue
              fontSize="16px"
              fontWeight="bold"
              formattedValue={toFormattedBalance(totalValue)}
              currencySymbol={toCurrencySymbol(settings.currency)}
            />
          </Column>
        </Column>
        <Column
          style={{
            borderTop: "1px solid rgba(58,72,97,1)",
            padding: "1rem 2rem",
          }}
        >
          <OverlayButton
            style={{ color: "white " }}
            onClick={() => {
              onPresentOnboardingModal();
            }}
          >
            <Row>
              <img alt="" src={syncSymbol} />
              <Spacer />
              <Typo1 style={{ fontWeight: "bold" }}>Add wallet</Typo1>
            </Row>
          </OverlayButton>
          {/*<OverlayButton*/}
          {/*  style={{ color: "white " }}*/}
          {/*  onClick={() => {*/}
          {/*    // loadWeb3Modal();*/}
          {/*    activateInjected();*/}
          {/*    handleClose();*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Row>*/}
          {/*    <img alt="" src={syncSymbol} />*/}
          {/*    <Spacer />*/}
          {/*    <Typo1 style={{ fontWeight: "bold" }}>Connect Metamask</Typo1>*/}
          {/*  </Row>*/}
          {/*</OverlayButton>*/}
          {/*<OverlayButton*/}
          {/*  style={{ color: "white " }}*/}
          {/*  onClick={() => {*/}
          {/*    restoreWalletFromPrivateKey(*/}
          {/*      "0xca12ecbbede631c5f61b39f3201d3722ea5eabde1b6b649b79057d80369e2583"*/}
          {/*    ).then(handleClose());*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Row>*/}
          {/*    <img alt="" src={syncSymbol} />*/}
          {/*    <Spacer />*/}
          {/*    <Typo1 style={{ fontWeight: "bold" }}>Connect PrivateKey</Typo1>*/}
          {/*  </Row>*/}
          {/*</OverlayButton>*/}
        </Column>
        <Column
          style={{
            borderTop: "1px solid rgba(58,72,97,1)",
            padding: "1rem 2rem",
          }}
        >
          <OverlayButton
            style={{ color: "white " }}
            onClick={() => {
              handleLogout();
            }}
          >
            <Row>
              <img alt="" src={crossSymbol} />
              <Spacer />
              <Typo1 style={{ fontWeight: "bold" }}>Logout</Typo1>
            </Row>
          </OverlayButton>
        </Column>
      </Container>
    </FadeInOut>
  );
};

export default WalletSelect;
