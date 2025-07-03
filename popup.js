document.addEventListener("DOMContentLoaded", function() {
  let currentTab = 'overview';
  let analysisData = null;
  let isAnalyzing = false;

  function init() {
    setupEventListeners();
    switchTab('overview');
    requestAnalysis();
  }

  function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        requestAnalysis(true);
      });
    }

    const toggleIds = ['muiOverlayToggle', 'customOverlayToggle', 'packageOverlayToggle', 'slideColorToggle'];
    toggleIds.forEach(function(id) {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener('change', function() {
          setTimeout(sendOverlayToggle, 100);
        });
      }
    });

    document.querySelectorAll('.tab-button').forEach(function(button) {
      button.addEventListener('click', function() {
        switchTab(button.dataset.tab);
      });
    });

    document.querySelectorAll('.stat-card').forEach(function(card) {
      card.addEventListener('click', function() {
        if (card.classList.contains('mui')) {
          switchTab('components');
        } else if (card.classList.contains('packages')) {
          switchTab('packages');
        } else {
          switchTab('overview');
        }
      });
    });
  }

  function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(function(btn) {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-content').forEach(function(content) {
      if (content.id === tabName + '-tab') {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    currentTab = tabName;
    
    if (analysisData) {
      populateTabContent(tabName);
    }
  }

  function requestAnalysis(force) {
    if (isAnalyzing && !force) return;
    
    isAnalyzing = true;
    showLoading();

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        handleAnalysisError(new Error('No active tab found'));
        return;
      }

      const tab = tabs[0];
      console.log('Attempting to analyze tab:', tab.url);

      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        handleAnalysisError(new Error('Cannot analyze browser internal pages. Please navigate to a regular website.'));
        return;
      }

      // Ping the content script first to see if it's ready
      chrome.tabs.sendMessage(tab.id, {action: "ping"}, function(response) {
        if (chrome.runtime.lastError || !response || response.status !== 'ok') {
          console.log('Content script not ready, injecting now.');
          // Inject the script if it's not there
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, function() {
            if (chrome.runtime.lastError) {
              handleAnalysisError(new Error('Cannot inject content script: ' + chrome.runtime.lastError.message));
              isAnalyzing = false;
            } else {
              // After injecting, wait a moment and then request analysis
              setTimeout(function() { fetchMuiData(tab.id); }, 500);
            }
          });
        } else {
          // Content script is ready, fetch the data
          fetchMuiData(tab.id);
        }
      });
    });
  }

  function fetchMuiData(tabId) {
    chrome.tabs.sendMessage(tabId, {action: "getMUIData"}, function(response) {
      if (chrome.runtime.lastError) {
        handleAnalysisError(new Error('Failed to get data from content script: ' + chrome.runtime.lastError.message));
      } else if (response) {
        handleAnalysisComplete(response);
      } else {
        handleAnalysisError(new Error('No response from content script'));
      }
      isAnalyzing = false;
    });
  }

  function handleAnalysisComplete(data) {
    console.log('Analysis data received:', data);
    analysisData = data;
    hideLoading();
    updateStatsCards(data);
    updateCoverageBar(data);
    populateTabContent(currentTab);
    generateInsights(data);
    sendOverlayToggle();
  }

  function handleAnalysisError(error) {
    hideLoading();
    console.error('Analysis failed:', error);
    
    ['muiCount', 'customCount', 'packageCount'].forEach(function(id) {
      const element = document.getElementById(id);
      if (element) element.textContent = '!';
    });

    const insightCards = document.getElementById('insightCards');
    if (insightCards) {
      insightCards.innerHTML = '<div class="insight-card negative">Analysis failed. Try refreshing the page.</div>';
    }
  }

  function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
  }

  function hideLoading() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  }

  function updateStatsCards(data) {
    animateCount('muiCount', data.totalMuiComponents || 0);
    animateCount('customCount', data.customComponentCount || 0);
    animateCount('packageCount', data.detectedPackages || 0);
  }

  function animateCount(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = target;
  }

  function updateCoverageBar(data) {
    const total = (data.totalMuiComponents || 0) + (data.customComponentCount || 0);
    
    if (total > 0) {
      const muiPercent = Math.round((data.totalMuiComponents / total) * 100);
      const customPercent = 100 - muiPercent;
      
      setTimeout(function() {
        const muiBar = document.getElementById('coverageBarMui');
        const customBar = document.getElementById('coverageBarCustom');
        const muiText = document.getElementById('muiPercentage');
        const customText = document.getElementById('customPercentage');
        
        if (muiBar) muiBar.style.width = muiPercent + '%';
        if (customBar) customBar.style.width = customPercent + '%';
        if (muiText) muiText.textContent = muiPercent + '%';
        if (customText) customText.textContent = customPercent + '%';
      }, 200);
    }
  }

  function populateTabContent(tabName) {
    if (!analysisData) return;

    if (tabName === 'components') {
      populateComponentsTab();
    } else if (tabName === 'packages') {
      populatePackagesTab();
    }
  }

  function populateComponentsTab() {
    const grid = document.getElementById('componentGrid');
    console.log('Populating components tab:', analysisData);
    
    if (!grid) {
      console.error('Component grid element not found');
      return;
    }
    
    if (!analysisData || !analysisData.muiComponentDetails) {
      console.log('No MUI component details available');
      grid.innerHTML = '<div class="component-card"><div class="card-header"><div class="card-title">No components detected</div></div></div>';
      return;
    }

    const components = Object.entries(analysisData.muiComponentDetails)
      .sort(function(a, b) { return b[1] - a[1]; });

    console.log('Components found:', components);

    let html = '';
    components.forEach(function(component) {
      html += '<div class="component-card">' +
        '<div class="card-header">' +
          '<div class="card-title">' + component[0] + '</div>' +
          '<div class="card-count">' + component[1] + '</div>' +
        '</div>' +
        '<div class="card-meta">' +
          '<span class="card-source">MUI Component</span>' +
        '</div>' +
      '</div>';
    });

    grid.innerHTML = html;
  }

  function populatePackagesTab() {
    const grid = document.getElementById('packageGrid');
    console.log('Populating packages tab:', analysisData);
    
    if (!grid) {
      console.error('Package grid element not found');
      return;
    }
    
    if (!analysisData || !analysisData.packageDependencies || analysisData.packageDependencies.length === 0) {
      console.log('No package dependencies available');
      grid.innerHTML = '<div class="package-card"><div class="card-header"><div class="card-title">No packages detected</div></div></div>';
      return;
    }

    console.log('Packages found:', analysisData.packageDependencies);

    let html = '';
    analysisData.packageDependencies.forEach(function(pkg) {
      const icon = getCategoryIcon(pkg.category);
      html += '<div class="package-card">' +
        '<div class="card-header">' +
          '<div class="card-title">' + icon + ' ' + pkg.name + '</div>' +
          '<div class="card-version">' + pkg.version + '</div>' +
        '</div>' +
        '<div class="card-meta">' +
          '<span class="card-source">' + pkg.source + '</span>' +
          (pkg.category ? '<span class="card-category">' + pkg.category + '</span>' : '') +
        '</div>' +
      '</div>';
    });

    grid.innerHTML = html;
  }

  function getCategoryIcon(category) {
    const icons = {
      'Roku RDS': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>',
      'MUI Core': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
      'MUI Styling': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
      'MUI Icons': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
      'MUI Fonts': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
      'MUI X': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      'MUI Labs': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 22V12"/></svg>',
      'Development Tools': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      'Framework': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-3.46 19.46"/><path d="M12 22a10 10 0 0 0 3.46-19.46"/><path d="M2 12h20"/></svg>',
      'CSS Framework': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l-10 5 10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      'Library': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M4 5h16v12H4V5z"/></svg>'
    };
    return icons[category] || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
  }

  function generateInsights(data) {
    const insights = [];
    const total = (data.totalMuiComponents || 0) + (data.customComponentCount || 0);
    
    if (total === 0) {
      insights.push({
        type: 'warning',
        message: 'No components detected. This might be a static page.'
      });
    } else {
      const muiPercent = Math.round((data.totalMuiComponents / total) * 100);
      
      if (muiPercent >= 80) {
        insights.push({
          type: 'positive',
          message: 'Excellent design system adoption! ' + muiPercent + '% of components use MUI.'
        });
      } else if (muiPercent >= 50) {
        insights.push({
          type: 'warning',
          message: 'Good progress (' + muiPercent + '%). Consider migrating more custom components.'
        });
      } else {
        insights.push({
          type: 'negative',
          message: 'Low adoption (' + muiPercent + '%). Many opportunities to use MUI.'
        });
      }
    }

    const insightCards = document.getElementById('insightCards');
    if (insightCards) {
      let html = '';
      insights.forEach(function(insight) {
        html += '<div class="insight-card ' + insight.type + '">' + insight.message + '</div>';
      });
      insightCards.innerHTML = html;
    }
  }

  function sendOverlayToggle() {
    const options = {
      showMUI: document.getElementById('muiOverlayToggle') ? document.getElementById('muiOverlayToggle').checked : true,
      showCustom: document.getElementById('customOverlayToggle') ? document.getElementById('customOverlayToggle').checked : true,
      showPackages: document.getElementById('packageOverlayToggle') ? document.getElementById('packageOverlayToggle').checked : true,
      slideColor: document.getElementById('slideColorToggle') ? document.getElementById('slideColorToggle').checked : false
    };

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "toggleOverlays", 
          options: options 
        });
      }
    });
  }

  init();
});