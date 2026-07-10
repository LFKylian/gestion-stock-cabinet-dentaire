// ============================================================
//  Init.gs — Point d'entrée serveur exposé à la WebApp
//
//  Seule fonction appelée par google.script.run au chargement.
//  Retourne TOUTES les données nécessaires en un seul aller-
//  retour réseau : produits, lots, alertes, opérateurs.
//  Le client n'a ensuite plus besoin de rappeler le serveur
//  sauf pour écrire (réception/sortie) ou rafraîchir.
// ============================================================

/**
 * Charge, recalcule et retourne toutes les données du tableau de bord.
 * Appelé au chargement initial ET lors du rafraîchissement manuel.
 * @returns {{
 *   ok: boolean,
 *   produits: Object[],
 *   lots: Object[],
 *   produitsEnAlerte: Object[],
 *   lotsEnAlerte: Object[],
 *   operateurs: string[],
 *   totalProduits: number,
 *   totalLots: number,
 *   timestamp: string
 * }}
 */
function Init_getDashboardData() {
  try {
    // Recalcul complet + lecture fraîche en un seul appel
    const { feuilleProduits, feuilleLots } = Stock_recalculerTout();

    const operateursRes = Utils_getOperateurs();

    return {
      ok:               true,
      produits:         feuilleProduits,
      lots:             feuilleLots,
      produitsEnAlerte: Alerts_getProduitsEnAlerte(feuilleProduits),
      lotsEnAlerte:     Alerts_getLotsEnAlertePeremption(SEUILS_PEREM.PROCHE, feuilleLots),
      operateurs:       operateursRes.ok ? operateursRes.operateurs : [],
      totalProduits:    feuilleProduits.filter(p => p[COL.PROD.ACTIF] === "OUI").length,
      totalLots:        feuilleLots.filter(l =>
                          l[COL.LOT.STATUT] === STATUT_LOT.EN_STOCK ||
                          l[COL.LOT.STATUT] === STATUT_LOT.STOCK_BAS
                        ).length,
      timestamp:        new Date().toISOString(),
    };
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}

/**
 * Enregistre une réception — exposé à google.script.run.
 * @param {Object} data
 * @returns {{ ok: boolean, refLot?: string, erreur?: string }}
 */
function Init_enregistrerReception(data) {
  return Stock_enregistrerReception(data);
}

/**
 * Enregistre une sortie — exposé à google.script.run.
 * Reçoit aussi le snapshot du cache client pour détection de conflit.
 * @param {Object} data
 * @param {Object} etatCacheClient  - { refLot, qteRestante }
 * @returns {{ ok: boolean, qteApres?: number, conflit?: boolean, erreur?: string }}
 */
function Init_enregistrerSortie(data, etatCacheClient) {
  return Stock_enregistrerSortie(data, etatCacheClient);
}