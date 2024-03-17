const express = require("express");
const app = express();
const port = 8282;

// ---------------------------------------
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ message: "Invalid JSON payload" });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send({ server: "running", port: port }).json();
});

const files = require("./endpoints/files.js");
files.filesMd(app);

const terminal = require("./endpoints/terminal.js");
terminal.terminalMd(app);

/* 
  prevent send invalid json from client 
  */
const jsonParserMiddleware = async (req, res, next) => {
  if (!req.body || typeof req.body !== "string") {
    next();
    return;
  }
  try {
    req.body = JSON.parse(req.body);
    next();
  } catch (e) {
    res.sendStatus(400).json({ msg: "Invalid data." });
  }
};

app.use(jsonParserMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
