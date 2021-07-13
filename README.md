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

Options: see [types.ts](./src/types.ts).

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

### Develop

```bash
npm run build
npm t
```

### License

MIT @ [netless](https://github.com/netless-io)
