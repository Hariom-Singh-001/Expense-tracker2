# Expense-tracker2

Video Tutorial:-`(https://youtu.be/h_8_IF43fF8)`

## 🏃‍♂️ How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/expense-tracker.git](https://github.com/your-username/expense-tracker.git)
    cd expense-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add:
    ```env
    DATABASE_URL=postgres://user:pass@host/db_name
    GEMINI_API_KEY=your_google_ai_key
    ```

4.  **Run the server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Go to `http://localhost:5000`

---

# 💰 AI-Powered Expense Tracker

> **Your personal financial assistant that doesn't just track spending but talks to you!**

An intelligent, full-stack expense management application designed to help users take control of their financial health. Beyond standard tracking, this app features a **Smart AI Accountant** (powered by Google Gemini) that analyzes your data and answers questions about your spending habits in real-time.

---

## 🚀 Key Features

### 📊 **Interactive Dashboard**
- **Visual Insights:** Beautiful, responsive charts (Recharts) show your spending trends over the last 7 days.
- **Financial Health at a Glance:** Instantly view your **Total Balance**, **Total Expenses**, and Remaining Budget.
- **Recent Activity:** Quick access to your latest transactions.

### 🤖 **Smart AI Accountant (Gemini 1.5 Flash)**
- **Chat with your Data:** Ask questions like *"How is my budget?"* or *"What is my biggest expense?"*
- **Auto-Categorization:** The AI automatically detects categories (e.g., "Food," "Travel") based on your item names.
- **Context-Aware:** The AI knows your specific transaction history and total spending, giving personalized advice.

### 🔐 **Secure Authentication**
- **User Accounts:** Fully secure Registration and Login system.
- **Session Management:** Persistent user sessions to keep your data safe.
- **Password Hashing:** Industry-standard security for user credentials.

### 💸 **Transaction Management**
- **Easy Entry:** Add new expenses quickly with a clean, validated form.
- **History Log:** View a complete history of all your past transactions.

---

## 🛠️ Tech Stack

This project was built using a modern, scalable "Permanent Free" stack:

**Frontend:**
* **React + Vite:** For a lightning-fast user interface.
* **TypeScript:** For type-safe, robust code.
* **Tailwind CSS + Shadcn UI:** For a sleek, professional, and responsive design.
* **Recharts:** For data visualization.
* **TanStack Query:** For efficient server state management.

**Backend:**
* **Node.js & Express:** Lightweight and fast server framework.
* **Passport.js:** For handling authentication sessions.
* **Google Gemini AI API:** The brain behind the financial insights.

**Database:**
* **PostgreSQL (Neon/Supabase):** Reliable, relational database for storing user and transaction data.
* **Drizzle ORM:** For type-safe database interactions.

---

## 🔮 Future Scope

We are constantly working to improve the Expense Tracker. Here is what's coming next:

* **📱 Mobile App:** A dedicated React Native app for tracking on the go.
* **🔔 Smart Alerts:** Get notified via email/SMS when you exceed your budget.
* **🏷️ Custom Categories:** Allow users to create and manage their own expense tags.
* **📉 Monthly Reports:** downloadable PDF reports of your monthly financial activity.
* **💳 Bank Integration:** Automatically sync transactions from your bank account.

---



<p align="center">
  Built with ❤️ by Hariom Singh, Rabbi Rasspreet Kaur & Priyanshu Sharma for the GDG Project.
</p>

