const { exec } = require("child_process");
const terminalMd = (app) => {
  app.post("/command", (req, res) => {
    const command = req.body.command;
    if (!command) {
      return res.send({ msg: "path is required." }).json();
    }

    try {
      exec(command, (error, stdout, stderr) => {
        if (error !== null) {
          return res.send({ error: error }).json();
        }
        if (stdout) {
          return res.send({ error: stdout }).json();
        }
        return res.send({ out: stdout }).json();
      });
    } catch (err) {
      res.send(_Send(0, 0, err)).json();
    }
  });
};

module.exports = {
  terminalMd,
};
