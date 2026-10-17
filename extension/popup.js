document.addEventListener("DOMContentLoaded", async () => {
  // Query active tab to get the current hostname
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = new URL(tab.url).hostname;

  const toast = document.getElementById("toast");

  function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      window.close(); // Close popup after reporting
    }, 1200);
  }

  // Report Site as Fake
  document.getElementById("report-fake-btn").addEventListener("click", () => {
    console.log("Reported as fake:", hostname);
    chrome.runtime.sendMessage({ action: "report_site_fake", domain: hostname });
    showToast("Report submitted! We will analyze this site.");
  });

  // Report Site as Safe
  document.getElementById("report-safe-btn").addEventListener("click", () => {
    console.log("Reported as safe:", hostname);
    chrome.runtime.sendMessage({ action: "report_site_safe", domain: hostname });
    showToast("Site marked as safe.");
  });

  // Open Dashboard
  document.getElementById("dashboard-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open_dashboard" });
  });
});