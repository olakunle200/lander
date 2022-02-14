import { useState, useEffect } from "react";

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";

import lander from "./contracts/lander.abi.json";
import IERC from "./contracts/IERC.abi.json";

function App() {
  const ERC20_DECIMALS = 18;

  const contractAddress = "0xC48ba779B3d1A490d6394b8190B4aFF1c7488ac8";
  const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  const [isEdit, setIsEdit] = useState(false);
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [editAmount, setEditAmount] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [amount, setAmount] = useState("");

  const [lands, setLands] = useState([]);

  const walletConnect = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];
        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
        console.log(user_address);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Error");
    }
  };

  useEffect(() => {
    walletConnect();
  }, []);

  useEffect(() => {
    if (contract) {
      getLands();
    }
  }, [contract]);

  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
      console.log(balance);
      const contract = new kit.web3.eth.Contract(lander, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (kit && address) {
      getBalance();
    } else {
      console.log("no kit");
    }
  }, [kit, address]);

  const addLand = async (event) => {
    event.preventDefault();
    console.log(name, description, image, amount);
    const _amount = new BigNumber(amount).shiftedBy(ERC20_DECIMALS).toString();
    try {
      await contract.methods
        .createLand(name, description, image, _amount, false)
        .send({ from: address });
      getLands();
    } catch (error) {
      console.log(error);
    }
  };

  const buyLand = async (index) => {
    const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);
    try {
      await cUSDContract.methods
        .approve(contractAddress, lands[index].amount)
        .send({ from: address });
      await contract.methods.buyLand(index).send({ from: address });
      getBalance();
      getLands();
    } catch (error) {
      console.log(error);
    }
  };

  const sellLand = async (index) => {
    try {
      await contract.methods.sellLand(index).send({ from: address });
      getLands();
    } catch (error) {
      console.log(error);
    }
  };

  const getLands = async () => {
    const landLength = await contract.methods.getLandLength().call();
    const _lands = [];

    for (let index = 0; index < landLength; index++) {
      let _land = new Promise(async (resolve, reject) => {
        let land = await contract.methods.getLand(index).call();
        resolve({
          index: index,
          owner: land[0],
          locationName: land[1],
          landDescription: land[2],
          landImage: land[3],
          amount: land[4],
          bought: land[5],
          forSale: land[6],
        });
      });
      _lands.push(_land);
    }
    const lands = await Promise.all(_lands);
    setLands(lands);
  };

  const setForSale = async (index) => {
    try {
      await contract.methods.setForSale(index).send({ from: address });
      getLands();
    } catch (error) {
      console.log(error);
    }
  };

  const changeAmount = async (index) => {
    const _amount = new BigNumber(editAmount)
      .shiftedBy(ERC20_DECIMALS)
      .toString();
    try {
      await contract.methods.editLand(index, _amount).send({ from: address });
      getLands();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Lander
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"></li>
            </ul>

            <button className="btn btn-outline-success">
              Balance:{cUSDBalance} cUSD
            </button>
          </div>
        </div>
      </nav>
      <main style={{ marginTop: "30px", padding: "10px" }}>
        <div className="row row-cols-2 row-cols-md-3 mb-3">
          {lands.map((land) => (
            <div className="col">
              <div className="card mb-4 rounded-3 shadow-sm">
                <div className="card-body">
                  {land.forSale && !land.bought ? (
                    <div
                      style={{
                        backgroundColor: "green",
                        width: "100px",
                        marginBottom: "10px",
                        padding: "10px",
                        color: "white",
                      }}
                    >
                      <strong>Sale</strong>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "red",
                        width: "100px",
                        marginBottom: "10px",
                        padding: "10px",
                        color: "white",
                      }}
                    >
                      <strong>Not for Sale</strong>
                    </div>
                  )}
                  <img
                    style={{ width: "300px", height: "200px", marginBottom: "20px" }}
                    src={land.landImage}
                    alt=""
                  />
                  <h5 className="card-title pricing-card-title">
                    {land.locationName}
                  </h5>
                  <p>{land.landDescription}</p>
                  <h5>{land.amount / 1000000000000000000} cUSD</h5>
                  <div className="row">
                    {console.log(land.owner, address, land.bought)}
                    {land.bought && land.forSale && address === land.owner && (
                      <div className="col-4">
                        <button
                          onClick={() => sellLand(land.index)}
                          className="btn btn-danger"
                        >
                          Sell Land
                        </button>
                      </div>
                    )}
                    {!land.bought && land.forSale && (
                      <div className="col-4">
                        <button
                          onClick={() => buyLand(land.index)}
                          className="btn btn-primary"
                        >
                          Buy Land
                        </button>
                      </div>
                    )}
                    {address === land.owner && (
                      <div className="col-4">
                        <button
                          onClick={() => setIsEdit(!isEdit)}
                          className="btn btn-danger"
                        >
                          Edit Info
                        </button>
                      </div>
                    )}
                    {address === land.owner && (
                      <div className="col-4">
                        <button
                          onClick={() => setForSale(land.index)}
                          className="btn btn-outline-primary"
                        >
                          Toggle Sale
                        </button>
                      </div>
                    )}
                  </div>

                  {isEdit && (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Change Amount</label>
                        <input
                          type="text"
                          className="form-control"
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => changeAmount(land.index)}
                        type="submit"
                        className="btn btn-primary"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div style={{ margin: "16px" }}>
        <h2>Add your Land</h2>
        <div className="row">
          <div className="col-6">
            <form onSubmit={addLand}>
              <div className="mb-3">
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Location Description</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Land Image</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
