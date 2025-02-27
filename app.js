const PORT = 3000;
const express = require("express");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("landingPage.ejs");
});

app.listen(PORT, () => {
  console.log("server started listening on port", PORT);
});
