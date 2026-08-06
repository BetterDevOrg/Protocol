// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BetterDev Milestone Badge
/// @notice Reputation milestone NFTs for verified BetterDev members.
contract MilestoneBadge is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    mapping(bytes32 => mapping(string => uint256)) private _tokenIdOf;
    mapping(uint256 => string) private _tokenURIById;
    mapping(uint256 => bytes32) private _badgeKeyOfToken;
    mapping(uint256 => string) private _memberIdOfToken;

    event MilestoneBadgeMinted(
        address indexed account,
        string indexed memberId,
        bytes32 indexed badgeKey,
        uint256 tokenId,
        string metadataURI
    );

    constructor(address initialOwner) ERC721("BetterDev Milestone Badge", "BDMILE") Ownable(initialOwner) {}

    function mintMilestoneBadge(
        address account,
        string calldata memberId,
        bytes32 badgeKey,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        require(account != address(0), "Invalid account");
        require(bytes(memberId).length > 0, "Invalid member ID");
        require(badgeKey != bytes32(0), "Invalid badge");
        require(_tokenIdOf[badgeKey][memberId] == 0, "Already minted");

        tokenId = _nextTokenId++;
        _safeMint(account, tokenId);

        _tokenIdOf[badgeKey][memberId] = tokenId;
        _tokenURIById[tokenId] = metadataURI;
        _badgeKeyOfToken[tokenId] = badgeKey;
        _memberIdOfToken[tokenId] = memberId;

        emit MilestoneBadgeMinted(account, memberId, badgeKey, tokenId, metadataURI);
    }

    function tokenIdOf(bytes32 badgeKey, string calldata memberId) external view returns (uint256) {
        return _tokenIdOf[badgeKey][memberId];
    }

    function badgeKeyOfToken(uint256 tokenId) external view returns (bytes32) {
        _requireOwned(tokenId);
        return _badgeKeyOfToken[tokenId];
    }

    function memberIdOfToken(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return _memberIdOfToken[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIById[tokenId];
    }
}
