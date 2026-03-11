import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY nie jest ustawiony — pomijam wysyłkę");
    return null;
  }
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
// Domyślnie onboarding@resend.dev (działa bez weryfikacji domeny na darmowym planie).
// Ustaw RESEND_FROM na własną domenę po jej weryfikacji w panelu Resend.
const FROM = process.env.RESEND_FROM ?? "ParkingCreator <onboarding@resend.dev>";

type ReservationData = {
  to: string;
  spotNumber: string;
  layoutName: string;
  estateName: string;
  startTime: Date;
  endTime: Date;
};

function fmt(d: Date) {
  return d.toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });
}

function baseHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#1e1e2e;padding:24px">
    <h2 style="color:#6c5ce7">${title}</h2>${body}
    <hr style="margin:24px 0;border:none;border-top:1px solid #ddd"/>
    <p style="font-size:12px;color:#888">ParkingCreator — System zarządzania parkingiem</p>
  </body></html>`;
}

export async function sendReservationCreated(data: ReservationData) {
  const client = getResend();
  if (!client) return;
  await client.emails.send({
    from: FROM,
    to: data.to,
    subject: `Rezerwacja ${data.spotNumber} — Oczekuje na potwierdzenie`,
    html: baseHtml(
      `Rezerwacja przyjęta — miejsce ${data.spotNumber}`,
      `<p>Twoja rezerwacja oczekuje na potwierdzenie zarządcy osiedla.</p>
       <table style="border-collapse:collapse;margin-top:16px">
         <tr><td style="padding:4px 12px 4px 0;color:#888">Miejsce:</td><td><strong>${data.spotNumber}</strong> — ${data.layoutName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Osiedle:</td><td>${data.estateName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Od:</td><td>${fmt(data.startTime)}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Do:</td><td>${fmt(data.endTime)}</td></tr>
       </table>`
    ),
  });
}

export async function sendReservationConfirmed(data: ReservationData) {
  const client = getResend();
  if (!client) return;
  await client.emails.send({
    from: FROM,
    to: data.to,
    subject: `Rezerwacja ${data.spotNumber} — Potwierdzona ✓`,
    html: baseHtml(
      `Rezerwacja potwierdzona — miejsce ${data.spotNumber}`,
      `<p style="color:#00b894;font-weight:bold">Twoja rezerwacja została potwierdzona przez zarządcę.</p>
       <table style="border-collapse:collapse;margin-top:16px">
         <tr><td style="padding:4px 12px 4px 0;color:#888">Miejsce:</td><td><strong>${data.spotNumber}</strong> — ${data.layoutName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Osiedle:</td><td>${data.estateName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Od:</td><td>${fmt(data.startTime)}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Do:</td><td>${fmt(data.endTime)}</td></tr>
       </table>`
    ),
  });
}

export async function sendActivationEmail(data: { to: string; name: string; activationUrl: string }) {
  const client = getResend();
  if (!client) return;
  await client.emails.send({
    from: FROM,
    to: data.to,
    subject: "Aktywuj swoje konto w ParkingCreator",
    html: baseHtml(
      `Witaj, ${data.name}!`,
      `<p>Twoje konto w systemie zarządzania parkingiem zostało utworzone.</p>
       <p>Aby aktywować konto i ustawić hasło, kliknij poniższy link:</p>
       <p style="margin:24px 0">
         <a href="${data.activationUrl}" style="background:#6c5ce7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
           Aktywuj konto
         </a>
       </p>
       <p style="font-size:12px;color:#888">Link wygasa po 48 godzinach.<br/>Jeśli to nie Ty, zignoruj tę wiadomość.</p>`
    ),
  });
}

export async function sendReservationCancelled(data: ReservationData) {
  const client = getResend();
  if (!client) return;
  await client.emails.send({
    from: FROM,
    to: data.to,
    subject: `Rezerwacja ${data.spotNumber} — Anulowana`,
    html: baseHtml(
      `Rezerwacja anulowana — miejsce ${data.spotNumber}`,
      `<p style="color:#e17055">Rezerwacja na poniższy termin została anulowana.</p>
       <table style="border-collapse:collapse;margin-top:16px">
         <tr><td style="padding:4px 12px 4px 0;color:#888">Miejsce:</td><td><strong>${data.spotNumber}</strong> — ${data.layoutName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Osiedle:</td><td>${data.estateName}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Od:</td><td>${fmt(data.startTime)}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#888">Do:</td><td>${fmt(data.endTime)}</td></tr>
       </table>`
    ),
  });
}
