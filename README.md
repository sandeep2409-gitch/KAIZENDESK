# Day 18: KaizenDesk — Premium E-commerce Cart

**KaizenDesk** is an ultra-premium, dark glassmorphic E-commerce cart application built using **Vue 3 (Composition API)** and reactive local state management. The shop showcases a workspace aesthetics theme featuring minimalist mechanical keyboards, open-back audiophile planar headphones, dense merino wool pads, and smart monitor light bars.

---

## 🎨 Design & Aesthetic Highlights

- **Minimalist Interface:** Clean header brand logo, static wide search bar, and clear category controls.
- **Dark Glassmorphism:** Semi-transparent containers (`rgba(17, 24, 39, 0.75)`) with a `16px` backdrop filter blur, thin borders, glowing focus rings, and custom animated scrollbars.
- **Floating Action Capsule:** A floating navigation control panel in the bottom-right corner of the viewport housing order history logs and a shopping cart bag with an animated count badge.
- **Micro-Animations:** Fluid slide-in panels, hover zoom transitions on product cards, and button states confirming when items have been successfully added.

---

## 🚀 Key Features

### 1. Catalog Curation, Search & Filtering
- **Interactive Search:** Filter items in real time by checking titles and product descriptions.
- **Category Chips:** Instantly narrow down results (e.g. *Keyboards*, *Audio*, *Desk Mats*, *Lighting*, *Accessories*).
- **Sort Dropdown:** Sort workspace items by *Price: Low to High*, *Price: High to Low*, or *Highest Rated*.

### 2. Reactive Composable State Management (`useCart.js`)
- Standardized shipping fees ($15 flat rate or free for orders over $200).
- Calculated 8% sales tax on the discounted subtotal.
- **Promo Coupon System:**
  - `SAVE10`: Offers 10% off the total subtotal.
  - `FREESHIP`: Waives the flat shipping charge.
  - `DESKGLOW`: Grants $20 off for orders over $150.
- **Persistence:** Keeps selected items and checkout order history saved inside `localStorage`.

### 3. Slide-Over Cart Drawer
- Smooth transition drawer presenting shopping cart quantities.
- Quantities adjusted dynamically via increment/decrement toggles.
- Validated Coupon input box with success/error alerts.

### 4. Interactive Checkout Wizard
- **Step 1: Selection Review:** Confirm item counts and view price breakdowns.
- **Step 2: Shipping Contact:** Validate full name, email addresses, phone details, and location.
- **Step 3: Secure Payment:** A glossy mock credit card that flips with a **3D CSS rotation** when the user focuses on the CVV password field. Inputs are masked automatically.
- **Step 4: Success Receipt:** Provides details of the transaction, estimated arrival dates, and a graphical packaging progress bar.

---

## 🛠 Tech Stack

- **Framework:** Vue 3 (Composition API, SFC `<script setup>`)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS Layout Emulation System (defined in [index.css](src/index.css))
- **Icons:** Lucide Vue Next

---

## 📂 Project Structure

```bash
DAY18 -- ECOMMERCE CART/
├── public/
├── src/
│   ├── assets/              # Premium generated image assets
│   │   ├── cyberboard.png   # Custom keyboard
│   │   ├── aetherflux.png   # Planar headphones
│   │   ├── zenithfelt.png   # Merino desk mat
│   │   └── monitorlight.png # Monitor light bar
│   ├── components/
│   │   ├── ProductCard.vue  # Catalog item layout
│   │   ├── CartDrawer.vue   # Cart drawer slide-over
│   │   └── CheckoutWizard.vue# Multi-step stepper + Flipping Mock Card
│   ├── composables/
│   │   └── useCart.js       # Local state manager
│   ├── App.vue              # Main container, floating console, history log
│   ├── index.css            # Dark glassmorphism & layout utilities
│   └── main.js              # Entry point mounting Vue
├── package.json
├── vite.config.js
└── README.md
```

---

## 💻 Local Setup & Execution

### 1. Install Dependencies
Navigate to the project directory and install the packages:
```bash
npm install
```

### 2. Start Development Server
Launch the local server:
```bash
npm run dev
```
Open **[http://localhost:5174/](http://localhost:5174/)** in your browser to inspect the application.

### 3. Build for Production
Verify compilation and generate production assets:
```bash
npm run build
```
The compiled bundle will be output to the `dist/` directory.
