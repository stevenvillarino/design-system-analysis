# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Chrome extension that analyzes web pages to identify design system components, specifically focusing on Material-UI (MUI) component detection versus custom React components. The extension provides visual overlays, metrics, and component hierarchy visualization to help teams measure design system adoption.

## Project Structure

**Core Files:**
- `manifest.json` - Chrome extension manifest (v3)
- `content.js` - Content script for analyzing web pages
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and UI logic
- `style.css` - Extension styling
- `icons/` - Extension icons (16px, 48px, 128px)

## Technology Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Frontend**: Vanilla JavaScript, HTML, CSS (shadcn-inspired styling)
- **Visualization**: Mermaid.js for component hierarchy diagrams (bundled locally)
- **Content Security Policy**: Strict policy with local scripts only

## Development Commands

This extension doesn't use a build system - it's vanilla JavaScript and can be loaded directly into Chrome:

**Chrome Extension Development:**
```bash
# Load extension for development
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the project directory
```

**No build process required** - files are directly loaded by Chrome.

## Architecture Overview

### Content Script (`content.js`)
- **MUI Detection**: Detects MUI presence and version through DOM analysis
- **Component Analysis**: Identifies specific MUI components by class patterns
- **Custom Component Detection**: Finds React components using PascalCase naming
- **Visual Overlays**: Adds colored outlines and labels to components
- **Messaging**: Responds to popup requests via Chrome extension messaging

### Popup Interface (`popup.js` + `popup.html`)
- **Analysis Trigger**: Automatically analyzes page when popup opens
- **Results Display**: Shows MUI/custom component metrics and ratios
- **Overlay Controls**: Toggle switches for MUI and custom component overlays
- **Component Hierarchy**: Mermaid.js diagram showing component structure
- **Error Handling**: Manages extension permission and tab communication errors

### Key Detection Patterns

**MUI Component Detection:**
- Looks for `MuiButton-root`, `MuiTypography-root`, etc. class patterns
- Supports 80+ MUI components including Button, Card, TextField, etc.
- Handles both v4 and v5 MUI class naming conventions
- Fallback detection via Emotion CSS classes for bundled apps

**Custom Component Detection:**
- Identifies PascalCase class names (likely React components)
- Filters out common utility classes and MUI components
- Excludes layout/container classes to focus on actual components

**Visual Overlays:**
- Blue outlines for MUI components
- Red outlines for custom components
- Component labels with counts
- Respects element positioning and z-index

## Extension Permissions

- `activeTab` - Access to current tab content
- `scripting` - Inject content scripts
- `storage` - Store extension preferences
- `<all_urls>` - Analyze any website

## Development Workflow

### Testing Changes
1. Make code changes to any file
2. Go to `chrome://extensions/`
3. Click reload button on the extension
4. Test on target websites

### Debugging
- Use Chrome DevTools for popup debugging
- Check console in content script context for page analysis
- Use `chrome.runtime.lastError` for extension API errors

## Component Analysis Logic

### MUI Detection Strategy
1. **Global Objects**: Check for `window.MUI` or `window.mui`
2. **DOM Classes**: Search for MUI-specific class patterns
3. **Script Tags**: Parse script sources for MUI version info
4. **Fallback**: Generic detection if specific patterns found

### Custom Component Heuristics
- PascalCase class names (React convention)
- Excludes common utility patterns (container, row, col, etc.)
- Filters out MUI components and layout classes
- Focuses on actual UI components vs. structural elements

### Overlay Management
- Adds `data-dsa-overlay` attribute to prevent duplicates
- Uses `!important` CSS for outline visibility
- Positions labels at top-left of components
- Cleanup removes all overlays and restores original styles

## Browser Extension Considerations

- **Manifest V3 compliance** with service worker restrictions
- **Content Security Policy** strict local-only scripts (Mermaid.js bundled)
- **Cross-origin permissions** for analyzing any website
- **Error handling** for sites that block content scripts
- **Performance optimization** for large DOM trees
- **Package cache** with 10-second TTL for performance

## Package Detection

The extension detects packages from multiple sources:

- **Script tag analysis** for CDN-loaded packages
- **Emotion/styled-components detection** for bundled MUI apps
- **DOM class pattern matching** for framework identification

Supported package categories:

- Roku Design System (@roku-web-ui/rds-*)
- MUI Core, Styling, Icons, X libraries
- React ecosystem
- CSS frameworks (Bootstrap, Tailwind)

## Future Enhancement Areas

- Component navigation panel
- Design token detection and analysis
- Support for other design systems (Ant Design, Chakra UI, etc.)
- Export functionality for analysis results