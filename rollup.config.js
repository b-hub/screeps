"use strict";

import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import screeps from 'rollup-plugin-screeps';

let cfg;
const dest = process.env.DEST;
if (dest) {
  if ((cfg = require("./screeps.json")[dest]) == null) {
    throw new Error("Invalid upload destination: " + dest);
  }

  const secrets = require("./screeps.secrets.json");
  Object.keys(cfg).forEach(key => {
    const configValue = cfg[key];
    if (secrets[configValue]) {
      cfg[key] = secrets[configValue];
    }
  });
} else {
  console.log("No destination specified - code will be compiled but not uploaded");
}



export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: false
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    typescript({tsconfig: "./tsconfig.json"}),
    screeps({config: cfg, dryRun: cfg == null})
  ]
}
