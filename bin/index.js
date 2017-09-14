#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const chokidar = require("chokidar");
const chalk = require("chalk");
const { compile } = require("neo4-js-compiler");

function formatMs(ms) {
  let milliseconds = ms % 1000;
  let seconds = Math.floor(ms / 1000);

  return `${seconds}.${milliseconds}s`;
}

program
  .version("0.1.0")
  .usage("[options] <file>")
  .option("--no-decorators", "Don't use decorators in the final code")
  .option("-o, --out [outFile]", "Write schema to given file")
  .option("--watch", "Watch file to compile")
  .parse(process.argv);

function compileFile(file) {
  const start = Date.now();
  console.log(`Starting to compile ${file}...`);
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      return console.error(err);
    }

    const schemaString = data.toString();
    const compiledSchema = compile(schemaString);
    const delta = Date.now() - start;

    if (program.out) {
      fs.writeFile(program.out, compiledSchema, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log(chalk.green("Compiled in " + formatMs(delta)));
      });
    } else {
      console.log(compiledSchema);
      console.log(chalk.green("Compiled in " + formatMs(delta)));
    }
  });
}

if (program.watch) {
  chokidar.watch(program.args[0]).on("all", (err, path) => {
    compileFile(program.args[0]);
  });
} else {
  compileFile(program.args[0]);
}
