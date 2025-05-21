// content.js

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
      '[class*="css-"][id*="mui-"]', // More generic but often used by MUI v5+ styled components
      'script[src*="@mui/"]', // Check for MUI script tags
      'link[href*="@mui/"]' // Check for MUI CSS links
    ];

    for (const selector of muiSelectors) {
      if (document.querySelector(selector)) {
        muiDetected = true;
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

  return { muiDetected, muiVersion };
}

function analyzeMUIComponents(muiVersion) {
  const identifiedComponents = {};
  let totalMuiComponents = 0;

  // List of common MUI components and their typical root class name patterns
  // This list can be expanded. We look for classes containing these strings.
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
    "Grid": "MuiGrid-root", // Grid can be very common, might need refinement
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
    "Select": "MuiSelect-root", // This is for the MuiSelect-select class, root is MuiInput-root usually
    "Skeleton": "MuiSkeleton-root",
    "Slider": "MuiSlider-root",
    "Snackbar": "MuiSnackbar-root",
    "Stepper": "MuiStepper-root",
    "Switch": "MuiSwitch-root",
    "Tab": "MuiTab-root",
    "Table": "MuiTable-root",
    "TextField": "MuiTextField-root", // This is a wrapper, actual input is MuiInput-input
    "ToggleButton": "MuiToggleButton-root",
    "Toolbar": "MuiToolbar-root",
    "Tooltip": "MuiTooltip-popper", // Popper is more specific than root for Tooltip
    "Typography": "MuiTypography-root"
  };

  for (const componentName in muiComponentPatterns) {
    const pattern = muiComponentPatterns[componentName];
    const selector = `[class*="${pattern}"]`;
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        identifiedComponents[componentName] = elements.length;
        totalMuiComponents += elements.length;
      }
    } catch (e) {
      console.warn(`Error querying for ${componentName} with selector ${selector}:`, e);
    }
  }
  
  // A more specific check for Select might be needed if MuiSelect-root is too generic or not always present
  // For TextField, MuiTextField-root is a good indicator.

  return { identifiedComponents, totalMuiComponents };
}

// Utility: Add overlay and label to an element
function addOverlay(element, label, color) {
  // Avoid duplicate overlays
  if (!element) return;
  if (element.hasAttribute('data-dsa-overlay')) return;
  element.setAttribute('data-dsa-overlay', 'true');
  // Add !important to outline for visibility
  element.style.setProperty('outline', `2px solid ${color}`, 'important');
  // Ensure position is not static
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  // Create label
  const labelDiv = document.createElement('div');
  labelDiv.textContent = label;
  labelDiv.style.position = 'absolute';
  labelDiv.style.top = '0';
  labelDiv.style.left = '0';
  labelDiv.style.background = color;
  labelDiv.style.color = '#fff';
  labelDiv.style.fontSize = '10px';
  labelDiv.style.padding = '2px 4px';
  labelDiv.style.zIndex = '9999';
  labelDiv.style.pointerEvents = 'none';
  labelDiv.style.borderRadius = '0 0 4px 0';
  labelDiv.setAttribute('data-dsa-overlay', 'true');
  element.appendChild(labelDiv);
  // Debug log
  console.log('[DSA] Overlay added:', label, element);
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
  if (el.className && /global|navbar|footer|header/i.test(el.className)) return true;
  return false;
}

// Show overlays for MUI and custom components
function showOverlays({ showMUI = true, showCustom = true }) {
  removeAllOverlays();
  let muiCount = 0;
  let customCount = 0;
  // MUI overlays
  if (showMUI) {
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
    for (const componentName in muiComponentPatterns) {
      const pattern = muiComponentPatterns[componentName];
      const selector = `[class*="${pattern}"]`;
      document.querySelectorAll(selector).forEach(el => {
        if (!isGlobalElement(el)) {
          addOverlay(el, componentName, '#1976d2'); // blue
          muiCount++;
        }
      });
    }
    console.log(`[DSA] MUI overlays applied: ${muiCount}`);
  }
  // Custom overlays
  if (showCustom) {
    const ignoredPatterns = [
      'container', 'row', 'col', 'grid', 'flex', 'box', 'wrapper', 'main', 'section', 'content', 'item', 'list', 'card', 'panel',
      'input', 'button', 'form', 'label', 'icon', 'avatar', 'divider', 'header', 'footer', 'nav', 'menu', 'toolbar', 'tab',
      'stepper', 'slider', 'switch', 'toggle', 'tooltip', 'snackbar', 'dialog', 'drawer', 'badge', 'chip', 'progress', 'rating',
      'select', 'skeleton', 'table', 'typography', 'breadcrumbs', 'accordion', 'alert', 'appbar', 'autocomplete', 'buttongroup',
      'checkbox', 'circularprogress', 'fab', 'formcontrol', 'formlabel', 'iconbutton', 'linearprogress', 'link', 'listitem',
      'paper', 'radio', 'textfield', 'togglebutton'
    ];
    document.querySelectorAll('[class]').forEach(el => {
      if (el.hasAttribute('data-dsa-overlay')) return; // already marked
      if (isGlobalElement(el)) return;
      const classList = el.className.split(' ').filter(Boolean);
      if (classList.length <= 1) return; // Ignore elements with only one class
      const hasIgnored = classList.some(cls => ignoredPatterns.some(pat => cls.toLowerCase().includes(pat)));
      if (hasIgnored) return;
      const isPascalCase = classList.some(cls => /^[A-Z][a-zA-Z0-9]+$/.test(cls));
      const isMUI = classList.some(cls => cls.startsWith('Mui'));
      if (isPascalCase && !isMUI) {
        addOverlay(el, 'Custom', '#d32f2f'); // red outline and label
        customCount++;
      }
    });
    console.log(`[DSA] Custom overlays applied: ${customCount}`);
  }
}

function analyzeCustomComponents() {
  // List of ignored utility/layout class patterns (case-insensitive, partial match)
  const ignoredPatterns = [
    'container', 'row', 'col', 'grid', 'flex', 'box', 'wrapper', 'main', 'section', 'content', 'item', 'list', 'card', 'panel',
    'input', 'button', 'form', 'label', 'icon', 'avatar', 'divider', 'header', 'footer', 'nav', 'menu', 'toolbar', 'tab',
    'stepper', 'slider', 'switch', 'toggle', 'tooltip', 'snackbar', 'dialog', 'drawer', 'badge', 'chip', 'progress', 'rating',
    'select', 'skeleton', 'table', 'typography', 'breadcrumbs', 'accordion', 'alert', 'appbar', 'autocomplete', 'buttongroup',
    'checkbox', 'circularprogress', 'fab', 'formcontrol', 'formlabel', 'iconbutton', 'linearprogress', 'link', 'listitem',
    'paper', 'radio', 'textfield', 'togglebutton'
  ];
  let customCount = 0;
  document.querySelectorAll('[class]').forEach(el => {
    if (el.hasAttribute('data-dsa-overlay')) return; // already marked
    if (isGlobalElement(el)) return;
    const classList = el.className.split(' ').filter(Boolean);
    if (classList.length <= 1) return; // Ignore elements with only one class
    // Ignore if any class matches an ignored pattern
    const hasIgnored = classList.some(cls => ignoredPatterns.some(pat => cls.toLowerCase().includes(pat)));
    if (hasIgnored) return;
    // Only count if at least one class is PascalCase (likely a React component)
    const isPascalCase = classList.some(cls => /^[A-Z][a-zA-Z0-9]+$/.test(cls));
    const isMUI = classList.some(cls => cls.startsWith('Mui'));
    if (isPascalCase && !isMUI) {
      customCount++;
    }
  });
  return customCount;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMUIData") {
    const detectionData = detectMUI();
    let analysisData = {
       ...detectionData,
       muiComponentDetails: null,
       totalMuiComponents: 0,
       // Placeholders for future analysis
       customComponentCount: 0,
       componentRatio: "N/A",
       packageDependencies: [],
       designTokens: []
    };

    if (detectionData.muiDetected) {
      const componentAnalysis = analyzeMUIComponents(detectionData.muiVersion);
      analysisData.muiComponentDetails = componentAnalysis.identifiedComponents;
      analysisData.totalMuiComponents = componentAnalysis.totalMuiComponents;
    }
    // Calculate custom components and ratio
    const customCount = analyzeCustomComponents();
    analysisData.customComponentCount = customCount;
    const total = (analysisData.totalMuiComponents || 0) + customCount;
    if (total > 0) {
      const muiPct = Math.round((analysisData.totalMuiComponents / total) * 100);
      const customPct = 100 - muiPct;
      analysisData.componentRatio = `MUI: ${muiPct}%, Custom: ${customPct}%`;
    }
    sendResponse(analysisData);
  }
  if (request.action === "toggleOverlays") {
    showOverlays(request.options || {});
    sendResponse({ success: true });
    return true;
  }
  return true; // Indicates that the response is sent asynchronously
});

