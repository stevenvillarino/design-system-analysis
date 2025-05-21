// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultsDiv = document.getElementById("results");
  const muiOverlayToggle = document.getElementById("muiOverlayToggle");
  const customOverlayToggle = document.getElementById("customOverlayToggle");
  const spinner = document.getElementById("spinner");
  const metricsSection = document.getElementById("metricsSection");

  // Helper to send overlay toggle message
  function sendOverlayToggle() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          action: "toggleOverlays",
          options: {
            showMUI: muiOverlayToggle ? muiOverlayToggle.checked : true,
            showCustom: customOverlayToggle ? customOverlayToggle.checked : true
          }
        }
      );
    });
  }

  // Function to show/hide spinner
  function setSpinner(visible) {
    if (spinner) spinner.style.display = visible ? "block" : "none";
  }

  // Function to show/hide metrics section
  function setMetricsVisible(visible) {
    if (metricsSection) metricsSection.style.display = visible ? "block" : "none";
  }

  // Function to request analysis from content script
  function requestAnalysis() {
    setSpinner(true);
    setMetricsVisible(false);
    resultsDiv.innerHTML = '<div id="spinner" class="spinner"></div><h2 class="section">Analysis Results</h2><p>Analyzing page...</p>';
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        setSpinner(false);
        resultsDiv.innerHTML = "<p>Error: No active tab found.</p>";
        return;
      }
      const activeTab = tabs[0];
      // Send a message to the content script in the active tab
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "getMUIData" },
        (response) => {
          setSpinner(false);
          setMetricsVisible(true);
          if (chrome.runtime.lastError) {
            resultsDiv.innerHTML = `<p>Error: ${chrome.runtime.lastError.message}</p><p>Please ensure the page is fully loaded and try again. You might need to refresh the page if it was open before the extension was installed/enabled.</p>`;
            console.error(chrome.runtime.lastError.message);
            return;
          }
          if (response) {
            let htmlContent = "<h2 class=\"section\">Analysis Results</h2>";
            if (response.muiDetected) {
              htmlContent += `<p><strong>MUI Detected:</strong> Yes</p>`;
              htmlContent += `<p><strong>MUI Version:</strong> ${response.muiVersion || "Not specifically identified"}</p>`;
              
              if (response.muiComponentDetails && Object.keys(response.muiComponentDetails).length > 0) {
                htmlContent += "<div class=\"section\"><h3>Detected MUI Components:</h3>";
                htmlContent += "<ul class=\"component-list\">";
                for (const component in response.muiComponentDetails) {
                  htmlContent += `<li class=\"list-item\"><span class=\"metric-dot mui\"></span>${component}: ${response.muiComponentDetails[component]}</li>`;
                }
                htmlContent += "</ul>";
                htmlContent += `<p><strong>Total MUI Components Found:</strong> <span class=\"metric-dot mui\"></span>${response.totalMuiComponents}</p>`;
                htmlContent += `<p><strong>Custom Components Found:</strong> <span class=\"metric-dot custom\"></span>${response.customComponentCount}</p>`;
                htmlContent += `<p><strong>Coverage Ratio:</strong> ${response.componentRatio}</p>`;
                htmlContent += "</div>";
              } else {
                htmlContent += "<p>No specific MUI components identified (or analysis not yet implemented for them).</p>";
                htmlContent += `<p><strong>Custom Components Found:</strong> <span class=\"metric-dot custom\"></span>${response.customComponentCount}</p>`;
                htmlContent += `<p><strong>Coverage Ratio:</strong> ${response.componentRatio}</p>`;
              }

            } else {
              htmlContent += "<p><strong>MUI Detected:</strong> No</p>";
              htmlContent += `<p><strong>Custom Components Found:</strong> <span class=\"metric-dot custom\"></span>${response.customComponentCount}</p>`;
              htmlContent += `<p><strong>Coverage Ratio:</strong> ${response.componentRatio}</p>`;
            }
            resultsDiv.innerHTML = htmlContent;
          } else {
            resultsDiv.innerHTML = "<p>No response from content script. Ensure the extension has permissions for this page and the page is loaded.</p>";
          }
          // After analysis, show overlays by default (sync with toggles)
          if (muiOverlayToggle) muiOverlayToggle.checked = true;
          if (customOverlayToggle) customOverlayToggle.checked = true;
          sendOverlayToggle();
        }
      );
    });
  }

  // Automatically request analysis when popup opens
  requestAnalysis();

  // Add event listener to the button if you want a manual trigger as well
  if(analyzeBtn) {
      analyzeBtn.addEventListener("click", () => {
        requestAnalysis();
      });
  }

  // Add event listeners for overlay toggles
  if (muiOverlayToggle) {
    muiOverlayToggle.addEventListener("change", sendOverlayToggle);
  }
  if (customOverlayToggle) {
    customOverlayToggle.addEventListener("change", sendOverlayToggle);
  }

  // Info icon tooltip (keyboard accessible)
  document.addEventListener('focusin', (e) => {
    if (e.target.classList && e.target.classList.contains('info-icon')) {
      const tooltip = e.target.nextElementSibling;
      if (tooltip) tooltip.style.display = 'block';
    }
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.classList && e.target.classList.contains('info-icon')) {
      const tooltip = e.target.nextElementSibling;
      if (tooltip) tooltip.style.display = 'none';
    }
  });
});

