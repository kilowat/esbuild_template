import { argv } from 'node:process';
import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';
import { sassPlugin } from 'esbuild-sass-plugin';

const buildPath = 'dist';
//const publicPath = '';

const
  productionMode = argv.includes('prod'),
  watchMode = argv.includes('watch'),
  servMode = argv.includes('serv'),
  target = 'chrome100,firefox100,safari15'.split(',');

console.log(`${productionMode ? 'prod' : 'dev'} ${watchMode ? 'watch' : 'build'}`);



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

// bundle CSS
const buildCSS = await esbuild.context({
  entryPoints: ['./src/css/styles.scss'],
  bundle: true,
  //external: ['@images/*', `${publicPath}/images/*`],
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: `${buildPath}/css`,
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'dataurl',
  },
  plugins: [
    sassPlugin(
      /*
      {
        transform: async (rawSource) => {
          const source = rawSource.replace(/@images/, `${publicPath}/images`);
          return source;
        },
      }
      */
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
  bundle: true,
  //format: 'esm',
  //splitting: true,
  target,
  drop: productionMode ? ['debugger', 'console'] : [],
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: `${buildPath}/js`,
  inject: !productionMode ? ['livereload.js'] : [],

  loader: {
    '.svg': 'dataurl'
  },
  plugins: [
    clean({
      patterns: [`${buildPath}/js*`],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


if (!watchMode) {
  // single production build
  let t = Date.now()
  console.log('building...')
  // single production build
  await buildHtml.rebuild();
  buildHtml.dispose();

  await buildMedia.rebuild();
  buildMedia.dispose();

  // single production build
  await buildCSS.rebuild();
  buildCSS.dispose();

  await buildJS.rebuild();
  buildJS.dispose();
  console.log('finished in', Date.now() - t, 'ms')
}
else {
  console.log('watching...')
  await buildHtml.watch();
  await buildMedia.watch();
  await buildCSS.watch();
  await buildJS.watch();

  if (servMode) {
    const serv = await buildHtml.serve({
      servedir: buildPath,
    });
    if (productionMode) {
      console.log('server in prod mode');
      console.log(serv)
    }
  }
}
