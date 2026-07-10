function Utils_getFeuille(nom) {
  const ss = SpreadsheetApp.openById("1LA8F21XcAoZbVxNInK8HVbUKyal5QJPd9rkVE9qSO9U");
  const feuille = ss.getSheetByName(nom);
  if (!feuille) throw new Error("Feuille introuvable : " + nom);
  return feuille;
}

/**
 * Retourne toutes les données d'une feuille (sans l'en-tête)
 * sous forme de tableau d'objets {colonne: valeur}
 */
function Utils_lireFeuille(nomFeuille) {
  const feuille = Utils_getFeuille(nomFeuille);
  const donnees = feuille.getDataRange().getValues();
  if (donnees.length <= 1) return [];
  const entetes = donnees[0];
  return donnees.slice(1).map((ligne, i) => {
    const obj = { _row: i + 2 }; // numéro de ligne réel dans Sheets (1-based + en-tête)
    entetes.forEach((col, j) => { obj[col] = ligne[j]; });
    return obj;
  });
}

/**
 * Récupère la liste unique des opérateurs enregistrés dans l'historique (pour l'auto-complétion)
 */
function Utils_getOperateurs() {
  try {
    const mvts = lireFeuille(SHEETS.MOUVEMENTS);
    const listeUnique = new Set();
    mvts.forEach(m => {
      const nom = String(m["Effectué par"] || "").trim();
      if (nom && nom !== "anonyme" && nom !== "WebApp") {
        listeUnique.add(nom);
      }
    });
    return { ok: true, operateurs: Array.from(listeUnique).sort() };
  } catch(e) {
    return { ok: false, erreur: e.message };
  }
}

/**
 * Retourne une ligne unique par valeur d'ID dans une colonne donnée
 * @param {Sheet} feuille
 * @param {string} colonneId  - nom de la colonne d'identifiant (ex: "ID Produit")
 * @param {string} valeurId   - valeur recherchée
 */
function Utils_lireLigneParId(feuille, colonneId, valeurId) {
  return feuille.find(l => String(l[colonneId]) === String(valeurId)) || null;
}

/**
 * Écrit une valeur dans une cellule précise d'une ligne identifiée par son ID
 * @param {Sheet}  feuille
 * @param {string} colonneId     - nom de la colonne d'identifiant
 * @param {string} valeurId      - valeur de l'ID à trouver
 * @param {string} colonneTarget - nom de la colonne à modifier
 * @param {*}      nouvelleVal   - nouvelle valeur à écrire
 * @returns {boolean} true si trouvé et modifié
 */
function Utils_ecrireCelluleParId(feuille, colonneId, valeurId, colonneTarget, nouvelleVal) {
  const donnees = feuille.getDataRange().getValues();
  const entetes = donnees[0];
  const idxId  = entetes.indexOf(colonneId);
  const idxCol = entetes.indexOf(colonneTarget);
  if (idxId === -1 || idxCol === -1) return false;

  for (let i = 1; i < donnees.length; i++) {
    if (String(donnees[i][idxId]) === String(valeurId)) {
      feuille.getRange(i + 1, idxCol + 1).setValue(nouvelleVal);
      return true;
    }
  }
  return false;
}

/**
 * Met à jour les colonnes calculées (Stock total + Alerte stock)
 * d'un produit dans la feuille Produits
 * @param {string} idProduit
 * @param {Sheet}  feuilleProduits
 * @param {Sheet}  feuilleLots
 */
function Utils_recalculerProduit(idProduit, feuilleProduits, feuilleLots) {
  const produit = Utils_lireLigneParId(feuilleProduits, "ID Produit", idProduit);
  if (!produit) return;

  const stock  = Stock_calculerStockTotal(idProduit, feuilleLots);
  const alerte = Stock_evaluerAlerteStock(stock, produit["Seuil alerte (stock bas)"]);

  Utils_ecrireCelluleParId(feuilleProduits, "ID Produit", idProduit, "Stock total",   stock);
  Utils_ecrireCelluleParId(feuilleProduits, "ID Produit", idProduit, "Alerte stock",  alerte);
}

/**
 * Met à jour les colonnes calculées (Alerte péremption + Jours avant péremption)
 * d'un lot dans la feuille Lots
 * @param {string} refLot
 */
function Utils_recalculerLot(refLot, feuille) {
  const lot = Utils_lireLigneParId(feuille, "Référence lot", refLot);
  if (!lot) return;

  const jours  = Alerts_joursAvantPeremption(lot["Date de péremption"]);
  const alerte = Alerts_evaluerAlertePeremption(lot["Date de péremption"], lot["Quantité restante"]);

  Utils_ecrireCelluleParId(feuille, "Référence lot", refLot, "Jours avant péremption", jours);
  Utils_ecrireCelluleParId(feuille, "Référence lot", refLot, "Alerte péremption",      alerte);

  // Mise à jour automatique du statut si périmé
  if (jours < 0 && lot["Statut"] !== "Retiré / Rappelé") {
    Utils_ecrireCelluleParId(feuille, "Référence lot", refLot, "Statut", "Périmé");
  }
}

/**
 * Recalcule TOUS les lots et produits (à appeler via le menu ou un trigger quotidien)
 */
function Utils_recalculerTout() {
  const lots = Utils_lireFeuille(SHEETS.LOTS);
  const produits = Utils_lireFeuille(SHEETS.PRODUITS);
  const idsProduitsTraites = new Set();

  lots.forEach(lot => {
    Utils_recalculerLot(lot["Référence lot"], lots);
    const idProd = String(lot["ID Produit lié"]);
    if (idProd && !idsProduitsTraites.has(idProd)) {
      Utils_recalculerProduit(idProd, produits);
      idsProduitsTraites.add(idProd);
    }
  });

  return { feuilleLots: lots, feuilleProduits: produits };
}

// ==============================================================================
// 
// ==============================================================================

/**
 * Fonction utilitaire pour inclure d'autres fichiers HTML (CSS, JS, fragments)
 * s'utilise avec <?!= include('fichier') ?>
 */
function Utils_include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Génère un ID unique horodaté préfixé
 * Ex: PROD-20260710-A3F2, LOT-20260710-B91C
 */
function Utils_genererID(prefixe) {
  const now = new Date();
  const date = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefixe + "-" + date + "-" + rand;
}