# Contributing to NeuroClarity XAI-CDSS

Thank you for your interest in contributing to **NeuroClarity XAI-CDSS**! We welcome contributions from data scientists, machine learning engineers, clinical researchers, clinicians, and software developers.

---

## Code of Conduct
We are dedicated to providing a welcoming, inclusive, and professional environment for all contributors. Please maintain respectful, evidence-based, and patient-centric discourse.

---

## Development Workflow

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/neuroclarity-xai-cdss.git
   cd neuroclarity-xai-cdss
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feat/my-clinical-feature
   ```
4. **Make and verify your changes**:
   - Ensure the frontend builds: `cd frontend && npm run build`
   - Test backend routes and linting: `cd backend && python -m py_compile main.py`
5. **Commit your changes** following conventional commits:
   ```bash
   git commit -m "feat(xai): add novel calibration curve visualizer"
   ```
6. **Push to your fork** and submit a **Pull Request**.

---

## Reporting Issues & Feature Requests
- Check the existing issues before creating a new one.
- Provide a clear, descriptive title and step-by-step reproduction instructions.
- If proposing new clinical risk scores or psychometric instruments, include citations to peer-reviewed clinical validation studies.
