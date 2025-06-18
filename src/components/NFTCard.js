import React from 'react';
import { ethers } from 'ethers';

const NFTCard = ({ nft, account, buyNFT }) => {
  return (
    <div className="nft-card">
      {nft.image && <img src={nft.image} alt={nft.name} className="nft-image" />}
      <h3>{nft.name || `Token #${nft.tokenId.toString()}`}</h3>
      <p>Price: {ethers.formatEther(nft.price)} ETH</p>
      {nft.owner?.toLowerCase() === account?.toLowerCase() ? (
        <p className="owner-label">Owner</p>
      ) : (
        nft.currentlyListed && (
          <button onClick={() => buyNFT(nft.tokenId, nft.price)}>Buy</button>
        )
      )}
    </div>
  );
};

export default NFTCard;
