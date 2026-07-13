// ============================================================
//  Utils.gs — Accès Sheets, lecture/écriture, helpers
//
//  PRINCIPE GRASP "Expert en Information" :
//  Chaque fonction reçoit les données déjà lues en mémoire
//  (tableaux d'objets), jamais un objet Sheet brut.
//  → Une seule lecture Sheets par feuille par exécution.
// ============================================================

/**
 * Retourne l'objet Sheet par nom.
 * @param {string} nom
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function Utils_getFeuille(nom) {
  // const feuille = SpreadsheetApp.openById("1LA8F21XcAoZbVxNInK8HVbUKyal5QJPd9rkVE9qSO9U").getSheetByName(nom);
  const id = Db_getDbId();
  if (!id) throw new Error("DB_MISSING"); // Erreur interceptée par le client
  
  try {
    const ss = SpreadsheetApp.openById(id);
    const feuille = ss.getSheetByName(nom);
    if (!feuille) throw new Error("Feuille introuvable : " + nom);
    return feuille;
  } catch (e) {
    if (e.message.includes("introuvable")) throw e;
    throw new Error("Impossible d'accéder au document. Vérifiez les droits.");
  }
}

/**
 * Lit une feuille entière et retourne un tableau d'objets.
 * Chaque objet a la forme { [nomColonne]: valeur, _row: numLigneReel }.
 * C'est la SEULE fonction qui appelle getValues() — tout le reste
 * travaille sur le tableau retourné.
 * @param {string} nomFeuille
 * @returns {Object[]}
 */
function Utils_lireFeuille(nomFeuille) {
  const feuille = Utils_getFeuille(nomFeuille);
  const donnees = feuille.getDataRange().getValues();
  if (donnees.length <= 1) return [];
  const entetes = donnees[0];
  return donnees.slice(1).map((ligne, i) => {
    const obj = { _row: i + 2 };
    entetes.forEach((col, j) => { obj[col] = ligne[j]; });
    return obj;
  });
}

/**
 * Cherche une ligne par valeur d'ID dans un tableau déjà en mémoire.
 * CORRECTION BUG #3 : reçoit un tableau d'objets, pas un objet Sheet.
 * @param {Object[]} tableau  - résultat de Utils_lireFeuille()
 * @param {string}   colonneId
 * @param {string}   valeurId
 * @returns {Object|null}
 */
function Utils_lireLigneParId(tableau, colonneId, valeurId) {
  return tableau.find(l => String(l[colonneId]) === String(valeurId)) || null;
}

/**
 * Écrit plusieurs champs d'une ligne dans Sheets en un minimum d'appels.
 * Reçoit le tableau en mémoire pour trouver le numéro de ligne
 * sans relire le Sheets.
 *
 * CORRECTION BUG #3 : ne fait plus getDataRange() — utilise _row.
 *
 * @param {string}   nomFeuille
 * @param {Object[]} tableau      - résultat de Utils_lireFeuille()
 * @param {string}   colonneId    - colonne clé pour identifier la ligne
 * @param {string}   valeurId     - valeur de la clé
 * @param {Object}   miseAJour    - { [nomColonne]: nouvelleValeur }
 * @returns {boolean}
 */
function Utils_ecrireParId(nomFeuille, tableau, colonneId, valeurId, miseAJour) {
  const ligne = Utils_lireLigneParId(tableau, colonneId, valeurId);
  if (!ligne) return false;

  const feuille = Utils_getFeuille(nomFeuille);
  const entetes = feuille.getRange(1, 1, 1, feuille.getLastColumn()).getValues()[0];

  Object.entries(miseAJour).forEach(([col, val]) => {
    const idxCol = entetes.indexOf(col);
    if (idxCol !== -1) feuille.getRange(ligne._row, idxCol + 1).setValue(val);
  });

  return true;
}

/**
 * Ajoute une ligne à la fin d'une feuille.
 * @param {string} nomFeuille
 * @param {any[]}  valeurs
 */
function Utils_ajouterLigne(nomFeuille, valeurs) {
  Utils_getFeuille(nomFeuille).appendRow(valeurs);
}

/**
 * Récupère la liste unique des opérateurs pour l'auto-complétion.
 * CORRECTION BUG #1 : appelle Utils_lireFeuille() et non lireFeuille().
 * @returns {{ ok: boolean, operateurs: string[] }}
 */
function Utils_getOperateurs() {
  try {
    const mvts = Utils_lireFeuille(SHEETS.MOUVEMENTS);
    const set = new Set();
    mvts.forEach(m => {
      const nom = String(m[COL.MVT.PAR] || "").trim();
      if (nom && nom !== "anonyme" && nom !== "WebApp") set.add(nom);
    });
    return { ok: true, operateurs: Array.from(set).sort() };
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}

/**
 * Retourne l'email de l'utilisateur actif, ou "anonyme".
 * @returns {string}
 */
function Utils_getUtilisateur() {
  try { return Session.getActiveUser().getEmail() || "anonyme"; }
  catch (_) { return "anonyme"; }
}

/**
 * Génère un ID unique horodaté avec préfixe.
 * Ex: LOT-20260710-A3F2
 * @param {string} prefixe
 * @returns {string}
 */
function Utils_genererID(prefixe) {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefixe}-${date}-${rand}`;
}

/**
 * Formate une date en dd/MM/yyyy selon le fuseau Apps Script.
 * @param {Date|string} val
 * @returns {string}
 */
function Utils_formatDate(val) {
  if (!val) return "";
  try { return Utilities.formatDate(new Date(val), Session.getScriptTimeZone(), "dd/MM/yyyy"); }
  catch (_) { return String(val); }
}

/**
 * Inclut un fichier HTML partiel dans un template (CSS, JS, fragments).
 * Usage dans Index.html : <?!= Utils_include('style') ?>
 * @param {string} filename
 * @returns {string}
 */
function Utils_include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}