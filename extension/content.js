function showScamWarningPopup() {
  if (document.getElementById("gov-shield-host")) return;

  if (!document.body) {
    document.addEventListener("DOMContentLoaded", showScamWarningPopup);
    return;
  }

  const hostDiv = document.createElement("div");
  hostDiv.id = "gov-shield-host";
  hostDiv.style.all = "initial";

  const shadowRoot = hostDiv.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    #gov-shield-screen-blocker {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483646;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(5px);
      cursor: not-allowed;
      pointer-events: all;
    }

    #gov-shield-root {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .gov-shield-card {
      width: 380px;
      max-width: 90vw;
      background: #121214;
      border: 1px solid #2d2d32;
      border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 24px;
      color: #f3f4f6;
      animation: govShieldScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes govShieldScaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .gov-shield-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .gov-shield-icon-badge {
      width: 40px;
      height: 40px;
      background-color: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      font-size: 20px;
      flex-shrink: 0;
    }

    .gov-shield-title {
      font-size: 16px;
      font-weight: 700;
      color: #f87171;
      margin: 0;
      line-height: 1.2;
    }

    .gov-shield-body {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .gov-shield-status-box {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid #ef4444;
      padding: 8px 12px;
      font-size: 12px;
      color: #fca5a5;
      border-radius: 0 6px 6px 0;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .gov-shield-checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 16px 0 20px 0;
      cursor: pointer;
      user-select: none;
    }

    .gov-shield-checkbox-container input {
      width: 16px;
      height: 16px;
      accent-color: #dc2626;
      cursor: pointer;
    }

    .gov-shield-checkbox-label {
      font-size: 13px;
      color: #d1d5db;
    }

    /* Main Actions Group */
    .gov-shield-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Visual Separator Line */
    .gov-shield-divider {
      height: 1px;
      background-color: #2d2d32;
      margin: 16px 0 12px 0;
    }

    /* Primary Danger Button */
    .gov-shield-btn-danger {
      width: 100%;
      padding: 10px 14px;
      background-color: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .gov-shield-btn-danger:hover {
      background-color: #b91c1c;
    }

    /* Secondary Action Button */
    .gov-shield-btn-secondary {
      width: 100%;
      padding: 9px 14px;
      background-color: #27272a;
      color: #d1d5db;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .gov-shield-btn-secondary:hover {
      background-color: #3f3f46;
      color: #ffffff;
    }

    /* Separate Dashboard Link Button */
    .gov-shield-btn-dashboard {
      width: 100%;
      padding: 8px 14px;
      background: transparent;
      color: #818cf8;
      border: 1px dashed #3730a3;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 0.2s, color 0.2s;
    }

    .gov-shield-btn-dashboard:hover {
      background-color: rgba(99, 102, 241, 0.1);
      color: #a5b4fc;
    }
  `;
  shadowRoot.appendChild(style);

  const screenBlocker = document.createElement("div");
  screenBlocker.id = "gov-shield-screen-blocker";
  shadowRoot.appendChild(screenBlocker);

  const rootDiv = document.createElement("div");
  rootDiv.id = "gov-shield-root";
  shadowRoot.appendChild(rootDiv);

  renderInitialWarningView(rootDiv, hostDiv, shadowRoot);

  (document.body || document.documentElement).appendChild(hostDiv);

  togglePageInputs(true);
}

// Initial Warning View with Separated Dashboard Button
function renderInitialWarningView(rootDiv, hostDiv, shadowRoot) {
  rootDiv.innerHTML = `
    <div class="gov-shield-card">
      <div class="gov-shield-header">
        <div class="gov-shield-icon-badge">⚠️</div>
        <div>
          <h4 class="gov-shield-title">WebSleuth AI</h4>
        </div>
      </div>
      
      <p class="gov-shield-body">
        This website is posing as an official government portal to steal sensitive information.
      </p>

      <div class="gov-shield-status-box">
        🔒 All clicks and input fields are blocked for your safety.
      </div>

      <!-- Main Action Buttons -->
      <div class="gov-shield-actions">
        <button id="gov-shield-leave-btn" class="gov-shield-btn-danger">
          Leave Site Immediately
        </button>
        <button id="gov-shield-proceed-btn" class="gov-shield-btn-secondary">
          Proceed anyway
        </button>
      </div>

      <!-- Divider -->
      <div class="gov-shield-divider"></div>

      <!-- Separate Dashboard Button Section -->
      <button id="gov-shield-dashboard-btn" class="gov-shield-btn-dashboard">
        📊 Open WebSleuth AI Dashboard
      </button>
    </div>
  `;

  shadowRoot.getElementById("gov-shield-leave-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "close_tab" });
  });

  shadowRoot.getElementById("gov-shield-dashboard-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open_dashboard" });
  });

  shadowRoot.getElementById("gov-shield-proceed-btn").addEventListener("click", () => {
    renderConfirmationDialogView(rootDiv, hostDiv, shadowRoot);
  });
}

// Proceed Confirmation View
function renderConfirmationDialogView(rootDiv, hostDiv, shadowRoot) {
  rootDiv.innerHTML = `
    <div class="gov-shield-card">
      <div class="gov-shield-header">
        <div class="gov-shield-icon-badge">⚠️</div>
        <div>
          <h4 class="gov-shield-title">Proceeding Warning</h4>
        </div>
      </div>

      <p class="gov-shield-body">
        Entering details on unverified websites puts your security at risk. Are you sure you want to proceed?
      </p>

      <label class="gov-shield-checkbox-container">
        <input type="checkbox" id="gov-shield-safe-checkbox">
        <span class="gov-shield-checkbox-label">Mark this site as safe for future visits</span>
      </label>

      <div class="gov-shield-actions">
        <button id="gov-shield-understand-btn" class="gov-shield-btn-secondary">
          I understand the risks
        </button>
        <button id="gov-shield-cancel-btn" class="gov-shield-btn-danger">
          Cancel & Leave Site
        </button>
      </div>
    </div>
  `;

  shadowRoot.getElementById("gov-shield-understand-btn").addEventListener("click", () => {
    const isChecked = shadowRoot.getElementById("gov-shield-safe-checkbox").checked;
    if (isChecked) {
      console.log("Site whitelisted for future visits:", window.location.hostname);
    }
    unlockPage(hostDiv);
  });

  shadowRoot.getElementById("gov-shield-cancel-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "close_tab" });
  });
}

function unlockPage(hostDiv) {
  togglePageInputs(false);
  if (hostDiv) hostDiv.remove();
}

function togglePageInputs(disable) {
  const inputs = document.querySelectorAll("input, textarea, select, button");
  inputs.forEach((input) => {
    if (!input.closest("#gov-shield-host")) {
      input.disabled = disable;
    }
  });
}

function checkWebsiteSafety() {
  const isScam = false;
  if (isScam) {
    showScamWarningPopup();
  }
}

if (document.readyState === "interactive" || document.readyState === "complete") {
  checkWebsiteSafety();
} else {
  document.addEventListener("DOMContentLoaded", checkWebsiteSafety);
}