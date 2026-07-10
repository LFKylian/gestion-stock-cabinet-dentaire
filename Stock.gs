/**
 * Calcule le stock total d'un produit en sommant les qté restantes
 * de tous ses lots actifs (non périmés, non retirés, non épuisés)
 * @param {string} idProduit
 * @param {Sheet}  feuilleLots
 * @returns {number}
 */
function Stock_calculerStockTotal(idProduit, feuilleLots) {
  return feuilleLots
    .filter(lot => {
      const statut = String(lot["Statut"] || "");
      return (
        String(lot["ID Produit lié"]) === String(idProduit) &&
        statut !== "Périmé" &&
        statut !== "Retiré / Rappelé" &&
        statut !== "Épuisé"
      );
    })
    .reduce((sum, lot) => sum + (Number(lot["Quantité restante"]) || 0), 0);
}

/**
 * Évalue l'alerte de stock d'un produit selon son seuil configuré
 * @param {number} stockTotal
 * @param {number} seuilAlerte
 * @returns {string} emoji + libellé
 */
function Stock_evaluerAlerteStock(stockTotal, seuilAlerte) {
  const stock = Number(stockTotal) || 0;
  const seuil = Number(seuilAlerte) || 0;

  if (stock <= 0)      return "🔴 RUPTURE";
  if (stock <= seuil)  return "🟠 STOCK BAS";
  return "🟢 OK";
}