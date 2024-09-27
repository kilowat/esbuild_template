import { argv } from 'node:process';
import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';
import { sassPlugin } from 'esbuild-sass-plugin'
import path from 'path';
const buildPath = './dist';

const
  productionMode = ('development' !== (argv[2] || process.env.NODE_ENV)),
  target = 'chrome100,firefox100,safari15'.split(',');

console.log(`${productionMode ? 'production' : 'development'} build`);

/*
const buildMedia = await esbuild.context({
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/images/*'],
        to: [`${buildPath}/images`],
      },
      watch: true,
    }),
    clean({
      patterns: [`${buildPath}/images/*`,],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});
*/

const buildHtml = await esbuild.context({
  entryPoints: ['./src/html/*.html'],
  bundle: true,
  logLevel: productionMode ? 'error' : 'info',
  outdir: buildPath,
  loader: {
    '.html': 'copy',
  },
  plugins: [
    clean({
      patterns: [`${buildPath}/*.html`],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});

// bundle CSS
const buildCSS = await esbuild.context({
  publicPath: '/test',
  entryPoints: ['./src/css/styles.scss'],
  bundle: true,
  target,
  external: ['./src/images/*'],
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: `${buildPath}/css`,
  plugins: [
    sassPlugin(
      {
        transform: async (rawSource, resolveDir) => {
          // TODO: Still working here, definitely not finalized
          const source = rawSource.replace(/@images/, path.resolve(__dirname, 'app/assets/images/'));
          console.log(resolveDir);
          return source;
        },
      }
    ),
    clean({
      patterns: [`${buildPath}/css*`],
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
  outdir: `${buildPath}/js`,
  chunkNames: '[name]-[hash]',
  splitting: true,
  inject: !productionMode ? ['livereload.js'] : [],
  plugins: [
    clean({
      patterns: [`${buildPath}/js*`],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


if (productionMode) {
  // single production build
  let t = Date.now()
  console.log('building...')
  // await buildMedia.rebuild();
  // buildMedia.dispose();
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
  // await buildMedia.watch();
  await buildHtml.watch();
  await buildCSS.watch();
  await buildJS.watch();

  // development server
  await buildHtml.serve({
    servedir: buildPath,
  });
}
