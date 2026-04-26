# AI-Guided Banking Project

A full-stack banking application designed for accessibility, featuring voice-guided interactions, multi-language support (English, Telugu, Hindi), and secure biometric authentication.

## Project Structure

- **ai-app/ai-banking-app**: Frontend mobile application built with React Native (Expo).
- **ai-app/backend**: Backend REST API built with Python (FastAPI) and SQLite.

## Features

- **Voice Assistant**: Integrated guidance and command processing.
- **Voice ID Verification**: Secure login using voice signature analysis.
- **Multi-Language Support**: English, Telugu, and Hindi.
- **Banking Transactions**: Send money, check balance, and view transaction history.
- **Biometric Security**: FaceID/Fingerprint support for payments.
- **Direct SMS**: Automatic transaction notifications via SMS.

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ai-app/backend
   ```
2. Install dependencies (ensure you have Python installed):
   ```bash
   pip install fastapi uvicorn librosa numpy twilio
   ```
3. Start the server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ai-app/ai-banking-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with the Expo Go app on your phone.

## Network Configuration
To test on a physical device, ensure your phone and PC are on the same Wi-Fi network. Update the IP address in `ai-app/ai-banking-app/utils/api.ts` to match your PC's current LAN IP.
