# Design System Analyzer Extension

<!-- Badges (add real ones if CI/CD is set up) -->
<!-- ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) -->
<!-- ![License](https://img.shields.io/badge/license-MIT-blue) -->

## Overview

**Design System Analyzer** is a Chrome extension that visually and quantitatively analyzes design system adoption on any web page. It helps teams measure, visualize, and improve the use of design system components (e.g., MUI) versus custom components.

**Features:**
- Detects and outlines MUI and custom (React) components
- Blue outlines for MUI, red for custom
- Labels each component visually on the page
- Coverage metrics: percentage and counts of MUI vs. custom
- Interactive popup with toggles for overlays and navigation
- Floating component navigation panel (coming soon)
- Modern, user-friendly UI/UX

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone git@github.com:stevenvillarino/design-system-analysis.git
   cd design-system-analysis
   ```
2. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

---

## Usage

1. **Open any web page** you want to analyze.
2. **Click the Design System Analyzer extension icon** in your Chrome toolbar.
3. The popup will automatically analyze the page and display:
   - MUI detection and version
   - List and count of detected MUI components
   - Count and percentage of custom components
   - Coverage ratio (MUI vs. custom)
4. **Use the toggles** to show/hide overlays for MUI and custom components.
5. **Visual overlays** will appear on the page:
   - Blue outline + label for MUI components
   - Red outline + label for custom components
6. (Coming soon) **Component navigation panel**: Quickly jump to any detected component on the page.

---

## Contributing

Contributions are welcome! To contribute:
- Fork the repo and create a feature branch
- Make your changes with clear comments and documentation
- Submit a pull request with a clear description
- Please update documentation and tests as needed

---

## License

[MIT](LICENSE) (placeholder)

---

## Maintainers
- [@stevenvillarino](https://github.com/stevenvillarino)

---

<!--
Changelog, architecture, and more docs can be found in the `.specstory/` folder.
--> 