/**
 * Retourne l'ID actuel pour l'interface
 */
function Db_getDbConfig() {
  return { id: Db_getDbId() || "" };
}

/**
 * Déconnecte la base de données actuelle
 */
function Db_deconnecterDb() {
  PropertiesService.getUserProperties().deleteProperty('DB_ID');
  return { ok: true };
}

/**
 * Vérifie, valide ou initialise une nouvelle base de données
 */
function Db_connecterDb(urlOuId) {
  try {
    // 1. Extraction de l'ID (Gère à la fois les URL complètes et les ID bruts)
    let id = urlOuId.trim();
    if (id.includes('/d/')) {
      const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) id = match[1];
    }

    if (!id) return { ok: false, erreur: "Lien ou ID invalide." };

    // 2. Tentative d'ouverture du document
    const ss = SpreadsheetApp.openById(id);
    const sheets = ss.getSheets().map(s => s.getName());

    // 3. Validation de la structure
    const requiredSheets = ["Produits", "Lots", "Mouvements", "Log"];
    const hasAllSheets = requiredSheets.every(nom => sheets.includes(nom));

    if (hasAllSheets) {
      // Le document semble avoir les bonnes feuilles, on vérifie l'en-tête de contrôle
      const enteteControle = ss.getSheetByName("Produits").getRange("A1").getValue();
      if (String(enteteControle).trim() !== "ID Produit") {
        return { ok: false, erreur: "Document non conforme : Le format des colonnes ne correspond pas à l'application." };
      }
      
      // Tout est valide, on sauvegarde l'ID
      PropertiesService.getUserProperties().setProperty('DB_ID', id);
      return { ok: true, isNew: false, message: "Connexion réussie à la base de données existante." };

    } else {
      // 4. Initialisation si la structure est absente
      _initialiserStockDentaire(ss); // Appel fonctions OnceInit.gs
      PropertiesService.getUserProperties().setProperty('DB_ID', id);
      return { ok: true, isNew: true, message: "Nouveau document détecté et initialisé avec succès." };
    }
  } catch (e) {
    return { ok: false, erreur: "Accès refusé ou document introuvable. Assurez-vous d'avoir les droits de modification sur le Google Sheet." };
  }
}

/**
 * Récupère l'ID de la base de données enregistrée pour l'utilisateur
 */
function Db_getDbId() {
  return PropertiesService.getUserProperties().getProperty('DB_ID');
}