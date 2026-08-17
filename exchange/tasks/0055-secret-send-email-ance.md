# Task t-0055 — Secret: E-pats uz ance.ewartwoods@gmail.com (Ance darba pakete)

- **id:** t-0055
- **to:** secret
- **kind:** `ops` (external email — OWNER-APPROVED send)
- **priority:** high
- **approval:** owner_approved   # the owner explicitly requested this send on
                                # 2026-08-17 ("vai tu vari izsūtīt epastus caur
                                # kādu no mūsu aģentiem?") — process it; still
                                # record proof in the envelope.
- **work_type:** local (python smtplib on this Mac; SMTP is open here)

## Background
Hermes (main server) cannot reach smtp.gmail.com (port 587/465 blocked on that
VM), but THIS MacBook has normal internet + SMTP. So Secret sends the
owner-approved email to Ance, whose new computer needs the bring-up package.

## Do
1. Read this repo (remember `exchange/ance/` + `exchange/tasks/0054-ance-bringup.md`
   + `scripts/ance-worker/setup-ance.sh` — the Ance bring-up package, commit
   `28ed2a1`).
2. Make sure the Gmail app-password is available:
   - `~/ewart-woods-farm/.env` should have `GMAIL_APP_PASSWORD=<app-password>`.
   - If NOT present: ask the OWNER (this chat) for it, or pause and report
     `blocked: need GMAIL_APP_PASSWORD in .env` (do NOT print the password,
     do NOT commit it).
3. Send the email with python3:
   - from: `ewartwoods@gmail.com` (sender + starttls via smtp.gmail.com:587)
   - to: `ance.ewartwoods@gmail.com`
   - subject: Expression as in the body below.
   - body: copy the "EMAIL BODY" verbatim below.
   - Use `smtplib.SMTP("smtp.gmail.com",587); starttls(); login(...)`.
4. If SMTP fails from here too (this Mac may also be restricted), do NOT retry
   wildly: report `blocked` with the exact error + the raw email prepared
   inside `exchange/results/t-0055-email-draft.txt` so the owner can paste+sand.
5. Commit + push. Envelope: `exchange/results/t-0055.md` with
   `{status: done, sent_to: ance..., message_id, sent_at}` or `blocked`.

## EMAIL BODY (send verbatim; headers as plain text above)

```
Subject: EWART WOODS Ferma — Ances darba uzdevumu komplekts (Etsy + US/CA Amazon)

Labdien, Ance!

No EWART WOODS fermas vadības (Hermes) — esi pieslēdzama kā jaunais aģents, kas
pārvaldīs mūsu Etsy veikalu un Amazon US/Kanāda kontus.

ĪSI INSTRUKCIJAS (šeit būs tā mazā versija; visi faili jau ir GitHub):

1. Jaunajā datorā:
   git clone https://github.com/ewartwoods-code/ewart-woods-farm.git ~/ewart-woods-farm
   cd ~/ewart-woods-farm

2. Uzstadi node >= 20 (nodejs.org) + Claude CLI (npm i -g @anthropic-ai/claude-code)
   un pieslēdz savu Claude kontu.

3. Palaid:
   bash scripts/ance-worker/setup-ance.sh

4. Uzīme Vieta: iestadjies (CHrome profilā "Ance") savos pārdošanas kontos:
   - Etsy (etsy.com/your/shop)
   - Amazon US (sellercentral.amazon.com)
   - Amazon CA (sellercentral.amazon.ca)

5. Pirms ieslēgšanas: 
   AUTOPILOT_EXECUTE=0 WORKER_ID=ance bash scripts/autopilot.sh

6. Iepirkš ekspluatāciju (ar īpašnieka apstipr.): launchctl load ... (vai systemd)
   IEpako to, ko izdr zī)"setup-ance.sh".

Ja kaut kas nav skaiis, uzraksti šeit vai atbildi šai vēstulei. Visi faili ir:
exchange/ance/ · exchange/tasks/0054-ance-bringup.md · scripts/ance-worker/setup-ance.sh
Komla 28ed2a1. Nauda/reklāmu/listingimu izmai īmai = tikai ar īsnieka at pid rību.

Ar cieņu,
Hermes — EWART WOODS ferma
EOF

## Result envelope
exchange/results/t-0055.md (status done/blocked + Message-Id if sent). No
secrets in the commit. If blocked, also commit the draft file above.

-- Hermes, 2026-08-17