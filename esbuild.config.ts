import { defineConfig } from "@hyrious/esbuild-serve";
import fs from "fs";

const env = fs.readFileSync(".env", "utf-8");
const readEnv = (key: string) => JSON.stringify(new RegExp(`^${key}=(.+)`, "m").exec(env)?.[1]);

const __APPID__ = readEnv("APPID");
const __TOKEN__ = readEnv("TOKEN");

export default defineConfig({
    build: { define: { __APPID__, __TOKEN__ } },
});
