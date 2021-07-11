import fs from "fs";

const env = fs.readFileSync(".env", "utf-8");
const readEnv = (key: string) => JSON.stringify(new RegExp(`^${key}=(.+)`, "m").exec(env)?.[1]);

const __APPID__ = readEnv("APPID");
const __TOKEN__ = readEnv("TOKEN");
const __ROOM_UUID__ = readEnv("ROOM_UUID");
const __ROOM_TOKEN__ = readEnv("ROOM_TOKEN");

export default {
    build: { define: { __APPID__, __TOKEN__, __ROOM_UUID__, __ROOM_TOKEN__ } },
};
