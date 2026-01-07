# N-Styler

[English](README.en.md) | [한국어](README.md) | [日本語](README.ja.md)

A Chrome extension that allows you to inject custom CSS and JavaScript into web pages.

## Key Features

- **Domain-based Style/Script Management**: Register and automatically apply CSS and JS by domain
- **External File Support**: Register local or remote CSS/JS file paths
- **Page Resource Management**: View and toggle CSS resources loaded on the page
- **Real-time Application**: Apply changes instantly without page refresh
- **Multi-language Support**: English, Japanese, and Korean UI support
- **Easy Management**: Manage extensions through an intuitive popup UI

## URL Matching Method

**Domain (hostname) based** matching is used:
- Apply the same style to all pages on `example.com`
- Subdomain distinction possible (`www.example.com` ≠ `api.example.com`)
- Unaffected by query parameters or paths

## Installation

### Developer Mode (Local)
1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder

### Chrome Web Store
- [Install from Chrome Web Store](#) (Link will be updated after release)

## Usage

1. Click the extension icon
2. **CSS/JS Tab**: Enter custom code
3. **External Tab**: Register external file paths
4. **Resources Tab**: Toggle page CSS resources
5. Click "Save" button - instantly applied!

## Screenshots

| CSS Edit | JavaScript Edit | CSS Resources Filter |
|---------|-----------------|----------------------|
| ![CSS Edit](extensions_store/screenshots/01_css_edit.png) | ![JS Edit](extensions_store/screenshots/02_js_edit.png) | ![CSS Resources](extensions_store/screenshots/03_css_resources_filter.png) |

| Manage Rules | Multi-language Support |
|-------------|----------------------|
| ![Manage](extensions_store/screenshots/04_manage.png) | ![Multi-langs](extensions_store/screenshots/05_multi_langs.png) |

## Folder Structure

```
N-Styler/
├── src/                    # Development source code
│   ├── _locales/           # Multi-language support (en, ja, ko)
│   ├── background/         # Background script
│   ├── content/            # Content script
│   ├── icons/              # Extension icons
│   ├── popup/              # Popup UI
│   └── manifest.json       # Extension configuration
├── dist/                   # Distribution files
├── README.md               # Korean documentation
├── README.en.md            # English documentation
├── README.ja.md            # Japanese documentation
├── TODO.md                 # Development plan
├── store-description.md    # Store description
└── N-Styler.zip            # Distribution ZIP file
```

## Privacy

- All data is stored locally in the browser
- No data is transmitted to external servers

## Contributing

We welcome bug reports, feature suggestions, and code contributions!
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License © 2026 N-Styler Contributors

See [LICENSE](LICENSE) file for details.
