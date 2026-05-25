---
draft: true
---


These Mermaid blocks are prepared for manual insertion into the final report if visual diagrams are required.

  

## 1. High-Level System Architecture

  

```mermaid

flowchart LR

U[User Browser] --> A[Next.js Application]

A --> C[Clerk Authentication]

A --> M[MongoDB via Mongoose]

A --> D[Cloudinary Media Storage]

A --> G[Google Gemini API]

  

A --> W[Authenticated Workspace]

A --> P[Public Reading Pages]

  

W --> E[TipTap Note Editor]

W --> S[Settings and Profile Controls]

W --> H[Share and Publish Controls]

  

P --> X[Public Explorer]

P --> T[Table of Contents]

P --> R[Rendered Note Content]

```

  

## 2. Note Publishing Flow

  

```mermaid

flowchart TD

A[User writes or edits a note] --> B[Editor saves content]

B --> C[Note stored in MongoDB]

C --> D{Visibility choice}

D -->|Private| E[Visible only inside workspace]

D -->|Unlisted| F[Generate share link]

D -->|Published| G[Publish to public profile]

F --> H[Render public snapshot]

G --> H

H --> I[Public note page]

G --> J[Public workspace explorer]

```

  

## 3. Main Workspace Structure

  

```mermaid

flowchart TB

A[Workspace Shell] --> B[Sidebar]

A --> C[Explorer Panel]

A --> D[Editor Canvas]

A --> E[Settings Dialog]

  

B --> B1[New Note]

B --> B2[Search]

B --> B3[Explorer Toggle]

  

C --> C1[Folders]

C --> C2[Notes]

C --> C3[Sorting and Context Actions]

  

D --> D1[Toolbar]

D --> D2[Auto-Save]

D --> D3[AI Assistant]

D --> D4[Share Dialog]

```