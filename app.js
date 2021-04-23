const express = require("express");
const redis = require("redis");
const axios = require("axios");

const app = express();
const redisClient = redis.createClient();


app.get("/noredis", async (req, res) => {
  let date = req.query.date;
  let fetch = await axios.get("https://covid19.th-stat.com/api/open/timeline");
  let data = fetch.data.Data;
  let result = null;
  data.forEach((element) => {
    if (element.Date === date) {
      result = element;
    }
  });
  result ? res.json(result) : res.status(404).json({ result: "Not found" });
});



app.get("/redis/clear", async (req, res) => {
  redisClient.del("coviddata");
  res.json({ result: "ok" });
});


app.get("/redis", async (req, res) => {
  let date = req.query.date;
  redisClient.get("coviddata", async (error, data) => {
    if (error) {
      return res.status(500).send("Internal server error!");
    } else if (data) {
      data = JSON.parse(data);
      let result = null;
      data.forEach((element) => {
        if (element.Date === date) {
          result = element;
        }
      });
      return result ? res.json(result) : res.status(404).json({ result: "Not found!" });
    } else {
      let fetch = await axios.get(
        "https://covid19.th-stat.com/api/open/timeline"
      );
      let get = fetch.data.Data;
      // redisClient.set("coviddata", JSON.stringify(get));
      redisClient.setex("coviddata", 10, JSON.stringify(get));
      let result = null;
      get.forEach((element) => {
        if (element.Date === date) {
            result = element;
        }
      });
      return result ? res.json(result) : res.status(404).json({ result: "Not found!" });
    }
  });
});
app.listen(3000, () => {
  console.log("start in port 3000");
});
