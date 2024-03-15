const express = require("express");
const fse = require("fs-extra");
const app = express();
const port = 8282;
const bodyParser = require("body-parser");



// function pathsToDirectoryStructure(paths) {
//   let result = "";
//   const structure = {};
//   paths.forEach((path) => {
//     const parts = path.split("/");
//     let current = structure;

//     parts.forEach((part, index) => {
//       if (!current[part]) {
//         current[part] = {};
//       }
//       current = current[part];
//     });
//   });

//   function buildText(obj, indent = "", isLast = true) {
//     Object.keys(obj).forEach((key, index, array) => {
//       const isLastChild = index === array.length - 1;
//       const prefix = isLast ? "└── " : "├── ";
//       const newIndent = indent + (isLast ? "    " : "│   ");

//       result += `${indent}${prefix}${key}\n`;

//       if (Object.keys(obj[key]).length) {
//         buildText(obj[key], newIndent, isLastChild);
//       }
//     });
//   }
//   const rootKeys = Object.keys(structure);
//   if (rootKeys.length) {
//     result += `${rootKeys[0]}\n`;
//     buildText(structure[rootKeys[0]]);
//   }

//   return result.trim();
// }




// ---------------------------------------
// ---------------------------------------
// ---------------------------------------
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: "Invalid JSON payload" });
  }
  next(err);
});


app.get("/", (req, res) => {
  res.send({ server: "running" }).json(); // Zwraca strukturę w formacie tekstowym umieszczoną w tagu <pre>
});

const files = require('./endpoints/files.js')
files.filesMd(app)

// Endpoint do przetwarzania listy ścieżek
// app.post("/revert-structure", (req, res) => {
//   const paths = req.body.paths;
//   if (!paths || !Array.isArray(paths)) {
//     return res.status(400).send("Invalid input");
//   }
//   const directoryStructure = pathsToDirectoryStructure(paths);
//   res.send(`${directoryStructure}`); // Zwraca strukturę w formacie tekstowym umieszczoną w tagu <pre>
// });

///xxxx




const jsonParserMiddleware = async(req, res, next) => {
  if (!req.body || typeof req.body !== 'string') {
    next();
    return;
  }
  try {
    req.body = JSON.parse(req.body);
    next();
  } catch (e) {
    res.sendStatus(400).json({ msg: 'Invalid data.' });
  }
};

app.use(jsonParserMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
