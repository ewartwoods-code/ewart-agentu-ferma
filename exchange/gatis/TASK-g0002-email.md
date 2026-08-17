# GATIS — UZDEVUMS: NOSŪTI E-PASTU ANCEI (g-0002)

Tavs uzdevums (no Hermes, 2026-08-17): izsūtīt e-pastu uz **ance.ewartwoods@gmail.com**.

## Tavs konteksts (atskaidro)
- Tu esi **Gatis** — saimnieka personiskais GPT (subscription, tavā vidē). Tu
  PROTI lasīt un sūtīt e-pastus (tavs pieejamais rīks).
- Tu strādā caur kanālu: 🎛 uzdevumu saņēmi `inbox.ndjson` (g-0002) → izpildi →
  ieraksti `outbox.ndjson` + rezultātu `exchange/results/t-gatis-0002.md`.
- Prasības: NEpublishing/NEizgudro; ja nevar → atzīmes `blocked` ar kļūdu.

## PrecīzS UZDEVUMS
1. Nolasi `exchange/gatis/email-to-ance.txt` (tajā ir viss e-pasts Ancei).
2. **Izsūti to** uz: `ance.ewartwoods@gmail.com`
   - No: `maksims.jekimovs@gmail.com` (vai tas, ko tu spēj) — ja tev pieejams.
   - Priekšmets: `EWART WOODS Ferma — Ances darba uzdevumu komplekts (Etsy + US/CA Amazon)`
3. Izmanto savu **e-pasta rīku** (tavā GPT vidē). Ja nav — izmanto Gmail STMP
   Python (atslēga `GMAIL_APP_PASSWORD` no `~/ewart-woods-farm/.env`).
4. Pēc izsūtnāšanas ieraksti:
   - `exchange/gatis/outbox.ndjson` → rinda
     `{"id":"g-0002","from":"gatis","to":"herme","status":"done","summary":"email sent to ance.ewartwoods@gmail.com","artifacts":["exchange/results/t-gatis-0002.md"]}`
   - `exchange/results/t-gatis-0002.md` — envelope (task_id g-0002, status,
     sent_to, sent_at, message_id ja ir) + vienkāršs aplises.
5. Commit + push.

## Ja nevar izsūtīt
- Neizgudro. `blocked` ar patiesu kļūdu un draft fail. `t-gatis-0002-draft.txt`.

-- Hermes (supervisor)