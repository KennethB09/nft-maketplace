import { Routes, Route, Navigate } from "react-router";
import { useCurrentAccount } from "@mysten/dapp-kit";

import Home from "./pages/Home";
import LinkWallet from "./pages/LinkWallet";

function App() {
  const currentAccount = useCurrentAccount();
  return (
    <Routes>
      <Route path="home" element={currentAccount ? <Home /> : <Navigate to={"/link-wallet"}/>} />
      <Route path="link-wallet" element={!currentAccount ? <LinkWallet /> : <Navigate to={"/Home"}/>} />
      <Route path="*" element={currentAccount ? <Home /> : <Navigate to={"/link-wallet"}/>}/>
    </Routes>
  );
}

export default App;
