import React, { useState } from 'react';
import '../styles/Main.css';

export default function Main() {
  const [step, setStep] = useState(1); 
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
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
    stopWorkEvidence: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      if (name === 'lifeSavingRules') {
        setFormData((prevData) => {
          if (checked) {
            return {
              ...prevData,
              lifeSavingRules: [...prevData.lifeSavingRules, value],
            };
          } else {
            return {
              ...prevData,
              lifeSavingRules: prevData.lifeSavingRules.filter((rule) => rule !== value),
            };
          }
        });
      } else if (name === 'causalFactors') {
        setFormData((prevData) => {
          if (checked) {
            return {
              ...prevData,
              causalFactors: [...prevData.causalFactors, value],
            };
          } else {
            return {
              ...prevData,
              causalFactors: prevData.causalFactors.filter((factor) => factor !== value),
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

  const validateForm = (step) => {
    const errors = {};
  
    if (step === 1) {
      if (!formData.unsafe) {
        errors.unsafe = "Please select an unsafe act or condition.";
      }
      if (!formData.location) {
        errors.location = "Location is required.";
      }
      if (!formData.observerName) {
        errors.observerName = "Observer name is required.";
      }
      if (!formData.company) {
        errors.company = "Company is required.";
      }
      if (!formData.position) {
        errors.position = "Position is required.";
      }
      if (!formData.date) {
        errors.date = "Date is required.";
      }
      if (!formData.time) {
        errors.time = "Time is required.";
      }
    }
  
    if (step === 2) {
      if (!formData.incidentDetails) {
        errors.incidentDetails = "Incident details are required.";
      }
      if (!formData.correctiveActions) {
        errors.correctiveActions = "Corrective actions are required.";
      }
    }
  
    if (step === 3) {
      if (formData.lifeSavingRules.length === 0) {
        errors.lifeSavingRules = "Please select at least one life-saving rule.";
      }
      if (formData.causalFactors.length === 0) {
        errors.causalFactors = "Please select at least one causal factor.";
      }
    }
  
    if (step === 4) {
      if (!formData.stopWorkEnforced) {
        errors.stopWorkEnforced = "Please select if stop work authority was enforced.";
      }
      if (!formData.stopWorkActions || formData.stopWorkActions.trim() === '') {
        errors.stopWorkActions = "Please provide the actions taken for stop work authority.";
      }
      if (formData.stopWorkEvidence && !['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'].includes(formData.stopWorkEvidence.type)) {
        errors.stopWorkEvidence = "Unsupported file type. Please upload a PNG, JPG, GIF, or SVG file.";
      }
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0]; 
    setFormData({ ...formData, stopWorkEvidence: file });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData({ ...formData, stopWorkEvidence: file });
  };

  const handleNext = () => {
    if (validateForm(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare the form payload including all the form data
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
      causalFactors: formData.causalFactors,
      stopWorkEnforced: formData.stopWorkEnforced,
      stopWorkActions: formData.stopWorkActions,
      stopWorkEvidence: formData.stopWorkEvidence ? formData.stopWorkEvidence.name : null // Only send file name or null
    };
  
    try {
      // Post the form data to your API handler
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPayload),
      });
  
      if (response.ok) {
        setFormSubmitted(true); // Display success message or handle UI update
        console.log('Form submitted successfully!');
      } else {
        console.error('Form submission failed.');
      }
    } catch (error) {
      console.error('An error occurred during form submission:', error);
    }
  };
  
  

  
  return (
    <div className="main">
      {/* Left Section with Image */}
      <div className="main-img">
        <div className="overlay">
          <h1>HOC CARD</h1>
          <p>Hazard Observation Card</p>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="main-form">
        <div className="form-header">
        <img src="/images/logo.png" alt="Dexter Logo" />
        </div>

        <div className="form-content">
          <div className="form-title">
            <h2>HOC CARD</h2>
            <p>Page {step}/4</p>
          </div>

          <form onSubmit={handleSubmit}>
      {step === 1 && (
        <>
          {/* Page 1 */}
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
            {formErrors.unsafe && <p className="error">{formErrors.unsafe}</p>}
          </div>


          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
          {formErrors.location && <p className="error">{formErrors.location}</p>}

          <label>Observer Name</label>
          <input
            type="text"
            name="observerName"
            value={formData.observerName}
            onChange={handleChange}
          />
          {formErrors.observerName && <p className="error">{formErrors.observerName}</p>}

          <label>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
          {formErrors.company && <p className="error">{formErrors.company}</p>}

          <label>Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
          {formErrors.position && <p className="error">{formErrors.position}</p>}

          <div className="date-time-group">
            <div className="date-field">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              {formErrors.date && <p className="error">{formErrors.date}</p>}
            </div>
            <div className="time-field">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
              {formErrors.time && <p className="error">{formErrors.time}</p>}
            </div>
          </div>

          <button type="button" onClick={handleNext}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Page 2 */}
          <label>Comprehensive Incident Details</label>
          <textarea
            name="incidentDetails"
            value={formData.incidentDetails}
            onChange={handleChange}
            placeholder="Description of incident details"
          ></textarea>
          {formErrors.incidentDetails && <p className="error">{formErrors.incidentDetails}</p>}

          <label>Actions Taken or Proposed for Correction</label>
          <textarea
            name="correctiveActions"
            value={formData.correctiveActions}
            onChange={handleChange}
            placeholder="Description of Actions Implemented"
          ></textarea>
          {formErrors.correctiveActions && <p className="error">{formErrors.correctiveActions}</p>}

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
    {/* Page 3 */}
    <h3 id='savings'>Life-Saving Rules Violated?</h3>
    <div className="checkbox-group">
      {[
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
      ].map((rule) => (
        <label key={rule} className="custom-checkbox-label">
          <input
            type="checkbox"
            name="lifeSavingRules"
            value={rule}
            checked={formData.lifeSavingRules.includes(rule)}
            onChange={handleChange}
          />
          <span className="custom-checkbox"></span>
          {rule}
        </label>
      ))}
    </div>
    {formErrors.lifeSavingRules && <p className="error">{formErrors.lifeSavingRules}</p>}

    <h3 id='causal'>Likely Causal Factor(s)?</h3>
    <div className="checkbox-group">
      {[
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
      ].map((factor) => (
        <label key={factor} className="custom-checkbox-label">
          <input
            type="checkbox"
            name="causalFactors"
            value={factor}
            checked={formData.causalFactors.includes(factor)}
            onChange={handleChange}
          />
          <span className="custom-checkbox"></span>
          {factor}
        </label>
      ))}

      {/* 'Others' checkbox and input field */}
      <label key="Others" className="custom-checkbox-label">
        <input
          type="checkbox"
          name="causalFactors"
          value="Others"
          checked={formData.causalFactors.includes('Others')}
          onChange={handleChange}
        />
        <span className="custom-checkbox"></span>
        Others
        <input
          type="text"
          name="otherCausalFactors"
          value={formData.otherCausalFactors || ''}
          onChange={handleChange}
          placeholder="Specify"
          className="others-input"
        />
      </label>
    </div>
    {formErrors.causalFactors && <p className="error">{formErrors.causalFactors}</p>}


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
    {/* Page 4 */}
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
    {formErrors.stopWorkEnforced && <p className="error">{formErrors.stopWorkEnforced}</p>}

    <label>Actions Taken For Stop Work Authority</label>
    <textarea
      name="stopWorkActions"
      value={formData.stopWorkActions}
      onChange={handleChange}
      placeholder="Description of action taken for stop work authority"
    ></textarea>
    {formErrors.stopWorkActions && <p className="error">{formErrors.stopWorkActions}</p>}

    <label>Attach Evidence (Images/Documents)</label>
    <div
      className="file-upload-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload').click()}
      style={{
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <img src="/images/upload.png" alt="Dexter Logo" />
      <p><span id='upload'>Click to upload</span> or drag and drop</p>
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
    {formData.stopWorkEvidence && <p>Uploaded file: {formData.stopWorkEvidence.name}</p>}
    {formErrors.stopWorkEvidence && <p className="error">{formErrors.stopWorkEvidence}</p>}

    <div className="button-group">
      <button className="back" type="button" onClick={handleBack}>
        Back
      </button>
      <button type="submit">Submit</button>
    </div>
  </>
)}



          </form>
        </div>
      </div>
      {formSubmitted && (
        <div className="success-message">
          <h2>Thank you for your submission!</h2>
          <p>Your HOC Card has been submitted successfully.</p>
        </div>
      )}
    </div>
  );
}
