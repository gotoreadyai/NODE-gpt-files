const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const basePath = "../../my-gpt-projects/";
const filesMd = (app) => {
  app.post("/dir-create", (req, res) => {
    const filePath = req.body.path;
    if (!filePath) {
      return res.send({ msg: "path is required." }).json();
    }
    try {
      fse.ensureDir(_Path(filePath), "0o2775", (err) => {
        res.send(_Send({}, "Direcrory created", err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/files-list", async (req, res) => {
    const filePath = req.body.path;
    if (!filePath) {
      return res.send({ msg: "path is required." }).json();
    }
    try {
      fs.readdir(_Path(filePath), { withFileTypes: true }, (err, files) => {
        files = files
          .map((file) => {
            return {
              name: file.name,
              isDirectory: file.isDirectory(),
              time: fs
                .statSync(_Path(filePath + "/" + file.name))
                .mtime.getTime(),
            };
          })
          .sort((a, b) => {
            // Sort by directory status first, directories first
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;

            // If both are the same type, sort by modification time
            return a.time - b.time;
          })
          .map((v) => v.name);
        res.send(_Send({ paths: files }, "Projects readed", err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/file-read", async (req, res) => {
    const filePath = req.body.path;
    if (!filePath) {
      return res.send({ msg: "path is required." }).json();
    }
    try {
      fs.readFile(_Path(filePath), "utf8", (err, data) =>
        res.send(_Send({ content: data }, "File is readed", err)).json()
      );
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/file-write", async (req, res) => {
    const filePath = req.body.path;
    const fileContent = req.body.content;
    if (!filePath) {
      return res.send({ msg: "path is required." }).json();
    }
    try {
      fse.outputFile(_Path(filePath), `${fileContent || filePath}`, (err) => {
        res.send(_Send({ content: fileContent }, "File is writed", err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/file-remove", async (req, res) => {
    const filePath = req.body.path;
    if (!filePath) {
      return res.send({ msg: "path is required." }).json();
    }
    try {
      fse.remove(_Path(filePath), (err) => {
        res.send(_Send({}, `File ${filePath} is deleted`, err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/create-structure", async (req, res) => {
    const path = req.body.path;
    const structure = req.body.structure;
    if (!structure) {
      return res
        .status(400)
        .send({ msg: "Directory structure text is required." })
        .json();
    }
    try {
      const list = parseStructure(structure, path);
      res.send(list).json();
    } catch (error) {
      res
        .status(500)
        .send({ msg: `Error creating file structure: ${error.message}` });
    }
  });

  // Endpoint do przetwarzania listy ścieżek
  // app.post("/revert-structure", (req, res) => {
  //   const paths = req.body.paths;
  //   if (!paths || !Array.isArray(paths)) {
  //     return res.status(400).send("Invalid input");
  //   }
  //   const directoryStructure = pathsToDirectoryStructure(paths);
  //   res.send(`${directoryStructure}`); // Zwraca strukturę w formacie tekstowym umieszczoną w tagu <pre>
  // });
};

const _Send = (data, msg, err) => {
  return err
    ? {
        type: "error",
        msg: `Error creating file: ${err}`,
      }
    : {
        type: "success",
        msg: msg,
        ...data,
      };
};

const _Path = (myPath) => {
  return path.join(__dirname, `${basePath}${myPath}`);
};

function parseStructure(textContent, targetPath) {
  const lines = textContent.split("\n");
  const paths = [];
  let parentDirectory = "";
  const stack = [];
  console.log(lines);

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }
    if (index === 0) {
      parentDirectory = line.trim();
      stack.push(parentDirectory + "/");
      return;
    }
    const level =
      line.lastIndexOf("├── ") !== -1
        ? line.lastIndexOf("├── ") / 4
        : line.lastIndexOf("└── ") !== -1
        ? line.lastIndexOf("└── ") / 4
        : line.lastIndexOf("│   ") !== -1
        ? line.lastIndexOf("│   ") / 4 + 1
        : 0;
    const name = line.trim().substring(4);
    while (stack.length > level + 1) {
      stack.pop();
    }
    stack.push(name.split("#")[0]);

    const path = stack
      .join("/")
      .replace(/└── /g, "")
      .replace(/├── /g, "")
      .replace(/│   /g, "")
      .replace(/\/+/g, "/")
      .replace(/\s+/g, "");

    if (path !== parentDirectory) {
      paths.push(path.replace(/\/+/g, "/"));

      fse.pathExists(_Path(`${targetPath}/${path}`), (err, exists) => {
        if (!exists) {
          fse
            .outputFile(_Path(`${targetPath}/${path}`), "")
            .then(() => {
              console.log(
                `The ${_Path(`${targetPath}/${path}`)} file has been saved!`
              );
            })
            .catch((err) => {
              console.error(err);
            });
        }
      });
    }
  });
  return paths;
}

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

module.exports = {
  filesMd,
};
