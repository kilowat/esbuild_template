import { argv } from 'node:process';
import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';
import { sassPlugin } from 'esbuild-sass-plugin';
import esbuildPluginTsc from 'esbuild-plugin-tsc';
import ImportGlobPlugin from "esbuild-plugin-import-glob";
const ImportGlob = ImportGlobPlugin.default

const buildPath = 'dist';
const publicPath = '/';

const
  productionMode = argv.includes('prod'),
  watchMode = argv.includes('watch'),
  servMode = argv.includes('serv'),
  target = 'chrome100,firefox100,safari15'.split(',');

console.log(`${productionMode ? 'prod' : 'dev'} ${watchMode ? 'watch' : 'build'}`);

const build = await esbuild.context({
  entryPoints: [
    { out: 'bundle', in: './src/js/index.ts' },
    './src/html/**/*',
  ],

  bundle: true,
  //format: 'esm',
  //splitting: true,
  publicPath: publicPath,
  target,
  drop: productionMode ? ['debugger', 'console'] : [],
  logLevel: productionMode ? 'error' : 'info',
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  outdir: buildPath,
  inject: !productionMode ? ['livereload.js'] : [],
  platform: 'browser',
  assetNames: 'assets/[name]-[hash]',
  write: true,
  // external: ['./src/images/'],
  loader: {
    '.svg': 'text',
    '.png': 'file',
    '.jpg': 'file',
    '.gif': 'file',
    '.jpeg': 'file',
    '.woff': 'file',
    '.ttf': 'file',
    '.html': 'copy',
  },
  plugins: [
    sassPlugin({
      watch: true,
      filter: /\.scss$/i,
      type: 'css',
      loadPaths: ['./src/styles'],
      /*
      transform: async (rawSource) => {
        //const source = rawSource.replace(/@images/, `${publicPath}/images`);
        return rawSource.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${publicPath}/$2$3`)
        //return source;
      }
        */
    }),
    ImportGlob(),
    esbuildPluginTsc({
      force: true,
    }),
    /*
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/html/*'],
        to: [`${buildPath}`],
      },
      watch: true,
    }),
    */
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/images/*'],
        to: [`${buildPath}/images`],
      },
      watch: true,
    }),
    clean({
      patterns: [`${buildPath}/**/*`],
      cleanOnStartPatterns: ['./prepare'],
      cleanOnEndPatterns: ['./post'],
    }),
  ]
});


if (watchMode) {
  console.log('watching...')
  await build.watch();
} else {
  let t = Date.now()
  console.log('building...')
  await build.rebuild();
  build.dispose();
  console.log('finished in', Date.now() - t, 'ms')
}

if (servMode) {
  const serv = await build.serve({
    servedir: buildPath,
    host: 'localhost',
  });
  if (productionMode) {
    console.log(`http://${serv.host}:${serv.port}`);
  }
}
