# 🧬 VitalArc — Next-Gen Bio-Intelligence Platform

VitalArc is a high-performance, medical-grade health assessment and longevity platform built for the **KLE Hackathon**. It empowers users to understand their physiological trajectory by calculating biological age, assessing multi-condition risk, and simulating the impact of lifestyle changes in real-time.

---

## ⚡ The Core Loop

1.  **The Collector**: Input your vitals and lifestyle habits through a sleek, medical-grade interface (voice input & OCR supported).
2.  **The Mirror**: Visualize your biological age and health delta across 4 core systems via an interactive 3D-anatomy explorer.
3.  **The Predictor**: View your 10-year risk profile for Cardiovascular Disease, Type 2 Diabetes, Stroke, and Metabolic Syndrome.
4.  **The Simulator**: Test habit changes (e.g., "What if I sleep 2 hours more?") and see immediate shifts in your future risk and biological age.

---

## 🛠 Tech Stack

VitalArc is built using a modern, performant, and type-safe stack:

-   **Frontend**: Next.js 14 (App Router)
-   **Styling**: Vanilla CSS + Tailwind CSS (for utility layouts)
-   **Animations**: Framer Motion (premium smooth reveals, 3D anatomy tilts)
-   **Icons**: Lucide React
-   **State Management**: Zustand (with persistence)
-   **AI Integration**: Google Gemini AI (Actionable Health Coaching)
-   **Medical Logic**: Custom TypeScript engines implementing Gompertz Law, FINDRISC, and Framingham models.

---

## 🔬 Scientific Methodology

VitalArc is not a toy. It uses validated medical models:
-   **Gompertz-Makeham mortality laws**: To map physiological decay to biological years.
-   **FINDRISC Scoring**: For Type 2 Diabetes risk assessment.
-   **Framingham Heart Study models**: For 10-year cardiovascular risk.
-   **Phenotypic Aging Clocks**: Derived from clinical biomarkers (Glucose, Cholesterol, BP).

---

## 🔐 Privacy First

-   **Zero Server Logging**: Your data stays in your browser's local storage.
-   **AES Encryption**: Sensitive health inputs are encrypted locally.
-   **No User Accounts**: Start scanning immediately—no email or password required.

---

## 🚀 Getting Started

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/[username]/vitalarc.git
    cd vitalarc
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:3000`.

---

## 🏆 Hackathon Edition
Built with precision for the **KLE Hackathon**. This tool is intended for educational and informational purposes only.

**v2.2 — Medical Build**
