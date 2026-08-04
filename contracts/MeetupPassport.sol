// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BetterDev Meetup Passport
/// @notice Per-meetup attendance stamp NFT for verified BetterDev members.
contract MeetupPassport is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    mapping(bytes32 => mapping(string => uint256)) private _tokenIdOf;
    mapping(uint256 => string) private _tokenURIById;
    mapping(uint256 => bytes32) private _meetupIdOfToken;
    mapping(uint256 => string) private _memberIdOfToken;

    event MeetupPassportMinted(
        address indexed account,
        string indexed memberId,
        bytes32 indexed meetupId,
        uint256 tokenId,
        string metadataURI
    );

    constructor(address initialOwner) ERC721("BetterDev Meetup Passport", "BDMEET") Ownable(initialOwner) {}

    function mintMeetupPassport(
        address account,
        string calldata memberId,
        bytes32 meetupId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        require(account != address(0), "Invalid account");
        require(bytes(memberId).length > 0, "Invalid member ID");
        require(meetupId != bytes32(0), "Invalid meetup");
        require(_tokenIdOf[meetupId][memberId] == 0, "Already minted");

        tokenId = _nextTokenId++;
        _safeMint(account, tokenId);

        _tokenIdOf[meetupId][memberId] = tokenId;
        _tokenURIById[tokenId] = metadataURI;
        _meetupIdOfToken[tokenId] = meetupId;
        _memberIdOfToken[tokenId] = memberId;

        emit MeetupPassportMinted(account, memberId, meetupId, tokenId, metadataURI);
    }

    function tokenIdOf(bytes32 meetupId, string calldata memberId) external view returns (uint256) {
        return _tokenIdOf[meetupId][memberId];
    }

    function meetupIdOfToken(uint256 tokenId) external view returns (bytes32) {
        _requireOwned(tokenId);
        return _meetupIdOfToken[tokenId];
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
