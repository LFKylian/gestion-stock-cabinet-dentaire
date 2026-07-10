/**
 * Retourne les produits en stock bas ou rupture
 * @param {Sheet} feuilleProduits
 * @returns {Array<Object>}
 */
function Alerts_getProduitsEnAlerte(feuilleProduits) {
  return feuilleProduits.filter(p => {
    const alerte = String(p["Alerte stock"] || "");
    return alerte.includes("🔴") || alerte.includes("🟠");
  });
}

/**
 * Retourne les lots avec péremption proche ou dépassée (hors épuisés)
 * @param {number} seuilJours - nombre de jours en-dessous duquel on alerte (défaut 60)
 * @param {Sheet}  feuilleLots
 * @returns {Array<Object>}
 */
function Alerts_getLotsEnAlertePeremption(seuilJours, feuilleLots) {
  seuilJours = seuilJours || 60;
  return feuilleLots.filter(lot => {
    if (Number(lot["Quantité restante"]) <= 0) return false;
    const statut = String(lot["Statut"] || "");
    if (statut === "Épuisé" || statut === "Retiré / Rappelé") return false;
    const jours = joursAvantPeremption(lot["Date de péremption"]);
    return jours <= seuilJours;
  }).sort((a, b) => {
    return joursAvantPeremption(a["Date de péremption"]) - joursAvantPeremption(b["Date de péremption"]);
  });
}

/**
 * Calcule le nombre de jours entre aujourd'hui et une date de péremption
 * @param {Date|string} datePer - date de péremption
 * @returns {number} jours restants (négatif si déjà périmé)
 */
function Alerts_joursAvantPeremption(datePer) {
  if (!datePer) return 9999;
  const perem = new Date(datePer);
  const now   = new Date();
  // Comparaison en jours entiers
  perem.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((perem - now) / (1000 * 60 * 60 * 24));
}

/**
 * Évalue l'alerte de péremption d'un lot
 * @param {Date|string} datePer       - date de péremption du lot
 * @param {number}      qteRestante   - quantité restante (lot épuisé = pas d'alerte utile)
 * @returns {string} emoji + libellé
 */
function Alerts_evaluerAlertePeremption(datePer, qteRestante) {
  if (!datePer) return "—";
  if (Number(qteRestante) <= 0) return "— Épuisé";

  const jours = Alerts_joursAvantPeremption(datePer);

  if (jours < 0)   return "🔴 PÉRIMÉ";
  if (jours <= 30) return "🟠 < 30 jours";
  if (jours <= 60) return "🟡 < 60 jours";
  return "🟢 OK";
}