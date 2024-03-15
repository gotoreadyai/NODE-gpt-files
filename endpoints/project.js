const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const basePath = "../../my-gpt-projects/";
const project = (app) => {
  app.post("/projects", (req, res) => {
    try {
      fs.readdir(_Path(""), (err, files) => {
        res.send(_Send({ projects: files }, "Projects readed", err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/project-meta", (req, res) => {
    const projectName = req.body.projectName;
    if (!projectName) {
      return res.status(400).send("projectName is required.");
    }
    try {
      fs.readdir(_Path(projectName), (err, files) =>
        res.send(_Send({ files: files }, "Project is readed.", err)).json()
      );
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/create-project", async (req, res) => {
    const projectName = req.body.projectName;
    const projectCrud = req.body.projectCrud;
    if (!projectName) {
      return res.status(400).send("projectName is required.");
    }
    try {
      const trimProjectName = projectName
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "", "")
        .replace(/ /g, "-")
        .toLowerCase();
      fse.outputFile(
        _Path(`${trimProjectName}/CRUD-dessciption.txt`),
        `${projectCrud | ""}`,
        (err) =>
          res
            .send(
              _Send(
                { projectName: trimProjectName, projectCrud: projectCrud },
                "Project is created",
                err
              )
            )
            .json()
      );
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/file-read", async (req, res) => {
    const filePath = req.body.path;
    if (!filePath) {
      return res.status(400).send("path is required.");
    }
    try {
      fs.readFile(_Path(filePath), "utf8", (err, data) =>
      console.log('fileReAS',_Path(filePath),data)
        // res.send(_Send({ content: data }, "File is readed", err)).json()
      );
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });

  app.post("/file-write", async (req, res) => {
    const filePath = req.body.path;
    const fileContent = req.body.content;
    console.log('filewrite',filePath,fileContent)
    if (!filePath) {
      return res.status(400).send("path is required.");
    }
    try {
      fse.outputFile(_Path(filePath), `${fileContent | ""}`, (err) => {
        res.send(_Send({ content: fileContent }, "File is writed", err)).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });
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

module.exports = {
  project,
};
