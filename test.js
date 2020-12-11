const dae2gltf = require("dae2gltf");
const srcFile = "./input/labyrinth.dae";
const dstFile = "./output/labyrinth.glb";
dae2gltf(srcFile, dstFile);