import "./App.scss";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  let url;
  const apiKey = "cbrqhjaad3idk2bmtfp0";
  const [enteredStock, setEnteredStock] = useState([]);
  const [companyProfileData, setCompanyProfileData] = useState({});
  const [fetched, setfetched] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [allStockCodes, setAllStockCodes] = useState([]);

  useEffect(() => {
    const getAllStockCodes = async () => {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${apiKey}`
        );
        setAllStockCodes(response.data);
        setisLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    getAllStockCodes();
  }, []);

  const onChangeSymbolHandler = (event) => {
    const enteredName = event.target.value;
    let matches = [];
    if (enteredName.length > 0) {
      matches = allStockCodes.filter((stock) => {
        const regex = new RegExp(`^${enteredName}`, "gi");
        return stock.symbol.match(regex);
      });
    }
    setSuggestions(matches);
    setEnteredStock(enteredName);
    setfetched(false);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    url = `https://finnhub.io/api/v1/stock/profile2?symbol=${enteredStock}&token=${apiKey}`;
    axios
      .get(url)
      .then((response) => {
        setCompanyProfileData({
          name: response.data.name,
          country: response.data.country,
          currency: response.data.currency,
          url: response.data.weburl,
        });
        setfetched(true);
      })
      .catch((er) => {});
  };

  return (
    !isLoading && (
      <div className="App">
        <form onSubmit={onSubmitHandler}>
          <div className="form-container">
            <label for="symbol">company name</label>
            <input
              minLength="1"
              type="text"
              onChange={onChangeSymbolHandler}
            ></input>
            <label for="startDate">Start date: </label>
            <input type="date"></input>
            <label for="EndDate">End date: </label>
            <input type="date"></input>
            <div className="suggestions-control">
              {suggestions &&
                suggestions.map((suggestions, key) => {
                  return (
                    <div className="suggestion-container" key={key}>
                      <p>{suggestions.symbol}</p>
                      <p>{suggestions.description}</p>
                    </div>
                  );
                })}
            </div>
          </div>
          <button> click</button>
        </form>

        {fetched && (
          <ul>
            <li>{companyProfileData.name}</li>
            <li>{companyProfileData.currency}</li>
            <li>{companyProfileData.country}</li>
            <li>{companyProfileData.url}</li>
          </ul>
        )}
      </div>
    )
  );
}

export default App;
