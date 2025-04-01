import express from "express";

const app = express();

app.use("/", (req, res) => {
  res.json("hello this is the food a order app");
  return;
});

app.listen(8000, () => {
  console.log("App is Listening to Port 8000");
});
