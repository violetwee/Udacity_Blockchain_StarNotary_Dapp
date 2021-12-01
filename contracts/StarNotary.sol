// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
    }

    // Task 1: Add a name and a symbol for your starNotary tokens.
    string public constant name = "StarNotary";
    string public constant symbol = "STAR";

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't owned"
        );
        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Task 1: Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        // Check that token exists
        require(_exists(_tokenId), "Invalid token id");

        Star memory star = tokenIdToStarInfo[_tokenId];
        return star.name;
    }

    // Task 1: Add a function called exchangeStars, so 2 users can exchange their star tokens...Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // Check that both tokens exist
        require(
            _exists(_tokenId1) && _exists(_tokenId2),
            "One or more tokens are invalid"
        );

        // Check that tokens belong to different owners
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        require(owner1 != owner2, "Tokens belong to the same owner");

        // Check that exchange is initiated by the token owners
        require(
            msg.sender == owner1 || msg.sender == owner2,
            "Token exchange not initiated by owner(s)"
        );

        // All OK, we initiate the exchange
        _transferFrom(owner1, owner2, _tokenId1);
        _transferFrom(owner2, owner1, _tokenId2);
    }

    // Task 1: Write a function to Transfer a Star. The function should transfer a star from the address of the caller. The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
    function transferStar(address _to1, uint256 _tokenId) public {
        // Check if sender is the owner of the token to be transferred
        require(ownerOf(_tokenId) == msg.sender, "You do not own this token");

        _transferFrom(msg.sender, _to1, _tokenId);
    }
}
