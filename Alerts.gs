// ============================================================
//  Alerts.gs — Calculs de péremption et filtres d'alertes
//
//  CORRECTION BUG #4 : tous les appels internes utilisent
//  le préfixe Alerts_ (plus de joursAvantPeremption() nu).
// ============================================================

/**
 * Calcule le nombre de jours entre aujourd'hui et une date de péremption.
 * @param {Date|string} datePer
 * @returns {number} positif = futur, négatif = périmé
 */
function Alerts_joursAvantPeremption(datePer) {
  if (!datePer) return 9999;
  const perem = new Date(datePer);
  const now   = new Date();
  perem.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((perem - now) / (1000 * 60 * 60 * 24));
}

/**
 * Retourne le libellé d'alerte de péremption pour un lot.
 * @param {Date|string} datePer
 * @param {number}      qteRestante
 * @returns {string}
 */
function Alerts_evaluerAlertePeremption(datePer, qteRestante) {
  if (!datePer) return "—";
  if (Number(qteRestante) <= 0) return "— Épuisé";
  const jours = Alerts_joursAvantPeremption(datePer);
  if (jours < 0)                        return "🔴 PÉRIMÉ";
  if (jours <= SEUILS_PEREM.URGENT)     return "🟠 < 30 jours";
  if (jours <= SEUILS_PEREM.PROCHE)     return "🟡 < 60 jours";
  return "🟢 OK";
}

/**
 * Filtre les produits en stock bas ou en rupture.
 * @param {Object[]} feuilleProduits  - tableau issu de Utils_lireFeuille()
 * @returns {Object[]}
 */
function Alerts_getProduitsEnAlerte(feuilleProduits) {
  return feuilleProduits.filter(p => {
    const a = String(p[COL.PROD.ALERTE] || "");
    return a.includes("🔴") || a.includes("🟠");
  });
}

/**
 * Filtre et trie les lots dont la péremption est dans les prochains seuilJours.
 * Exclut les lots épuisés et retirés.
 * CORRECTION BUG #4 : l'appel interne utilise Alerts_joursAvantPeremption().
 * @param {number}   seuilJours
 * @param {Object[]} feuilleLots  - tableau issu de Utils_lireFeuille()
 * @returns {Object[]}
 */
function Alerts_getLotsEnAlertePeremption(seuilJours, feuilleLots) {
  seuilJours = seuilJours || SEUILS_PEREM.PROCHE;
  return feuilleLots
    .filter(lot => {
      if (Number(lot[COL.LOT.QTE_RESTANTE]) <= 0) return false;
      const statut = String(lot[COL.LOT.STATUT] || "");
      if (statut === STATUT_LOT.EPUISE || statut === STATUT_LOT.RETIRE) return false;
      return Alerts_joursAvantPeremption(lot[COL.LOT.DATE_PEREM]) <= seuilJours;
    })
    .sort((a, b) =>
      Alerts_joursAvantPeremption(a[COL.LOT.DATE_PEREM]) -
      Alerts_joursAvantPeremption(b[COL.LOT.DATE_PEREM])
    );
}