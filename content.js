// content.js

console.log('[DSA] Design System Analyzer content script loaded at:', new Date().toISOString());

// Enhanced MUI ecosystem and design system package detection
let packageCache = null;
let packageCacheTime = 0;

function detectAllPackages() {
  // Return cached result if less than 10 seconds old (reduced from 30)
  const now = Date.now();
  if (packageCache && (now - packageCacheTime) < 10000) {
    return packageCache;
  }
  
  const packages = new Map();
  
  console.log('[DSA-DEBUG] Starting package detection...');
  
  // Enhanced script tag checking with focus on MUI and Roku Design System
  const scripts = Array.from(document.querySelectorAll('script[src]')).slice(0, 200);
  console.log('[DSA-DEBUG] Found', scripts.length, 'script tags');
  
  // More flexible pattern matching for modern bundlers
  const packagePatterns = [
    // Roku Design System packages (more flexible patterns)
    {
      patterns: [
        /@roku-web-ui\/rds-components/i,
        /@roku-web-ui\/rds-theme/i,
        /@roku-web-ui\/rds-icons/i,
        /@roku-web-ui\/rds-fonts/i
      ],
      name: '@roku-web-ui/rds-components',
      category: 'Roku RDS',
      source: 'roku-design-system'
    },
    
    // MUI Core packages (more flexible)
    {
      patterns: [/@mui\/material/i, /mui\.material/i],
      name: '@mui/material',
      category: 'MUI Core',
      source: 'mui-core'
    },
    {
      patterns: [/@mui\/system/i, /mui\.system/i],
      name: '@mui/system',
      category: 'MUI Core',
      source: 'mui-system'
    },
    {
      patterns: [/@mui\/utils/i],
      name: '@mui/utils',
      category: 'MUI Core',
      source: 'mui-utils'
    },
    {
      patterns: [/@mui\/base/i],
      name: '@mui/base',
      category: 'MUI Core',
      source: 'mui-base'
    },
    {
      patterns: [/@mui\/lab/i],
      name: '@mui/lab',
      category: 'MUI Labs',
      source: 'mui-lab'
    },
    
    // MUI Styling and Theming
    {
      patterns: [/@mui\/styles/i],
      name: '@mui/styles',
      category: 'MUI Styling',
      source: 'mui-styles'
    },
    {
      patterns: [/@emotion\/react/i],
      name: '@emotion/react',
      category: 'MUI Styling',
      source: 'emotion-react'
    },
    {
      patterns: [/@emotion\/styled/i],
      name: '@emotion/styled',
      category: 'MUI Styling',
      source: 'emotion-styled'
    },
    {
      patterns: [/@emotion\/cache/i],
      name: '@emotion/cache',
      category: 'MUI Styling',
      source: 'emotion-cache'
    },
    
    // MUI Icons and Fonts
    {
      patterns: [/@mui\/icons-material/i],
      name: '@mui/icons-material',
      category: 'MUI Icons',
      source: 'mui-icons'
    },
    {
      patterns: [/material-icons/i],
      name: 'material-icons',
      category: 'MUI Icons',
      source: 'material-icons'
    },
    {
      patterns: [/roboto-fontface/i, /typeface-roboto/i],
      name: 'roboto-font',
      category: 'MUI Fonts',
      source: 'roboto-font'
    },
    
    // MUI Advanced/Professional
    {
      patterns: [/@mui\/x-/i],
      name: '@mui/x-libraries',
      category: 'MUI X',
      source: 'mui-x'
    },
    
    // React and ecosystem
    {
      patterns: [/react(\.min)?\.js/i, /react\.production\.js/i],
      name: 'react',
      category: 'Framework',
      source: 'react-core'
    },
    {
      patterns: [/react-dom(\.min)?\.js/i, /react-dom\.production\.js/i],
      name: 'react-dom',
      category: 'Framework',
      source: 'react-dom'
    },
    
    // Other Design Systems
    {
      patterns: [/bootstrap(\.min)?\.js/i],
      name: 'bootstrap',
      category: 'CSS Framework',
      source: 'bootstrap'
    },
    {
      patterns: [/tailwindcss/i],
      name: 'tailwindcss',
      category: 'CSS Framework',
      source: 'tailwindcss'
    },
    
    // CDN patterns
    {
      patterns: [/cdn\.jsdelivr\.net\/npm\//i],
      name: 'cdn-jsdelivr',
      category: 'CDN',
      source: 'cdn-jsdelivr'
    },
    {
      patterns: [/unpkg\.com\//i],
      name: 'unpkg-cdn',
      category: 'CDN',
      source: 'unpkg'
    }
  ];
  
  let foundPackages = 0;
  scripts.forEach((script, index) => {
    const src = script.src;
    if (!src) return;
    
    for (const pattern of packagePatterns) {
      if (pattern.patterns.some(p => p.test(src))) {
        const packageName = pattern.name;
        if (!packages.has(packageName)) {
          // Extract version from URL if possible
          const versionMatch = src.match(/@?([\w\-\.]+)@?([\d\w\.\-]+)?/);
          const version = versionMatch ? versionMatch[2] || 'detected' : 'detected';
          
          packages.set(packageName, {
            name: packageName,
            version: version,
            source: 'script-tag',
            category: pattern.category,
            url: src,
            scriptIndex: index
          });
          foundPackages++;
          console.log('[DSA-DEBUG] Found package in script:', packageName, 'from', src);
          break; // Only add each package once
        }
      }
    }
  });
  
  console.log('[DSA-DEBUG] Found', foundPackages, 'packages from script tags');
  
  // Enhanced global object detection for MUI ecosystem
  const globalChecks = [
    // MUI globals
    { global: 'MaterialUI', name: '@mui/material', version: () => window.MaterialUI?.version, category: 'MUI Core' },
    { global: 'MUI', name: '@mui/material', version: () => window.MUI?.version, category: 'MUI Core' },
    { global: 'mui', name: '@mui/material', version: () => window.mui?.version, category: 'MUI Core' },
    
    // React and ecosystem
    { global: 'React', name: 'react', version: () => window.React?.version, category: 'Framework' },
    { global: 'ReactDOM', name: 'react-dom', version: () => window.ReactDOM?.version, category: 'Framework' },
    
    // Emotion (MUI's styling solution)
    { global: 'emotion', name: '@emotion/react', version: () => window.emotion?.version, category: 'MUI Styling' },
    
    // Storybook
    { global: '__STORYBOOK_ADDONS', name: 'storybook', version: 'detected', category: 'Development Tools' },
    { global: '__STORYBOOK_CLIENT_API__', name: 'storybook', version: 'detected', category: 'Development Tools' },
    
    // Other frameworks
    { global: 'bootstrap', name: 'bootstrap', version: () => window.bootstrap?.Tooltip?.VERSION, category: 'CSS Framework' },
    { global: 'jQuery', name: 'jquery', version: () => window.jQuery?.fn?.jquery, category: 'Library' },
    
    // Additional global checks
    { global: '__REACT_DEVTOOLS_GLOBAL_HOOK__', name: 'react-devtools', version: 'detected', category: 'Development Tools' },
    { global: '__APOLLO_DEVTOOLS__', name: 'apollo-client', version: 'detected', category: 'Library' }
  ];
  
  let foundGlobals = 0;
  globalChecks.forEach(({ global, name, version, category }) => {
    if (window[global] && !packages.has(name)) {
      const versionString = typeof version === 'function' ? version() : version;
      packages.set(name, {
        name,
        version: versionString || 'detected',
        source: 'global-object',
        category: category || 'Unknown',
        url: null
      });
      foundGlobals++;
      console.log('[DSA-DEBUG] Found package via global object:', name, versionString);
    }
  });
  
  console.log('[DSA-DEBUG] Found', foundGlobals, 'packages from global objects');
  
  // CSS and font detection for MUI ecosystem
  const cssChecks = [
    // MUI theme detection through CSS variables
    { selector: '[data-mui-theme]', name: '@mui/material-theme', category: 'MUI Theming' },
    { selector: '.MuiCssBaseline-root', name: '@mui/material-baseline', category: 'MUI Core' },
    
    // Material Icons detection
    { selector: '.material-icons, .material-icons-outlined, .material-icons-round', name: 'material-icons', category: 'MUI Icons' },
    
    // Font detection
    { selector: 'link[href*="fonts.googleapis.com/css"][href*="Roboto"]', name: 'roboto-font', category: 'MUI Fonts' },
    { selector: 'link[href*="fonts.googleapis.com/icon"][href*="Material+Icons"]', name: 'material-icons-font', category: 'MUI Icons' },
    
    // Other CSS frameworks
    { selector: '.container, .btn', name: 'bootstrap', category: 'CSS Framework' },
    { selector: '.flex, .grid', name: 'tailwindcss', category: 'CSS Framework' },
    
    // Additional CSS-based detection
    { selector: '[class*="Mui"]', name: 'mui-styles', category: 'MUI Core' },
    { selector: '[class*="ant-"]', name: 'ant-design', category: 'UI Framework' },
    { selector: '[class*="chakra-"]', name: 'chakra-ui', category: 'UI Framework' }
  ];
  
  let foundCss = 0;
  cssChecks.forEach(({ selector, name, category }) => {
    if (!packages.has(name) && document.querySelector(selector)) {
      packages.set(name, {
        name,
        version: 'detected',
        source: 'css-detection',
        category: category || 'Unknown',
        url: null
      });
      foundCss++;
      console.log('[DSA-DEBUG] Found package via CSS selector:', name);
    }
  });
  
  console.log('[DSA-DEBUG] Found', foundCss, 'packages from CSS detection');
  
  // Check for MUI theme configuration in DOM
  const themeDetection = detectMUITheme();
  if (themeDetection.hasCustomTheme) {
    packages.set('@mui/custom-theme', {
      name: '@mui/custom-theme',
      version: 'detected',
      source: 'theme-analysis',
      category: 'MUI Theming',
      details: themeDetection,
      url: null
    });
    console.log('[DSA-DEBUG] Found custom MUI theme');
  }
  
  // Check for common framework indicators
  const frameworkIndicators = [
    { name: 'webpack', indicator: () => window.webpackJsonp || window.__webpack_require__, category: 'Build Tool' },
    { name: 'typescript', indicator: () => window.ts, category: 'Language' },
    { name: 'lodash', indicator: () => window._ && window._.version, category: 'Utility' },
    { name: 'moment', indicator: () => window.moment, category: 'Utility' }
  ];
  
  frameworkIndicators.forEach(({ name, indicator, category }) => {
    if (indicator() && !packages.has(name)) {
      packages.set(name, {
        name,
        version: typeof indicator() === 'object' ? indicator()?.version || 'detected' : 'detected',
        source: 'framework-detection',
        category: category || 'Framework',
        url: null
      });
      console.log('[DSA-DEBUG] Found framework:', name);
    }
  });
  
  const result = Array.from(packages.values());
  console.log('[DSA-DEBUG] Total packages detected:', result.length);
  
  packageCache = result;
  packageCacheTime = now;
  return result;
}

// Detect MUI theme configuration and customization
function detectMUITheme() {
  const themeInfo = {
    hasCustomTheme: false,
    customColors: [],
    customTypography: false,
    customBreakpoints: false,
    themeMode: 'unknown'
  };
  
  // Check for theme provider in DOM
  const themeProvider = document.querySelector('[data-mui-theme], .MuiThemeProvider-root');
  if (themeProvider) {
    themeInfo.hasCustomTheme = true;
  }
  
  // Analyze CSS custom properties for theme customization
  const rootElement = document.documentElement;
  if (rootElement) {
    const computedStyle = getComputedStyle(rootElement);
    const customProperties = [];
    
    // Check for common MUI theme CSS variables
    const muiThemeVars = [
      '--mui-palette-primary-main',
      '--mui-palette-secondary-main',
      '--mui-palette-background-default',
      '--mui-typography-fontFamily',
      '--mui-breakpoints-xs',
      '--mui-spacing'
    ];
    
    muiThemeVars.forEach(varName => {
      const value = computedStyle.getPropertyValue(varName);
      if (value) {
        customProperties.push({ name: varName, value: value.trim() });
        themeInfo.hasCustomTheme = true;
      }
    });
    
    themeInfo.customProperties = customProperties;
  }
  
  // Detect dark/light mode
  const darkModeIndicators = [
    '[data-theme="dark"]',
    '.MuiCssBaseline-root[data-mui-color-scheme="dark"]',
    'body[data-theme="dark"]'
  ];
  
  const lightModeIndicators = [
    '[data-theme="light"]',
    '.MuiCssBaseline-root[data-mui-color-scheme="light"]',
    'body[data-theme="light"]'
  ];
  
  if (darkModeIndicators.some(selector => document.querySelector(selector))) {
    themeInfo.themeMode = 'dark';
  } else if (lightModeIndicators.some(selector => document.querySelector(selector))) {
    themeInfo.themeMode = 'light';
  }
  
  return themeInfo;
}

function detectMUI() {
  let muiVersion = null;
  let muiDetected = false;

  // Try to find MUI version from a global object (common in some setups)
  if (window.MUI && window.MUI.version) {
    muiVersion = window.MUI.version;
    muiDetected = true;
  } else if (window.mui && window.mui.version) { // older versions might use lowercase mui
    muiVersion = window.mui.version;
    muiDetected = true;
  } else {
    // Look for MUI specific class names or elements as a fallback or primary detection
    const muiSelectors = [
      '[class*="MuiButton-"]', 
      '[class*="MuiInput-"]',
      '[class*="MuiTypography-"]',
      '[class*="MuiBox-"]',
      '[class*="MuiContainer-"]',
      '[class*="MuiFormControl-"]',
      '[class*="MuiPaper-"]',
      '[class*="MuiSvgIcon-"]',
      '[class*="Mui"]', // Generic MUI class check
      '[class*="css-"][id*="mui-"]', // More generic but often used by MUI v5+ styled components
      'script[src*="@mui/"]', // Check for MUI script tags
      'link[href*="@mui/"]' // Check for MUI CSS links
    ];

    for (const selector of muiSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        muiDetected = true;
        if (debugMode) console.log(`[DSA-DEBUG] MUI detected via selector: ${selector}, found ${elements.length} elements`);
        break;
      }
    }

    // If MUI is detected but version not found via global, try to infer from script tags
    if (muiDetected && !muiVersion) {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      for (const script of scripts) {
        const src = script.src;
        const muiMatch = src.match(/@mui\/[^\/]+(?:\/([^\/]+))?\/([^\/]+)\/(?:umd\/|esm\/)?([^\.\/]+)/i) || src.match(/material-ui(?:@|\/)([\d\.]+)/i);
        if (muiMatch) {
          muiVersion = muiMatch[1] || muiMatch[2] || muiMatch[3]; // Attempt to grab version from different regex groups
          if (muiVersion && !muiVersion.match(/^\d+\.\d+/)) {
             const specificVersionMatch = src.match(/@mui\/(?:material|system|utils|core)(?:\/|@)([\d\w\.-]+)/i);
             if (specificVersionMatch && specificVersionMatch[1]) {
                muiVersion = specificVersionMatch[1];
             } else {
                muiVersion = "Version unclear from scripts";
             }
          } else if (muiVersion && muiVersion.includes(".js")) {
             muiVersion = muiVersion.split(".js")[0];
          }
          break;
        }
      }
       if (!muiVersion && muiDetected) {
         muiVersion = "Detected, version not identified";
       }
    }
  }

  if (debugMode) {
    console.log(`[DSA-DEBUG] MUI Detection Results:`, { muiDetected, muiVersion });
    if (muiDetected) {
      const allMuiElements = document.querySelectorAll('[class*="Mui"]');
      console.log(`[DSA-DEBUG] Total elements with Mui classes: ${allMuiElements.length}`);
      const sampleElements = Array.from(allMuiElements).slice(0, 5);
      console.log(`[DSA-DEBUG] Sample MUI elements:`, sampleElements.map(el => el.className));
    }
  }

  return { muiDetected, muiVersion };
}

// Optimized MUI component analysis with performance improvements
let muiAnalysisCache = null;
let muiCacheTime = 0;

function analyzeMUIComponents(muiVersion) {
  if (debugMode) console.log('[DSA-DEBUG] Starting MUI component analysis');
  // Return cached result if less than 30 seconds old
  const now = Date.now();
  if (muiAnalysisCache && (now - muiCacheTime) < 30000) {
    if (debugMode) console.log('[DSA-DEBUG] Returning cached MUI analysis');
    return muiAnalysisCache;
  }
  
  const identifiedComponents = {};
  let totalMuiComponents = 0;

  // Focus on most common MUI components for faster analysis
  const commonMuiPatterns = {
    "Button": "MuiButton-root",
    "Typography": "MuiTypography-root",
    "Paper": "MuiPaper-root",
    "Card": "MuiCard-root",
    "TextField": "MuiTextField-root",
    "IconButton": "MuiIconButton-root",
    "Chip": "MuiChip-root",
    "Alert": "MuiAlert-root",
    "Grid": "MuiGrid-root",
    "AppBar": "MuiAppBar-root",
    "Box": "MuiBox-root",
    "Container": "MuiContainer-root",
    "FormControl": "MuiFormControl-root",
    "InputLabel": "MuiInputLabel-root",
    "InputBase": "MuiInputBase-root",
    "OutlinedInput": "MuiOutlinedInput-root",
    "FormLabel": "MuiFormLabel-root",
    "SvgIcon": "MuiSvgIcon-root",
    "ButtonBase": "MuiButtonBase-root",
    "Accordion": "MuiAccordion-root",
    "AccordionSummary": "MuiAccordionSummary-root",
    "AccordionDetails": "MuiAccordionDetails-root",
    "Collapse": "MuiCollapse-root",
    "Switch": "MuiSwitch-root",
    "Divider": "MuiDivider-root",
    "InputAdornment": "MuiInputAdornment-root"
  };

  // Single query for all MUI elements
  const allMuiElements = document.querySelectorAll('[class*="Mui"]');
  if (debugMode) console.log(`[DSA-DEBUG] Found ${allMuiElements.length} elements with 'Mui' in class name`);
  
  // Process elements in batches for better performance
  const batchSize = 100;
  for (let i = 0; i < allMuiElements.length; i += batchSize) {
    const batch = Array.from(allMuiElements).slice(i, i + batchSize);
    
    batch.forEach(element => {
      const className = element.className;
      if (!className || typeof className !== 'string') return;
      
      for (const [componentName, pattern] of Object.entries(commonMuiPatterns)) {
        if (className.includes(pattern)) {
          if (debugMode) console.log(`[DSA-DEBUG] Identified component: ${componentName}`, element);
          identifiedComponents[componentName] = (identifiedComponents[componentName] || 0) + 1;
          totalMuiComponents++;
          break; // Element can only match one pattern
        }
      }
    });
    
    // Yield control to avoid blocking
    if (i % 200 === 0) {
      setTimeout(() => {}, 0);
    }
  }

  if (debugMode) console.log(`[DSA-DEBUG] MUI analysis complete. Found ${totalMuiComponents} components.`, identifiedComponents);
  muiAnalysisCache = { identifiedComponents, totalMuiComponents };
  muiCacheTime = now;
  return muiAnalysisCache;
}

// Enhanced overlay system with slide color effects and better labeling
function addOverlay(element, label, color, options = {}) {
  // Avoid duplicate overlays
  if (!element) return;
  if (element.hasAttribute('data-dsa-overlay')) return;
  element.setAttribute('data-dsa-overlay', 'true');
  
  const { slideColor = false, componentType = 'unknown', count = 1 } = options;
  
  // Add outline with enhanced styling
  element.style.setProperty('outline', `3px solid ${color}`, 'important');
  element.style.setProperty('outline-offset', '2px', 'important');
  
  // Add slide color overlay if requested
  if (slideColor) {
    const overlay = document.createElement('div');
    overlay.className = 'dsa-slide-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = `${color}20`; // 20% opacity
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9998';
    overlay.style.borderRadius = '4px';
    overlay.setAttribute('data-dsa-overlay', 'true');
    
    // Ensure parent has relative positioning for overlay
    const computedStyle = getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(overlay);
  }
  
  // Create enhanced label with component details
  const labelDiv = document.createElement('div');
  labelDiv.className = 'dsa-component-label';
  
  // Label content with component type and count
  const labelText = count > 1 ? `${label} (${count})` : label;
  labelDiv.innerHTML = `
    <div class="dsa-label-main">${labelText}</div>
    <div class="dsa-label-type">${componentType}</div>
  `;
  
  // Enhanced label styling
  labelDiv.style.position = 'absolute';
  labelDiv.style.top = '-8px';
  labelDiv.style.left = '0';
  labelDiv.style.background = color;
  labelDiv.style.color = '#fff';
  labelDiv.style.fontSize = '11px';
  labelDiv.style.fontWeight = 'bold';
  labelDiv.style.padding = '4px 8px';
  labelDiv.style.borderRadius = '4px 4px 0 0';
  labelDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  labelDiv.style.zIndex = '9999';
  labelDiv.style.pointerEvents = 'none';
  labelDiv.style.fontFamily = 'Arial, sans-serif';
  labelDiv.style.lineHeight = '1.2';
  labelDiv.style.minWidth = '60px';
  labelDiv.style.textAlign = 'center';
  labelDiv.setAttribute('data-dsa-overlay', 'true');
  
  // Ensure parent positioning
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  
  element.appendChild(labelDiv);
  
  // Add hover effect
  const originalOutline = `3px solid ${color}`;
  element.addEventListener('mouseenter', () => {
    element.style.setProperty('outline', `4px solid ${color}`, 'important');
    element.style.setProperty('outline-offset', '3px', 'important');
  });
  
  element.addEventListener('mouseleave', () => {
    element.style.setProperty('outline', originalOutline, 'important');
    element.style.setProperty('outline-offset', '2px', 'important');
  });
  
  console.log('[DSA] Enhanced overlay added:', label, componentType, element);
}

// Utility: Remove all overlays
function removeAllOverlays() {
  // Remove outlines and data attribute
  document.querySelectorAll('[data-dsa-overlay]').forEach(el => {
    el.style.outline = '';
    el.removeAttribute('data-dsa-overlay');
    // Remove label divs
    Array.from(el.children).forEach(child => {
      if (child.getAttribute && child.getAttribute('data-dsa-overlay') === 'true') {
        el.removeChild(child);
      }
    });
  });
}

// Utility: Check if element is global (nav, footer, etc.)
function isGlobalElement(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'nav' || tag === 'footer' || tag === 'header') return true;
  if (el.className && typeof el.className === 'string' && /global|navbar|footer|header/i.test(el.className)) return true;
  return false;
}

// Enhanced overlay system with slide colors and better component detection
function showOverlays({ showMUI = true, showCustom = true, showPackages = true, slideColor = false }) {
  removeAllOverlays();
  let muiCount = 0;
  let customCount = 0;
  let packageCount = 0;
  
  // Color palette for different component types
  const colors = {
    mui: '#1976d2',        // Blue
    custom: '#d32f2f',     // Red
    react: '#61dafb',      // React Blue
    vue: '#4fc08d',        // Vue Green
    bootstrap: '#7952b3',  // Bootstrap Purple
    antd: '#1890ff',       // Ant Design Blue
    chakra: '#319795',     // Chakra Teal
    tailwind: '#06b6d4',   // Tailwind Cyan
    other: '#ff9800'       // Orange for other packages
  };
  
  // MUI overlays with enhanced detection
  if (showMUI) {
    const muiComponentPatterns = {
      "Accordion": "MuiAccordion-root",
      "AccordionSummary": "MuiAccordionSummary-root",
      "AccordionDetails": "MuiAccordionDetails-root",
      "Alert": "MuiAlert-root",
      "AppBar": "MuiAppBar-root",
      "Autocomplete": "MuiAutocomplete-root",
      "Avatar": "MuiAvatar-root",
      "Badge": "MuiBadge-root",
      "BottomNavigation": "MuiBottomNavigation-root",
      "Box": "MuiBox-root",
      "Breadcrumbs": "MuiBreadcrumbs-root",
      "Button": "MuiButton-root",
      "ButtonBase": "MuiButtonBase-root",
      "ButtonGroup": "MuiButtonGroup-root",
      "Card": "MuiCard-root",
      "Checkbox": "MuiCheckbox-root",
      "Chip": "MuiChip-root",
      "CircularProgress": "MuiCircularProgress-root",
      "Collapse": "MuiCollapse-root",
      "Container": "MuiContainer-root",
      "Dialog": "MuiDialog-root",
      "Divider": "MuiDivider-root",
      "Drawer": "MuiDrawer-root",
      "Fab": "MuiFab-root",
      "FormControl": "MuiFormControl-root",
      "FormControlLabel": "MuiFormControlLabel-root",
      "FormLabel": "MuiFormLabel-root",
      "Grid": "MuiGrid-root",
      "Icon": "MuiIcon-root",
      "IconButton": "MuiIconButton-root",
      "InputAdornment": "MuiInputAdornment-root",
      "InputBase": "MuiInputBase-root",
      "InputLabel": "MuiInputLabel-root",
      "LinearProgress": "MuiLinearProgress-root",
      "Link": "MuiLink-root",
      "List": "MuiList-root",
      "ListItem": "MuiListItem-root",
      "Menu": "MuiMenu-root",
      "OutlinedInput": "MuiOutlinedInput-root",
      "Paper": "MuiPaper-root",
      "Radio": "MuiRadio-root",
      "Rating": "MuiRating-root",
      "Select": "MuiSelect-root",
      "Skeleton": "MuiSkeleton-root",
      "Slider": "MuiSlider-root",
      "Snackbar": "MuiSnackbar-root",
      "Stepper": "MuiStepper-root",
      "SvgIcon": "MuiSvgIcon-root",
      "Switch": "MuiSwitch-root",
      "Tab": "MuiTab-root",
      "Table": "MuiTable-root",
      "TextField": "MuiTextField-root",
      "ToggleButton": "MuiToggleButton-root",
      "Toolbar": "MuiToolbar-root",
      "Tooltip": "MuiTooltip-popper",
      "Typography": "MuiTypography-root"
    };
    
    // Group components by type for better counting
    const componentCounts = {};
    
    for (const componentName in muiComponentPatterns) {
      const pattern = muiComponentPatterns[componentName];
      const selector = `[class*="${pattern}"]`;
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        componentCounts[componentName] = elements.length;
      }
      
      elements.forEach(el => {
        if (!isGlobalElement(el)) {
          addOverlay(el, componentName, colors.mui, {
            slideColor,
            componentType: 'MUI',
            count: componentCounts[componentName]
          });
          muiCount++;
        }
      });
    }
    console.log(`[DSA] MUI overlays applied: ${muiCount}`);
  }
  
  // Enhanced custom component detection
  if (showCustom) {
    const ignoredPatterns = [
      'container', 'row', 'col', 'grid', 'flex', 'box', 'wrapper', 'main', 'section', 'content', 'item', 'list', 'card', 'panel',
      'input', 'button', 'form', 'label', 'icon', 'avatar', 'divider', 'header', 'footer', 'nav', 'menu', 'toolbar', 'tab',
      'stepper', 'slider', 'switch', 'toggle', 'tooltip', 'snackbar', 'dialog', 'drawer', 'badge', 'chip', 'progress', 'rating',
      'select', 'skeleton', 'table', 'typography', 'breadcrumbs', 'accordion', 'alert', 'appbar', 'autocomplete', 'buttongroup',
      'checkbox', 'circularprogress', 'fab', 'formcontrol', 'formlabel', 'iconbutton', 'linearprogress', 'link', 'listitem',
      'paper', 'radio', 'textfield', 'togglebutton'
    ];
    
    // Track custom components with better naming
    const customComponents = new Map();
    
    document.querySelectorAll('[class]').forEach(el => {
      if (el.hasAttribute('data-dsa-overlay')) return;
      if (isGlobalElement(el)) return;
      
      if (!el.className || typeof el.className !== 'string') return;
      const classList = el.className.split(' ').filter(Boolean);
      if (classList.length <= 1) return;
      
      const hasIgnored = classList.some(cls => ignoredPatterns.some(pat => cls.toLowerCase().includes(pat)));
      if (hasIgnored) return;
      
      const isPascalCase = classList.some(cls => /^[A-Z][a-zA-Z0-9]+$/.test(cls));
      const isMUI = classList.some(cls => cls.startsWith('Mui'));
      
      if (isPascalCase && !isMUI) {
        // Extract the most likely component name
        const componentClass = classList.find(cls => /^[A-Z][a-zA-Z0-9]+$/.test(cls));
        const componentName = componentClass || 'Custom';
        
        // Track component counts
        if (!customComponents.has(componentName)) {
          customComponents.set(componentName, 0);
        }
        customComponents.set(componentName, customComponents.get(componentName) + 1);
        
        addOverlay(el, componentName, colors.custom, {
          slideColor,
          componentType: 'Custom',
          count: customComponents.get(componentName)
        });
        customCount++;
      }
    });
    console.log(`[DSA] Custom overlays applied: ${customCount}`);
  }
  
  // Package-specific component detection
  if (showPackages) {
    // Bootstrap components
    const bootstrapComponents = {
      'btn': 'Button',
      'nav': 'Navigation',
      'navbar': 'NavBar',
      'card': 'Card',
      'modal': 'Modal',
      'dropdown': 'Dropdown',
      'carousel': 'Carousel',
      'alert': 'Alert'
    };
    
    Object.entries(bootstrapComponents).forEach(([className, componentName]) => {
      document.querySelectorAll(`.${className}`).forEach(el => {
        if (!el.hasAttribute('data-dsa-overlay') && !isGlobalElement(el)) {
          addOverlay(el, componentName, colors.bootstrap, {
            slideColor,
            componentType: 'Bootstrap',
            count: 1
          });
          packageCount++;
        }
      });
    });
    
    // Ant Design components
    document.querySelectorAll('[class*="ant-"]').forEach(el => {
      if (!el.hasAttribute('data-dsa-overlay') && !isGlobalElement(el)) {
        if (!el.className || typeof el.className !== 'string') return;
        const classList = el.className.split(' ');
        const antClass = classList.find(cls => cls.startsWith('ant-'));
        if (antClass) {
          const componentName = antClass.split('-')[1] || 'AntComponent';
          addOverlay(el, componentName, colors.antd, {
            slideColor,
            componentType: 'Ant Design',
            count: 1
          });
          packageCount++;
        }
      }
    });
    
    console.log(`[DSA] Package component overlays applied: ${packageCount}`);
  }
  
  return { muiCount, customCount, packageCount };
}

// Optimized custom component analysis
let customAnalysisCache = null;
let customCacheTime = 0;

function analyzeCustomComponents() {
  // Return cached result if less than 30 seconds old
  const now = Date.now();
  if (customAnalysisCache && (now - customCacheTime) < 30000) {
    return customAnalysisCache;
  }
  
  let customCount = 0;
  
  // Use more efficient selector and limit search scope
  const potentialCustom = document.querySelectorAll('[class*="-"], [class^="C"], [class^="A"], [class^="B"], [class^="D"], [class^="E"], [class^="F"], [class^="G"], [class^="H"], [class^="I"], [class^="J"], [class^="K"], [class^="L"], [class^="M"], [class^="N"], [class^="O"], [class^="P"], [class^="Q"], [class^="R"], [class^="S"], [class^="T"], [class^="U"], [class^="V"], [class^="W"], [class^="X"], [class^="Y"], [class^="Z"]');
  
  // Quick regex patterns for performance
  const pascalCasePattern = /^[A-Z][a-zA-Z0-9]+$/;
  const muiPattern = /^Mui/;
  const ignoredPattern = /^(container|row|col|grid|flex|box|wrapper|main|section|content|item|list|card|panel|input|button|form|label|icon|avatar|divider|header|footer|nav|menu|toolbar|tab)$/i;
  
  // Process in smaller batches
  const maxElements = Math.min(potentialCustom.length, 500); // Limit to 500 elements
  
  for (let i = 0; i < maxElements; i++) {
    const el = potentialCustom[i];
    if (el.hasAttribute('data-dsa-overlay') || isGlobalElement(el)) continue;
    
    if (!el.className || typeof el.className !== 'string') continue;
    const classList = el.className.split(' ').filter(Boolean);
    if (classList.length <= 1) continue;
    
    // Quick check for PascalCase and non-MUI
    const hasPascalCase = classList.some(cls => {
      return pascalCasePattern.test(cls) && !muiPattern.test(cls) && !ignoredPattern.test(cls);
    });
    
    if (hasPascalCase) {
      customCount++;
    }
    
    // Yield control every 100 elements
    if (i % 100 === 0) {
      setTimeout(() => {}, 0);
    }
  }
  
  customAnalysisCache = customCount;
  customCacheTime = now;
  return customCount;
}

let debugMode = true; // Enable debug mode to help troubleshoot

// Enhanced message listener with comprehensive package detection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (debugMode) console.log('[DSA-DEBUG] Received message:', request.action);
    
    if (request.action === "ping") {
      sendResponse({ status: "ok" });
      return true;
    }

    if (request.action === "toggleOverlays") {
      if (typeof request.options.debugMode !== 'undefined') {
        debugMode = request.options.debugMode;
        console.log(`[DSA] Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
      }
      const overlayResults = showOverlays(request.options || {});
      sendResponse({ success: true, ...overlayResults });
      return true;
    }
    
    if (request.action === "getMUIData") {
      try {
        if (debugMode) console.log('[DSA-DEBUG] Starting MUI data analysis...');
        
        const detectionData = detectMUI();
        if (debugMode) console.log('[DSA-DEBUG] MUI detection complete:', detectionData);
        
        const allPackages = detectAllPackages();
        if (debugMode) console.log('[DSA-DEBUG] Package detection complete:', allPackages.length, 'packages found');
        
        let analysisData = {
           ...detectionData,
           muiComponentDetails: null,
           totalMuiComponents: 0,
           customComponentCount: 0,
           componentRatio: "N/A",
           packageDependencies: allPackages,
           designTokens: [],
           detectedPackages: allPackages.length,
           packageBreakdown: {}
        };

        if (detectionData.muiDetected) {
          if (debugMode) console.log('[DSA-DEBUG] MUI detected, analyzing components...');
          const componentAnalysis = analyzeMUIComponents(detectionData.muiVersion);
          analysisData.muiComponentDetails = componentAnalysis.identifiedComponents;
          analysisData.totalMuiComponents = componentAnalysis.totalMuiComponents;
          if (debugMode) console.log('[DSA-DEBUG] MUI component analysis complete:', componentAnalysis);
        } else {
          if (debugMode) console.log('[DSA-DEBUG] MUI not detected, checking for manual detection...');
          // Fallback: try manual detection if automatic failed
          const manualMuiElements = document.querySelectorAll('[class*="Mui"]');
          if (manualMuiElements.length > 0) {
            if (debugMode) console.log('[DSA-DEBUG] Manual MUI detection found', manualMuiElements.length, 'elements');
            analysisData.muiDetected = true;
            analysisData.muiVersion = 'Detected via fallback';
            // Quick count of MUI components
            const quickAnalysis = {};
            manualMuiElements.forEach(el => {
              const className = el.className;
              if (!className || typeof className !== 'string') return;
              
              const match = className.match(/Mui(\w+)-root/);
              if (match) {
                const componentName = match[1];
                quickAnalysis[componentName] = (quickAnalysis[componentName] || 0) + 1;
              }
            });
            analysisData.muiComponentDetails = quickAnalysis;
            analysisData.totalMuiComponents = Object.values(quickAnalysis).reduce((sum, count) => sum + count, 0);
            if (debugMode) console.log('[DSA-DEBUG] Manual MUI analysis complete:', quickAnalysis, 'Total:', analysisData.totalMuiComponents);
          }
        }
        
        // Calculate custom components and ratio
        if (debugMode) console.log('[DSA-DEBUG] Analyzing custom components...');
        const customCount = analyzeCustomComponents();
        analysisData.customComponentCount = customCount;
        if (debugMode) console.log('[DSA-DEBUG] Custom component analysis complete:', customCount);
        
        // Enhanced package breakdown with MUI ecosystem focus
        const packageBreakdown = {};
        const muiEcosystem = {
          corePackages: [],
          stylingPackages: [],
          iconPackages: [],
          advancedPackages: [],
          devTools: []
        };
        
        allPackages.forEach(pkg => {
          const category = pkg.category || categorizePackage(pkg.name);
          if (!packageBreakdown[category]) {
            packageBreakdown[category] = [];
          }
          packageBreakdown[category].push(pkg);
          
          // Organize MUI ecosystem packages
          if (category === 'MUI Core') {
            muiEcosystem.corePackages.push(pkg);
          } else if (category === 'MUI Styling') {
            muiEcosystem.stylingPackages.push(pkg);
          } else if (category === 'MUI Icons' || category === 'MUI Fonts') {
            muiEcosystem.iconPackages.push(pkg);
          } else if (category === 'MUI X' || category === 'MUI Labs') {
            muiEcosystem.advancedPackages.push(pkg);
          } else if (category === 'Development Tools') {
            muiEcosystem.devTools.push(pkg);
          }
        });
        
        analysisData.packageBreakdown = packageBreakdown;
        analysisData.muiEcosystem = muiEcosystem;
        
        const total = (analysisData.totalMuiComponents || 0) + customCount;
        if (total > 0) {
          const muiPct = Math.round((analysisData.totalMuiComponents / total) * 100);
          const customPct = 100 - muiPct;
          analysisData.componentRatio = `MUI: ${muiPct}%, Custom: ${customPct}%`;
        }
        
        if (debugMode) console.log('[DSA-DEBUG] Final analysis data:', analysisData);
        sendResponse(analysisData);
        
      } catch (error) {
        console.error('[DSA-ERROR] Analysis failed:', error);
        sendResponse({
          error: true,
          message: error.message,
          muiDetected: false,
          totalMuiComponents: 0,
          customComponentCount: 0,
          packageDependencies: [],
          detectedPackages: 0
        });
      }
      return; // Don't return true for synchronous response
    }
    
    return true; // Indicates that the response is sent asynchronously
    
  } catch (error) {
    console.error('[DSA-ERROR] Message handler failed:', error);
    sendResponse({
      error: true,
      message: 'Content script error: ' + error.message
    });
    return true;
  }
});

// Helper function to categorize packages
function categorizePackage(packageName) {
  const categories = {
    'UI Framework': ['mui', 'ant-design', 'chakra-ui', 'mantine', 'semantic-ui'],
    'CSS Framework': ['bootstrap', 'tailwindcss', 'bulma', 'foundation'],
    'JavaScript Library': ['react', 'vue', 'angular', 'jquery', 'lodash'],
    'Utility': ['moment', 'axios', 'date-fns', 'uuid'],
    'Visualization': ['d3', 'chart.js', 'plotly', 'echarts']
  };
  
  for (const [category, packages] of Object.entries(categories)) {
    if (packages.some(pkg => packageName.toLowerCase().includes(pkg))) {
      return category;
    }
  }
  
  return 'Other';
}

