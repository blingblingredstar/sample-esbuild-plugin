const fs = require('fs');
const path = require('path');
const { createLink, createScript, generateHTML } = require('./utils');
const { Plugin } = require('esbuild');

/**
 * Esbuild plugin that can generate HTML with bundles
 * @returns {Plugin}
 */
module.exports = () => ({
  name: 'esbuild:html',
  setup(build) {
    build.onEnd(async (buildResult) => {
      if (buildResult.errors.length) return;

      const { metafile } = buildResult;
      const scripts = [];
      const links = [];
      if (metafile) {
        const { outputs } = metafile;
        const assets = Object.keys(outputs);
        assets.forEach((asset) => {
          if (asset.endsWith('.js')) {
            scripts.push(createScript(asset));
            return;
          }
          if (asset.endsWith('.css')) {
            links.push(createLink(asset));
            return;
          }
        });
      }
      const templateContent = generateHTML(scripts, links);
      const templatePath = path.join(process.cwd(), 'index.html');
      await fs.writeFile(templatePath, templateContent, () => {});
    });
  },
});
