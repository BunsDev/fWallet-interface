import React, { Suspense, useEffect, useRef, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import styled, { ThemeProvider } from "styled-components";
import i18next from "./i18n";
import theme from "./theme/theme";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";

import withConnectedWallet from "./hocs/withConnectedWallet";
import ModalProvider from "./context/ModalProvider";
import { AccountProvider } from "./context/AccountProvider";
import { ActiveWalletProvider } from "./context/ActiveWalletProvider";
import { FantomApiProvider } from "./context/FantomApiProvider";
import { SettingsProvider } from "./context/SettingsProvider";
import { TransactionProvider } from "./context/TransactionProvider";
import Home from "./containers/Home";
import SideBar from "./containers/SideBar/SideBar";
import Test from "./containers/Test/Test";
import TopBar from "./containers/TopBar/TopBar";
import Send from "./containers/Send";
import Staking from "./containers/Staking";
import { Body, mediaExact } from "./components";
import Scrollbar from "./components/Scrollbar";
import Governance from "./containers/Governance";
import Proposal from "./containers/Proposal";
import CreateProposal from "./containers/CreateProposal";
import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import Swap from "./containers/Swap";
import { ApiDataProvider } from "./context/ApiDataProvider";
import NotifyProvider from "./context/NotifyProvider";
import Bridge from "./containers/Bridge";
import { TokenPriceProvider } from "./context/TokenPriceProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import useWalletProvider from "./hooks/useWalletProvider";
import useModal from "./hooks/useModal";
import InfoModal from "./components/InfoModal";
import config from "./config/config";
import { switchToChain } from "./web3/events";
import Preferences from "./containers/Preferences";
import * as Fathom from "fathom-client";

Bugsnag.start({
  apiKey: process.env.REACT_APP_BUGSNAG_API_KEY,
  autoDetectErrors: false,
  autoTrackSessions: false,
  collectUserIp: false,
  plugins: [new BugsnagPluginReact()],
});

Fathom.load(process.env.REACT_APP_FATHOM_SITEID);

const AppContent: React.FC<any> = () => {
  const location = useLocation();
  const { walletContext } = useWalletProvider();
  const containerRef = useRef(null);

  // refresh scrollbar on height change
  const [, setContainerHeight] = useState(null);
  const [correctChainLoaded, setCorrectChainLoaded] = useState(false);

  const [onPresentWrongChainSelected, onDismissWrongChainSelected] = useModal(
    <InfoModal
      message={`[Web3] wrong network selected. Please change your network to Fantom ${
        parseInt(config.chainId) === 250 ? "Opera" : "Testnet"
      } to continue`}
      withCloseButton={false}
      handleActionButton={async () =>
        await switchToChain(
          walletContext.activeWallet.provider,
          parseInt(config.chainId)
        )
      }
      actionButtonText={`Switch to ${
        parseInt(config.chainId) === 250 ? "Fantom Opera" : "Fantom Testnet"
      }`}
      actionButtonNoDismiss={true}
    />,
    "browser-wrong-network-modal",
    true
  );

  useEffect(() => {
    setContainerHeight(containerRef?.current?.clientHeight);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/bridge") {
      return setCorrectChainLoaded(true);
    }
    if (walletContext.activeWallet.providerType === "browser") {
      return setCorrectChainLoaded(
        walletContext.web3ProviderState.chainSelected ===
          parseInt(config.chainId)
      );
    }
    if (walletContext.activeWallet.providerType === "software") {
      walletContext.activeWallet.provider.getNetwork().then((network: any) => {
        setCorrectChainLoaded(network.chainId === parseInt(config.chainId));
      });
    }
  }, [location.pathname, walletContext.web3ProviderState.chainSelected]);

  useEffect(() => {
    if (!correctChainLoaded) {
      return onPresentWrongChainSelected();
    }
    onDismissWrongChainSelected();
  }, [correctChainLoaded]);

  useEffect(() => {
    Fathom.trackPageview();
  }, [location]);

  return (
    <>
      <SideBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Suspense fallback="Loading">
          <TopBar />
        </Suspense>
        <Scrollbar
          style={{
            width: "100%",
            height: "100%",
            barColor: "rgba(196,202,213,0.41)",
          }}
        >
          <StyledRouteContainer
            ref={containerRef}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              backgroundColor: "rgba(10, 22, 46, 1)",
            }}
          >
            <Switch>
              <Route path="/test" component={Test} />
              <Route path="/home" component={Home} />
              <Route path="/send" component={Send} />
              <Route path="/staking" component={Staking} />
              <Route path="/swap" component={Swap} />
              <Route path="/bridge" component={Bridge} />
              <Route path="/governance" component={Governance} exact />
              <Route
                path="/governance/proposal/create"
                component={CreateProposal}
                exact
              />
              <Route path="/governance/proposal/:id" component={Proposal} />
              <Route path="/preferences" component={Preferences} />
              <Route path="/" component={Home} />
            </Switch>
          </StyledRouteContainer>
        </Scrollbar>
      </div>
    </>
  );
};

const StyledRouteContainer = styled.div`
  ${mediaExact.xs(`padding: 0 1.5rem 0 1rem`)};
  ${mediaExact.sm(`padding: 0 2rem 0 1.5rem`)};
  ${mediaExact.md(`padding: 0 4rem 0 2rem`)};
  ${mediaExact.lg(`padding: 0 4rem 0 2rem`)};
`;

const AppContentWithWallet = withConnectedWallet(AppContent);

function App() {
  return (
    <Providers>
      <Body>
        <ErrorBoundary name="/">
          <AppContentWithWallet />
        </ErrorBoundary>
      </Body>
    </Providers>
  );
}

const Providers: React.FC<any> = ({ children }) => {
  function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
  }
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <I18nextProvider i18n={i18next}>
        <ThemeProvider theme={theme}>
          <SettingsProvider>
            <ApiDataProvider>
              <FantomApiProvider>
                <AccountProvider>
                  <TokenPriceProvider>
                    <ActiveWalletProvider>
                      <TransactionProvider>
                        <ModalProvider>
                          <NotifyProvider>{children}</NotifyProvider>
                        </ModalProvider>
                      </TransactionProvider>
                    </ActiveWalletProvider>
                  </TokenPriceProvider>
                </AccountProvider>
              </FantomApiProvider>
            </ApiDataProvider>
          </SettingsProvider>
        </ThemeProvider>
      </I18nextProvider>
    </Web3ReactProvider>
  );
};

export default App;
