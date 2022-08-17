import "./App.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import Diagram from "./components/Diagram";

function App() {
  let url;
  let candleUrl;
  const apiKey = "cbrqhjaad3idk2bmtfp0";
  const [enteredStock, setEnteredStock] = useState("");
  const [companyProfileData, setCompanyProfileData] = useState({});
  const [fetched, setfetched] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [allStockCodes, setAllStockCodes] = useState([]);
  const [fromDateValue, setFromDateValue] = useState("");
  const [toDateValue, setToDateValue] = useState("");
  const [allprices, setAllprices] = useState([]);

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

    const fromDate = new Date(fromDateValue);
    const toDate = new Date(toDateValue);
    const unixTimestampFrom = Math.floor(fromDate.getTime() / 1000);
    const unixTimestampTo = Math.floor(toDate.getTime() / 1000);
    if (unixTimestampTo - unixTimestampFrom <= 0) {
      return;
    }

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
      })
      .catch((er) => {});

    candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${enteredStock}&resolution=D&from=${unixTimestampFrom}&to=${unixTimestampTo}&token=${apiKey}`;
    axios.get(candleUrl).then((response) => {
      console.log(response);
      const unixTimeStamps = response.data.t;
      const prices = response.data.c;
      let alldates = [];

      unixTimeStamps.map((entries) => {
        const date = new Date(entries * 1000).toLocaleDateString("en-GB");
        return alldates.push(date);
      });

      const dataForDiagram = prices.map((price, index) => {
        return { [alldates[index]]: price };
      });
    });

    setfetched(true);
  };

  return (
    !isLoading && (
      <div className="App">
        <form onSubmit={onSubmitHandler}>
          <div className="form-container">
            <label htmlFor="symbol">company name</label>
            <input
              minLength="1"
              type="text"
              onChange={onChangeSymbolHandler}
            ></input>
            <label htmlFor="startDate">Start date: </label>
            <input
              type="date"
              onChange={(e) => {
                return setFromDateValue(e.target.value);
              }}
            ></input>
            <label htmlFor="EndDate">End date: </label>
            <input
              type="date"
              onChange={(e) => {
                return setToDateValue(e.target.value);
              }}
            ></input>
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
        {fetched && <Diagram data={allprices} />}
      </div>
    )
  );
}

export default App;
