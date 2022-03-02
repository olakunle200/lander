// SPDX-License-Identifier: MIT  
pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract lander{
    struct Land{
        address payable owner;
        string locationName;
        string landDescription;
        string landImage;
        uint amount;
        uint highestBid;
        bool bought;
        bool forSale;
    }

/*  Added a new struct and mapping for bidding functionality to keep the code base clean  */
    struct Bid{
        address bidder;
        uint timeOfBidding;
        uint askingAmount;
    }
    mapping(uint => Bid) bids;

    mapping(uint => Land) lands;
    uint landLength = 0;

    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


// modifier to make sure it is the owner of the land
    modifier onlyOwner(uint _index) {
        require(msg.sender == lands[_index].owner, "Not the owner of land");
        _;
    }

/* Added two new events for selling of land and bidding of land
    We can filter through these events in the front end to show relevant events to relavent poeple */
    event landSold(address indexed buyer, address indexed seller, uint soldPrice);
    event newBid(uint indexed indexOfTheLand, address indexed bidder, uint biddingPrice );

// function to create land
    function createLand(
        string memory _name,
        string  memory _desc,
        string memory _image,
        uint _amount,
        bool _forSale
    )public {
        lands[landLength] = Land(
            payable(msg.sender),
            _name,
            _desc,
            _image,
            _amount,
            0,
            false,
            _forSale
        );

        landLength++;
    }

// function to edit land
/* Added the onlyOwner modifier such that only the owner can edit the land */
    function editLand(
        uint _index,
        uint _amount
    )public onlyOwner(_index){
        Land storage land = lands[_index];
        land.amount = _amount;
    }

// function to get land
    function getLand(uint _index)public view returns(
        address payable,
        string memory,
        string memory,
        string memory,
        uint,
        bool,
        bool
    ){
         Land storage land = lands[_index];
        return(           
            land.owner,
            land.locationName,
            land.landDescription,
            land.landImage,
            land.amount,
            land.bought,
            land.forSale
        );
    }

// function to buy land
    function buyLand(uint _index) public payable{
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                lands[_index].owner,
                lands[_index].amount
            ),
            "Land could not be bought"
        );
        emit landSold(msg.sender, lands[_index].owner , lands[_index].amount);
        lands[_index].bought = true;
        lands[_index].owner = payable(msg.sender);
        lands[_index].forSale = false;
    }

/* Function to bid for the land*/
    function bidForLand(uint _index, uint askingPrice ) public{
        bids[_index] = Bid(
            msg.sender,
            block.timestamp,
            askingPrice
        );
        Land storage land = lands[_index];
        if(askingPrice > land.highestBid){
            land.highestBid = askingPrice;
        }
        emit newBid(_index, msg.sender, askingPrice);
    }

/* Function for the owner to see all the bids made */
    function seeAllBids(uint _index) public view  onlyOwner(_index) returns(
        address, 
        uint,
        uint
    ){
        Bid storage bid = bids[_index];
        return (
            bid.bidder,
            bid.timeOfBidding,
            bid.askingAmount
        );
    }
// function to sell land
    function sellLand(uint _index)public{
        lands[_index].bought = false;
    }

// function to toggle sale
    function setForSale(uint _index) public onlyOwner(_index){
        lands[_index].forSale = !lands[_index].forSale;
    }

// function to get land length
    function getLandLength() public view returns (uint) {
        return (landLength);
    }
}