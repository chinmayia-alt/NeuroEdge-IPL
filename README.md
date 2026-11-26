# NeuroEdge-IPL

## Wearable seizure-monitoring interface

A responsive front-end prototype for the NeuroEdge wearable seizure-detection project.

### Run locally
Open `index.html` in a modern browser. No build step or package installation is required.

### Prototype capabilities
- Responsive monitoring dashboard with an illustrative EEG waveform.
- Risk score, signal-quality indicator, heart-rate placeholder, and session timer.
- Channel selector and pause/resume controls for a synthetic demo stream.
- High-priority alert modal with visual cues and general seizure first-aid guidance.
- Event timeline and wearable sensor status placeholders.

### Important: demo data only
The waveform, risk percentage, heart rate, and sensor status are simulated in the browser. **No CHB-MIT data is loaded, no seizure prediction model is running, and no physical wristband is connected.** The preview alert is manually triggered. This interface is not a medical device and must not be used for diagnosis, treatment decisions, or emergency monitoring.

## CHB-MIT dataset and model integration plan
Use the CHB-MIT Scalp EEG Database to develop and validate a separate signal-processing and inference pipeline. The dataset contains long-term scalp EEG recordings from pediatric subjects; it is not a wrist-worn sensor dataset. Its channel montage, sampling rate, annotations, and recording setup must be reconciled with the actual wearable hardware before deployment.

Suggested pipeline:
1. Load EDF recordings and seizure annotation summaries; preserve subject-wise train/validation/test separation to avoid leakage.
2. Preprocess using a documented filter, resampling strategy, channel mapping, and artifact-quality checks. Fit normalization parameters on training data only.
3. Create windowed inputs and labels using clearly specified preictal/interictal definitions. Evaluate sensitivity, false alarms per hour, detection delay, and event-level metrics—not accuracy alone.
4. Train and validate a compact model, then measure memory, inference latency, and energy on the target embedded hardware.
5. Expose a local inference service or device bridge that returns calibrated outputs, signal quality, model version, and timestamp.

### Suggested front-end inference contract
The UI is prepared for a future local endpoint such as `POST /api/predict`. An example response:
```json
{
  "risk_score": 0.08,
  "risk_level": "low",
  "signal_quality": 0.94,
  "prediction_horizon_seconds": 60,
  "model_version": "edge-model-0.1",
  "timestamp": "2026-11-26T10:00:00+05:30"
}
```
This schema and its values are illustrative, not validated clinical thresholds or predictions. Replace the demo stream with real sensor and model outputs before any real-world testing.

### Safety and alert design
A model flag is a possible-risk notification, not confirmation that a seizure is occurring or will occur. Define thresholds with clinical input and prospective validation. Test alert latency, missed events, false alarms, offline behavior, battery failure, and caregiver notification reliability. Keep an independently designed emergency plan; the UI must never delay emergency care.
