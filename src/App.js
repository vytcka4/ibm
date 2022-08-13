import "./App.css";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

function App() {
  const [enteredStock, setEnteredStock] = useState([]);
  let url;
  const apiKey = "cbrqhjaad3idk2bmtfp0";

  const [companyProfileData, setCompanyProfileData] = useState({});
  const [fetched, setfetched] = useState(false);

  const GetCompanyData = (event) => {
    const enteredName = event.target.value;
    const enteredNameArray = enteredName
      .split(" ")
      .filter((Element) => Element.length > 0)
      .map((el, index) => el[index].trim());

    console.log(enteredNameArray);
    setEnteredStock(enteredName);
  };
  useEffect(() => {
    const getData = setTimeout(() => {
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
          console.log(response.data);
          setfetched(true);
        })
        .catch((er) => {});
    }, 250);

    return () => {
      clearTimeout(getData);
    };
  }, [enteredStock]);

  console.log(companyProfileData);

  return (
    <div className="App">
      <form>
        <label>company name</label>
        <input minLength="1" type="text" onChange={GetCompanyData}></input>
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
  );
}

export default App;
