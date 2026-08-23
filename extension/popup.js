const BACKEND_URL = 'https://sahayak-seven-rho.vercel.app';

// UI Elements
const statusBadge = document.getElementById('connection-status');
const alertBanner = document.getElementById('alert-banner');
const refreshBtn = document.getElementById('refresh-btn');
const autofillBtn = document.getElementById('autofill-btn');
const spinnerIcon = refreshBtn ? refreshBtn.querySelector('.spinner-icon') : null;
const btnText = document.getElementById('btn-text');

// State Cache
let currentProfile = null;
const unmaskedFields = new Set(); // Tracks which sensitive fields are currently unmasked

// Profile fields
const fields = {
  name: document.getElementById('profile-name'),
  dob: document.getElementById('profile-dob'),
  gender: document.getElementById('profile-gender'),
  father: document.getElementById('profile-father'),
  mother: document.getElementById('profile-mother'),
  blood: document.getElementById('profile-blood'),
  aadhaar: document.getElementById('profile-aadhaar'),
  pan: document.getElementById('profile-pan'),
  dl: document.getElementById('profile-dl'),
  voter: document.getElementById('profile-voter'),
  address: document.getElementById('profile-address'),
  state: document.getElementById('profile-state'),
  district: document.getElementById('profile-district'),
  city: document.getElementById('profile-city'),
  pin: document.getElementById('profile-pin'),
  income: document.getElementById('profile-income'),
  occupation: document.getElementById('profile-occupation')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Load cached profile first
  loadCachedProfile();
  
  // Attach refresh button click
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchProfileFromBackend();
    });
  }

  // Attach autofill button click
  if (autofillBtn) {
    autofillBtn.addEventListener('click', () => {
      handleAutofillClick();
    });
  }

  // Attach toggle unmask click handlers for sensitive fields
  ['aadhaar', 'pan', 'dl', 'voter'].forEach(fieldKey => {
    const el = fields[fieldKey];
    if (el) {
      el.style.cursor = 'pointer';
      el.title = 'Click to toggle mask';
      el.addEventListener('click', () => {
        if (unmaskedFields.has(fieldKey)) {
          unmaskedFields.delete(fieldKey);
        } else {
          unmaskedFields.add(fieldKey);
        }
        renderProfile(currentProfile);
      });
    }
  });
});

function updateStatus(connected) {
  if (!statusBadge) return;
  if (connected) {
    statusBadge.className = 'status-badge connected';
    statusBadge.querySelector('.status-text').textContent = 'Connected';
  } else {
    statusBadge.className = 'status-badge disconnected';
    statusBadge.querySelector('.status-text').textContent = 'Disconnected';
  }
}

function showAlert(message, type = 'error') {
  if (!alertBanner) return;
  alertBanner.textContent = message;
  alertBanner.className = `alert-banner ${type}`;
}

function hideAlert() {
  if (!alertBanner) return;
  alertBanner.className = `alert-banner hidden`;
}

/**
 * Mask sensitive identity numbers for secure popup display
 */
function maskValue(key, val) {
  if (!val) return '';
  if (unmaskedFields.has(key)) return val; // User explicitly unmasked

  if (key === 'aadhaar') {
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 8) {
      return `XXXX XXXX ${digits.slice(-4)}`;
    }
    return 'XXXX-XXXX-XXXX';
  }
  if (key === 'pan') {
    if (val.length >= 6) {
      return `${val.slice(0, 2)}XXX${val.slice(-2)}`;
    }
    return 'XXXXX-XXXX';
  }
  if (key === 'dl' || key === 'voter') {
    if (val.length >= 6) {
      return `${val.slice(0, 3)}****${val.slice(-3)}`;
    }
    return '******';
  }
  return val;
}

/**
 * Maps all potential field alias keys into a single canonical profile object
 */
function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    full_name: profile.full_name || profile.fullName || "",
    date_of_birth: profile.date_of_birth || profile.dob || profile.dateOfBirth || "",
    gender: profile.gender || profile.sex || "",
    father_name: profile.father_name || profile.fatherName || profile.father_or_husband_name || "",
    mother_name: profile.mother_name || profile.motherName || "",
    blood_group: profile.blood_group || profile.bloodGroup || "",
    aadhaar_number: profile.aadhaar_number || profile.aadhaar || profile.aadhaarNumber || "",
    pan_number: profile.pan_number || profile.pan || profile.panNumber || "",
    driving_licence_number: profile.driving_licence_number || profile.driving_licence || profile.driving_license_number || profile.drivingLicenceNumber || profile.drivingLicenseNumber || "",
    voter_id_number: profile.voter_id_number || profile.voter_id || profile.voterIdNumber || "",
    address: profile.address || profile.raw_address_text || "",
    state: profile.state || "",
    district: profile.district || "",
    city: profile.city || profile.city_locality || "",
    pin_code: profile.pin_code || profile.pinCode || profile.pincode || "",
    annual_income: profile.annual_income != null ? String(profile.annual_income) : (profile.annualIncome || ""),
    occupation: profile.occupation || ""
  };
}

function renderProfile(profile) {
  currentProfile = normalizeProfile(profile);
  
  if (!currentProfile) {
    // Show empty state for all fields
    Object.values(fields).forEach(el => {
      if (!el) return;
      el.textContent = 'Not Loaded';
      el.className = 'detail-val empty-val';
      const itemContainer = el.closest('.detail-item');
      if (itemContainer) itemContainer.style.display = 'flex';
    });
    // Ensure all sections are visible
    document.querySelectorAll('.section-container').forEach(sec => {
      sec.style.display = 'flex';
    });
    if (autofillBtn) autofillBtn.disabled = true;
    return;
  }

  // Populate fields
  const mappings = {
    name: currentProfile.full_name,
    dob: currentProfile.date_of_birth,
    gender: currentProfile.gender,
    father: currentProfile.father_name,
    mother: currentProfile.mother_name,
    blood: currentProfile.blood_group,
    aadhaar: maskValue('aadhaar', currentProfile.aadhaar_number),
    pan: maskValue('pan', currentProfile.pan_number),
    dl: maskValue('dl', currentProfile.driving_licence_number),
    voter: maskValue('voter', currentProfile.voter_id_number),
    address: currentProfile.address,
    state: currentProfile.state,
    district: currentProfile.district,
    city: currentProfile.city,
    pin: currentProfile.pin_code,
    income: currentProfile.annual_income,
    occupation: currentProfile.occupation
  };

  Object.entries(mappings).forEach(([key, val]) => {
    const el = fields[key];
    if (!el) return;
    const itemContainer = el.closest('.detail-item');
    if (val) {
      el.textContent = val;
      el.className = 'detail-val';
      if (itemContainer) itemContainer.style.display = 'flex';
    } else {
      el.textContent = 'Empty';
      el.className = 'detail-val empty-val';
      if (itemContainer) itemContainer.style.display = 'none'; // Hide empty values
    }
  });

  // Hide section containers if all their child detail-items are hidden
  const sections = document.querySelectorAll('.section-container');
  sections.forEach(sec => {
    const items = sec.querySelectorAll('.detail-item');
    const hasVisible = Array.from(items).some(item => item.style.display !== 'none');
    sec.style.display = hasVisible ? 'flex' : 'none';
  });

  // Enable autofill button if any details exist
  const hasAnyData = Object.values(currentProfile).some(val => !!val);
  if (autofillBtn) autofillBtn.disabled = !hasAnyData;
}

function loadCachedProfile() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['verifiedProfile', 'sahayak_token', 'lastConnected'], (result) => {
      if (result.verifiedProfile) {
        renderProfile(result.verifiedProfile);
        updateStatus(result.lastConnected || true);
      }
      fetchProfileFromBackend();
    });
  } else {
    fetchProfileFromBackend();
  }
}

async function fetchProfileFromBackend() {
  hideAlert();
  if (refreshBtn) refreshBtn.disabled = true;
  if (spinnerIcon) spinnerIcon.classList.add('spinning');
  if (btnText) btnText.textContent = 'Refreshing...';

  try {
    // 1. Check for stored token in extension storage
    let token = null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(['sahayak_token', 'verifiedProfile']);
      token = stored.sahayak_token;
      if (stored.verifiedProfile && !currentProfile) {
        renderProfile(stored.verifiedProfile);
      }
    }

    // 1b. Fallback: Query open SAHAYAK tabs to sync token & profile directly from web app
    if (!token && typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      try {
        const tabs = await chrome.tabs.query({
          url: ["https://*.vercel.app/*", "http://localhost:*/*", "http://127.0.0.1:*/*"]
        });
        for (const tab of tabs) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => ({
                token: localStorage.getItem('sahayak_token'),
                profile: localStorage.getItem('sahayak_user_profile')
              })
            });
            if (results && results[0] && results[0].result) {
              const res = results[0].result;
              if (res.token) {
                token = res.token;
                chrome.storage.local.set({ sahayak_token: token });
              }
              if (res.profile && !currentProfile) {
                try {
                  const parsed = JSON.parse(res.profile);
                  renderProfile(parsed);
                  chrome.storage.local.set({ verifiedProfile: parsed, lastConnected: true });
                } catch (pe) {}
              }
            }
            if (token) break;
          } catch (te) {}
        }
      } catch (qe) {}
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}/api/profile`, {
      method: 'GET',
      headers: headers
    });

    if (res.ok) {
      const data = await res.json();
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
        return;
      }
    }

    // If fetch was 401 or not ok, check if cached profile exists from web app
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(['verifiedProfile']);
      if (stored.verifiedProfile) {
        renderProfile(stored.verifiedProfile);
        updateStatus(true);
        return;
      }
    }

    renderProfile(null);
    updateStatus(false);
    showAlert('Please log in and save your profile on the SAHAYAK website first.', 'info');

  } catch (err) {
    console.error('[SAHAYAK Extension] Connection failed:', err);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(['verifiedProfile']);
      if (stored.verifiedProfile) {
        renderProfile(stored.verifiedProfile);
        updateStatus(true);
        return;
      }
    }
    updateStatus(false);
    showAlert('Unable to connect to SAHAYAK server.', 'error');
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
    if (spinnerIcon) spinnerIcon.classList.remove('spinning');
    if (btnText) btnText.textContent = 'Refresh Profile';
  }
}

function handleAutofillClick() {
  if (!currentProfile) {
    showAlert('No profile loaded. Please refresh/load your profile first.', 'error');
    return;
  }

  // Retrieve current active tab
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const activeTab = tabs[0];
        
        // Dispatch message to content script inside active tab (with full UNMASKED data)
        chrome.tabs.sendMessage(activeTab.id, {
          action: "AUTOFILL_PROFILE",
          profile: currentProfile
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("SAHAYAK: Message sending failed:", chrome.runtime.lastError.message);
            showAlert("Could not connect to the page. Please refresh the page and try again.", "error");
            return;
          }
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
    console.log('[SAHAYAK Extension] Mock active tab autofill dispatch:', currentProfile);
    showAlert('Autofill request sent to this page. (Mock)', 'info');
  }
}
