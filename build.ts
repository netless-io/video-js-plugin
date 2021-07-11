import esbuild, { BuildOptions } from "esbuild";
import prettyBytes from "pretty-bytes";
import pkg from "./package.json";

const entryPoints = ["src/index.ts"];
const external = Object.keys({
    // ...pkg.dependencies,
    ...pkg.peerDependencies,
});
const common: BuildOptions = {
    entryPoints,
    external,
    bundle: true,
    sourcemap: true,
    metafile: true,
};

const startTime = performance.now();

const cjs = esbuild.build({
    ...common,
    format: "cjs",
    outfile: pkg.main,
});

const esm = esbuild.build({
    ...common,
    format: "esm",
    outfile: pkg.module,
});

const pluginNS = "external-global";
const globals = {
    react: "React",
    "white-web-sdk": "WhiteWebSdk",
    "video.js": "videojs",
};

const iife = esbuild.build({
    ...common,
    external: [],
    outfile: pkg.jsdelivr,
    plugins: [
        // https://github.com/yanm1ng/esbuild-plugin-external-global/blob/master/src/index.ts
        {
            name: pluginNS,
            setup({ onResolve, onLoad }) {
                onResolve(
                    { filter: new RegExp(`^(${Object.keys(globals).join("|")})$`) },
                    args => ({ path: args.path, namespace: pluginNS })
                );
                onLoad({ filter: /.*/, namespace: pluginNS }, args => ({
                    contents: `module.exports = ${globals[args.path]}`,
                }));
            },
        },
    ],
});

// @ts-ignore
const results = [await cjs, await esm, await iife];

const elapsed = (performance.now() - startTime) | 0;

const files: { file: string; bytes: number }[] = [];
for (const a of results) {
    const outs = a.metafile!.outputs;
    for (const file in outs) {
        files.push({ file, bytes: outs[file].bytes });
    }
}
const columnWidth = Math.max(...files.map(a => a.file.length));
for (const { file, bytes } of files) {
    console.log(" ", file.padEnd(columnWidth), prettyBytes(bytes));
}
console.log(`\nDone in ${elapsed}ms`);
