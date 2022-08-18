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
  const [allPricesData, setAllPricesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage("");
  };

  const onSuggestionsHandler = (text) => {
    console.log(text);
    setEnteredStock(text);
    setSuggestions([]);
  };

  function onSubmitHandler(event) {
    event.preventDefault();

    if (enteredStock.length > 35) {
      setErrorMessage("exceeded character limits");
      return;
    }

    const fromDate = new Date(fromDateValue);
    const toDate = new Date(toDateValue);
    const unixTimestampFrom = Math.floor(fromDate.getTime() / 1000);
    const unixTimestampTo = Math.floor(toDate.getTime() / 1000);
    if (unixTimestampTo - unixTimestampFrom <= 0) {
      setErrorMessage("invalid date");
      return;
    }

    async function getStockData() {
      url = `https://finnhub.io/api/v1/stock/profile2?symbol=${enteredStock}&token=${apiKey}`;
      await axios
        .get(url)
        .then((response) => {
          if (Object.keys(response.data).length === 0) {
            setErrorMessage("stock price wasn't found");
            return;
          }
          setCompanyProfileData({
            name: response.data.name,
            country: response.data.country,
            currency: response.data.currency,
            url: response.data.weburl,
          });
        })
        .catch((er) => {
          console.error(er);
          return setErrorMessage("something went wrong");
        });
    }

    getStockData();

    if (errorMessage.length > 0) {
      return;
    }

    async function getPrices() {
      candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${enteredStock}&resolution=D&from=${unixTimestampFrom}&to=${unixTimestampTo}&token=${apiKey}`;
      await axios
        .get(candleUrl)
        .then((response) => {
          console.log(response);
          if (Object.keys(response.data).length !== 1) {
            const unixTimeStamps = response.data.t;
            const prices = response.data.c;
            let alldates = [];

            unixTimeStamps.map((entries) => {
              const date = new Date(entries * 1000).toLocaleDateString("en-GB");
              return alldates.push(date);
            });

            const dataForDiagram = prices.map((price, index) => {
              return { price: price, date: alldates[index] };
            });
            setAllPricesData(dataForDiagram);
          } else {
            setfetched(false);
            return;
          }
        })
        .catch((err) => {
          return console.error(err);
        });
    }
    getPrices();

    // axios
    //   .post("http://localhost:8080", {
    //     name: companyProfileData.name,
    //     prices: allPricesData,
    //   })
    //   .then((res) => {
    //     console.log(res);
    //   });

    setErrorMessage("");
    setfetched(true);
  }

  return (
    !isLoading && (
      <div className="App">
        <form onSubmit={onSubmitHandler}>
          <div className="form-container">
            {errorMessage && <p>{errorMessage}</p>}
            <label htmlFor="symbol">company name</label>
            <input
              required
              minLength="1"
              type="text"
              maxLength="36"
              onChange={onChangeSymbolHandler}
              value={enteredStock}
            ></input>
            <label htmlFor="startDate">Start date: </label>
            <input
              required
              type="date"
              onChange={(e) => {
                setErrorMessage("");
                return setFromDateValue(e.target.value);
              }}
            ></input>
            <label htmlFor="EndDate">End date: </label>
            <input
              required
              type="date"
              onChange={(e) => {
                setErrorMessage("");
                return setToDateValue(e.target.value);
              }}
            ></input>
            <div className="suggestions-control">
              {suggestions &&
                suggestions.map((suggestion, key) => {
                  return (
                    <div
                      className="suggestion-container"
                      key={key}
                      onClick={() => {
                        onSuggestionsHandler(suggestion.symbol);
                      }}
                    >
                      <p>{suggestion.symbol}</p>
                      <p>{suggestion.description}</p>
                    </div>
                  );
                })}
            </div>
          </div>
          <button>Search</button>
        </form>
        {fetched && <Diagram data={allPricesData} />}
      </div>
    )
  );
}

export default App;
