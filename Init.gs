/**
 * Retourne toutes les données nécessaires au tableau de bord
 * Utilisé par la WebApp pour le chargement initial
 */
function Init_getDashboardData() {
  resultat = Utils_recalculerTout(); // S'assure que les données calculées sont à jour
  return {
    produits:          resultat.feuilleProduits,
    lots:              resultat.feuilleLots,
    produitsEnAlerte:  Alerts_getProduitsEnAlerte(resultat.feuilleProduits),
    lotsEnAlerte:      Alerts_getLotsEnAlertePeremption(60, resultat.feuilleLots),
    timestamp:         new Date().toISOString(),
    operateurs:        Utils_getOperateurs()
  };
}