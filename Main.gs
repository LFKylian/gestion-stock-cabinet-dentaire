// ============================================================
//  STOCK DENTAIRE — Code.gs (WebApp principale)
// ============================================================


// ────────────────────────────────────────────────────────────
//  POINT D'ENTRÉE WEB
// ────────────────────────────────────────────────────────────

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const page   = params.page || "accueil";
  const lotId  = params.lot  || null;

  const template = HtmlService.createTemplateFromFile("Index");
  template.page  = page;
  template.lotId = lotId;

  return template.evaluate()
    .setTitle("🦷 Stock Cabinet Dentaire")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0");
}

// ────────────────────────────────────────────────────────────
//  MENU SHEETS (fusionne avec Setup.gs)
// ────────────────────────────────────────────────────────────

/* function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🦷 Stock Dentaire")
    .addItem("▶ Initialiser la structure", "initialiserStockDentaire")
    .addItem("🔄 Recalculer alertes et péremptions", "recalculerTout")
    .addItem("⏰ Installer le recalcul quotidien (7h)", "installerTriggerQuotidien")
    .addSeparator()
    .addItem("⚠️ Réinitialiser (efface tout)", "reinitialiserTout")
    .addToUi();
} */

// ────────────────────────────────────────────────────────────
//  
// ────────────────────────────────────────────────────────────
