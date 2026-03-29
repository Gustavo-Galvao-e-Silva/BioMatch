# BioMatch

BioMatch connects patients to active clinical trials using AI. Upload a medical record, get a ranked list of trials you actually qualify for — with plain-language explanations of why each one is a match.

## The problem

Finding clinical trials is hard. ClinicalTrials.gov lists over 400,000 studies, with eligibility criteria written in dense medical language. Most patients never find the trials they qualify for. Most trials struggle to recruit.

## What BioMatch does

1. A patient uploads their medical record. Gemini extracts structured clinical information from it.
2. The patient's profile is matched against a corpus of active trials using semantic vector search — not just keyword matching.
3. Claude reranks the top candidates and writes a plain-language explanation of why each trial is a good fit.
4. Patients can message researchers directly through the platform.

## Matching pipeline

- **Hard filters** — age, sex, and recruitment status eliminate ineligible trials before any AI is involved.
- **Semantic search** — patient medical summaries are embedded and matched against pre-computed study vectors (Voyage AI `voyage-3`).
- **LLM reranking** — top-20 candidates are scored and explained by an LLM, surfacing the most relevant trials with human-readable rationale.

## Tech stack

| | |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Clerk |
| Backend | FastAPI, PostgreSQL + pgvector |
| AI | Google Gemini, ChromaDB, Voyage AI |

## Roles

**Patient** — upload a record, see matched trials ranked by relevance, message researchers.

**Researcher** — manage trials, view matched applicants, communicate with patients.

## Data source

Clinical trial data from [ClinicalTrials.gov](https://clinicaltrials.gov) API v2, covering 30+ disease areas including cancer, diabetes, Alzheimer's, cardiovascular disease, and more.
