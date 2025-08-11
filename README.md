# Electron Sketching / Cute Photo Sketching App

This project is a desktop application that allows users to transform images into pencil sketch-style versions by applying a Gaussian blur-based filter.

The application was developed as a student project to explore how a desktop graphical interface (GUI) can be integrated with a backend image processing service.

This project combines:
- Connecting an Electron-based frontend (built with HTML, CSS, and JavaScript) to a Python backend.
- Applying real-time image processing operations using OpenCV.
- Implementing an adjustable slider that controls the filter intensity (kernel size) for the sketch effect.

The core idea of this project is to explore how to develop a desktop application from scratch, including both the backend functionality and the user interface.
All interface elements such as the buttons, layout, and color scheme were manually designed by me to match the intended visual style of the app 
***(inspired by retro-style arcades)***.

---

## How it Works

1. The user uploads an image via the app’s GUI.
2. The app sends the image to a local backend server (written in Python using FastAPI).
3. The backend processes the image using OpenCV (grayscale, inversion, Gaussian blur, and blending for the sketch effect).
4. The processed sketch image is returned to the app and displayed.
5. The user can adjust the kernel size via a slider to change the sketch intensity, triggering live reprocessing of the image.

---

## How to Set Up and Run the App (Development Mode)

**Note:** This app requires both **Node.js** (for the Electron frontend) and **Python** (for the backend image processing).  
The backend and frontend communicate through HTTP locally.

### 1. Clone the Repository:
```bash
git clone https://github.com/avonamolos/electron-sketching.git
cd Electron-Sketching
```
### 2. Install Electron Dependencies:
```bash
npm install
```
### 3. Install Python Dependencies:
Go to the ***backend directory*** and install required Python packages:
```bash
cd backend
pip install fastapi uvicorn opencv-python numpy
```
### 4. Start the Backend (FastAPI Server):
Still inside the backend/ directory, start the backend server:
```bash
python -m uvicorn backend:app --reload --port 8000
```
The backend will start locally at http://localhost:8000 and automatically reload on code changes.
### 5. Start the Electron Frontend:

In a new terminal (from the project root directory):

```bash
npm start
```
The Electron app will launch and connect to the local backend automatically.

---

## Planned Improvements and Future Work

- Package the entire application as a standalone `.exe` file for Windows, so that users can run the app without installing dependencies or starting the backend manually.
- Integrate the Python backend into the `.exe` using tools like **PyInstaller** to create a bundled backend executable.
- Automate backend startup from within the Electron app, so the backend runs silently in the background without requiring user actions.
- General UI refinements and code cleanup.

