import { EtherspotTransactionKit } from "@etherspot/transaction-kit";
import * as ethers from "ethers";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";

import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  const randomWallet = ethers.Wallet.createRandom();
  const providerWallet = new ethers.Wallet(randomWallet.privateKey);

  return (
    <UserProvider>
      <EtherspotTransactionKit provider={providerWallet} chainId={100}>
        <div className={montserrat.className}>
          <Component {...pageProps} />
        </div>
      </EtherspotTransactionKit>
    </UserProvider>
  );
}
