<div align="center">

# Young Study

**A product-style open source app that helps young people make better real-world decisions instead of just consuming more information.**

Built for university students, fresh graduates, and young adults entering real life for the first time.  
The current core flow focuses on **Shanghai first-time rental decisions -> settlement handoff**, turning judgment, checklists, scripts, reports, and next-step actions into one product chain.

[![GitHub stars](https://img.shields.io/github/stars/b1ue13e/fengshui-lens?style=for-the-badge)](https://github.com/b1ue13e/fengshui-lens/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/b1ue13e/fengshui-lens?style=for-the-badge)](https://github.com/b1ue13e/fengshui-lens/network/members)
[![GitHub issues](https://img.shields.io/github/issues/b1ue13e/fengshui-lens?style=for-the-badge)](https://github.com/b1ue13e/fengshui-lens/issues)
[![Engine Core Verification](https://img.shields.io/github/actions/workflow/status/b1ue13e/fengshui-lens/engine-test.yml?branch=main&style=for-the-badge&label=engine%20core%20verification)](https://github.com/b1ue13e/fengshui-lens/actions/workflows/engine-test.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Goal 10k Stars](https://img.shields.io/badge/Goal-10k%20Stars-ffb000?style=for-the-badge)](#)

<p>
  <a href="#screenshots"><strong>Screenshots</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="./ROADMAP.md"><strong>Roadmap</strong></a> ·
  <a href="./CONTRIBUTING.md"><strong>Contributing</strong></a>
</p>

</div>

---

## Landing pitch

Most life-advice products give people more content.  
**Young Study is trying to give them better judgment.**

Instead of acting like a portal, a content farm, or a generic tool dump, this project is designed around one question:

> **How do we help young people make fewer expensive mistakes when they face real life for the first time?**

The current answer starts with one sharp product slice:

- enter from the homepage
- make a structured rental decision
- get a report with risks and next actions
- compare two options if needed
- continue into Shanghai settlement handoff after the decision is made

That product shape is what makes this repository interesting.

---

## Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="./docs/readme/home.png" alt="Young Study homepage" />
    </td>
    <td width="50%">
      <img src="./docs/readme/rent-tools.png" alt="Rent decision tools" />
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="./docs/readme/scenario.png" alt="Scenario training page" />
    </td>
  </tr>
</table>

---

## Core product flow

### 1. Homepage
The homepage is intentionally narrowed around one primary job:

- rental-first entry
- brand visible early
- Shanghai handoff clearly secondary, not competing with the main task

### 2. Rent decision flow
Current main flow:

1. `/rent/tools`
2. `/rent/tools/analyze`
3. `/rent/tools/evaluate`
4. `/rent/tools/evaluate/basic`
5. `/rent/tools/evaluate/space`
6. `/rent/tools/evaluate/living`
7. `/rent/tools/report`
8. `/rent/tools/report/[id]`
9. `/rent/tools/compare`

### 3. Settlement handoff
After the user decides to move to Shanghai:

- `/survival-plans/start`
- `/resources`

### 4. Training base layer
Longer-term training surfaces:

- `/categories`
- `/categories/[slug]`
- `/scenario/[slug]`
- `/paths`
- `/toolkit`
- `/simulator`
- `/search`

---

## Architecture

```mermaid
flowchart TD
  U["User"] --> H["Homepage"]
  H --> A["Listing quick scan"]
  H --> E0["Rent decision start"]

  E0 --> E1["Basic housing info"]
  E1 --> E2["On-site spatial risk"]
  E2 --> E3["Decision constraints"]
  E3 --> R["Decision report"]
  R --> C["Compare"]
  R --> S["Shanghai settlement handoff"]

  H --> T["Training base"]
  T --> CAT["Categories"]
  T --> SC["Scenario pages"]
  T --> TK["Toolkit"]
  T --> SIM["Simulator"]
  T --> SEARCH["Search"]

  subgraph Frontend["Next.js App Router"]
    H
    A
    E0
    E1
    E2
    E3
    R
    C
    S
    CAT
    SC
    TK
    SIM
    SEARCH
  end

  subgraph Domain["Domain layer"]
    ENG["Rental decision engine"]
    RT["Rent tool logic"]
    CONTENT["Content repositories"]
  end

  subgraph Data["Data layer"]
    ZS["Zustand local progress"]
    SQLITE["Prisma + SQLite"]
    SB["Supabase optional sync"]
  end
```

---

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand
- Prisma + SQLite
- Supabase SSR (optional)
- Vitest
- Playwright

---

## Quick start

```bash
npm install
npm run dev
```

Default local URL:

- http://localhost:3000

Production build:

```bash
npm run build
npm run start
```

---

## Contributing

If you want to contribute, start here:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [ROADMAP.md](./ROADMAP.md)

Good contributions are not just about adding features. They should make the core flow sharper, clearer, and more product-like.

---

## The 10k stars ambition

This repository probably does not reach 10k stars by becoming bigger.  
It only gets there if it becomes:

- clearer
- more opinionated
- more product-shaped
- more memorable
- more obviously useful the moment someone lands on the repo

That is the standard this project is aiming for.