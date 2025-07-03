// content.js

// Enhanced MUI ecosystem and design system package detection
let packageCache = null;
let packageCacheTime = 0;

function detectAllPackages() {
  // Return cached result if less than 30 seconds old
  const now = Date.now();
  if (packageCache && (now - packageCacheTime) < 30000) {
    return packageCache;
  }
  
  const packages = new Map();
  
  // Enhanced script tag checking with focus on MUI and Roku Design System
  const scripts = Array.from(document.querySelectorAll('script[src]')).slice(0, 100);
  const muiEcosystemPatterns = [
    // Roku Design System packages
    { pattern: /@roku-web-ui\/rds-components(?:@|\/)([\d\w\.-]+)/, name: '@roku-web-ui/rds-components', version: 1, category: 'Roku RDS' },
    { pattern: /@roku-web-ui\/rds-theme(?:@|\/)([\d\w\.-]+)/, name: '@roku-web-ui/rds-theme', version: 1, category: 'Roku RDS' },
    { pattern: /@roku-web-ui\/rds-icons(?:@|\/)([\d\w\.-]+)/, name: '@roku-web-ui/rds-icons', version: 1, category: 'Roku RDS' },
    { pattern: /@roku-web-ui\/rds-fonts(?:@|\/)([\d\w\.-]+)/, name: '@roku-web-ui/rds-fonts', version: 1, category: 'Roku RDS' },
    { pattern: /@roku-web-ui\/rds-storybook(?:@|\/)([\d\w\.-]+)/, name: '@roku-web-ui/rds-storybook', version: 1, category: 'Roku RDS' },
    
    // MUI Core packages
    { pattern: /@mui\/material(?:@|\/)([\d\w\.-]+)/, name: '@mui/material', version: 1, category: 'MUI Core' },
    { pattern: /@mui\/system(?:@|\/)([\d\w\.-]+)/, name: '@mui/system', version: 1, category: 'MUI Core' },
    { pattern: /@mui\/utils(?:@|\/)([\d\w\.-]+)/, name: '@mui/utils', version: 1, category: 'MUI Core' },
    { pattern: /@mui\/base(?:@|\/)([\d\w\.-]+)/, name: '@mui/base', version: 1, category: 'MUI Core' },
    { pattern: /@mui\/lab(?:@|\/)([\d\w\.-]+)/, name: '@mui/lab', version: 1, category: 'MUI Labs' },
    
    // MUI Styling and Theming
    { pattern: /@mui\/styles(?:@|\/)([\d\w\.-]+)/, name: '@mui/styles', version: 1, category: 'MUI Styling' },
    { pattern: /@emotion\/react(?:@|\/)([\d\w\.-]+)/, name: '@emotion/react', version: 1, category: 'MUI Styling' },
    { pattern: /@emotion\/styled(?:@|\/)([\d\w\.-]+)/, name: '@emotion/styled', version: 1, category: 'MUI Styling' },
    { pattern: /@emotion\/cache(?:@|\/)([\d\w\.-]+)/, name: '@emotion/cache', version: 1, category: 'MUI Styling' },
    
    // MUI Icons and Fonts
    { pattern: /@mui\/icons-material(?:@|\/)([\d\w\.-]+)/, name: '@mui/icons-material', version: 1, category: 'MUI Icons' },
    { pattern: /material-icons(?:@|\/)([\d\w\.-]+)/, name: 'material-icons', version: 1, category: 'MUI Icons' },
    { pattern: /roboto-fontface(?:@|\/)([\d\w\.-]+)/, name: 'roboto-fontface', version: 1, category: 'MUI Fonts' },
    { pattern: /typeface-roboto(?:@|\/)([\d\w\.-]+)/, name: 'typeface-roboto', version: 1, category: 'MUI Fonts' },
    
    // MUI Advanced/Professional
    { pattern: /@mui\/x-data-grid(?:@|\/)([\d\w\.-]+)/, name: '@mui/x-data-grid', version: 1, category: 'MUI X' },
    { pattern: /@mui\/x-date-pickers(?:@|\/)([\d\w\.-]+)/, name: '@mui/x-date-pickers', version: 1, category: 'MUI X' },
    { pattern: /@mui\/x-charts(?:@|\/)([\d\w\.-]+)/, name: '@mui/x-charts', version: 1, category: 'MUI X' },
    
    // Design System & Development Tools
    { pattern: /storybook(?:@|\/)([\d\w\.-]+)/, name: 'storybook', version: 1, category: 'Development Tools' },
    { pattern: /@storybook\/([^@\/]+)(?:@|\/)([\d\w\.-]+)/, name: 1, version: 2, prefix: '@storybook', category: 'Development Tools' },
    { pattern: /chromatic(?:@|\/)([\d\w\.-]+)/, name: 'chromatic', version: 1, category: 'Development Tools' },
    
    // Other Design Systems
    { pattern: /react(?:@|\/)([\d\w\.-]+)/, name: 'react', version: 1, category: 'Framework' },
    { pattern: /bootstrap(?:@|\/)([\d\w\.-]+)/, name: 'bootstrap', version: 1, category: 'CSS Framework' },
    { pattern: /tailwindcss(?:@|\/)([\d\w\.-]+)/, name: 'tailwindcss', version: 1, category: 'CSS Framework' },
    
    // CDN patterns
    { pattern: /cdn\.jsdelivr\.net\/npm\/([^@\/]+)@([^/]+)/, name: 1, version: 2, category: 'CDN Package' },
    { pattern: /unpkg\.com\/([^@\/]+)@([^/]+)/, name: 1, version: 2, category: 'CDN Package' }
  ];
  
  scripts.forEach(script => {
    const src = script.src;
    for (const { pattern, name, version, prefix, category } of muiEcosystemPatterns) {
      const match = src.match(pattern);
      if (match) {
        const packageName = typeof name === 'string' ? name : (prefix ? `${prefix}/${match[name]}` : match[name]);
        const packageVersion = match[version] || 'detected';
        
        if (!packages.has(packageName)) {
          packages.set(packageName, {
            name: packageName,
            version: packageVersion,
            source: 'script-tag',
            category: category || 'Unknown',
            url: src
          });
        }
        break;
      }
    }
  });
  
  // Enhanced global object detection for MUI ecosystem
  const muiGlobalChecks = [
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
    { global: 'jQuery', name: 'jquery', version: () => window.jQuery?.fn?.jquery, category: 'Library' }
  ];
  
  muiGlobalChecks.forEach(({ global, name, version, category }) => {
    if (window[global] && !packages.has(name)) {
      const versionString = typeof version === 'function' ? version() : version;
      packages.set(name, {
        name,
        version: versionString || 'detected',
        source: 'global-object',
        category: category || 'Unknown',
        url: null
      });
    }
  });
  
  // CSS and font detection for MUI ecosystem
  const muiCssChecks = [
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
    { selector: '.flex, .grid', name: 'tailwindcss', category: 'CSS Framework' }
  ];
  
  muiCssChecks.forEach(({ selector, name, category }) => {
    if (!packages.has(name) && document.querySelector(selector)) {
      packages.set(name, {
        name,
        version: 'detected',
        source: 'css-detection',
        category: category || 'Unknown',
        url: null
      });
    }
  });
  
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
  }
  
  packageCache = Array.from(packages.values());
  packageCacheTime = now;
  return packageCache;
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

  // Enhanced detection logic
  const muiSelectors = [
    '[class*="MuiButton-"]', 
    '[class*="MuiInput-"]',
    '[class*="MuiTypography-"]',
    '[class*="css-"][id*="mui-"]', // MUI v5+ styled components
    'script[src*="@mui/"]', 
    'link[href*="@mui/"]',
    '[data-mui-internal-clone-element]' // A less common but reliable indicator
  ];

  if (window.MUI && window.MUI.version) {
    muiVersion = window.MUI.version;
    muiDetected = true;
  } else if (window.mui && window.mui.version) {
    muiVersion = window.mui.version;
    muiDetected = true;
  } else if (document.querySelector(muiSelectors.join(','))) {
    muiDetected = true;
  }

  if (muiDetected && !muiVersion) {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    for (const script of scripts) {
      const src = script.src;
      const muiMatch = src.match(/@mui\/[^\/]+(?:\/([^\/]+))?\/([^\/]+)\/(?:umd\/|esm\/)?([^\.\/]+)/i) || src.match(/material-ui(?:@|\/)([\d\.]+)/i);
      if (muiMatch) {
        muiVersion = muiMatch[1] || muiMatch[2] || muiMatch[3] || "version not found";
        break;
      }
    }
    if (!muiVersion) {
      muiVersion = "Detected, but version not identified";
    }
  }

  return { muiDetected, muiVersion };
}

// Optimized MUI component analysis with performance improvements
let muiAnalysisCache = null;
let muiCacheTime = 0;

const muiComponentPatterns = {
    "Accordion": "MuiAccordion-root",
    "Alert": "MuiAlert-root",
    "AppBar": "MuiAppBar-root",
    "Autocomplete": "MuiAutocomplete-root",
    "Avatar": "MuiAvatar-root",
    "Badge": "MuiBadge-root",
    "BottomNavigation": "MuiBottomNavigation-root",
    "Breadcrumbs": "MuiBreadcrumbs-root",
    "Button": "MuiButton-root",
    "ButtonGroup": "MuiButtonGroup-root",
    "Card": "MuiCard-root",
    "Checkbox": "MuiCheckbox-root",
    "Chip": "MuiChip-root",
    "CircularProgress": "MuiCircularProgress-root",
    "Dialog": "MuiDialog-root",
    "Divider": "MuiDivider-root",
    "Drawer": "MuiDrawer-root",
    "Fab": "MuiFab-root",
    "FormControl": "MuiFormControl-root",
    "FormLabel": "MuiFormLabel-root",
    "Grid": "MuiGrid-root",
    "Icon": "MuiIcon-root",
    "IconButton": "MuiIconButton-root",
    "LinearProgress": "MuiLinearProgress-root",
    "Link": "MuiLink-root",
    "List": "MuiList-root",
    "ListItem": "MuiListItem-root",
    "Menu": "MuiMenu-root",
    "Paper": "MuiPaper-root",
    "Radio": "MuiRadio-root",
    "Rating": "MuiRating-root",
    "Select": "MuiSelect-root",
    "Skeleton": "MuiSkeleton-root",
    "Slider": "MuiSlider-root",
    "Snackbar": "MuiSnackbar-root",
    "Stepper": "MuiStepper-root",
    "Switch": "MuiSwitch-root",
    "Tab": "MuiTab-root",
    "Table": "MuiTable-root",
    "TextField": "MuiTextField-root",
    "ToggleButton": "MuiToggleButton-root",
    "Toolbar": "MuiToolbar-root",
    "Tooltip": "MuiTooltip-popper",
    "Typography": "MuiTypography-root"
};

function analyzeMUIComponents(muiVersion) {
  // Return cached result if less than 30 seconds old
  const now = Date.now();
  if (muiAnalysisCache && (now - muiCacheTime) < 30000) {
    return muiAnalysisCache;
  }
  
  const identifiedComponents = {};
  let totalMuiComponents = 0;

  try {
    const allMuiElements = document.querySelectorAll('[class*="Mui"]');
    
    allMuiElements.forEach(element => {
      const classList = element.className;
      for (const [componentName, pattern] of Object.entries(muiComponentPatterns)) {
        if (classList.includes(pattern)) {
          identifiedComponents[componentName] = (identifiedComponents[componentName] || 0) + 1;
          totalMuiComponents++;
          break; 
        }
      }
    });

  } catch (error) {
    console.error("[DSA] Error analyzing MUI components:", error);
    // Return empty results on error, but don't crash
    return { identifiedComponents: {}, totalMuiComponents: 0 };
  }

  muiAnalysisCache = { identifiedComponents, totalMuiComponents };
  muiCacheTime = now;
  return muiAnalysisCache;
}

// Enhanced overlay system with slide color effects and better labeling
function addOverlay(element, label, color, options = {}) {
  // Avoid duplicate overlays
  if (!element || element.hasAttribute('data-dsa-overlay')) return;
  element.setAttribute('data-dsa-overlay', 'true');
  
  const { slideColor = false, componentType = 'unknown', count = 1 } = options;
  
  // Add outline with enhanced styling
  element.style.setProperty('outline', `3px solid ${color}`, 'important');
  element.style.setProperty('outline-offset', '2px', 'important');
  
  // Ensure parent has relative positioning for overlay
  const computedStyle = getComputedStyle(element);
  if (computedStyle.position === 'static') {
    element.style.position = 'relative';
  }

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
    overlay.setAttribute('data-dsa-overlay-child', 'true');
    element.appendChild(overlay);
  }
  
  // Create enhanced label with component details
  const labelDiv = document.createElement('div');
  labelDiv.className = 'dsa-component-label';
  labelDiv.setAttribute('data-dsa-overlay-child', 'true');
  
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
  
  element.appendChild(labelDiv);
  
  // Add hover effect
  const originalOutline = element.style.outline;
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
  });

  // Remove all overlay child elements (labels, slide colors)
  document.querySelectorAll('[data-dsa-overlay-child]').forEach(child => {
    child.remove();
  });
}

// Utility: Check if element is global (nav, footer, etc.)
function isGlobalElement(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'nav' || tag === 'footer' || tag === 'header') return true;
  if (el.className && /global|navbar|footer|header/i.test(el.className)) return true;
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

// Enhanced message listener with comprehensive package detection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "ok" });
    return true;
  }
  
  if (request.action === "getMUIData") {
    const detectionData = detectMUI();
    const allPackages = detectAllPackages();
    
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
      const componentAnalysis = analyzeMUIComponents(detectionData.muiVersion);
      analysisData.muiComponentDetails = componentAnalysis.identifiedComponents;
      analysisData.totalMuiComponents = componentAnalysis.totalMuiComponents;
    }
    
    // Calculate custom components and ratio
    const customCount = analyzeCustomComponents();
    analysisData.customComponentCount = customCount;
    
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
    
    showOverlays({ showMUI: true, showCustom: true, showPackages: true, slideColor: false });
    sendResponse(analysisData);
  }
  
  if (request.action === "toggleOverlays") {
    const overlayResults = showOverlays(request.options || {});
    sendResponse({ success: true, ...overlayResults });
    return true;
  }
  
  return true; // Indicates that the response is sent asynchronously
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

