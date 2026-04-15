# @itsreimau/suppress-baileys - Just to suppress the annoying Baileys error log

> [!NOTE]
>
> This package is specifically designed for the Baileys fork by [itsliaaa](https://github.com/itsliaaa/baileys) (`@itsliaaa/baileys`). If your Baileys version (original or other forks) has the same noisy error logging issue, feel free to try it — it might work just fine.

## 📥 Installation

```bash
npm install github:itsreimau/suppress-baileys
```

## 🚀 Usage

Simply require this package at the very beginning of your main file:

```js
require("@itsreimau/suppress-baileys");
```

After that, all Baileys error logs will be automatically suppressed (won't appear in the console).

### Complete example:

```js
require("@itsreimau/suppress-baileys");
const { makeWASocket } = require("baileys");

// Baileys error logs will no longer appear — your console stays clean
const sock = makeWASocket(...);
```

## 🙏 Acknowledgements

Special thanks to:

- [Liaaa](https://github.com/itsliaaa)
- All contributors and users

## 📄 License

This project is licensed under the [MIT License](LICENSE).