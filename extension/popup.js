const BACKEND_URL = 'http://127.0.0.1:8001';

// UI Elements
const statusBadge = document.getElementById('connection-status');
const alertBanner = document.getElementById('alert-banner');
const refreshBtn = document.getElementById('refresh-btn');
const autofillBtn = document.getElementById('autofill-btn');
const spinnerIcon = refreshBtn.querySelector('.spinner-icon');
const btnText = document.getElementById('btn-text');

// State Cache
let currentProfile = null;

// Profile fields
const fields = {
  name: document.getElementById('profile-name'),
  dob: document.getElementById('profile-dob'),
  state: document.getElementById('profile-state'),
  address: document.getElementById('profile-address'),
  income: document.getElementById('profile-income'),
  occupation: document.getElementById('profile-occupation')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Load cached profile first
  loadCachedProfile();
  
  // Attach refresh button click
  refreshBtn.addEventListener('click', () => {
    fetchProfileFromBackend();
  });

  // Attach autofill button click
  autofillBtn.addEventListener('click', () => {
    handleAutofillClick();
  });
});

function updateStatus(connected) {
  if (connected) {
    statusBadge.className = 'status-badge connected';
    statusBadge.querySelector('.status-text').textContent = 'Connected';
  } else {
    statusBadge.className = 'status-badge disconnected';
    statusBadge.querySelector('.status-text').textContent = 'Disconnected';
  }
}

function showAlert(message, type = 'error') {
  alertBanner.textContent = message;
  alertBanner.className = `alert-banner ${type}`;
}

function hideAlert() {
  alertBanner.className = 'alert-banner hidden';
}

function renderProfile(profile) {
  console.log("SAHAYAK: Profile received", profile);
  currentProfile = profile;
  if (!profile) {
    // Show empty state for all fields
    Object.values(fields).forEach(el => {
      el.textContent = 'Not Loaded';
      el.className = 'detail-val empty-val';
    });
    autofillBtn.disabled = true;
    return;
  }

  // Populate fields
  const mappings = {
    name: profile.full_name,
    dob: profile.date_of_birth,
    state: profile.state,
    address: profile.address,
    income: profile.annual_income,
    occupation: profile.occupation
  };

  Object.entries(mappings).forEach(([key, val]) => {
    const el = fields[key];
    if (val) {
      el.textContent = val;
      el.className = 'detail-val';
    } else {
      el.textContent = 'Empty';
      el.className = 'detail-val empty-val';
    }
  });

  // Enable autofill button if any details exist
  autofillBtn.disabled = false;
}

function loadCachedProfile() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['verifiedProfile', 'lastConnected'], (result) => {
      if (result.verifiedProfile) {
        renderProfile(result.verifiedProfile);
        updateStatus(result.lastConnected || false);
      } else {
        fetchProfileFromBackend();
      }
    });
  } else {
    fetchProfileFromBackend();
  }
}

async function fetchProfileFromBackend() {
  console.log("SAHAYAK: Fetching profile");
  hideAlert();
  refreshBtn.disabled = true;
  spinnerIcon.classList.add('spinning');
  btnText.textContent = 'Refreshing...';

  try {
    const res = await fetch(`${BACKEND_URL}/profile`, {
      method: 'GET'
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    console.log('[SAHAYAK Extension] Fetched profile:', data);

    if (data.success && data.profile) {
      const profile = data.profile;
      renderProfile(profile);
      updateStatus(true);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          verifiedProfile: profile,
          lastConnected: true
        });
      }
    } else {
      renderProfile(null);
      updateStatus(true);
      showAlert(data.message || 'No verified profile found. Please complete your profile on the SAHAYAK website first.', 'info');
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          verifiedProfile: null,
          lastConnected: true
        });
      }
    }

  } catch (err) {
    console.error('[SAHAYAK Extension] Connection failed:', err);
    updateStatus(false);
    showAlert('Unable to connect to SAHAYAK. Please make sure the backend is running.', 'error');
  } finally {
    refreshBtn.disabled = false;
    spinnerIcon.classList.remove('spinning');
    btnText.textContent = 'Refresh Profile';
  }
}

function handleAutofillClick() {
  console.log("SAHAYAK: Autofill button clicked");
  if (!currentProfile) {
    showAlert('No profile loaded. Please refresh/load your profile first.', 'error');
    return;
  }

  // Retrieve current active tab
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const activeTab = tabs[0];
        console.log("SAHAYAK: Sending profile data to tab ID:", activeTab.id);
        
        // Dispatch message to content script inside active tab
        chrome.tabs.sendMessage(activeTab.id, {
          action: "AUTOFILL_PROFILE",
          profile: currentProfile
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("SAHAYAK: Message sending failed:", chrome.runtime.lastError.message);
            showAlert("Could not connect to the page. Please refresh the page and try again.", "error");
            return;
          }
          console.log("SAHAYAK: Message sent successfully.");
          console.log('[SAHAYAK Extension] Autofill response:', response);
          if (response && response.success) {
            const { filledCount, unmatchedCount, unmatchedFields } = response;
            if (unmatchedCount === 0) {
              showAlert(`✓ ${filledCount} fields filled successfully`, 'info');
            } else {
              const fieldsStr = unmatchedFields && unmatchedFields.length > 0 
                ? ` (unmatched: ${unmatchedFields.join(', ')})`
                : '';
              showAlert(`${filledCount} fields filled. ${unmatchedCount} fields could not be matched${fieldsStr}.`, 'info');
            }
          } else {
            showAlert('Autofill request sent to this page.', 'info');
          }
        });
      } else {
        showAlert('No active page detected.', 'error');
      }
    });
  } else {
    // Mock logging when previewing outside extension context
    console.log("SAHAYAK: Message sent successfully.");
    console.log('[SAHAYAK Extension] Mock active tab autofill dispatch:', currentProfile);
    showAlert('Autofill request sent to this page. (Mock)', 'info');
  }
}
