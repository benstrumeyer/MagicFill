import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionMessage } from '../../shared/types';
import './popup.css';

interface UnrecognizedField {
  selector: string;
  context: string;
  type: string;
  fieldType: string;
  inputType?: string;
}

interface FillResult {
  filled: number;
  total: number;
  unrecognized: UnrecognizedField[];
}

const Popup: React.FC = () => {
  const [status, setStatus] = useState({ icon: '⏳', text: 'Loading...', type: 'info' as 'success' | 'warning' | 'error' | 'info' });
  const [unrecognizedFields, setUnrecognizedFields] = useState<UnrecognizedField[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentField, setCurrentField] = useState<{ selector: string; context: string } | null>(null);
  const [answerKey, setAnswerKey] = useState('');
  const [answerValue, setAnswerValue] = useState('');
  const [siteSpecific, setSiteSpecific] = useState(false);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        setStatus({ icon: '⚠️', text: 'No active tab', type: 'warning' });
        return;
      }

      const message: ExtensionMessage = { action: 'getUnrecognizedFields' };
      const fields = await chrome.tabs.sendMessage(tab.id, message);
      
      if (fields && fields.length > 0) {
        setStatus({ icon: '✅', text: `Ready to fill (${fields.length} unrecognized)`, type: 'success' });
        setUnrecognizedFields(fields);
      } else {
        setStatus({ icon: '✅', text: 'All fields recognized', type: 'success' });
        setUnrecognizedFields([]);
      }
    } catch (error) {
      setStatus({ icon: '⚠️', text: 'Not a fillable page', type: 'warning' });
      setUnrecognizedFields([]);
    }
  };

  const fillForm = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const message: ExtensionMessage = { action: 'fillForm' };
      const result: FillResult = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result) {
        setStatus({ icon: '✨', text: `Filled ${result.filled}/${result.total} fields`, type: 'success' });
        await updateStatus();
      }
    } catch (error) {
      setStatus({ icon: '❌', text: 'Error filling form', type: 'error' });
      console.error('Fill error:', error);
    }
  };

  const openAddAnswerModal = (selector: string, context: string) => {
    setCurrentField({ selector, context });
    setAnswerKey(generateAnswerKey(context));
    setAnswerValue('');
    setSiteSpecific(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentField(null);
  };

  const saveAndFill = async () => {
    if (!answerKey.trim() || !answerValue.trim() || !currentField) {
      alert('Please fill in both key and value');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      // Add answer
      const addMessage: ExtensionMessage = {
        action: 'addAnswer',
        payload: { key: answerKey, value: answerValue, siteSpecific }
      };
      await chrome.tabs.sendMessage(tab.id, addMessage);

      // Fill the field immediately
      const fillMessage: ExtensionMessage = {
        action: 'fillField',
        payload: { selector: currentField.selector, value: answerValue }
      };
      await chrome.tabs.sendMessage(tab.id, fillMessage);

      closeModal();
      await updateStatus();
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Error saving answer');
    }
  };

  const generateAnswerKey = (context: string): string => {
    return context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openManageAnswers = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage.html') });
  };

  return (
    <div className="container">
      <header>
        <h1>✨ MagicFill</h1>
        <p className="subtitle">Auto-fill job applications</p>
      </header>

      <div className="status-section">
        <div className={`status ${status.type}`}>
          <div className="status-icon">{status.icon}</div>
          <div className="status-text">{status.text}</div>
        </div>
      </div>

      <div className="actions">
        <button onClick={fillForm} className="btn btn-primary">
          <span className="btn-icon">✨</span>
          Fill Form
        </button>
        <button onClick={openManageAnswers} className="btn btn-secondary">
          <span className="btn-icon">⚙️</span>
          Manage Answers
        </button>
      </div>

      {unrecognizedFields.length > 0 && (
        <div className="unrecognized-section">
          <h3>Unrecognized Fields</h3>
          <p className="help-text">These fields couldn't be auto-filled. Add answers to fill them next time.</p>
          <div className="field-list">
            {unrecognizedFields.map((field, index) => (
              <div key={index} className="field-item">
                <div className="field-info">
                  <div className="field-context">{truncate(field.context, 40)}</div>
                  <div className="field-type">
                    {field.fieldType} {field.inputType ? `(${field.inputType})` : ''}
                  </div>
                </div>
                <button
                  className="add-btn"
                  onClick={() => openAddAnswerModal(field.selector, field.context)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Answer</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="fieldContext">Field Context:</label>
                <input
                  type="text"
                  id="fieldContext"
                  value={currentField?.context || ''}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="answerKey">Answer Key:</label>
                <input
                  type="text"
                  id="answerKey"
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                  placeholder="e.g., preferredWorkLocation"
                />
              </div>
              <div className="form-group">
                <label htmlFor="answerValue">Answer Value:</label>
                <textarea
                  id="answerValue"
                  rows={3}
                  value={answerValue}
                  onChange={(e) => setAnswerValue(e.target.value)}
                  placeholder="Enter your answer..."
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={siteSpecific}
                    onChange={(e) => setSiteSpecific(e.target.checked)}
                  />
                  <span>Site-specific (only for this website)</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
              <button onClick={saveAndFill} className="btn btn-primary">Save & Fill Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mount React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
