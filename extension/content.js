console.log("SAHAYAK: Content script loaded");

// Mappings of target keys and their variation keywords
const CONFIDENCE_KEYWORDS = {
  first_name: {
    kws: ['first name', 'firstname', 'given name', 'givenname', 'fname', 'forename', 'name_first'],
    weight: 10
  },
  last_name: {
    kws: ['last name', 'lastname', 'surname', 'family name', 'familyname', 'lname', 'name_last'],
    weight: 10
  },
  middle_name: {
    kws: ['middle name', 'middlename', 'mname'],
    weight: 10
  },
  full_name: {
    kws: ['full name', 'fullname', 'applicant name', 'name', 'applicant fullname'],
    weight: 5
  },
  date_of_birth: {
    kws: ['dob', 'date of birth', 'birth date', 'birthdate', 'dob_date'],
    weight: 8
  },
  day: {
    kws: ['day', 'birth day', 'date', 'dob_day'],
    weight: 10
  },
  month: {
    kws: ['month', 'birth month', 'mm', 'dob_month'],
    weight: 10
  },
  year: {
    kws: ['year', 'birth year', 'yyyy', 'dob_year'],
    weight: 10
  },
  state: {
    kws: ['state', 'state name', 'province', 'region'],
    weight: 10
  },
  address: {
    kws: ['address', 'residential address', 'permanent address', 'communication address', 'addr', 'location', 'street address'],
    weight: 8
  },
  annual_income: {
    kws: ['annual income', 'income', 'yearly income', 'salary', 'income details'],
    weight: 10
  },
  occupation: {
    kws: ['occupation', 'profession', 'employment', 'job', 'work type'],
    weight: 10
  },
  gender: {
    kws: ['gender', 'sex', 'gender type', 'gender selection'],
    weight: 10
  }
};

// Task 2: Text Normalization (trim, lowercase, hyphens/underscores to spaces)
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase()
    .trim()
    .replace(/[\-_]/g, ' ')
    .replace(/\s+/g, ' ');
}

function matchTextNormalized(text, keywords) {
  if (!text) return false;
  const normText = normalizeText(text);
  return keywords.some(kw => {
    const normKw = normalizeText(kw);
    return normText.includes(normKw) || normKw.includes(normText);
  });
}

function getElementLabels(el) {
  const labels = [];
  
  if (el.id) {
    try {
      const escapedId = CSS.escape(el.id);
      const queryLabels = document.querySelectorAll(`label[for="${escapedId}"]`);
      for (const l of queryLabels) {
        if (l.textContent) labels.push(l.textContent);
      }
    } catch (err) {
      try {
        const allLabels = Array.from(document.getElementsByTagName('label'));
        for (const l of allLabels) {
          if (l.getAttribute('for') === el.id && l.textContent) {
            labels.push(l.textContent);
          }
        }
      } catch (innerErr) {}
    }
  }
  
  const parentLabel = el.closest('label');
  if (parentLabel && parentLabel.textContent) {
    labels.push(parentLabel.textContent);
  }
  
  const prev = el.previousElementSibling;
  if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN') && prev.textContent) {
    labels.push(prev.textContent);
  }
  
  return labels;
}

// Score elements based on confidence weights
function scoreElementForField(el, fieldName) {
  const cfg = CONFIDENCE_KEYWORDS[fieldName];
  if (!cfg) return 0;
  
  let score = 0;
  const keywords = cfg.kws;
  
  const primarySources = [];
  if (el.id) primarySources.push(el.id);
  if (el.name) primarySources.push(el.name);
  if (el.getAttribute('aria-label')) primarySources.push(el.getAttribute('aria-label'));
  
  const labels = getElementLabels(el);
  primarySources.push(...labels);

  const secondarySources = [];
  if (el.placeholder) secondarySources.push(el.placeholder);
  if (el.getAttribute('autocomplete')) secondarySources.push(el.getAttribute('autocomplete'));
  
  const tertiarySources = [];
  const parent = el.parentElement;
  if (parent) {
    tertiarySources.push(parent.innerText || parent.textContent);
  }
  
  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) {
      tertiarySources.push(legend.textContent);
    }
  }

  // Calculate score matches
  for (const src of primarySources) {
    if (matchTextNormalized(src, keywords)) score += 5;
  }
  for (const src of secondarySources) {
    if (matchTextNormalized(src, keywords)) score += 3;
  }
  for (const src of tertiarySources) {
    if (matchTextNormalized(src, keywords)) score += 2;
  }

  return score * cfg.weight;
}

function triggerEvents(el) {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Task 4: Intelligent Name Split
function parseName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: "", lastName: "" };
  }
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

function parseDOB(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return { day: "", month: "", monthName: "", year: "" };
  }
  
  const cleaned = dateStr.trim();
  let day = "", month = "", year = "";
  
  const ymdMatch = cleaned.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (ymdMatch) {
    year = ymdMatch[1];
    month = ymdMatch[2].padStart(2, '0');
    day = ymdMatch[3].padStart(2, '0');
  } else {
    const dmyMatch = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (dmyMatch) {
      day = dmyMatch[1].padStart(2, '0');
      month = dmyMatch[2].padStart(2, '0');
      year = dmyMatch[3];
    }
  }
  
  if (!day || !month || !year) {
    const parts = cleaned.split(/[-\/\s]+/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1].padStart(2, '0');
        day = parts[2].padStart(2, '0');
      } else {
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
      }
    }
  }
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIdx = parseInt(month, 10) - 1;
  const monthName = (monthIdx >= 0 && monthIdx < 12) ? months[monthIdx] : "";
  
  return { day, month, monthName, year };
}

function getDOBPossibleValues(dobStr) {
  const parsed = parseDOB(dobStr);
  if (!parsed.day || !parsed.month || !parsed.year) {
    return null;
  }
  
  const dayValues = [parsed.day, String(parseInt(parsed.day, 10))];
  const monthValues = [parsed.monthName, parsed.monthName.substring(0, 3), parsed.month, String(parseInt(parsed.month, 10))];
  const uniqueMonthValues = Array.from(new Set(monthValues)).filter(Boolean);
  const yearValues = [parsed.year];
  
  return {
    day: dayValues,
    month: uniqueMonthValues,
    year: yearValues
  };
}

// Task 7: Visibility and Editable Ignorance Check
function isFieldVisibleAndEditable(el) {
  if (!el) return false;
  
  const tagName = el.tagName.toLowerCase();
  const typeAttr = (el.type || '').toLowerCase();
  const role = el.getAttribute('role') || '';
  
  const isButton = tagName === 'button' || typeAttr === 'button' || typeAttr === 'submit' || typeAttr === 'reset';
  const isCheckboxOrRadio = typeAttr === 'checkbox' || typeAttr === 'radio';
  const isAriaControl = role === 'combobox' || role === 'listbox' || role === 'textbox';
  
  if (isButton && !isAriaControl) return false;
  if (isCheckboxOrRadio) return false;
  if (typeAttr === 'hidden') return false;
  
  if (el.disabled || el.getAttribute('disabled') !== null) return false;
  if (el.readOnly || el.getAttribute('readonly') !== null) return false;
  
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  
  if (el.offsetWidth === 0 && el.offsetHeight === 0 && style.display !== 'contents') {
    return false;
  }
  
  return true;
}

// Task 5: Native Value Setter Injection helper
function setElementValueNative(el, value) {
  try {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'input') {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      if (setter) {
        setter.call(el, value);
        return true;
      }
    } else if (tagName === 'textarea') {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      if (setter) {
        setter.call(el, value);
        return true;
      }
    } else if (tagName === 'select') {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      if (setter) {
        setter.call(el, value);
        return true;
      }
    }
  } catch (err) {
    console.warn("[SAHAYAK] Native value setter failed, falling back to assignment:", err);
  }
  
  el.value = value;
  return true;
}

// Programmatic Click Dropdown matching options
async function selectDropdownValue(element, possibleValues) {
  if (!element || !possibleValues || possibleValues.length === 0) return false;
  
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  
  const isNativeSelect = tagName === 'select';
  const isCustomDropdown = role === 'combobox' || role === 'listbox' || role === 'button' || tagName === 'button' || element.getAttribute('aria-haspopup') === 'true' || element.getAttribute('aria-haspopup') === 'listbox';

  if (isNativeSelect) {
    const options = element.options;
    let matchedIdx = -1;
    const normPossible = possibleValues.map(v => String(v).toLowerCase().trim());
    
    for (let i = 0; i < options.length; i++) {
      const optText = options[i].text.toLowerCase().trim();
      const optVal = options[i].value.toLowerCase().trim();
      
      if (normPossible.includes(optText) || normPossible.includes(optVal) ||
          normPossible.some(v => optText.includes(v) || optVal.includes(v))) {
        matchedIdx = i;
        break;
      }
    }
    
    if (matchedIdx !== -1) {
      element.selectedIndex = matchedIdx;
      triggerEvents(element);
      return true;
    }
    return false;
  }
  
  if (isCustomDropdown) {
    console.log(`[SAHAYAK] Clicking custom dropdown:`, element);
    element.click();
    
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const normPossible = possibleValues.map(v => String(v).toLowerCase().trim());
    const optionCandidates = Array.from(document.querySelectorAll('[role="option"], [role="listitem"], li, .vR13fe, .quantumWizMenuPapermsmenuOption'));
    
    let targetOption = null;
    for (const opt of optionCandidates) {
      const optText = opt.textContent.toLowerCase().trim();
      const optVal = (opt.getAttribute('data-value') || opt.getAttribute('value') || '').toLowerCase().trim();
      
      if (normPossible.includes(optText) || normPossible.includes(optVal) ||
          normPossible.some(v => optText.includes(v) || optVal.includes(v))) {
        if (opt.offsetWidth > 0 || opt.offsetHeight > 0) {
          targetOption = opt;
          break;
        }
      }
    }
    
    if (!targetOption) {
      const allDivs = Array.from(document.querySelectorAll('div, span, li'));
      for (const opt of allDivs) {
        const optText = opt.textContent.toLowerCase().trim();
        if (normPossible.includes(optText) || normPossible.some(v => optText.includes(v))) {
          if (opt.offsetWidth > 0 || opt.offsetHeight > 0) {
            const parentPopup = opt.closest('[role="listbox"], [role="menu"], .isOpen, .popup, .dropdown');
            if (parentPopup) {
              targetOption = opt;
              break;
            }
          }
        }
      }
    }
    
    if (targetOption) {
      console.log(`[SAHAYAK] Selecting custom option:`, targetOption);
      targetOption.click();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      triggerEvents(element);
      
      const listbox = targetOption.closest('[role="listbox"]');
      if (listbox) triggerEvents(listbox);
      
      return true;
    }
  }

  // Fallback for inputs
  return autofillElement(element, possibleValues[0]);
}

function autofillElement(el, value) {
  if (!el || value === undefined || value === null) return false;
  
  if (setElementValueNative(el, value)) {
    triggerEvents(el);
    const valAfter = el.value || el.innerText || el.textContent;
    console.log("[SAHAYAK] Value after fill", valAfter);
    return true;
  }
  return false;
}

function verifyFieldFilled(el, possibleValues) {
  const val = (el.value || el.innerText || el.textContent || '').trim().toLowerCase();
  if (!val) return false;
  
  const placeholder = (el.placeholder || el.getAttribute('placeholder') || '').trim().toLowerCase();
  if (placeholder && val === placeholder) return false;
  
  const normPossible = possibleValues.map(v => String(v).toLowerCase().trim());
  return normPossible.includes(val) || normPossible.some(v => val.includes(v)) || val !== '';
}

async function runAutofill(profile) {
  console.log("SAHAYAK: Autofill started");
  console.log("SAHAYAK: Profile received", profile);

  try {
    if (!profile) {
      console.error("SAHAYAK: No profile data found");
      return { filledCount: 0, failedCount: 0, unmatchedFieldNames: [] };
    }

    // Get all candidate elements
    const allCandidates = Array.from(document.querySelectorAll(
      'input, select, textarea, [contenteditable="true"], [role="textbox"], [role="combobox"], [role="listbox"], [role="button"]'
    ));
    
    // Task 7: Filter candidates to only keep visible and editable fields
    const candidates = allCandidates.filter(isFieldVisibleAndEditable);
    console.log("SAHAYAK: Total candidate elements", candidates.length);
    
    // Log all fields found
    candidates.forEach(element => {
      console.log("[SAHAYAK] Found field:", {
        tag: element.tagName,
        type: element.type,
        id: element.id,
        name: element.name,
        placeholder: element.placeholder,
        ariaLabel: element.getAttribute("aria-label"),
        autocomplete: element.autocomplete,
        role: element.getAttribute("role")
      });
      const labels = getElementLabels(element);
      if (labels.length > 0) {
        console.log("[SAHAYAK] Detected label:", labels[0]);
      }
    });

    const nameData = parseName(profile.full_name || profile.fullName);
    const dobData = parseDOB(profile.date_of_birth || profile.dateOfBirth);
    const dobValues = getDOBPossibleValues(profile.date_of_birth || profile.dateOfBirth);

    // Score all candidates using confidence scoring
    const detectedMappings = {
      first_name: [],
      last_name: [],
      middle_name: [],
      full_name: [],
      date_of_birth: [],
      day: [],
      month: [],
      year: [],
      state: [],
      address: [],
      annual_income: [],
      occupation: [],
      gender: []
    };
    
    for (const el of candidates) {
      let bestField = null;
      let highestScore = 0;
      
      for (const fieldName of Object.keys(CONFIDENCE_KEYWORDS)) {
        const score = scoreElementForField(el, fieldName);
        if (score > highestScore) {
          highestScore = score;
          bestField = fieldName;
        }
      }
      
      if (highestScore > 0 && bestField) {
        detectedMappings[bestField].push({ el, score: highestScore });
      }
    }

    // Show the final detected mapping
    console.log("Detected fields:");
    const logObj = {};
    Object.entries(detectedMappings).forEach(([key, items]) => {
      if (items.length > 0) {
        logObj[key] = items.map(item => ({
          tag: item.el.tagName,
          id: item.el.id,
          name: item.el.name,
          score: item.score
        }));
      }
    });
    console.log(logObj);

    // Dynamic field inputs mapping values
    const valuesToFill = {
      first_name: [nameData.firstName],
      last_name: [nameData.lastName],
      middle_name: [nameData.middleName],
      full_name: [nameData.fullName],
      day: dobValues ? dobValues.day : [dobData.day],
      month: dobValues ? dobValues.month : [dobData.monthName, dobData.month],
      year: dobValues ? dobValues.year : [dobData.year],
      date_of_birth: [profile.date_of_birth || profile.dateOfBirth],
      state: [profile.state],
      address: [profile.address],
      annual_income: [profile.annual_income || profile.annualIncome],
      occupation: [profile.occupation],
      gender: [profile.gender || profile.sex]
    };

    let filledCount = 0;
    let failedCount = 0;
    const unmatchedFieldNames = [];
    
    // Task 8: Prevent duplicate filling (track filled nodes)
    const filledElements = new Set();

    for (const [fieldName, items] of Object.entries(detectedMappings)) {
      const vals = valuesToFill[fieldName];
      if (!vals || vals.length === 0 || vals[0] === undefined || vals[0] === null || vals[0] === '') {
        continue;
      }
      
      if (items.length === 0) {
        unmatchedFieldNames.push(fieldName);
        continue;
      }
      
      console.log(`[SAHAYAK] Matched as ${fieldName.toUpperCase()}`);
      
      for (const item of items) {
        if (filledElements.has(item.el)) {
          continue; // skip duplicate elements
        }
        
        console.log(`[SAHAYAK] Filling value: ${vals[0]}`);
        let success = false;
        
        if (['day', 'month', 'year', 'gender'].includes(fieldName)) {
          success = await selectDropdownValue(item.el, vals);
        } else {
          success = autofillElement(item.el, vals[0]);
        }
        
        if (success) {
          if (verifyFieldFilled(item.el, vals)) {
            console.log(`[SAHAYAK] Successfully filled field`);
            filledCount++;
            filledElements.add(item.el);
          } else {
            console.warn(`[SAHAYAK] Value was not accepted by the webpage`);
            failedCount++;
          }
        } else {
          failedCount++;
        }
      }
    }

    console.log("SAHAYAK: Autofill completed");
    return { filledCount, failedCount, unmatchedFieldNames };

  } catch (error) {
    console.error("SAHAYAK AUTOFILL ERROR:", error);
    return { filledCount: 0, failedCount: 0, unmatchedFieldNames: [] };
  }
}

// Register message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("SAHAYAK: Autofill message received", message);
  if (message.action === "AUTOFILL_PROFILE") {
    let attempts = 0;
    const maxAttempts = 6;
    
    async function attemptAutofill() {
      console.log(`[SAHAYAK] Autofill attempt ${attempts + 1} of ${maxAttempts}...`);
      const result = await runAutofill(message.profile);
      
      if (result.filledCount > 0 || attempts >= maxAttempts - 1) {
        sendResponse({ 
          success: true, 
          filledCount: result.filledCount, 
          failedCount: result.failedCount,
          unmatchedCount: result.unmatchedFieldNames.length,
          unmatchedFields: result.unmatchedFieldNames
        });
      } else {
        attempts++;
        setTimeout(attemptAutofill, 500);
      }
    }
    
    attemptAutofill();
  }
  return true;
});
