// Next, React
import { FC, useEffect, useState } from "react";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";

//Metaplex
import { MouseEventHandler, useCallback, useMemo } from "react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

import { PublicKey } from "@solana/web3.js";

export const HomeView: FC = ({}) => {
  const wallet = useWallet();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  const mx = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet));
  }, [connection, wallet]);
  const [address, setAddress] = useState("");
  const [receiver, setReceiver] = useState("");
  const [nft, setNft] = useState(null);

  const fetchNft = async () => {
    const asset = await mx
      .nfts()
      .findByMint({ mintAddress: new PublicKey(address) });

    setNft(asset);
  };

  async function transfer(mintAddress: string, transferAddress: string) {
    console.log("Transfer started....");
    console.log("Transferring from: ", wallet.publicKey.toBase58());
    console.log("Transferring to: ", transferAddress);
    const mintAddressPublicKey = new PublicKey(mintAddress);
    const nft = await mx
      .nfts()
      .findByMint({ mintAddress: mintAddressPublicKey });
    return await mx.nfts().transfer({
      nftOrSft: nft,
      fromOwner: wallet.publicKey,
      toOwner: new PublicKey(transferAddress),
    });
  }
  async function handleClick(
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    event.preventDefault();
    console.log("clicked");
    try {
      const result = await transfer(address, receiver);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  return (
    <div className="md:hero mx-auto p-4 ">
      <div className="flex flex-col w-full">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          NFT Transfer
        </h1>
        {publicKey ? (
          <>
            <p className="text-center text-2xl mt-10 md:pl-12 font-bold ">
              Your SOL balance: {balance}
            </p>
            <p className="text-center text-2xl mt-10 md:pl-12 font-bold ">
              Enter NFT mint address to fetch NFT
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center mt-8">
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="bg-[#0F172A] text-white px-4 py-3 rounded-md hover:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent  border border-slate-500 w-[500px]"
                required
              />
              <button
                onClick={fetchNft}
                className="bg-[#9945FF] text-white px-4  py-3 ml-2 rounded-md"
              >
                Fetch
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center mt-8">
            <p className="text-center text-2xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
              Please connect your wallet to continue
            </p>
            <ul className="text-left text-2xl md:pl-12 font-bold mt-10 bg-clip-text text-white ">
              <li>1. Enter NFT mint address to fetch NFT </li>
              <li>2. Enter receiver address and click send to transfer NFT </li>
            </ul>
          </div>
        )}
        {nft && (
          <>
            <div className="flex justify-center items-center">
              <div className="mt-8 flex-col ">
                {/* keep h1 center of the div*/}
                <div className="w-full flex justify-center items-center">
                  <h1 className="text-[20px] text-center font-medium text-[#0F172A] bg-white px-4 py-2 -mb-8 w-72 transform rotate-[-5deg] border border-[#9945FF]">
                    {nft.name}
                  </h1>
                </div>
                <img
                  className="max-w-[500px]"
                  src={nft.json.image}
                  alt="The downloaded illustration of the provided NFT address."
                />
              </div>
            </div>
            <div className="flex flex-col mt-4 justify-center items-center">
              <input
                type="text"
                value={receiver}
                onChange={(event) => setReceiver(event.target.value)}
                className="bg-[#0F172A] text-white px-4 py-3 rounded-md hover:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent  border border-slate-500 w-[450px]"
              />
              <button
                onClick={handleClick}
                className="bg-[#9945FF] text-white px-48 py-3 mt-2 rounded-md"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
