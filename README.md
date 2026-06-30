# ⚡ Invoice & Tariff Comparator — Goldenergy Simulator

An independent, data-driven utility application designed to solve a critical operational bottleneck in the Portuguese energy retail sector. This software automates complex tariff modeling, reducing commercial quotation time by over **93%**.

---

## 📈 Business Case & Operational Impact

* **Context:** Developed during my tenure as a Commercial Supervisor for a Goldenergy outsourced sales team.
* **The Problem:** Sales agents manually computed savings proposals by reviewing complex utility invoices, calculating fixed terms, energy consumption, multi-tier VAT (6% vs 23%), and regulatory fees (IEC/CAV). Each simulation took **10 to 15 minutes** per client, introducing human error and limiting sales velocity.
* **The Solution:** This simulator converts raw customer invoice metrics into an instantaneous comparison against Goldenergy's "Desconto Máximo" and "Plano Gold" plans.
* **Measurable ROI:** Dropped computation times to **under 1 minute per client**, achieving a **93%+ increase in operational efficiency** and skyrocketing the sales team's daily reach.

---

## 🛠️ Technical Stack & Architecture

This application was engineered using raw, lightweight web technologies to maximize execution speed and ensure zero framework-overhead dependencies:

* **Frontend Structure:** Semantically structured HTML5.
* **Styling Framework:** Tailwind CSS (implemented via CDN for utility-first responsive layout and UI grid structures).
* **Core Engine:** Vanilla JavaScript (ES6+).
* **Visual Additions:** FontAwesome icons for cognitive UI cues, combined with custom CSS keyframes (`fadeInUp`) and JavaScript asynchronous loops (`setInterval`) for realistic **CountUp financial visual animations**.

---

## 🧠 Key Engineering Highlights (Code Analysis)

As an engineer, I prioritized accurate business logic over cosmetic abstraction:

1. **Complex Mathematical Modeling:** Implemented rigorous Portuguese fiscal constraints (`calcularDetalhamentoIVA`), dynamically allocating base consumption up to statutory limits (e.g., 100 kWh for Electricity, 40 kWh for Gas) at a 6% VAT tier, while applying a 23% tier on surpluses, regulatory taxes (`IEC`, `CAV`, `TRFE`), and fixed costs.
2. **Dynamic UI Rendering & DOM Manipulation:** Developed an active rendering routine (`renderizar`) that seamlessly switches the viewport from an idle state (`welcome_view`) into an active grid analytics layout, appending dynamic cross-table calculations and highlighting the most cost-effective plan using contextual color-coding.
3. **Data Integrity Guardrails:** Implemented sanitization functions (`raw()`) preventing script crashes (`NaN` propagation) by safely converting empty string inputs into arithmetic zeros.
4. **Data Structures:** Embedded an organized matrix (`DATA`) to map out contract variables natively (Power capacity in kVA, Gas tiers, and distinct energy coefficients).

---

## 🔧 How to Run the Project Locally

Since the project relies natively on Vanilla technologies, it requires no compilation or package installations (`npm install` is not required):

1. Clone the repository:
   ```bash
   git clone [https://github.com/cdiasbrasilio/invoinceAndTariffComparator.git](https://github.com/cdiasbrasilio/invoinceAndTariffComparator.git)
