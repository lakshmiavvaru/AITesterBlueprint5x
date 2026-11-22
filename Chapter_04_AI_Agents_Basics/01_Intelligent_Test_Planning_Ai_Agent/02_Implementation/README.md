# Jira Test Plan Generator

Enter a Jira ticket ID. The app reads the issue (read-only), then generates a test plan from `01_Plan/TestPlan_Template.md` using Groq or Ollama.

## Run
```bash
npm install
npm start        # http://localhost:3000
```
Requires Node 22+.

## Configuration
The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` and `GROQ_API_KEY` from the repo-root `.env`. The task prompt mentions `config.md`, but you pointed to `.env`, so that is what is used.
Optional: `GROQ_MODEL` (default `openai/gpt-oss-120b`), `OLLAMA_URL`, `OLLAMA_MODEL`.
The Settings page overrides these in server memory only. Secrets are never sent back to the browser.

## Layout
- `src/backend/server.js`: Express API (Jira, LLM, generation)
- `src/frontend/index.html`: React UI (loaded from CDN, no build step). It has the Main page and Settings, as in `design.png`.

## Limitations
- Assumes Jira Cloud (REST API v3).
- The React CDN scripts need internet access.
- Output is requested at temperature 0, but LLM output is not guaranteed to be identical between runs.
- Not verified against a live Jira or LLM unless you run it with your credentials.
