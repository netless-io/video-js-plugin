# Changelog

## 0.3.8

- Fix: remove the workaround introduced from 0.3.2.

  Ref: [white-web-sdk@2.13.16](https://developer.netless.link/javascript-zh/home/js-changelog#h-21316-2021-08-10).

- Fix: handle attributes undefined.

## 0.3.7

- Fix: correct the detection of not allowing video play in Safari.

## 0.3.6

- Fix: border style on android by shifting 0.5px. Thanks to [@l1shen].
- Add: custom logger option in `videoJsPlugin({ log: ... })`.
- Fix: not pausing correctly in replay mode.

## 0.3.2

- Fix: restore state on network reconnection (only workaround).

  Remember to fix the code.

## 0.3.1

- Fix: correctly send `muted` state. This only affects some Safari.

## 0.3.0

- Init project.


[@l1shen]: https://github.com/l1shen
