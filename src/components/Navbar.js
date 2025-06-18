import {
  BrowserRouter as Router,
  Link,

} from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

function Navbar() {

const [connected, toggleConnect] = useState(false);
const location = useLocation();
const [currAddress, updateAddress] = useState('0x');

async function getAddress() {
  try {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    updateAddress(addr);
  } catch (error) {
    console.error("Error getting address:", error);
    updateAddress('0x');
  }
}

async function connectWebsite() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    console.log("MetaMask detected, attempting to connect...");
    
    // Always request accounts when user clicks connect
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Accounts received:", accounts);
    
    if (accounts.length === 0) {
      console.log("No accounts found");
      return;
    }
    
    // Check/switch network to Sepolia testnet (0xaa36a7) or Ethereum mainnet (0x1)
    const targetChainId = '0xaa36a7'; // Sepolia testnet
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log("Current chain ID:", chainId);
    
    if(chainId !== targetChainId) {
      console.log("Switching to Sepolia network...");
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          console.log("Adding Sepolia network...");
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetChainId,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }  
    
    await getAddress();
    toggleConnect(true);
    console.log("Successfully connected!");
    
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    // If user rejects connection, make sure state reflects disconnected status
    toggleConnect(false);
    updateAddress('0x');
  }
}

function disconnectWallet() {
  toggleConnect(false);
  updateAddress('0x');
  window.location.reload();
}

async function handleWalletConnection() {
  if (connected) {
    disconnectWallet();
  } else {
    await connectWebsite();
  }
}

useEffect(() => {
  // Only set up event listeners, don't auto-connect
  if (window.ethereum) {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        disconnectWallet();
      } else if (connected) {
        // User switched accounts (only if already connected in our app)
        getAddress();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Cleanup listener on component unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }
}, [connected]);

  return (
    <div className="">
      <nav className="w-screen">
        <ul className='flex items-end justify-between py-3 bg-transparent text-black pr-5'>
        <li className='flex items-end ml-5 pb-2'>
          <Link to="/">
          {/* <img src={fullLogo} alt="" width={120} height={120} className="inline-block -mt-2"/> */}
          <div className='inline-block font-bold text-xl ml-2'>
            NFT Marketplace
          </div>
          </Link>
        </li>
        <li className='w-2/6'>
          <ul className='lg:flex justify-between font-bold mr-10 text-lg'>
            {location.pathname === "/" ? 
            <li className='border-b-2 hover:pb-0 p-2'>
              <Link to="/">Marketplace</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2'>
              <Link to="/">Marketplace</Link>
            </li>              
            }
            {location.pathname === "/sellNFT" ? 
            <li className='border-b-2 hover:pb-0 p-2'>
              <Link to="/sellNFT">Sell NFT</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2'>
              <Link to="/sellNFT">Sell NFT</Link>
            </li>              
            }              
            {location.pathname === "/profile" ? 
            <li className='border-b-2 hover:pb-0 p-2'>
              <Link to="/profile">My NFT</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2'>
              <Link to="/profile">My NFT</Link>
            </li>              
            }  
            <li>
              <button 
                className={`font-bold py-2 px-4 rounded text-sm ${
                  connected 
                    ? "bg-green-500 hover:bg-green-700 text-white" 
                    : "bg-blue-500 hover:bg-blue-700 text-white"
                }`} 
                onClick={handleWalletConnection}
              >
                {connected ? "Disconnect" : "Connect Wallet"}
              </button>
            </li>
          </ul>
        </li>
        </ul>
      </nav>
      <div className='text-black text-bold text-right mr-10 text-sm'>
        {currAddress !== "0x" ? "Connected to" : "Not Connected. Please login to view NFTs"} {currAddress !== "0x" ? (currAddress.substring(0,15)+'...'):""}
      </div>
    </div>
  );
}

export default Navbar;