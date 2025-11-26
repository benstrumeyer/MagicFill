/**
 * Learning Script - Injected into page to capture form fills
 * Listens for blur/change events and captures field data
 */

export const LEARNING_SCRIPT = `
(function() {
  const learnedFields = new Map(); // Use Map to avoid duplicates by selector
  
  // Generate stable selector for element
  function generateSelector(el) {
    // Prefer ID
    if (el.id) return '#' + el.id;
    
    // Use name attribute
    if (el.name) {
      const tag = el.tagName.toLowerCase();
      return tag + '[name="' + el.name + '"]';
    }
    
    // Use data-testid or data-qa
    const testId = el.getAttribute('data-testid') || el.getAttribute('data-qa');
    if (testId) {
      return '[data-testid="' + testId + '"]';
    }
    
    // Fallback to nth-of-type
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === el.tagName
      );
      const index = siblings.indexOf(el) + 1;
      return el.tagName.toLowerCase() + ':nth-of-type(' + index + ')';
    }
    
    return el.tagName.toLowerCase();
  }
  
  // Get human-readable label for field
  function getFieldLabel(el) {
    const labels = [];
    
    // Get label by 'for' attribute
    if (el.id) {
      const label = document.querySelector('label[for="' + el.id + '"]');
      if (label && label.textContent) {
        labels.push(label.textContent.trim());
      }
    }
    
    // Get aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) labels.push(ariaLabel);
    
    // Get placeholder
    if (el.placeholder) labels.push(el.placeholder);
    
    // Get parent label
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      const text = parentLabel.textContent.replace(el.value || '', '').trim();
      if (text) labels.push(text);
    }
    
    // Get preceding sibling text
    const prevSibling = el.previousElementSibling;
    if (prevSibling && prevSibling.textContent) {
      const text = prevSibling.textContent.trim();
      if (text && text.length < 100) labels.push(text);
    }
    
    // Fallback to name or id
    if (labels.length === 0) {
      labels.push(el.name || el.id || 'Unknown Field');
    }
    
    return labels[0]; // Return first (most relevant) label
  }
  
  // Capture field data
  function captureField(field) {
    // Skip if no value
    if (!field.value || field.value.trim() === '') return;
    
    // Skip hidden fields
    if (field.type === 'hidden') return;
    
    // Skip password fields (security)
    if (field.type === 'password') return;
    
    const selector = generateSelector(field);
    
    // Check if already captured
    if (learnedFields.has(selector)) {
      // Update value if changed
      const existing = learnedFields.get(selector);
      if (existing.value !== field.value) {
        existing.value = field.value;
        console.log('🔄 Updated:', existing.label, '=', field.value);
      }
      return;
    }
    
    const fieldData = {
      selector,
      label: getFieldLabel(field),
      value: field.value,
      type: field.tagName.toLowerCase(),
      inputType: field.type || undefined,
      timestamp: new Date().toISOString()
    };
    
    learnedFields.set(selector, fieldData);
    
    // Send to Playwright (exposed function)
    if (window.captureField) {
      window.captureField(fieldData);
    }
    
    // Visual feedback - green flash
    const originalBorder = field.style.border;
    const originalBoxShadow = field.style.boxShadow;
    
    field.style.border = '2px solid #10b981';
    field.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
    
    setTimeout(() => {
      field.style.border = originalBorder;
      field.style.boxShadow = originalBoxShadow;
    }, 1000);
    
    console.log('✓ Learned:', fieldData.label, '=', fieldData.value);
  }
  
  // Listen to blur events (when user leaves a field)
  document.addEventListener('blur', (e) => {
    const field = e.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      captureField(field);
    }
  }, true);
  
  // Listen to change events (for selects and radios)
  document.addEventListener('change', (e) => {
    const field = e.target;
    if (field.tagName === 'SELECT' || field.type === 'radio' || field.type === 'checkbox') {
      captureField(field);
    }
  }, true);
  
  // Capture all fields on form submit (catch any missed)
  document.addEventListener('submit', (e) => {
    console.log('📝 Form submitted - capturing all fields...');
    
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.value) {
        captureField(field);
      }
    });
  }, true);
  
  // Add visual indicator that learning mode is active
  const indicator = document.createElement('div');
  indicator.id = 'magicfill-learning-indicator';
  indicator.innerHTML = '🎓 MagicFill Learning Mode Active';
  indicator.style.cssText = \`
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  \`;
  
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  \`;
  
  document.head.appendChild(style);
  document.body.appendChild(indicator);
  
  // Add counter to indicator
  setInterval(() => {
    const count = learnedFields.size;
    indicator.innerHTML = \`🎓 Learning Mode: \${count} field\${count !== 1 ? 's' : ''} learned\`;
  }, 500);
  
  console.log('🎓 MagicFill Learning Mode Active!');
  console.log('Fill out the form and I will learn from you.');
  console.log('Close the browser when done to save the profile.');
})();
`;
