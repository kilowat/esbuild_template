import { argv } from 'node:process';
import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import fs from 'node:fs'

const
  productionMode = ('development' !== (argv[2] || process.env.NODE_ENV)),
  target = 'chrome100,firefox100,safari15'.split(',');

console.log(`${productionMode ? 'production' : 'development'} build`);

let exampleOnLoadPlugin = {
  name: 'example',
  setup(build) {
    // Load ".txt" files and return an array of words
    build.onLoad({ filter: /\.html$/ }, async (args) => {
      window.location.reload();
    })
  },
}

const buldHtml = await esbuild.context({
  entryPoints: ['./src/html/*.html'],
  bundle: true,
  logLevel: productionMode ? 'error' : 'info',
  outdir: './build',
  loader: {
    '.html': 'copy',
  },
  plugins: [
    exampleOnLoadPlugin,
  ]
});

// bundle CSS
const buildCSS = await esbuild.context({
  entryPoints: ['./src/css/main.css'],
  bundle: true,
  target,
  external: ['/images/*'],
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'dataurl'
  },
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: './build/css',
  plugins: [
    clean({
      patterns: ['./build/css*'],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


// bundle JS

const buildJS = await esbuild.context({
  entryPoints: ['./src/js/main.js'],
  format: 'esm',
  bundle: true,
  target,
  drop: productionMode ? ['debugger', 'console'] : [],
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: './build/js',
  chunkNames: '[name]-[hash]',
  splitting: true,
  inject: !productionMode ? ['livereload.js'] : [],
  plugins: [
    clean({
      patterns: ['./build/js*'],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


if (productionMode) {

  // single production build
  await buldHtml.rebuild();
  buldHtml.dispose();

  // single production build
  await buildCSS.rebuild();
  buildCSS.dispose();

  await buildJS.rebuild();
  buildJS.dispose();

}
else {
  // watch for file changes
  await buldHtml.watch();
  await buildCSS.watch();
  await buildJS.watch();

  // development server
  await buildCSS.serve({
    servedir: './build'
  });
}
