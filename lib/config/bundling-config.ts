export const commonBundlingOptions = {
  esbuildArgs: {
    "--loader:.png=dataurl": true,
    "--define:window=undefined": true,
    "--define:document=undefined": true,
    "--define:navigator=undefined": true,
    "--define:canvas=undefined": true,
    "--define:__IS_FRONTEND__=true": true,
    "--define:OPENSEARCH=true": true,
    "--preserve-symlinks": true,
  },
  define: {
    "global.window": "undefined",
    "global.document": "undefined",
    "global.navigator": "undefined",
    "global.canvas": "undefined",
    __IS_FRONTEND__: "false",
  },
  minify: true,
  sourceMap: true,
};
