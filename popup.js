document.addEventListener("DOMContentLoaded", function() {
  let currentTab = 'overview';
  let analysisData = null;
  let isAnalyzing = false;

  // Initialize the popup
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

      // Check if we can inject on this URL
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        handleAnalysisError(new Error('Cannot analyze browser internal pages. Please navigate to a regular website.'));
        return;
      }

      chrome.tabs.sendMessage(tab.id, {action: "getMUIData"}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Content script error:', chrome.runtime.lastError.message);
          // Try to inject the content script manually
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, function() {
            if (chrome.runtime.lastError) {
              handleAnalysisError(new Error('Cannot inject content script: ' + chrome.runtime.lastError.message));
            } else {
              // Wait a moment then try again
              setTimeout(function() {
                chrome.tabs.sendMessage(tab.id, {action: "getMUIData"}, function(response) {
                  if (chrome.runtime.lastError) {
                    handleAnalysisError(new Error('Content script still not responding: ' + chrome.runtime.lastError.message));
                  } else if (response) {
                    handleAnalysisComplete(response);
                  } else {
                    handleAnalysisError(new Error('No response from content script after injection'));
                  }
                  isAnalyzing = false;
                });
              }, 500);
            }
          });
        } else if (response) {
          console.log('Analysis response received:', response);
          handleAnalysisComplete(response);
          isAnalyzing = false;
        } else {
          handleAnalysisError(new Error('No response from content script'));
          isAnalyzing = false;
        }
      });
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

    const current = parseInt(element.textContent) || 0;
    if (current !== target) {
      element.textContent = target;
    }
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
    console.log('Populating components tab:', {
      grid: !!grid,
      muiComponentDetails: analysisData?.muiComponentDetails,
      analysisData: analysisData
    });
    
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
    console.log('Populating packages tab:', {
      grid: !!grid,
      packageDependencies: analysisData?.packageDependencies,
      analysisData: analysisData
    });
    
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
      'Roku RDS': '🎵',
      'MUI Core': '🔵',
      'MUI Styling': '🎨',
      'MUI Icons': '🔤',
      'MUI Fonts': '🔤',
      'MUI X': '⚡',
      'MUI Labs': '🧪',
      'Development Tools': '🛠️',
      'Framework': '⚛️',
      'CSS Framework': '💎',
      'Library': '📚'
    };
    return icons[category] || '📦';
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

  // Start the application
  init();
});