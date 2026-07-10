// ============================================================
//  STOCK DENTAIRE — Script d'initialisation v2 (correctif)
//  Colle ce script en REMPLACEMENT du précédent dans l'éditeur
//  Puis exécute : initialiserStockDentaire()
//  (Produits sera recréé proprement, les autres aussi)
// ============================================================

function initialiserStockDentaire() {
  const ss = SpreadsheetApp.openById("1LA8F21XcAoZbVxNInK8HVbUKyal5QJPd9rkVE9qSO9U");
  console.log("⏳ Initialisation en cours, veuillez patienter…");

  _creerFeuilleProduits(ss);
  _creerFeuilleLots(ss);
  _creerFeuilleMouvements(ss);
  _creerFeuilleLog(ss);
  _supprimerFeuilleParDefaut(ss);

  console.log(
    "✅ Structure créée avec succès !\n\n" +
    "4 feuilles créées : Produits · Lots · Mouvements · Log\n\n" +
    "Vous pouvez maintenant passer au Prompt 2."
  );
}


// ────────────────────────────────────────────────────────────
//  FEUILLE 1 — PRODUITS
// ────────────────────────────────────────────────────────────

function _creerFeuilleProduits(ss) {
  const NOM = "Produits";
  let feuille = ss.getSheetByName(NOM);
  if (feuille) feuille.clear(); else feuille = ss.insertSheet(NOM, 0);

  const entetes = [
    "ID Produit",
    "Nom du produit",
    "Catégorie réglementaire",
    "Catégorie d'usage",
    "Unité de conditionnement",
    "Seuil alerte (stock bas)",
    "Fournisseur habituel",
    "Emplacement",
    "Notes",
    "Actif",
    "Stock total",
    "Alerte stock",
  ];
  feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]);

  feuille.getRange(1, 1, 1, entetes.length)
    .setBackground("#1a73e8")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  const largeurs = [120, 220, 200, 180, 160, 140, 180, 160, 250, 60, 100, 120];
  largeurs.forEach((l, i) => feuille.setColumnWidth(i + 1, l));
  feuille.setFrozenRows(1);

  feuille.getRange("C2:C1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Stupéfiant / Liste I-II","Médicament classique","Dispositif médical","Consommable","Anesthésique"], true)
      .setAllowInvalid(false).build()
  );
  feuille.getRange("D2:D1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Anesthésie","Antibiotique","Antalgique","Antiseptique","Hémostatique","Matériel à usage unique","Autre"], true)
      .setAllowInvalid(false).build()
  );
  feuille.getRange("E2:E1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Boîte","Flacon","Carpule","Tube","Sachet","Unité"], true)
      .setAllowInvalid(false).build()
  );
  feuille.getRange("J2:J1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["OUI","NON"], true)
      .setAllowInvalid(false).build()
  );

  feuille.getRange("F2:F1000").setNumberFormat("0");
  feuille.getRange("K2:K1000").setNumberFormat("0");
  feuille.getRange("K1:L1").setBackground("#e8f0fe").setFontColor("#1a73e8");
  feuille.getRange("K2:L1000").setBackground("#f8f9fa").setFontColor("#5f6368");
  feuille.getRange("K1").setNote("Calculé automatiquement par la WebApp. Ne pas modifier.");
  feuille.getRange("L1").setNote("Calculé automatiquement par la WebApp. Ne pas modifier.");

  feuille.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🔴")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🟠")
      .setBackground("#fef7e0").setFontColor("#b06000")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🟢")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$J2="NON"')
      .setBackground("#f1f3f4").setFontColor("#9aa0a6")
      .setRanges([feuille.getRange("A2:L1000")]).build(),
  ]);
}


// ────────────────────────────────────────────────────────────
//  FEUILLE 2 — LOTS  (correctif : setFontWeight retiré)
// ────────────────────────────────────────────────────────────

function _creerFeuilleLots(ss) {
  const NOM = "Lots";
  let feuille = ss.getSheetByName(NOM);
  if (feuille) feuille.clear(); else feuille = ss.insertSheet(NOM, 1);

  const entetes = [
    "Référence lot",
    "ID Produit lié",
    "Nom produit",
    "N° lot fournisseur",
    "Quantité reçue",
    "Quantité restante",
    "Date de réception",
    "Date de péremption",
    "Fournisseur",
    "Statut",
    "Emplacement précis",
    "Alerte péremption",
    "Jours avant péremption",
    "Notes",
  ];
  feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]);

  feuille.getRange(1, 1, 1, entetes.length)
    .setBackground("#0f9d58")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  const largeurs = [140, 120, 200, 160, 110, 110, 130, 130, 160, 120, 160, 140, 150, 220];
  largeurs.forEach((l, i) => feuille.setColumnWidth(i + 1, l));
  feuille.setFrozenRows(1);

  feuille.getRange("J2:J1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["En stock","Stock bas","Épuisé","Périmé","Retiré / Rappelé"], true)
      .setAllowInvalid(false).build()
  );

  feuille.getRange("G2:H1000").setNumberFormat("dd/MM/yyyy");
  feuille.getRange("E2:F1000").setNumberFormat("0");
  feuille.getRange("M2:M1000").setNumberFormat("0");

  feuille.getRange("L1:M1").setBackground("#e6f4ea").setFontColor("#0f9d58");
  feuille.getRange("L2:M1000").setBackground("#f8f9fa").setFontColor("#5f6368");
  feuille.getRange("L1").setNote("Calculé automatiquement. Ne pas modifier.");
  feuille.getRange("M1").setNote("Calculé automatiquement. Ne pas modifier.");

  // ── Mise en forme conditionnelle — SANS setFontWeight ──
  feuille.setConditionalFormatRules([

    // Alerte péremption (colonne L)
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🔴")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🟠")
      .setBackground("#fef7e0").setFontColor("#b06000")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🟡")
      .setBackground("#fffde7").setFontColor("#856404")
      .setRanges([feuille.getRange("L2:L1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("🟢")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("L2:L1000")]).build(),

    // Statut (colonne J) — setFontWeight retiré partout
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Périmé")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("J2:J1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Retiré / Rappelé")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("J2:J1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Stock bas")
      .setBackground("#fef7e0").setFontColor("#b06000")
      .setRanges([feuille.getRange("J2:J1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Épuisé")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("J2:J1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("En stock")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("J2:J1000")]).build(),

    // Ligne entière grisée si périmé ou retiré
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=OR($J2="Périmé",$J2="Retiré / Rappelé")')
      .setBackground("#f1f3f4").setFontColor("#9aa0a6")
      .setRanges([feuille.getRange("A2:N1000")]).build(),
  ]);
}


// ────────────────────────────────────────────────────────────
//  FEUILLE 3 — MOUVEMENTS
// ────────────────────────────────────────────────────────────

function _creerFeuilleMouvements(ss) {
  const NOM = "Mouvements";
  let feuille = ss.getSheetByName(NOM);
  if (feuille) feuille.clear(); else feuille = ss.insertSheet(NOM, 2);

  const entetes = [
    "ID Mouvement",
    "Référence lot",
    "Nom produit",
    "Type",
    "Quantité",
    "Date",
    "Effectué par",
    "Commentaire",
    "Qté restante après",
  ];
  feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]);

  feuille.getRange(1, 1, 1, entetes.length)
    .setBackground("#f4511e")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  const largeurs = [130, 140, 200, 160, 80, 160, 160, 260, 150];
  largeurs.forEach((l, i) => feuille.setColumnWidth(i + 1, l));
  feuille.setFrozenRows(1);

  feuille.getRange("D2:D1000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Entrée (réception)","Sortie (utilisation)","Ajustement inventaire","Retrait / Périmé"], true)
      .setAllowInvalid(false).build()
  );

  feuille.getRange("F2:F1000").setNumberFormat("dd/MM/yyyy HH:mm");
  feuille.getRange("E2:E1000").setNumberFormat("0");
  feuille.getRange("I2:I1000").setNumberFormat("0");

  feuille.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("Entrée")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("D2:D1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("Sortie")
      .setBackground("#e8f0fe").setFontColor("#1967d2")
      .setRanges([feuille.getRange("D2:D1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("Retrait")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("D2:D1000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("Ajustement")
      .setBackground("#fef7e0").setFontColor("#b06000")
      .setRanges([feuille.getRange("D2:D1000")]).build(),
  ]);
}


// ────────────────────────────────────────────────────────────
//  FEUILLE 4 — LOG
// ────────────────────────────────────────────────────────────

function _creerFeuilleLog(ss) {
  const NOM = "Log";
  let feuille = ss.getSheetByName(NOM);
  if (feuille) feuille.clear(); else feuille = ss.insertSheet(NOM, 3);

  const entetes = [
    "Timestamp",
    "Utilisateur",
    "Action",
    "Entité concernée",
    "ID Entité",
    "Ancienne valeur",
    "Nouvelle valeur",
    "Session / Info",
  ];
  feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]);

  feuille.getRange(1, 1, 1, entetes.length)
    .setBackground("#455a64")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  const largeurs = [160, 200, 180, 140, 130, 260, 260, 200];
  largeurs.forEach((l, i) => feuille.setColumnWidth(i + 1, l));
  feuille.setFrozenRows(1);

  feuille.getRange("A2:A10000").setNumberFormat("dd/MM/yyyy HH:mm:ss");

  feuille.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("SUPPRESSION")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("RETRAIT")
      .setBackground("#fce8e6").setFontColor("#c5221f")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("CREATION")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("RECEPTION")
      .setBackground("#e6f4ea").setFontColor("#137333")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("MODIFICATION")
      .setBackground("#fef7e0").setFontColor("#b06000")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("SORTIE")
      .setBackground("#e8f0fe").setFontColor("#1967d2")
      .setRanges([feuille.getRange("C2:C10000")]).build(),
  ]);

  feuille.getRange("A1").setNote(
    "LECTURE SEULE — Gérée automatiquement par la WebApp.\n" +
    "Ne jamais modifier ou supprimer des lignes manuellement."
  );
}


// ────────────────────────────────────────────────────────────
//  UTILITAIRES
// ────────────────────────────────────────────────────────────

function _supprimerFeuilleParDefaut(ss) {
  ["Feuille 1", "Sheet1", "Feuille1"].forEach(nom => {
    const f = ss.getSheetByName(nom);
    if (f) { try { ss.deleteSheet(f); } catch (e) {} }
  });
}

function reinitialiserTout() {
  const ui = SpreadsheetApp.getUi();
  const rep = ui.alert("⚠️ ATTENTION",
    "Cette action va EFFACER toutes les données et recréer la structure vierge.\nÊtes-vous sûr ?",
    ui.ButtonSet.YES_NO);
  if (rep === ui.Button.YES) initialiserStockDentaire();
}