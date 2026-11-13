/**
 * On sort · statistiques anonymes
 * À coller dans une NOUVELLE feuille Google « On sort · statistiques » (Extensions > Apps Script).
 * Déployer > Nouveau déploiement > Application Web > Exécuter en tant que : moi > Accès : Tout le monde.
 * Ne reçoit aucune donnée personnelle : un identifiant tiré au hasard sur le téléphone, le type d'action et l'identifiant du lieu.
 */
const EVTS = ["open", "fiche", "go", "pick", "share"];

function doGet(e) {
  const p = (e && e.parameter) || {};
  const ev = String(p.e || ""), u = String(p.u || ""), lieu = String(p.p || "").slice(0, 40);
  if (EVTS.indexOf(ev) >= 0 && /^[a-z0-9]{4,12}$/.test(u) && /^[\w-]*$/.test(lieu)) {
    const sh = feuille_("Événements", ["Le", "Action", "Visiteur", "Lieu"]);
    sh.appendRow([new Date(), ev, u, lieu]);
  }
  return ContentService.createTextOutput("ok");
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("On sort").addItem("Calculer le résumé", "resume").addToUi();
}

/** Par semaine : visiteurs, visiteurs revenus d'une semaine sur l'autre, fiches ouvertes, clics « Y aller ». */
function resume() {
  const ev = feuille_("Événements", ["Le", "Action", "Visiteur", "Lieu"]);
  const n = ev.getLastRow() - 1, sem = {};
  if (n > 0) ev.getRange(2, 1, n, 4).getValues().forEach(function (r) {
    const d = new Date(r[0]), lundi = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    const k = Utilities.formatDate(lundi, "Europe/Paris", "yyyy-MM-dd");
    const s = sem[k] = sem[k] || { v: {}, fiche: 0, go: 0, pick: 0, share: 0 };
    s.v[r[2]] = 1; if (s[r[1]] !== undefined) s[r[1]]++;
  });
  const ks = Object.keys(sem).sort(), rows = [];
  ks.forEach(function (k, i) {
    const s = sem[k], v = Object.keys(s.v), prev = i ? sem[ks[i - 1]].v : null;
    const revenus = prev ? v.filter(function (x) { return prev[x]; }).length : "";
    const base = prev ? Object.keys(prev).length : 0;
    rows.push([k, v.length, revenus, prev && base ? Math.round(100 * revenus / base) + " %" : "", s.fiche, s.go, s.pick, s.share]);
  });
  const sh = feuille_("Résumé", ["Semaine du", "Visiteurs", "Revenus de la semaine d'avant", "Taux de retour", "Fiches ouvertes", "Clics « Y aller »", "Clics sélection", "Partages"]);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 8).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, 8).setValues(rows);
}

function feuille_(nom, entetes) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(nom);
  if (!sh) { sh = ss.insertSheet(nom); sh.appendRow(entetes); sh.getRange(1, 1, 1, entetes.length).setFontWeight("bold"); sh.setFrozenRows(1); }
  return sh;
}
