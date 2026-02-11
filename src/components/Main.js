import React, { useState, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { toast } from 'sonner';
import '../styles/Main.css';

export default function Main() {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    unsafe: '',
    location: '',
    observerName: '',
    company: '',
    position: '',
    date: '',
    time: '',
    incidentDetails: '',
    correctiveActions: '',
    lifeSavingRules: [],
    causalFactors: [],
    stopWorkEnforced: '',
    stopWorkActions: '',
    stopWorkEvidence: null,
    otherCausalFactors: '',
    otherLifeSavingRules: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    if (name === 'otherCausalFactors') {
      setFormData({
        ...formData,
        otherCausalFactors: value,
      });
      return;
    }

    if (name === 'otherLifeSavingRules') {
      setFormData({
        ...formData,
        otherLifeSavingRules: value,
      });
      return;
    }

    if (type === 'checkbox') {
      if (name === 'lifeSavingRules') {
        setFormData(prevData => {
          if (checked) {
            return {
              ...prevData,
              lifeSavingRules: [...prevData.lifeSavingRules, value],
            };
          } else {
            return {
              ...prevData,
              lifeSavingRules: prevData.lifeSavingRules.filter(rule => rule !== value),
            };
          }
        });
      } else if (name === 'causalFactors') {
        setFormData(prevData => {
          if (checked) {
            return {
              ...prevData,
              causalFactors: [...prevData.causalFactors, value],
            };
          } else {
            return {
              ...prevData,
              causalFactors: prevData.causalFactors.filter(factor => factor !== value),
            };
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = step => {
    const errors = {};

    if (step === 1) {
      if (!formData.unsafe) {
        errors.unsafe = 'Please select an unsafe act or condition.';
      }
      if (!formData.location) {
        errors.location = 'Location is required.';
      }
      if (!formData.observerName) {
        errors.observerName = 'Observer name is required.';
      }
      if (!formData.company) {
        errors.company = 'Company is required.';
      }
      if (!formData.position) {
        errors.position = 'Position is required.';
      }
      if (!formData.date) {
        errors.date = 'Date is required.';
      }
      if (!formData.time) {
        errors.time = 'Time is required.';
      }
    }

    if (step === 2) {
      if (!formData.incidentDetails) {
        errors.incidentDetails = 'Incident details are required.';
      }
      if (!formData.correctiveActions) {
        errors.correctiveActions = 'Corrective actions are required.';
      }
    }

    if (step === 3) {
      if (formData.lifeSavingRules.length === 0) {
        errors.lifeSavingRules = 'Please select at least one life-saving rule.';
      }
      if (
        formData.lifeSavingRules.includes('Others') &&
        (!formData.otherLifeSavingRules || formData.otherLifeSavingRules.trim() === '')
      ) {
        errors.otherLifeSavingRules = 'Please specify other life-saving rules.';
      }
      if (formData.causalFactors.length === 0) {
        errors.causalFactors = 'Please select at least one causal factor.';
      }
      if (
        formData.causalFactors.includes('Others') &&
        (!formData.otherCausalFactors || formData.otherCausalFactors.trim() === '')
      ) {
        errors.otherCausalFactors = 'Please specify other causal factors.';
      }
    }

    if (step === 4) {
      if (!formData.stopWorkEnforced) {
        errors.stopWorkEnforced = 'Please select if stop work authority was enforced.';
      }
      if (
        formData.stopWorkEnforced === 'yes' &&
        (!formData.stopWorkActions || formData.stopWorkActions.trim() === '')
      ) {
        errors.stopWorkActions = 'Please provide the actions taken for stop work authority.';
      }
      if (
        formData.stopWorkEvidence &&
        !['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'].includes(formData.stopWorkEvidence.type)
      ) {
        errors.stopWorkEvidence = 'Unsupported file type. Please upload a PNG, JPG, GIF, or SVG file.';
      }
      if (formData.stopWorkEvidence && formData.stopWorkEvidence.size > 5242880) {
        errors.stopWorkEvidence = 'File size must be less than 5MB.';
      }
    }

    // Show toast messages for any errors
    Object.values(errors).forEach(error => {
      toast.error(error);
    });

    return Object.keys(errors).length === 0;
  };

  const handleDragOver = event => {
    event.preventDefault();
  };

  const handleDrop = event => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFormData({ ...formData, stopWorkEvidence: file });
  };

  const handleFileChange = event => {
    const file = event.target.files[0];
    setFormData({ ...formData, stopWorkEvidence: file });
  };

  const handleNext = () => {
    if (validateForm(step)) {
      setStep(step + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm(4)) {
      return;
    }

    setIsSubmitting(true);
    setStatus('Processing...');

    try {
      let fileUrl = '';

      // 1. Upload file to Vercel Blob if present
      if (formData.stopWorkEvidence) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (formData.stopWorkEvidence.size > MAX_FILE_SIZE) {
          toast.error('File must be less than 5MB.');
          setIsSubmitting(false);
          setStatus('');
          return;
        }

        if (!formData.stopWorkEvidence.type.startsWith('image/')) {
          toast.error('Please upload an image file.');
          setIsSubmitting(false);
          setStatus('');
          return;
        }

        setStatus('Uploading attachment...');
        const newBlob = await upload(formData.stopWorkEvidence.name, formData.stopWorkEvidence, {
          access: 'public',
          handleUploadUrl: '/api/blob-upload',
        });
        fileUrl = newBlob.url;
      }

      // 2. Send form data + image URL to backend
      setStatus('Sending message...');
      const formPayload = {
        unsafe: formData.unsafe,
        location: formData.location,
        observerName: formData.observerName,
        company: formData.company,
        position: formData.position,
        date: formData.date,
        time: formData.time,
        incidentDetails: formData.incidentDetails,
        correctiveActions: formData.correctiveActions,
        lifeSavingRules: formData.lifeSavingRules,
        otherLifeSavingRules: formData.otherLifeSavingRules || '',
        causalFactors: formData.causalFactors,
        otherCausalFactors: formData.otherCausalFactors || '',
        stopWorkEnforced: formData.stopWorkEnforced,
        stopWorkActions: formData.stopWorkActions,
        fileUrl: fileUrl,
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPayload),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Submitted successfully!');
        setFormSubmitted(true);
        setStatus('');
      } else {
        throw new Error(responseData.error || 'Failed to submit.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
      setStatus('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main">
      <div className="main-img">
        <div className="overlay">
          <h1>HOC CARD</h1>
          <p>Hazard Observation Card</p>
        </div>
      </div>

      <div className="main-form">
        <div className="form-header">
          <img src="/images/logo.png" alt="Dexter Logo" />
        </div>

        {formSubmitted ? (
          <div className="success-message">
            <div className="success-icon">
              <img src="/images/success.png" alt="success icon" />
            </div>
            <h2>HOC card has been submitted successfully</h2>
            <button onClick={() => window.location.reload()} className="finish-button">
              Finish
            </button>
          </div>
        ) : (
          <div className="form-content">
            <div className="form-title">
              <h2>HOC CARD</h2>
              <p>Page {step}/4</p>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <p>Unsafe Act or Unsafe Condition?</p>
                  <div className="radio-group">
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="unsafe"
                        value="act"
                        checked={formData.unsafe === 'act'}
                        onChange={handleChange}
                      />
                      <label htmlFor="act">Unsafe Act</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="unsafe"
                        value="condition"
                        checked={formData.unsafe === 'condition'}
                        onChange={handleChange}
                      />
                      <label htmlFor="condition">Unsafe Condition</label>
                    </div>
                  </div>

                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} />


                  <label>Observer Name</label>
                  <input type="text" name="observerName" value={formData.observerName} onChange={handleChange} />


                  <label>Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} />


                  <label>Position</label>
                  <input type="text" name="position" value={formData.position} onChange={handleChange} />


                  <div className="date-time-group">
                    <div className="date-field">
                      <label htmlFor="date">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={e => {
                          const selectedDate = new Date(e.target.value);
                          const today = new Date();

                          if (e.target.value !== '') {
                            if (selectedDate > today) {
                              alert('You cannot select a future date.');
                              e.target.value = today.toISOString().split('T')[0];
                            } else {
                              handleChange(e);
                            }
                          }
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        onClick={e => e.target.showPicker()}
                      />


                    </div>
                    <div className="time-field">
                      <label htmlFor="time">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        onClick={e => e.target.showPicker()}
                      />

                    </div>
                  </div>

                  <button type="button" onClick={handleNext}>
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <label>Comprehensive Incident Details</label>
                  <textarea
                    name="incidentDetails"
                    value={formData.incidentDetails}
                    onChange={handleChange}
                    placeholder="Description of incident details"></textarea>


                  <label>Actions Taken or Proposed for Correction</label>
                  <textarea
                    name="correctiveActions"
                    value={formData.correctiveActions}
                    onChange={handleChange}
                    placeholder="Description of Actions Implemented"></textarea>


                  <div className="button-group">
                    <button className="back" type="button" onClick={handleBack}>
                      Back
                    </button>
                    <button type="button" onClick={handleNext}>
                      Next
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 id="savings">Life-Saving Rules Violated?</h3>
                  <div className="checkbox-group">
                    {[
                      'None',
                      'Work Permit',
                      'Energized System',
                      'Overriding Equipment Safety',
                      'Working at Height',
                      'Smoking, Drug, and Alcohol',
                      'Lifting Operations',
                      'Toxic Gases',
                      'Confined Space',
                      'Management of Change',
                      'Suspended Load',
                      'Driving Safety',
                      'Journey Management',
                      'Others',
                    ].map(rule => (
                      <label key={rule} className="custom-checkbox-label">
                        <input
                          type="checkbox"
                          name="lifeSavingRules"
                          value={rule}
                          checked={formData.lifeSavingRules.includes(rule)}
                          onChange={handleChange}
                          disabled={formData.lifeSavingRules.includes('None') && rule !== 'None'}
                        />
                        <span className="custom-checkbox"></span>
                        {rule}
                      </label>
                    ))}
                  </div>
                  {formData.lifeSavingRules.includes('Others') && (
                    <input
                      type="text"
                      name="otherLifeSavingRules"
                      placeholder="Please specify other life-saving rules"
                      value={formData.otherLifeSavingRules}
                      onChange={handleChange}
                      className="text-input"
                      disabled={formData.lifeSavingRules.includes('None')}
                    />
                  )}


                  <h3 id="causal">Likely Causal Factor(s)?</h3>
                  <div className="checkbox-group">
                    {[
                      'None',
                      'Human Error',
                      'Poor Chemical Handling',
                      'Fall Protection',
                      'Defective Equipment',
                      'Inadequate Planning',
                      'Poor Housekeeping',
                      'By-Passing Safety Features',
                      'No/Poor Supervision',
                      'Radiation Exposure',
                      'Road Condition',
                      'Line of Fire',
                      'Poor Training',
                      'Working Without PTW/JSA',
                      'No/Inadequate PPE',
                      'Poor Visibility',
                      'Inadequate Guards',
                      'Pressurized Vessel',
                      'Procedure Not Followed',
                      'Lack of Competence',
                      'Weather Condition',
                      'Inadequate Ventilation',
                      'Explosive Atmosphere',
                      'Noise Exposure',
                      'Improper Loading',
                      'Others',
                    ].map(factor => (
                      <label key={factor} className="custom-checkbox-label">
                        <input
                          type="checkbox"
                          name="causalFactors"
                          value={factor}
                          checked={formData.causalFactors.includes(factor)}
                          onChange={handleChange}
                          disabled={formData.causalFactors.includes('None') && factor !== 'None'}
                        />
                        <span className="custom-checkbox"></span>
                        {factor}
                      </label>
                    ))}
                  </div>
                  {formData.causalFactors.includes('Others') && (
                    <input
                      type="text"
                      name="otherCausalFactors"
                      placeholder="Please specify other causal factors"
                      value={formData.otherCausalFactors}
                      onChange={handleChange}
                      className="text-input"
                      disabled={formData.causalFactors.includes('None')}
                    />
                  )}


                  <div className="button-group">
                    <button className="back" type="button" onClick={handleBack}>
                      Back
                    </button>
                    <button type="button" onClick={handleNext}>
                      Next
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <p>Was Stop Work Authority Enforced?</p>
                  <div className="radio-group">
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="stopWorkEnforced"
                        value="yes"
                        checked={formData.stopWorkEnforced === 'yes'}
                        onChange={handleChange}
                      />
                      <label htmlFor="stopWorkEnforced">Yes</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="stopWorkEnforced"
                        value="no"
                        checked={formData.stopWorkEnforced === 'no'}
                        onChange={handleChange}
                      />
                      <label htmlFor="stopWorkEnforced">No</label>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="stopWorkEnforced"
                        value="n/a"
                        checked={formData.stopWorkEnforced === 'n/a'}
                        onChange={handleChange}
                      />
                      <label htmlFor="stopWorkEnforced">N/A</label>
                    </div>
                  </div>


                  <label>Actions Taken For Stop Work Authority</label>
                  <textarea
                    name="stopWorkActions"
                    value={formData.stopWorkActions}
                    onChange={handleChange}
                    placeholder="Description of action taken for stop work authority"
                    disabled={formData.stopWorkEnforced === 'no' || formData.stopWorkEnforced === 'n/a'}
                  ></textarea>


                  <label>Attach Evidence (Image)</label>
                  {formData.stopWorkEvidence ? (
                    <div className="file-preview-container">
                      <img src="/images/file-icon.png" alt="File Icon" className="file-icon" />
                      <div className="file-info">
                        <p className="file-name">{formData.stopWorkEvidence.name}</p>
                        <p className="file-size">{(formData.stopWorkEvidence.size / 1024).toFixed(1)} KB</p>
                        <div className="progress-wrapper">
                          <div className="progress-bar">
                            <div className="progress"></div>
                          </div>
                          <span className="progress-percent">100%</span>
                        </div>
                      </div>
                      <img
                        src="/images/delete.png"
                        className="delete-icon"
                        alt="Delete Icon"
                        onClick={() => setFormData({ ...formData, stopWorkEvidence: null })}
                      />
                    </div>
                  ) : (
                    <div
                      className="file-upload-container"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById('file-upload').click()}
                      style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                      <img src="/images/upload.png" alt="Upload" />
                      <p>
                        <span id="upload">Click to upload</span> or drag and drop
                      </p>
                      <p>SVG, PNG, JPG, or GIF (max. 800×400px)</p>
                      <input
                        id="file-upload"
                        type="file"
                        name="stopWorkEvidence"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/svg+xml, image/png, image/jpeg, image/gif"
                      />
                    </div>
                  )}



                  <div className="button-group">
                    <button className="back" type="button" onClick={handleBack}>
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting}>
                      {status || 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
