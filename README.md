# Hospital Readmission Prediction System

This project was developed as a part of the **Cognizant NPN AIA Program Hackathon**. It is a comprehensive system designed to predict the risk of patient readmission to a hospital, leveraging machine learning and a modern web application stack.

---

### Key Features

* **Readmission Risk Prediction**: A Flask API hosts an XGBoost model to predict a patient's readmission risk. The model expects specific features related to patient demographics, medical procedures, medications, and healthcare utilization.
* **Database Management**: The system uses a PostgreSQL database with a schema for `hospitals`, `patient_details`, and `medical_history`.
* **Web Dashboard**: The frontend is a modern web dashboard built with React and Shadcn UI, written in TypeScript.
* **API Endpoints**: The backend provides endpoints for health checks (`/health`), model information (`/model-info`), and the core prediction functionality (`/predict`).
  
---

### Technology Stack

**Frontend**
* **Language**: TypeScript
* **Framework**: React.js with Vite
* **UI Library**: Shadcn UI
* **State Management**: React Query
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM
* **Authentication & Database**: Supabase (React client)

**Backend**
* **Framework**: Flask
* **Machine Learning**: XGBoost and scikit-learn
* **Data Processing**: Pandas and NumPy
* **Model Persistence**: Joblib

**Database**
* **Database Service**: Supabase
* **Schema**: PostgreSQL with tables for `patient_details`, `medical_history`, and `hospitals`

---

### Setup and Installation

Follow these steps to set up and run the project locally.

#### Prerequisites
* Python 3.8+
* Node.js 18+
* Supabase CLI

#### 1. Backend API Setup
1.  Navigate to the `api` directory:
    ```bash
    cd api
    ```
2.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
3.  Place the trained model file (`readmission_model.joblib`) in the `api` directory. If the model is not available, the API will run in mock mode.
4.  Run the Flask API server:
    ```bash
    python predict.py
    ```
    The API will start on `http://0.0.0.0:5000`.

#### 2. Supabase Database Setup
1.  Follow the official Supabase documentation to set up a new project.
2.  Install the Supabase CLI globally:
    ```bash
    npm install supabase --global
    ```
3.  Link your local project to your Supabase project.
4.  Run the migrations to create the necessary tables:
    ```bash
    supabase db diff --local --schema-only --file 20250913152000_patient_details_schema
    supabase db push
    ```

#### 3. Frontend Setup
1.  Navigate to the project root directory:
    ```bash
    cd ..
    ```
2.  Install the Node.js dependencies:
    ```bash
    npm install
    ```
3.  Configure your Supabase environment variables in a `.env.local` file.
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:5173`.
