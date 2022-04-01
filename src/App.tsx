import "./App.css";
import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
interface nftProps {
  name: string;
  image: string;
  source: string;
}
function App() {
  const Web3Api = useMoralisWeb3Api();
  const [nfts, setNfts] = useState<Array<nftProps>>([]);
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user!.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout();
    console.log("logged out");
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      const ethNFTs = await Web3Api.account.getNFTs({
        // chain: "polygon",
        // address: "0x39713b717d5d74652941cd7e30a83aac0dd130a1",
        chain: "eth",
        address: user!.get("ethAddress"),
      });
      if (ethNFTs?.result) {
        let nfts_array = [];
        for (let nft of ethNFTs?.result) {
          let source = nft?.name;
          if (nft?.metadata) {
            const metadata = JSON.parse(nft?.metadata);
            let image = "";
            console.log(metadata);
            if (metadata?.image) image = metadata?.image;
            if (metadata?.image_url) image = metadata?.image_url;
            // for ipfs
            if (image.startsWith("ipfs://")) {
              image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
            }
            nfts_array.push({
              name: metadata?.name,
              image: image,
              source: source,
            });
          }
        }
        console.log(nfts_array);
        setNfts(nfts_array);
      }
    };

    if (isAuthenticated) {
      fetchNFTs();
    }
  }, [isAuthenticated]);

  return (
    <div>
      <h1>Moralis Hello World!</h1>
      <h5>{user ? user!.get("ethAddress") : ""}</h5>
      <button onClick={login}>Moralis Metamask Login</button>
      <button onClick={logOut} disabled={isAuthenticating}>
        Logout
      </button>
      {nfts.map((row) => (
        <div key={row.image}>
          <h5>{row.name}</h5>
          <img src={row.image} width="200px" />
          <h5>{row.source}</h5>
        </div>
      ))}
    </div>
  );
}

export default App;
