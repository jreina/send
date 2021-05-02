#!/usr/bin/env node

const path = require("path");
const os = require("os");

const open = require("open");
const express = require("express");
const { program } = require("commander");
const qrcode = require("qrcode");
const { v4: uuid } = require("uuid");
const app = express();

program
  .name("send")
  .arguments("<file>")
  .action(async function (file) {
    const fullPath = path.resolve(file);
    const filename = path.basename(fullPath);
    const serverPath = `http://${os.hostname()}:4000/`;
    const downloadPage = `${serverPath}download`;
    const guid = uuid();
    const fileUrl = `${serverPath}${guid}`;
    const qr = await qrcode.toDataURL(downloadPage);

    // // spin up server
    app.get("/", (req, res) => {
      res.sendFile(path.resolve(__dirname, "static/index.html"));
    });

    app.get("/code.png", (req, res) => {
      res.json({ dataUrl: qr, url: downloadPage });
    });

    app.get(`/metadata.json`, (req, res) => {
      res.json({
        filename,
        url: fileUrl,
      });
    });

    app.get(`/${guid}`, (req, res) => {
      res.download(fullPath);
    });

    app.get("/download", (req, res) => {
      console.log(fullPath);
      res.sendFile(path.resolve(__dirname, "static/download.html"));
    });
    app.listen(4000);
    open(serverPath);
  });

program.parse(process.argv);
