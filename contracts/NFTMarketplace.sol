//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    address payable owner;
    uint256 listPrice = 0.01 ether;

    struct ListedNFT {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    event NFTListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    mapping(uint256 => ListedNFT) private idToListedNFT;


    constructor() ERC721("NFT Marketplace", "NFTM") {
        owner = payable(msg.sender);
    }


    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestNFTId() public view returns (ListedNFT memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedNFT[currentTokenId];
    }

    function getListedNFTForId(uint256 tokenId) public view returns (ListedNFT memory) {
        return idToListedNFT[tokenId];
    }

    function getCurrentNFT() public view returns (uint256) {
        return _tokenIds.current();
    }
    mapping(string => bool) private _metadataUsed;

    function createNFT(string memory tokenURI, uint256 price) public payable returns (uint) {
        require(
            !_metadataUsed[tokenURI],
            "This NFT metadata has already been used"
        );

        _metadataUsed[tokenURI] = true;

        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price);

        return newTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");
        owner.transfer(msg.value);

        idToListedNFT[tokenId] = ListedNFT(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        //Emit the event for successful transfer. The frontend parses this message and updates the end user
        emit NFTListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }
    
    function getAllNFTs() public view returns (ListedNFT[] memory) {
        uint nftCount = _tokenIds.current();
        ListedNFT[] memory tokens = new ListedNFT[](nftCount);
        uint currentIndex = 0;
        uint currentId;
        for(uint i=0;i<nftCount;i++)
        {
            currentId = i + 1;
            ListedNFT storage currentItem = idToListedNFT[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }
    
    function getMyNFTs() public view returns (ListedNFT[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;
        for(uint i=0; i < totalItemCount; i++)
        {
            if(idToListedNFT[i+1].owner == msg.sender || idToListedNFT[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }

        ListedNFT[] memory items = new ListedNFT[](itemCount);
        for(uint i=0; i < totalItemCount; i++) {
            if(idToListedNFT[i+1].owner == msg.sender || idToListedNFT[i+1].seller == msg.sender) {
                currentId = i+1;
                ListedNFT storage currentItem = idToListedNFT[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        uint price = idToListedNFT[tokenId].price;
        address seller = idToListedNFT[tokenId].seller;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idToListedNFT[tokenId].currentlyListed = false;
        idToListedNFT[tokenId].owner = payable(msg.sender);
        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
    }
}
