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
        bool bought;
        bool forSale;
    }

    mapping(uint => Land) lands;
    uint landLength = 0;

    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

// modifier to make sure it is the owner of the land
    modifier onlyOwner(uint _index) {
        require(msg.sender == lands[_index].owner, "Not the owner of land");
        _;
    }

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
            false,
            _forSale
        );

        landLength++;
    }

// function to edit land
    function editLand(
        uint _index,
        uint _amount
    )public{
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
        lands[_index].bought = true;
        lands[_index].owner = payable(msg.sender);
        lands[_index].forSale = false;
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