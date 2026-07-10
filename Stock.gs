// ============================================================
//  Stock.gs — Calculs de stock et actions métier
//
//  CORRECTION BUG #2 : Utils_recalculerTout() passait feuilleLots
//  manquant à Utils_recalculerProduit(). Toutes les fonctions
//  reçoivent maintenant les deux tableaux explicitement.
//
//  PRINCIPE GRASP "Faible couplage" : Stock.gs ne lit jamais
//  le Sheets directement — il reçoit les tableaux en paramètre
//  et délègue les écritures à Utils_ecrireParId().
// ============================================================

/**
 * Calcule le stock total d'un produit depuis le tableau des lots.
 * N'exclut que les lots inactifs (Périmé, Retiré, Épuisé).
 * @param {string}   idProduit
 * @param {Object[]} feuilleLots
 * @returns {number}
 */
function Stock_calculerStockTotal(idProduit, feuilleLots) {
  return feuilleLots
    .filter(lot => {
      const statut = String(lot[COL.LOT.STATUT] || "");
      return (
        String(lot[COL.LOT.ID_PRODUIT]) === String(idProduit) &&
        statut !== STATUT_LOT.PERIME &&
        statut !== STATUT_LOT.RETIRE &&
        statut !== STATUT_LOT.EPUISE
      );
    })
    .reduce((sum, lot) => sum + (Number(lot[COL.LOT.QTE_RESTANTE]) || 0), 0);
}

/**
 * Retourne le libellé d'alerte de stock selon le seuil configuré.
 * @param {number} stockTotal
 * @param {number} seuilAlerte
 * @returns {string}
 */
function Stock_evaluerAlerteStock(stockTotal, seuilAlerte) {
  const stock = Number(stockTotal) || 0;
  const seuil = Number(seuilAlerte) || 0;
  if (stock <= 0)     return "🔴 RUPTURE";
  if (stock <= seuil) return "🟠 STOCK BAS";
  return "🟢 OK";
}

/**
 * Recalcule et persiste les colonnes calculées d'un lot (alerte + jours).
 * CORRECTION BUG #2 : reçoit le tableau feuilleLots pour localiser _row.
 * @param {string}   refLot
 * @param {Object[]} feuilleLots
 */
function Stock_recalculerLot(refLot, feuilleLots) {
  const lot = Utils_lireLigneParId(feuilleLots, COL.LOT.REF, refLot);
  if (!lot) return;

  const jours  = Alerts_joursAvantPeremption(lot[COL.LOT.DATE_PEREM]);
  const alerte = Alerts_evaluerAlertePeremption(lot[COL.LOT.DATE_PEREM], lot[COL.LOT.QTE_RESTANTE]);
  const miseAJour = {
    [COL.LOT.JOURS_PEREM]:  jours,
    [COL.LOT.ALERTE_PEREM]: alerte,
  };

  // Péremption automatique si dépassée
  if (jours < 0 && lot[COL.LOT.STATUT] !== STATUT_LOT.RETIRE) {
    miseAJour[COL.LOT.STATUT] = STATUT_LOT.PERIME;
  }

  Utils_ecrireParId(SHEETS.LOTS, feuilleLots, COL.LOT.REF, refLot, miseAJour);
}

/**
 * Recalcule et persiste Stock total + Alerte stock d'un produit.
 * CORRECTION BUG #2 : reçoit les deux tableaux — plus d'argument manquant.
 * @param {string}   idProduit
 * @param {Object[]} feuilleProduits
 * @param {Object[]} feuilleLots
 */
function Stock_recalculerProduit(idProduit, feuilleProduits, feuilleLots) {
  const produit = Utils_lireLigneParId(feuilleProduits, COL.PROD.ID, idProduit);
  if (!produit) return;

  const stock  = Stock_calculerStockTotal(idProduit, feuilleLots);
  const alerte = Stock_evaluerAlerteStock(stock, produit[COL.PROD.SEUIL]);

  Utils_ecrireParId(SHEETS.PRODUITS, feuilleProduits, COL.PROD.ID, idProduit, {
    [COL.PROD.STOCK_TOTAL]: stock,
    [COL.PROD.ALERTE]:      alerte,
  });
}

/**
 * Recalcule tous les lots puis tous les produits impactés.
 * Lit chaque feuille UNE SEULE FOIS et réutilise le tableau.
 * @returns {{ feuilleProduits: Object[], feuilleLots: Object[] }}
 */
function Stock_recalculerTout() {
  const feuilleLots     = Utils_lireFeuille(SHEETS.LOTS);
  const feuilleProduits = Utils_lireFeuille(SHEETS.PRODUITS);
  const produitsTraites = new Set();

  feuilleLots.forEach(lot => {
    Stock_recalculerLot(lot[COL.LOT.REF], feuilleLots);

    const idProd = String(lot[COL.LOT.ID_PRODUIT] || "");
    if (idProd && !produitsTraites.has(idProd)) {
      Stock_recalculerProduit(idProd, feuilleProduits, feuilleLots);
      produitsTraites.add(idProd);
    }
  });

  // Relit les feuilles après écriture pour retourner des données à jour
  return {
    feuilleLots:     Utils_lireFeuille(SHEETS.LOTS),
    feuilleProduits: Utils_lireFeuille(SHEETS.PRODUITS),
  };
}

/**
 * Enregistre une réception (création d'un lot + mouvement d'entrée).
 * Crée le produit à la volée si isNouveauProduit === true.
 * @param {Object} data  - payload du formulaire
 * @returns {{ ok: boolean, refLot?: string, erreur?: string }}
 */
function Stock_enregistrerReception(data) {
  try {
    const now         = new Date();
    const utilisateur = data.effectuePar || Utils_getUtilisateur();
    let   idProduit   = data.idProduit;
    let   nomProd     = "";

    if (data.isNouveauProduit === true || data.isNouveauProduit === "true") {
      idProduit = Utils_genererID(ID_PREFIX.PROD);
      nomProd   = data.prodNom;
      Utils_ajouterLigne(SHEETS.PRODUITS, [
        idProduit, nomProd,
        data.prodCatReg, data.prodCatUsage, data.prodUnite,
        Number(data.prodSeuil) || 5,
        data.fournisseur || "", data.emplacement || "",
        "Créé via formulaire réception", "OUI", 0, "",
      ]);
      Log_ecrire(utilisateur, "CREATION", "Produit", idProduit, null, nomProd);
    } else {
      const produits = Utils_lireFeuille(SHEETS.PRODUITS);
      const produit  = Utils_lireLigneParId(produits, COL.PROD.ID, idProduit);
      nomProd = produit ? produit[COL.PROD.NOM] : idProduit;
    }

    const refLot = Utils_genererID(ID_PREFIX.LOT);
    const qte    = Number(data.qteRecue);

    Utils_ajouterLigne(SHEETS.LOTS, [
      refLot, idProduit, nomProd,
      data.numLotFournisseur, qte, qte,
      data.dateReception  ? new Date(data.dateReception)  : now,
      data.datePeremption ? new Date(data.datePeremption) : "",
      data.fournisseur || "", STATUT_LOT.EN_STOCK,
      data.emplacement || "", "", "", data.notes || "",
    ]);

    Utils_ajouterLigne(SHEETS.MOUVEMENTS, [
      Utils_genererID(ID_PREFIX.MVT), refLot, nomProd,
      TYPE_MVT.ENTREE, qte, now, utilisateur,
      data.commentaire || "Réception initiale", qte,
    ]);

    // Recalcul ciblé (lot + produit uniquement, pas tout le Sheets)
    const feuilleLots     = Utils_lireFeuille(SHEETS.LOTS);
    const feuilleProduits = Utils_lireFeuille(SHEETS.PRODUITS);
    Stock_recalculerLot(refLot, feuilleLots);
    Stock_recalculerProduit(idProduit, feuilleProduits, feuilleLots);

    Log_ecrire(utilisateur, "RECEPTION", "Lot", refLot, null, JSON.stringify({ qte, nomProd }));
    return { ok: true, refLot };
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}

/**
 * Enregistre une sortie (prélèvement sur un lot existant).
 * Vérifie la cohérence du cache avant d'écrire (anti-conflit).
 * @param {Object} data  - payload du formulaire
 * @param {Object} etatCacheClient  - { refLot, qteRestante } snapshot client
 * @returns {{ ok: boolean, qteApres?: number, erreur?: string }}
 */
function Stock_enregistrerSortie(data, etatCacheClient) {
  try {
    const feuilleLots = Utils_lireFeuille(SHEETS.LOTS);
    const lot         = Utils_lireLigneParId(feuilleLots, COL.LOT.REF, data.refLot);
    if (!lot) return { ok: false, erreur: "Lot introuvable." };

    const qteSortie   = Number(data.quantite);
    const qteServeur  = Number(lot[COL.LOT.QTE_RESTANTE]);
    const utilisateur = data.effectuePar || Utils_getUtilisateur();

    // ── Détection de conflit : le serveur diffère du cache client ──
    if (etatCacheClient && Number(etatCacheClient.qteRestante) !== qteServeur) {
      return {
        ok: false,
        conflit: true,
        erreur: `Conflit détecté : le stock a changé depuis votre dernière actualisation. `
              + `Cache : ${etatCacheClient.qteRestante} · Serveur : ${qteServeur}. `
              + `Veuillez actualiser et recommencer.`,
        qteServeur,
      };
    }

    if (qteSortie <= 0)          return { ok: false, erreur: "La quantité doit être > 0." };
    if (qteSortie > qteServeur)  return { ok: false, erreur: `Stock insuffisant. Disponible : ${qteServeur}` };

    const qteApres      = qteServeur - qteSortie;
    const nouveauStatut = qteApres === 0
      ? STATUT_LOT.EPUISE
      : qteApres <= 3 ? STATUT_LOT.STOCK_BAS : STATUT_LOT.EN_STOCK;

    Utils_ecrireParId(SHEETS.LOTS, feuilleLots, COL.LOT.REF, data.refLot, {
      [COL.LOT.QTE_RESTANTE]: qteApres,
      [COL.LOT.STATUT]:       nouveauStatut,
    });

    Utils_ajouterLigne(SHEETS.MOUVEMENTS, [
      Utils_genererID(ID_PREFIX.MVT), data.refLot, lot[COL.LOT.NOM_PRODUIT],
      TYPE_MVT.SORTIE, qteSortie, new Date(), utilisateur,
      data.commentaire || "", qteApres,
    ]);

    const feuilleLotsMaj     = Utils_lireFeuille(SHEETS.LOTS);
    const feuilleProduitsMaj = Utils_lireFeuille(SHEETS.PRODUITS);
    Stock_recalculerLot(data.refLot, feuilleLotsMaj);
    Stock_recalculerProduit(lot[COL.LOT.ID_PRODUIT], feuilleProduitsMaj, feuilleLotsMaj);

    Log_ecrire(utilisateur, "SORTIE", "Lot", data.refLot,
      `Qté avant: ${qteServeur}`, `Qté après: ${qteApres}`);

    return { ok: true, qteApres, nouveauStatut };
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}