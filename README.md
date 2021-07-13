## @netless/video-js-plugin

Requires `white-web-sdk >= 2.13.8` to work properly.

### Usage

```ts
import "video.js/dist/video-js.css";
import { videoJsPlugin } from "@netless/video-js-plugin";
import { createPlugins } from "white-web-sdk";

const plugins = createPlugins({ "video.js": videoJsPlugin() });

plugins.setPluginContext("video.js", { enable: true, verbose: true });

const sdk = new WhiteWebSdk({ appIdentifier, plugins });

const room = await sdk.joinRoom({ uuid, roomToken });

room.insertPlugin("video.js", {
    originX: -width / 2,
    originY: -height / 2,
    width,
    height,
    attributes: { src: "url/to/a.mp4" },
});
```

If you are using `<script>`, here is an example:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/video.js/dist/video-js.css" />
<script src="https://cdn.jsdelivr.net/npm/react/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/video.js/dist/video.js"></script>
<script src="https://sdk.netless.link/white-web-sdk/2.13.10.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@netless/video-js-plugin/dist/index.iife.js"></script>
<script>
    const { createPlugins } = WhiteWebSdk;
    const { videoJsPlugin } = WhiteWebSdkVideoJsPlugin;
    // there you go
</script>
```

### Options

<dl>
    <dt>context</dt>
    <dd>local config, does not affect other ones.</dd>
    <dt>attributes</dt>
    <dd>sync with everyone.</dd>
</dl>

```ts
export interface PluginContext {
    /**
     * Chrome prevents video play sound on video.play().
     * Set `hideMuteAlert: true` to hide the muted mask covering the player.
     * @default false
     */
    hideMuteAlert?: boolean;

    /**
     * @deprecated use `enable` or `room.setWritable()` instead.
     * @default "guest"
     */
    identity?: "host" | "publisher" | "guest" | "observer";

    /**
     * If set false, videojs plugins will not be controlled by the user input.
     * @default false
     */
    enable?: boolean;

    /**
     * For debug.
     * @default false
     */
    verbose?: boolean;
}
```

```ts
export interface VideoJsPluginAttributes {
    /** whether to show [X], default `true` */
    close?: boolean;
    /** text at top-left corner */
    title?: string;
    /** mime type */
    type?: string;

    /** video url */
    src: string;
    /** poster */
    poster: string;
    /** current `room.calibrationTimestamp` */
    hostTime: number;
    /** current play time */
    currentTime: number;
    /** is paused, default `false` */
    paused: boolean;
    /** is muted, default `false` */
    muted: boolean;
    /** volume (0..1), default `1` */
    volume: number;
}

```

### Develop

Requires Node.js 16. See .env.example first.

```bash
npm run build
npm t
```

### License

MIT @ [netless](https://github.com/netless-io)
