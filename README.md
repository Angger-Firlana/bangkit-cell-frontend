# BangkitCell Management System (Frontend)

A modern, responsive dashboard and Point of Sale (POS) system for smartphone repair shops and retail businesses. Built with **React**, **TypeScript**, and **TailwindCSS**.

## 🚀 Features

### 🔧 Service Management
- **Service Job Tracking:** Manage repair orders from entry to completion.
- **Estimated & Final Fees:** Track customer quotes and final service costs.
- **Sparepart Integration:** Live inventory lookup and subtraction upon repair completion.
- **Thermal Printing:** Integrated Web Bluetooth support for printing receipts (Service & Sales).

### 🛒 Point of Sale (POS)
- **Fluid Checkout:** Fast product selection with real-time cart updates.
- **Payment Methods:** Integrated with backend-driven payment options.
- **Mobile-Optimized:** Custom bottom-sheet cart for a seamless experience on smartphones.

### 📦 Inventory & Marketplace
- **Stock Management:** Real-time tracking with low-stock alerts and easy adjustments.
- **Phone Marketplace:** Manage listings for second-hand or new phones.
- **Lazy Loading:** Optimized data fetching for heavy lists like spareparts.

### 📊 Reports & Insights
- **Sales Analytics:** Visual summaries of daily and monthly revenue.
- **Service Trends:** Monitor repair volume and technician productivity.

## 🎨 UI/UX Highlights
- **Responsive Design:** Fully functional from desktop monitors to mobile phones.
- **Modern Stack:** TailwindCSS with custom "Glassmorphism" elements and smooth Lucide icons.
- **Design System:** Consistent, reusable components (Buttons, Cards, Modals, Inputs).
- **Typography:** Professional aesthetic using the **Poppins** font family.

## 🛠 Tech Stack
- **Framework:** React 18+ (Vite)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **State Management:** Zustand (Auth)
- **Icons:** Lucide-React
- **Routing:** React Router DOM v7
- **API Client:** Axios

## 🛠 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/bangkit-cell-frontend.git
    cd bangkit-cell-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file based on `.env.example`:
    ```env
    VITE_API_BASE_URL=http://your-laravel-api.test/api/v1
    ```

4.  **Run in development mode:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    ```

## 📄 Documentation
For detailed integration notes and architectural updates, refer to [DOCS.md](./DOCS.md).
