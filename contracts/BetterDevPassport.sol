// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BetterDev Passport
/// @notice Chain-specific Passport NFT that points to a universal BetterDev member ID.
contract BetterDevPassport is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    mapping(address => string) private _memberIdOf;
    mapping(string => uint256) private _tokenIdOfMember;
    mapping(uint256 => string) private _tokenURIById;

    event PassportMinted(address indexed account, string indexed memberId, uint256 indexed tokenId, string metadataURI);

    constructor(address initialOwner) ERC721("BetterDev Passport", "BDPASS") Ownable(initialOwner) {}

    function mintPassport(address account, string calldata memberId, string calldata metadataURI)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        require(account != address(0), "Invalid account");
        require(bytes(memberId).length > 0, "Invalid member ID");
        require(bytes(_memberIdOf[account]).length == 0, "Wallet already minted");
        require(_tokenIdOfMember[memberId] == 0, "Member already minted");

        tokenId = _nextTokenId++;
        _safeMint(account, tokenId);

        _memberIdOf[account] = memberId;
        _tokenIdOfMember[memberId] = tokenId;
        _tokenURIById[tokenId] = metadataURI;

        emit PassportMinted(account, memberId, tokenId, metadataURI);
    }

    function memberIdOf(address account) external view returns (string memory) {
        return _memberIdOf[account];
    }

    function passportOf(address account) external view returns (uint256 tokenId, string memory memberId) {
        memberId = _memberIdOf[account];
        if (bytes(memberId).length == 0) return (0, "");
        return (_tokenIdOfMember[memberId], memberId);
    }

    function tokenIdOfMember(string calldata memberId) external view returns (uint256) {
        return _tokenIdOfMember[memberId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIById[tokenId];
    }
}
