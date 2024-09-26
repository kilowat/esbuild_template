import { argv } from 'node:process';
import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';

const
  productionMode = ('development' !== (argv[2] || process.env.NODE_ENV)),
  target = 'chrome100,firefox100,safari15'.split(',');

console.log(`${productionMode ? 'production' : 'development'} build`);

const buildLogPlugin = {
  name: 'rebuild-log',
  setup({ onStart, onEnd }) {
    var t
    onStart(() => {
      t = Date.now()
    })
    onEnd(() => {
      console.log('build finished in', Date.now() - t, 'ms')
    })
  }
};

const buildMedia = await esbuild.context({
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/images/*'],
        to: ['./build/images'],
      },
      watch: true,
    }),
    clean({
      patterns: ['./build/images/*',],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


const buildHtml = await esbuild.context({
  entryPoints: ['./src/html/*.html'],
  bundle: true,
  logLevel: productionMode ? 'error' : 'info',
  outdir: './build',
  loader: {
    '.html': 'copy',
  },
  plugins: [
    clean({
      patterns: ['./build/*.html'],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
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
  let t = Date.now()
  console.log('building...')
  await buildMedia.rebuild();
  buildMedia.dispose();
  // single production build
  await buildHtml.rebuild();
  buildHtml.dispose();
  // single production build
  await buildCSS.rebuild();
  buildCSS.dispose();

  await buildJS.rebuild();
  buildJS.dispose();
  console.log('finished in', Date.now() - t, 'ms')
}
else {
  // watch for file changes
  await buildMedia.watch();
  await buildHtml.watch();
  await buildCSS.watch();
  await buildJS.watch();

  // development server
  await buildHtml.serve({
    servedir: './build'
  });
}
