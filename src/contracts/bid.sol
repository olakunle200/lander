/* Function to bid for the land
    externally implement bidding functionality
 */
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
    function seeAllBids(uint _index) public view  OnlyOwner(_index) returns(
        address, 
        uint,
        uint
    ){
        Bid storage bid = bids[_index];
        return (
            bid.address,
            bid.timeOfBidding,
            bid.askingAmount
        );
    }