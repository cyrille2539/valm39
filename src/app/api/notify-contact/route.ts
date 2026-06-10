import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SOURCE_LABELS: Record<string, string> = {
  devis:        "Demande de devis",
  agences:      "Partenariat agences",
  location:     "Gestion locative",
  investisseurs:"Investisseurs",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message, source } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.ionos.fr",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.IONOS_EMAIL,
        pass: process.env.IONOS_PASSWORD,
      },
    });

    const sourceLabel = SOURCE_LABELS[source] ?? source ?? "Contact";
    const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    await transporter.sendMail({
      from: `"ValM39 Site" <${process.env.IONOS_EMAIL}>`,
      to: "contact@valm39.fr",
      subject: `Nouvelle demande — ${name || email} (${sourceLabel})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9f9f7;border-radius:8px">
          <h2 style="margin:0 0 4px;color:#2d2d2a">Nouvelle demande de contact</h2>
          <p style="margin:0 0 20px;color:#888;font-size:13px">${date} · ${sourceLabel}</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:100px">Nom</td><td style="padding:8px 0;font-weight:600;color:#2d2d2a">${name || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#6b8f3a">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666">Téléphone</td><td style="padding:8px 0"><a href="tel:${phone}" style="color:#6b8f3a">${phone || "—"}</a></td></tr>
          </table>
          ${message ? `<div style="margin-top:16px;padding:16px;background:#fff;border-radius:6px;border-left:3px solid #6b8f3a"><p style="margin:0;color:#2d2d2a;line-height:1.6">${message.replace(/\n/g, "<br>")}</p></div>` : ""}
          <p style="margin-top:20px;font-size:12px;color:#aaa">Envoyé depuis valm39.fr</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-contact]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
