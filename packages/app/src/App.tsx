import React, {
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { ThemeContext, ThemeProvider } from "styled-components";

import i18next from "./i18n";
import theme from "./theme/theme";
import withConnectedWallet from "./hocs/withConnectedWallet";
import ModalProvider from "./context/ModalProvider";
import { AccountProvider } from "./context/AccountProvider";
import { ActiveWalletProvider } from "./context/ActiveWalletProvider";
import { FantomApiProvider } from "./context/FantomApiProvider";
import { SettingsProvider } from "./context/SettingsProvider";
import { TransactionProvider } from "./context/TransactionProvider";
import useDetectResolutionType from "./hooks/useDetectResolutionType";
import Home from "./containers/Home";
import SideBar from "./containers/SideBar/SideBar";
import Test from "./containers/Test/Test";
import TopBar from "./containers/TopBar/TopBar";
import Send from "./containers/Send";
import Staking from "./containers/Staking";
import { Body, Heading1, Heading3 } from "./components";
import Column from "./components/Column";
import Spacer from "./components/Spacer";
import fWalletLogoImg from "./assets/img/fWalletLogo_beta.svg";
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

const AppContent: React.FC<any> = () => {
  const location = useLocation();
  const containerRef = useRef(null);

  // refresh scrollbar on height change
  const [, setContainerHeight] = useState(null);
  useEffect(() => {
    setContainerHeight(containerRef?.current?.clientHeight);
  }, [location.pathname]);

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
          <div
            ref={containerRef}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "0 4rem 0 2rem",
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
              <Route path="/" component={Home} />
            </Switch>
          </div>
        </Scrollbar>
      </div>
    </>
  );
};

const AppContentWithWallet = withConnectedWallet(AppContent);

function App() {
  const { resolutionType } = useDetectResolutionType();
  return (
    <Providers>
      <Body>
        <AppContentWithWallet />
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
                  <ActiveWalletProvider>
                    <TransactionProvider>
                      <ModalProvider>
                        <NotifyProvider>{children}</NotifyProvider>
                      </ModalProvider>
                    </TransactionProvider>
                  </ActiveWalletProvider>
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
