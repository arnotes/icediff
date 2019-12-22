const packager = require('electron-packager')

async function bundleElectronApp() {
  const appPaths = await packager({
    path: '../',
    ignore: [
      'config',
      'desktop',
      'node_modules/.bin',
      'node_modules/electron',
      'node_modules/electron-prebuilt',
      'node_modules/electron-prebuilt-compile',
      'public',
      'scripts',
      'src',
      '.git'
    ]
  });
  console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

bundleElectronApp();