// ============================================================
//  Main.gs — Point d'entrée HTTP de la WebApp
// ============================================================

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const template = HtmlService.createTemplateFromFile("Index");
  template.page  = params.page || "accueil";
  template.lotId = params.lot  || null;

  return template.evaluate()
    .setTitle("🦷 Stock Cabinet Dentaire")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0");
}

/* function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🦷 Stock Dentaire")
    .addItem("▶ Initialiser la structure",           "_initialiserStockDentaire")
    .addItem("🔄 Recalculer alertes et péremptions", "Stock_recalculerTout")
    .addItem("⏰ Installer le recalcul quotidien",   "installerTriggerQuotidien")
    .addSeparator()
    .addItem("⚠️ Réinitialiser (efface tout)",       "reinitialiserTout")
    .addToUi();
} */