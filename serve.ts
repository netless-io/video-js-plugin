import { importFile } from "@hyrious/esbuild-dev";
import { style } from "@hyrious/esbuild-plugin-style";
import cp from "child_process";
import esbuild from "esbuild";
import pkg from "./package.json";

const pluginNS = "external-global";
const globals = {
    react: "React",
    "white-web-sdk": "WhiteWebSdk",
    "video.js": "videojs",
};

// @ts-ignore
const a = await esbuild.serve(
    {
        servedir: ".",
        port: 8001,
    },
    {
        entryPoints: ["src/index.ts"],
        outfile: pkg.jsdelivr,
        globalName: "WhiteWebSdkVideoJsPlugin",
        bundle: true,
        sourcemap: true,
        metafile: true,
        loader: { ".svg": "dataurl" },
        plugins: [
            style(),
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
    }
);
console.log(`serving http://localhost:${a.port}/dist/index.iife.js`);

// @ts-ignore
const { default: config } = await importFile("./esbuild.config.ts");

// @ts-ignore
const b = await esbuild.serve(
    {
        servedir: ".",
        port: 8002,
    },
    {
        ...config.build,
        entryPoints: ["test.ts"],
        outfile: "test.js",
        sourcemap: true,
        metafile: true,
    }
);
console.log(`serving http://localhost:${b.port}/test.js`);

if (process.platform === "win32") {
    cp.spawnSync("start index.html", { shell: true, stdio: "inherit" });
}
if (process.platform === "darwin") {
    cp.spawnSync("open index.html", { shell: true, stdio: "inherit" });
}
