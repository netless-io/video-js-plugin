## 同步播放器简单原理

SDK 提供的同步接口：

```ts
import { autorun } from "white-web-sdk";

autorun(() => {
    // 这段代码会在 context 和 plugin.attributes 更新的时候执行
});

// 更新 plugin.attributes，这会触发所有人（包括自己）的 autorun
plugin.putAttributes({});

// 注意：必须使用 class component 定义插件，否则必须保证 react 和 sdk 使用同一份
```

由于 video.js 以及各种浏览器（尤其是 Safari）的兼容性问题，这里我们自己维护一遍播放器的状态，大致有以下这些：

```ts
interface PlayerState {
    // 下面两个属性在插件的整个生命周期中不会更改
    readonly src: string;
    readonly poster: string;

    paused: boolean;
    muted: boolean;
    volume: number;
    currentTime: number;
}
```

通过手动绘制控制条，我们可以简单地把用户操作映射到播放器状态的更新：

```ts
$("#play").click(() => {
    setPlayerState({ paused: false });
});
```

在更新本地播放器状态的同时，触发所有人的 `autorun`：

```ts
function setPlayerState(s) {
    plugin.putAttributes(s);
}
```

在 `autorun` 里让播放器状态和全局一致：

```ts
autorun(() => {
    const s = plugin.attributes;
    if (player.paused() !== s.paused) {
        if (s.paused === true) player.pause();
        if (s.paused === false) player.play();
    }
});
```

### 坑点

-   `plugin.putAttributes()` 会同步触发 `autorun`，而\
    `player.xxx()` 既有可能同步也有可能是延迟生效的（根据平台）。
    -   因此我们在 `setPlayerState()` 里直接 put，然后依赖 autorun 去调用实际的播放器 API。
-   m3u8 的一系列 [bug](./bugs.md)，我们轮询全局状态，去执行 autorun 里的东西。
