const express = require("express");
const serveIndex = require("serve-index");
const multer = require("multer");
const fs = require("fs").promises;
const { resolve } = require("path");
const dae2gltf = require("dae2gltf");
var mustacheExpress = require('mustache-express');

// use diskstorage, so we can control filenames
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "input/");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const upload = multer({ storage: storage }).single("file");

// express web server
const app = express();

// use moustache templates to generate views
app.engine('html',mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// serve static files
app.use("/", express.static("public"));

// serve output 
app.use(
  "/output",
  express.static("output"),
  // serveIndex("output", { icons: true })
);

// show previews + serve file index
app.use(
  "/preview",
  express.static("preview"),
  serveIndex("output", { icons: true })
);

// preview a single file in a-frame
app.use( "/preview/:filename.glb", (req, res) => {
  res.render('aframe', { gltf : '/output/' + req.params.filename + '.glb' } );
});

// convert files, and show the inside aframe
app.post("/convert", upload, async (req, res) => {
  const file = req.file;
  const inputPath = resolve( file.path );
  const outputFile = file.originalname.replace(/\.[^/.]+$/, ".glb");
  const outputPath = resolve ( 'output',  outputFile );
  await dae2gltf( inputPath, outputPath);
  await fs.unlink(req.file.path);
  res.redirect('/preview/' + outputFile );
});

// start express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
