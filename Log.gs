// ============================================================
//  Log.gs — Traçabilité de toutes les actions utilisateur
//
//  Séparé de Utils.gs (principe GRASP "Forte cohésion") :
//  une seule responsabilité = écrire dans la feuille Log.
//  Encapsulé dans try/catch : une erreur de log ne doit
//  jamais faire planter l'opération principale.
// ============================================================

/**
 * Enregistre une action dans la feuille Log.
 * @param {string} utilisateur    - email ou nom
 * @param {string} action         - ex: "RECEPTION", "SORTIE", "CREATION", "MODIFICATION"
 * @param {string} entite         - "Produit", "Lot", "Mouvement"
 * @param {string} idEntite       - identifiant de l'entité
 * @param {*}      ancienneValeur - état avant (null si création)
 * @param {*}      nouvelleValeur - état après
 */
function Log_ecrire(utilisateur, action, entite, idEntite, ancienneValeur, nouvelleValeur) {
  try {
    const serialiser = v => (v === null || v === undefined || v === "")
      ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));

    Utils_ajouterLigne(SHEETS.LOG, [
      new Date(),
      utilisateur  || "anonyme",
      action       || "ACTION",
      entite       || "",
      idEntite     || "",
      serialiser(ancienneValeur),
      serialiser(nouvelleValeur),
      `tz:${Session.getScriptTimeZone()}`,
    ]);
  } catch (e) {
    // Silencieux : le log ne doit jamais bloquer l'opération métier
    console.error("Log_ecrire error:", e.message);
  }
}