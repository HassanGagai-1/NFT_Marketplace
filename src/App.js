import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Marketplace from '../Marketplace.json';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [nfts, setNfts] = useState([]);
  const [formInput, setFormInput] = useState({ url: '', price: '' });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.log('wallet connection failed');
      }
    }
  };

  const loadNFTs = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, provider);
    const items = await contract.getAllNFTs();
    setNfts(items);
  };

  const mintNFT = async () => {
    if (!formInput.url || !formInput.price) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
    const price = ethers.parseEther(formInput.price);
    let listingPrice = await contract.getListPrice();
    const transaction = await contract.createNFT(formInput.url, price, { value: listingPrice });
    await transaction.wait();
    setFormInput({ url: '', price: '' });
    loadNFTs();
  };

  const buyNFT = async (tokenId, price) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
    const transaction = await contract.executeSale(tokenId, { value: price });
    await transaction.wait();
    loadNFTs();
  };

  useEffect(() => {
    if (account) {
      loadNFTs();
    }
  }, [account]);

  return (
    <div className="App">
      <h1>NFT Marketplace</h1>
      {account ? (
        <p>Connected wallet: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {account && (
        <div className="mint">
          <h2>Create NFT</h2>
          <input
            type="text"
            placeholder="Metadata URL"
            value={formInput.url}
            onChange={e => setFormInput({ ...formInput, url: e.target.value })}
          />
          <input
            type="text"
            placeholder="Price in ETH"
            value={formInput.price}
            onChange={e => setFormInput({ ...formInput, price: e.target.value })}
          />
          <button onClick={mintNFT}>Mint</button>
        </div>
      )}

      <h2>Marketplace</h2>
      <ul>
        {nfts.map((nft, idx) => (
          <li key={idx} className="nft">
            <p>Token ID: {nft.tokenId.toString()}</p>
            <p>Owner: {nft.owner}</p>
            <p>Price: {ethers.formatEther(nft.price)} ETH</p>
            {nft.currentlyListed && account && (
              <button onClick={() => buyNFT(nft.tokenId, nft.price)}>Buy</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
