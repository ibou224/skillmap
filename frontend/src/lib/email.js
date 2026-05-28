/**
 * email.js
 * Service d'envoi d'emails via Resend.
 *
 * Variables d'environnement requises :
 *   RESEND_API_KEY     — clé API Resend (https://resend.com/api-keys)
 *   RESEND_FROM_EMAIL  — adresse expéditrice vérifiée (ex: no-reply@votredomaine.com)
 *                        En développement, utiliser : onboarding@resend.dev
 *
 * Si RESEND_API_KEY est absent, les emails sont ignorés avec un avertissement.
 */

import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

/** Retourne une instance Resend uniquement si la clé est définie. */
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Templates HTML ────────────────────────────────────────────────────────────

/**
 * Template email : affectation finalisée (envoyé au professeur).
 */
function buildFinalizationHtml({ prenom, nom, coursNom, coursCode, etape, sessionNom }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- En-tête SkillMap -->
    <div style="background:linear-gradient(135deg,#4b9a5e 0%,#135d55 100%);border-radius:14px;padding:28px 32px;margin-bottom:20px;">
      <h1 style="color:white;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">SkillMap</h1>
      <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:12px;letter-spacing:0.03em;">
        Gestion des affectations académiques — La Cité
      </p>
    </div>

    <!-- Corps principal -->
    <div style="background:white;border-radius:14px;border:1px solid #e2e8f0;padding:32px;margin-bottom:20px;">

      <!-- Icône checkmark -->
      <div style="width:48px;height:48px;background:#f0fdf4;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:22px;">✅</span>
      </div>

      <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">
        Votre affectation est confirmée
      </h2>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Bonjour <strong style="color:#1e293b;">${prenom} ${nom}</strong>,<br>
        Votre affectation pour la session <strong style="color:#1e293b;">${sessionNom}</strong>
        a été officiellement finalisée par l'équipe RH.
      </p>

      <!-- Carte cours -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 22px;">
        <p style="color:#15803d;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">
          📚 Cours attribué
        </p>
        <p style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 4px;line-height:1.3;">${coursNom}</p>
        <p style="color:#64748b;font-size:13px;margin:0;">
          Code : <strong>${coursCode}</strong>
          &nbsp;·&nbsp;
          Étape ${etape}
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;line-height:1.6;">
        Pour toute question concernant cette affectation, veuillez contacter
        le département des ressources humaines de La Cité.
      </p>
    </div>

    <!-- Pied de page -->
    <p style="color:#cbd5e1;font-size:11px;text-align:center;margin:0;line-height:1.8;">
      © ${new Date().getFullYear()} SkillMap — La Cité collégiale<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>`;
}

// ── Fonctions d'envoi ─────────────────────────────────────────────────────────

/**
 * Envoie un email de confirmation au professeur dont l'affectation vient d'être finalisée.
 *
 * @param {Object} opts
 * @param {string} opts.professorEmail
 * @param {string} opts.professorPrenom
 * @param {string} opts.professorNom
 * @param {string} opts.coursNom
 * @param {string} opts.coursCode
 * @param {number} opts.coursEtape
 * @param {string} opts.sessionNom
 */
export async function sendFinalizationEmail({
  professorEmail,
  professorPrenom,
  professorNom,
  coursNom,
  coursCode,
  coursEtape,
  sessionNom,
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absent — email de finalisation non envoyé à", professorEmail);
    return;
  }

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      professorEmail,
    subject: `[SkillMap] Affectation confirmée — ${coursNom} (${sessionNom})`,
    html:    buildFinalizationHtml({
      prenom:     professorPrenom,
      nom:        professorNom,
      coursNom,
      coursCode,
      etape:      coursEtape,
      sessionNom,
    }),
  });
}

/**
 * Envoie les emails de finalisation en lot (plusieurs affectations).
 * Les erreurs individuelles sont logguées mais n'interrompent pas les autres envois.
 *
 * @param {Array<Parameters<typeof sendFinalizationEmail>[0]>} recipients
 */
export async function sendFinalizationEmailBatch(recipients) {
  if (!getResend()) {
    console.warn(`[email] RESEND_API_KEY absent — ${recipients.length} email(s) non envoyé(s).`);
    return;
  }

  const results = await Promise.allSettled(
    recipients.map((r) => sendFinalizationEmail(r))
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`[email] ${failed.length}/${recipients.length} email(s) échoués :`,
      failed.map((f) => f.reason?.message)
    );
  }
}
