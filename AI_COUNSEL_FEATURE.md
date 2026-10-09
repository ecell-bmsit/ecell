# AI Counsel for Build Your Idea

## Purpose

AI Counsel helps students pressure-test a startup idea before approaching E-Cell. It should act as a preparation coach, not as an authority that accepts, rejects, or numerically scores an idea.

The feature should help a student understand:

- The problem they are solving
- Who experiences the problem
- Existing alternatives and competitors
- Evidence that the problem exists
- Technical, financial, operational, and adoption constraints
- What to research or validate before requesting E-Cell support

## Student workflow

1. The student opens **Build Your Idea**.
2. The student writes an initial draft covering the problem, target user, proposed solution, and current evidence.
3. The student clicks **Get AI Feedback**.
4. The site asks for the student's college Google Workspace email and sends a one-time code (OTP) to that mailbox.
5. The student enters the code. Supabase Auth verifies it and creates a session.
6. The AI endpoint validates that session and checks the exact allowed email domain.
7. The server checks the student's remaining AI allowance and the project-wide daily budget.
8. The server sends the draft to the AI provider.
9. The AI returns:
   - A short understanding of the idea
   - Three to five questions the student should answer
   - Likely constraints to investigate
   - Specific research or validation tasks
   - A suggested next step
10. The student revises the idea and may request limited follow-up feedback.
11. The student submits the prepared idea to E-Cell.
12. The server saves the submission to Supabase Postgres first, then appends a review row to Google Sheets.
13. E-Cell reviews the submission, assigns a status and owner, and contacts the student.

AI feedback must not prevent final submission. If the AI provider is unavailable, the student should still be able to submit the idea.

## Authentication: college email OTP

The college uses Google Workspace for email. The selected login method is **email OTP through Supabase Auth**: students prove that they can receive mail at their college address by entering the code sent to it. The site does not need Google OAuth for this flow.

Authentication is required **before the first AI request** and before final submission. Students do not need access to Google Sheets; a server-side E-Cell service account writes review rows.

### Exact domain rule

College IT must confirm the exact student email domain or domains before implementation. `@bmsit.in` and `@student.bmsit.in` are different domains. Do not implement the proposed `.bmsit.in` suffix check literally: it would not match an address like `name@bmsit.in`.

Parse and normalize the email address, then compare its domain for exact equality against a server-controlled allowlist. Apply the same rule before requesting an OTP, in a Supabase **Before User Created** hook, and when authorizing each AI or submission request. The client-side check is only for immediate feedback.

Mail delivery proves control of that mailbox. It does not by itself prove current enrollment if staff or alumni retain addresses on the same domain. Ask college IT whether students have a separate domain or whether current-student status needs an additional eligibility list.

### Supabase Auth setup

1. Enable email authentication in the E-Cell Supabase project.
2. Configure the email template to include `{{ .Token }}` so `signInWithOtp` sends a six-digit code instead of the default magic link.
3. Set OTP expiry to about 10 minutes.
4. Configure a verified E-Cell sender through custom SMTP or Supabase's Send Email hook. Supabase's built-in sender is limited to two auth emails per hour and is not suitable for a student launch.
5. Set the allowed site URL and redirect URLs for local and production environments.
6. Implement a **Before User Created** hook to reject new accounts outside the allowed domain list.
7. Call `signInWithOtp` to send the code and `verifyOtp` with type `email` to verify it.
8. Keep the OTP resend cooldown and verification-attempt limits enabled; add application limits per email and IP to prevent inbox flooding.

The Supabase publishable key may be used in the browser. The service role key and SMTP credentials must remain server-side. Never treat possession of a publishable key as authorization.

### Information needed from college IT

- Exact student email domain or domains
- Whether staff, alumni, or guests use those same domains
- Permission to send login codes to student mailboxes
- An E-Cell-controlled sender address and approved SMTP service, or permission to use a transactional email provider
- Any college policy on storing student ideas and email addresses

## Session and authorization rules

- Keep the Supabase service role key, SMTP credentials, and AI key only in server environment variables.
- Verify the Supabase access token and its user on every AI and submission request.
- Never trust an email, user ID, or allowance value sent by the browser.
- Use the Supabase Auth user ID for rate limiting and the verified email for contact.
- Keep session tokens out of URLs and use secure cookie handling for server endpoints.
- Expire inactive sessions and provide a sign-out action.

## Usage limits

Recommended pilot limits:

- Three AI feedback requests per idea
- A separate daily limit per verified student, such as three to five requests
- A project-wide daily request ceiling
- Maximum idea length of 5,000 characters
- Maximum AI response length configured server-side
- CAPTCHA or equivalent abuse protection on OTP requests when abuse appears

Do not use campus IP address as the only limit because many students may share one Wi-Fi exit IP. Use the verified Supabase Auth user ID, with IP-based protection as a secondary signal.

Persist usage counters in Supabase Postgres. An in-memory counter is unreliable across serverless instances. Claim an allowance atomically so simultaneous requests cannot bypass the limit.

When a limit is reached, show the remaining time or reset date and allow final submission without additional AI feedback.

## AI response contract

The AI endpoint should request structured JSON so the frontend can render predictable sections:

```json
{
  "understanding": "Short restatement of the idea",
  "questions": ["Question 1", "Question 2", "Question 3"],
  "constraints": [
    {
      "category": "technical | financial | operational | adoption | legal",
      "hypothesis": "Constraint to investigate",
      "whyItMatters": "Why this could affect implementation",
      "howToCheck": "A concrete validation action"
    }
  ],
  "researchTasks": ["Interview five target users"],
  "nextStep": "One concrete action to take first",
  "disclaimer": "This is exploratory feedback and is not a feasibility decision."
}
```

The prompt should instruct the model to:

- Ask specific, answerable questions
- Separate assumptions from known facts
- Avoid claiming that an idea will succeed or fail
- Avoid legal, medical, financial, or safety conclusions
- Avoid exposing one student's idea to another student
- Prefer low-cost validation tasks suitable for college students
- Keep the response concise and actionable

## Data storage

### Supabase Postgres: source of truth

The site will move from MongoDB to Supabase. Store complete records in Supabase Postgres because they need retries, status changes, duplicate protection, and audit history. Use foreign keys to `auth.users.id` where appropriate and enable Row Level Security (RLS) on student-facing tables. A student may read and update only their own drafts and submissions; E-Cell review access should use an explicit staff role or server endpoint.

Suggested fields:

- `submissionId`
- `authUserId` (`auth.users.id`)
- `verifiedEmail`
- `name`
- `initialIdea`
- `finalIdea`
- `aiFeedbackRounds`
- `researchAnswers`
- `aiFeedback`
- `aiRequestCount`
- `status`
- `assignedTo`
- `createdAt`
- `updatedAt`

Keep separate tables for ideas, feedback rounds, usage counters, and Sheet export jobs. Do not expose a service role key to the browser. Protect updates to usage counters and review statuses through server-side authorization.

### Google Sheets: team review surface

Append one row after the Supabase save succeeds. Suggested columns:

| Column | Purpose |
|---|---|
| Submission ID | Deduplication and lookup |
| Submitted at | Sorting and reporting |
| Name | Contact |
| Verified email | Contact and ownership |
| Problem | Understand the need |
| Target users | Understand the audience |
| Proposed solution | Understand the product |
| Evidence/research | Measure preparation |
| Open questions | Guide the first meeting |
| Constraints raised | Prepare mentors |
| AI rounds used | Usage tracking |
| Status | New, needs clarification, meeting planned, mentoring, closed |
| Owner | E-Cell team member responsible |
| Notes | Internal follow-up |

Protect the sheet and restrict access to the E-Cell team. Treat all student text as untrusted text. Prevent spreadsheet formula injection by writing user content as text and escaping values beginning with `=`, `+`, `-`, or `@` where necessary.

If the Sheets API fails, keep the Supabase record and mark the export for retry. Do not make the student submit again.

## MongoDB to Supabase migration

This is a site-wide database change, not just an AI Counsel change. The repository currently uses MongoDB for ideas, failure stories, words, hit counts, game teams, game state, and crossword entries. Inventory the deployed routes and all existing records before removing MongoDB connections.

1. Design Postgres tables and constraints for each collection. Preserve original MongoDB IDs in a `legacy_mongo_id` column where needed for traceability.
2. Export a backup of MongoDB data and record document counts per collection.
3. Import the data into Supabase and validate row counts, unique keys, relationships, and representative records.
4. Convert API handlers from Mongoose queries to Supabase or SQL queries. Keep sensitive operations on the server and apply RLS to any browser-accessible tables.
5. Run both systems only as long as needed for a controlled cutover. Decide how writes made during migration will be copied before switching production traffic.
6. Switch production routes to Supabase, test submission and game flows, and keep the MongoDB backup until reconciliation is complete.
7. Remove `MONGODB_URI`, Mongoose dependencies, and old models only after all production routes and historical data have been verified.

Google Sheets remains a review surface. It is not the database being migrated.

## API design

### `POST /api/auth/request-otp`

Accepts a college email, checks the exact allowed domain and abuse limits, then requests a Supabase Auth email OTP. Return a generic response that does not disclose whether the address already has an account.

### `POST /api/auth/verify-otp`

Verifies the code through Supabase Auth and establishes a session. A wrong or expired code must not create a usable session.

### `POST /api/ai-feedback`

Requires an authenticated college session.

Request:

```json
{
  "ideaId": "optional-id-for-follow-up",
  "idea": "Student draft",
  "context": {
    "problem": "Optional structured answer",
    "targetUsers": "Optional structured answer",
    "evidence": "Optional structured answer"
  }
}
```

Server checks:

1. Valid session
2. Verified college email and exact allowed domain
3. Valid input length
4. CAPTCHA result when required
5. Per-idea allowance
6. Per-student daily allowance
7. Project-wide daily ceiling

The endpoint returns the structured AI response and updated allowance information. It must never return provider keys, internal prompts, or database credentials.

### `POST /api/submit-idea`

Requires an authenticated college session. Save to Supabase Postgres first, then enqueue or perform the Sheets append. Return a submission ID even if the Sheets export is pending.

### `POST /api/auth/logout`

Clears the secure application session.

## Cost planning

For 200–300 ideas, with three short AI responses per idea, the expected provider usage is approximately 600–900 calls. The planned AI provider can be Claude through an E-Cell-owned Claude Console organization. Using 2,000 input and 1,000 output tokens per call, the estimate from Anthropic's October 2026 list prices is about $0.42–$0.63 on Claude Haiku 5.5 or $8.40–$12.60 on Claude Sonnet 5.5. Recheck prices before launch; longer prompts, responses, retries, and model changes alter the bill.

Budget separately for Supabase hosting and OTP email delivery. Configure custom SMTP before the student pilot; the built-in Supabase sender is too limited for this use case.

The main financial risk is an unprotected public endpoint. Add:

- Provider project spend alerts
- An application-level hard daily request ceiling
- An application-level monthly budget ceiling
- Usage logging without storing sensitive prompt contents unnecessarily
- Alerts for unusual request spikes or error rates

## Privacy and student communication

Before the first AI request, show a short notice explaining:

- The idea text is sent to Claude for feedback
- E-Cell stores the draft and final submission for review
- The student should not include passwords, personal secrets, or sensitive third-party information
- AI feedback is exploratory and is reviewed by the student and E-Cell

Decide and document retention periods for drafts, AI feedback, authentication identifiers, and final submissions. Give students a way to request correction or deletion where college policy requires it.

## Failure handling

- Wrong or expired OTP: allow a limited retry and explain how to request a fresh code.
- Email delivery failure: keep the draft intact and show a retry option after the resend cooldown.
- AI timeout: offer retry, but do not assume an interrupted provider request was free.
- AI provider error: show a useful message and keep the draft in the browser.
- Rate limit: show the reset time and allow final submission.
- Supabase failure: do not report success; ask the student to retry.
- Sheets failure after Supabase success: report that the submission was saved and queue the export.
- Duplicate retry: use `submissionId` and an idempotency key to avoid duplicate rows.

## Implementation phases

### Phase 1: prepare the database migration

- Verify the deployed `/api/submit-idea` route.
- Inventory MongoDB collections, production routes, record counts, and data constraints.
- Create the Supabase project, Postgres schema, RLS policies, and backup plan.
- Migrate historical records and validate counts and sample records before cutover.
- Convert and test all routes that currently use Mongoose.
- Add a unique submission ID and idempotency handling in Supabase.

### Phase 2: add Google Sheets export

- Create an E-Cell-owned Google Cloud project.
- Enable the Sheets API.
- Create a service account.
- Share the target Sheet with the service account's email as an editor.
- Store credentials only in deployment environment variables.
- Add retry and export-status handling.

### Phase 3: add college email OTP

- Confirm exact Google Workspace student email domains and account eligibility with college IT.
- Configure Supabase Auth email OTP template, expiry, sender, and custom SMTP.
- Add the domain restriction hook and server-side session checks.
- Test valid student, wrong-domain, staff/alumni, expired code, resend, and abuse-limit cases.

### Phase 4: add AI Counsel

- Add the structured draft UI.
- Require a verified college email OTP session before the first AI call.
- Add the AI endpoint and structured response renderer.
- Add persistent usage limits, CAPTCHA, logging, and budget ceilings.
- Pilot with 20–30 students.

### Phase 5: launch and monitor

- Review feedback quality with E-Cell mentors.
- Track request count, cost, latency, failures, and abandoned drafts.
- Adjust limits and prompts based on pilot evidence.
- Expand access to the full student population.

## Acceptance criteria

- A student cannot call the AI endpoint without a valid college session.
- An address outside the exact allowed domain is rejected before an OTP is sent and cannot access protected endpoints.
- A valid OTP proves mailbox control; current-student eligibility is checked separately if the college requires it.
- The built-in Supabase mail sender is replaced with a production-capable SMTP or Send Email hook configuration.
- The AI key is never present in frontend code or browser responses.
- Supabase RLS prevents one student from reading another student's idea.
- Limits work across multiple serverless instances.
- A failed Sheets write does not lose a saved submission.
- Duplicate retries do not create duplicate Sheet rows.
- The student can submit without AI feedback if the provider is unavailable.
- The page remains usable at phone widths from 320px upward.
- MongoDB collections and records have been reconciled in Supabase before production cutover.
- The OTP flow is tested with real college Google Workspace mailboxes before launch.

## References

- [Supabase passwordless email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase Before User Created hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)
- [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
