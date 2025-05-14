# 🏥 FDA Compliance Assistant

A lightweight RAG-based web app to help hospitals compare their Standard Operating Procedures (SOPs) against FDA guidelines. Designed to streamline SOP reviews, detect compliance gaps, and provide actionable insights.

---

## 🚀 Overview

This project helps hospitals:

- Upload SOP documents (PDF)
- Automatically compare against official FDA regulations using Retrieval-Augmented Generation (RAG)
- Receive detailed comparisons and highlight compliance gaps
- Get checklist-style fixes
- Ask clarifying questions about their SOP via chat interface

---

## 🧠 Ideation origin

This idea was born during a hackathon hosted by **Commure**, where we explored regulatory automation in healthcare. Though we didn’t ship it during the event, we brought the concept to life after!

---

## 🛠️ What it does

- Upload a hospital SOP in PDF format
- Uses RAG to compare against FDA documentation (hosted in Pinecone)
- Returns a structured comparison with summaries and compliance issues
- Provides a checklist of improvements
- Lets users ask questions about their SOPs interactively

---

## 🧰 Tech Stack

- **Backend**: Python, Flask, FAISS, Pinecone, OpenAI GPT-4o
- **Frontend**: React (TSX), Vite
- **Deployment**: Railway (backend), Vercel (frontend)

---

## 📂 Sample Documents
👉 [Google Drive – Sample SOP PDFs](https://drive.google.com/drive/folders/1A0Ym9qyM7-BA2Uun2gucaysVW2Nj5L6m?usp=sharing)
