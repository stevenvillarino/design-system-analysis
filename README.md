# Design System Analyzer Extension

<!-- Badges (add real ones if CI/CD is set up) -->
<!-- ![Build Status](https://img.shields.io/badge/build-passing-brightgreen) -->
<!-- ![License](https://img.shields.io/badge/license-MIT-blue) -->

## Overview

**Design System Analyzer** is a Chrome extension that visually and quantitatively analyzes design system adoption on any web page. It helps teams measure, visualize, and improve the use of design system components (e.g., MUI, Roku RDS) versus custom components.

**Features:**
- Detects and outlines MUI and custom (React) components
- Blue outlines for MUI, red for custom
- Labels each component visually on the page
- Coverage metrics: percentage and counts of MUI vs. custom
- **Package detection** for MUI ecosystem, Roku Design System, and other frameworks
- Interactive popup with modern shadcn-inspired UI
- Tabbed interface: Components, Packages, and Debug views
- Support for bundled applications (Emotion/styled-components detection)

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

**No build process required** - files are directly loaded by Chrome.

---

## Usage

1. **Open any web page** you want to analyze.
2. **Click the Design System Analyzer extension icon** in your Chrome toolbar.
3. The popup will automatically analyze the page and display:
   - **Stats cards**: MUI component count, custom component count, detected packages
   - **Coverage bar**: Visual ratio of MUI vs. custom components
   - **Insights**: Adoption recommendations based on analysis
4. **Navigate tabs** to explore:
   - **Components**: Detailed list of detected MUI components with counts
   - **Packages**: Detected packages (MUI Core, Styling, Icons, Roku RDS, etc.)
   - **Debug**: Analysis logs and diagnostic information
5. **Visual overlays** appear on the page:
   - Blue outline + label for MUI components
   - Red outline + label for custom components

---

## Detected Packages

The extension detects packages from:

- **Roku Design System**: @roku-web-ui/rds-components, rds-theme, rds-icons, rds-fonts
- **MUI Core**: @mui/material, @mui/system, @mui/base, @mui/utils
- **MUI Styling**: @emotion/react, @emotion/styled, @mui/styles
- **MUI Icons**: @mui/icons-material, material-icons
- **MUI X**: Data Grid, Date Pickers, Charts
- **Frameworks**: React, Bootstrap, Tailwind CSS

---

## Project Structure

```text
design-system-analysis/
├── manifest.json      # Chrome extension manifest (v3)
├── content.js         # Content script for page analysis
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── style.css          # shadcn-inspired styling
├── background.js      # Service worker
├── mermaid.min.js     # Local Mermaid.js for diagrams
└── icons/             # Extension icons
```

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

## Changelog

See [MILESTONE_DOCUMENTATION.md](MILESTONE_DOCUMENTATION.md) for detailed development history.
