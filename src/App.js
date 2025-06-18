// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import Marketplace from './Marketplace.json'; 
// import './App.css';
// import { GetIpfsUrlFromPinata } from './utils';
// import NFTCard from './components/NFTCard';

// function App() {
//   const [account, setAccount] = useState('');
//   const [nfts, setNfts] = useState([]);
//   const [formInput, setFormInput] = useState({ url: '', price: '' });

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);
//       } catch (err) {
//         console.log('wallet connection failed');
//       }
//     }
//   };
//   // const disconnectWallet = async () => {
//   //   if (window.ethereum) {
//   //     try {
//   //       await window.ethereum.request({ method: 'eth_requestAccounts', params: [{ eth_accounts: {} }] });
//   //       setAccount('');
//   //       window.location.reload();
//   //     } catch (err) {
//   //       console.log('wallet disconnection failed');
//   //     }
//   //   }
//   // };

//   const disconnectWallet = () => {
//     setAccount('');
//     setNfts([]);
//     // if you want a full page refresh:
//     window.location.reload();
//   };

//   const loadNFTs = async () => {
//     if (!window.ethereum) return;
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, provider);
//     const items = await contract.getAllNFTs();
//     const data = await Promise.all(
//       items.map(async item => {
//         const tokenURI = await contract.tokenURI(item.tokenId);
//         let meta = {};
//         try {
//           const url = GetIpfsUrlFromPinata(tokenURI) || tokenURI;
//           const response = await fetch(url);
//           meta = await response.json();
//         } catch (err) {
//           console.log('Failed to fetch metadata', err);
//         }
//         return {
//           ...item,
//           image: meta.image ? GetIpfsUrlFromPinata(meta.image) || meta.image : '',
//           name: meta.name || '',
//           description: meta.description || ''
//         };
//       })
//     );
//     setNfts(data);
//   };

//   const mintNFT = async () => {
//     if (!formInput.url || !formInput.price) return;
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
//     const price = ethers.parseEther(formInput.price);
//     let listingPrice = await contract.getListPrice();
//     const transaction = await contract.createNFT(formInput.url, price, { value: listingPrice });
//     await transaction.wait();
//     setFormInput({ url: '', price: '' });
//     loadNFTs();
//   };

//   const buyNFT = async (tokenId, price) => {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
//     const transaction = await contract.executeSale(tokenId, { value: price });
//     await transaction.wait();
//     loadNFTs();
//   };

//   useEffect(() => {
//     if (account) {
//       loadNFTs();
//     }
//   }, [account]);
  

//   return (
//     <div className="App">
//       <header className="header">
//         {account ? (
//           <button onClick={disconnectWallet} className="wallet-btn">
//             {account.substring(0, 6)}...{account.substring(account.length - 4)} (Disconnect)
//           </button>
//         ) : (
//           <button onClick={connectWallet} className="wallet-btn">Connect Wallet</button>
//         )}
//       </header>

//       <h1>NFT Marketplace</h1>


//       {account && (
//         <div className="mint">
//           <h2>Create NFT</h2>
//           <input
//             type="text"
//             placeholder="Metadata URL"
//             value={formInput.url}
//             onChange={e => setFormInput({ ...formInput, url: e.target.value })}
//           />
//           <input
//             type="text"
//             placeholder="Price in ETH"
//             value={formInput.price}
//             onChange={e => setFormInput({ ...formInput, price: e.target.value })}
//           />
//           <button onClick={mintNFT}>Mint</button>
//         </div>
//       )}

//       <h2>Marketplace</h2>
//       <div className="nft-grid">
//         {nfts.map((nft, idx) => (
//           <NFTCard key={idx} nft={nft} account={account} buyNFT={buyNFT} />
//         ))}
//       </div>
//     </div>
//   );
// }

import './App.css';
import Navbar from './components/Navbar.js';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import SellNFT from './components/SellNFT';
import NFTPage from './components/NFTpage';
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div className="container">
        <Routes>
          <Route path="/" element={<Marketplace />}/>
          <Route path="/nftPage" element={<NFTPage />}/>        
          <Route path="/profile" element={<Profile />}/>
          <Route path="/sellNFT" element={<SellNFT />}/>             
        </Routes>
    </div>
  );
}

export default App;
