/* ============================================
 * MODULE QaliaPDF : Génération rapport PDF natif (jsPDF)
 * Source : page-unique.html lines 20366-22966
 * Approche C : texte sélectionnable, police Plus Jakarta Sans embarquée
 * ============================================ */

/* --- Part 1 : QaliaPDF object + lazy loaders --- */
    (function() {
      'use strict';

      // CDN URLs (lazy-load on first call)
      var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
      var HTML2CANVAS_CDN = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      var FONT_REGULAR_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.ttf';
      var FONT_BOLD_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.ttf';
      var FONT_SEMIBOLD_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf';
      var FONT_DISPLAY_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/dm-serif-display@latest/latin-400-normal.ttf';

      // Color palette (synchronisee avec les tokens CSS canoniques du tunnel)
      // Source de verite : _chantier/baseline-palette.json
      // Toute modification de cette palette doit etre repercutee dans le :root CSS
      // ET dans baseline-palette.json pour preserver la coherence visuelle entre le
      // PDF d'export et le tunnel HTML.
      var COLORS = {
        // Couleurs primaires (identiques baseline)
        bleuCanard: [27, 126, 148],     // --bleu-canard #1B7E94
        bleuLight: [42, 157, 182],      // --bleu-light #2A9DB6 (ajoute)
        bordeaux: [147, 41, 81],        // --bordeaux #932951
        bordeauxLight: [179, 53, 98],   // --bordeaux-light #B33562 (ajoute)
        noir: [26, 26, 26],             // --noir #1A1A1A
        blanc: [255, 255, 255],         // --blanc #FFFFFF

        // Gris (CORRIGES : etaient hors-palette)
        gris: [90, 106, 112],           // --gris #5A6A70 (etait [102,102,102])
        grisClair: [232, 238, 240],     // --gris-clair #E8EEF0 (usage : bordures uniquement)
        // grisLeger : gris moyen clair, LISIBLE sur fond blanc (WCAG AA).
        // Auparavant aliase sur grisClair [232,238,240] => texte invisible sur page blanche
        // (bug footer/disclaimer rapporte 2026-04-10).
        // Valeur : palette gris eclairci (~50% entre gris et blanc), preserve la hierarchie
        // visuelle "texte discret" sans tomber sous le seuil de lisibilite.
        grisLeger: [120, 135, 142],     // #78878E (gris discret mais lisible)
        blancCasse: [247, 249, 250],    // --blanc-casse #F7F9FA (etait beigeClair [245,243,239])
        beigeClair: [247, 249, 250],    // alias retro-compatible
        bgCard: [247, 249, 250],        // bgCard aligne sur blanc-casse pour coherence (etait [250,249,246])
        borderLight: [232, 238, 240],   // border-1 = gris-clair (etait [230,228,223])

        // Statuts (CORRIGES)
        succes: [45, 110, 84],          // --succes #2D6E54 (etait vert [46,125,91])
        vert: [45, 110, 84],            // alias retro-compatible
        succesLight: [42, 191, 126],    // --succes-light #2ABF7E (ajoute)
        erreur: [201, 64, 64],          // --erreur #C94040 (etait rouge [192,57,43])
        rouge: [201, 64, 64],           // alias retro-compatible
        erreurLight: [208, 72, 72],     // --erreur-light #D04848 (aligne PALETTE canvas)
        erreurDark: [176, 48, 48],      // --erreur-dark #B03030 (ajoute)
        warning: [212, 160, 32],        // --warning #D4A020 (CORRIGE bug : ambre = warning, plus rouge)
        ambre: [212, 160, 32],          // alias retro-compatible (etait par erreur [201,64,64])
        warningDark: [168, 122, 16],    // --warning-dark #A87A10 (ajoute)
        warningLight: [224, 192, 96],   // --warning-light #E0C060 (ajoute, aligne PALETTE canvas)
        tealVif: [78, 205, 196]         // --teal-vif #4ECDC4 (ajoute)
      };

      // --- Securisation doc.text : protege contre undefined/null ---
      // jsPDF.text() crash si le 1er argument n'est pas un string.
      // Ce wrapper intercepte TOUS les appels et convertit undefined/null en ''.
      function patchDocText(doc) {
        var _origText = doc.text.bind(doc);
        doc.text = function(text) {
          var args = Array.prototype.slice.call(arguments);
          if (args[0] == null) args[0] = '';
          else if (typeof args[0] !== 'string' && !Array.isArray(args[0])) args[0] = String(args[0]);
          return _origText.apply(this, args);
        };
        return doc;
      }

      // Module state
      var _libPromise = null;
      var _html2canvasPromise = null;
      var _fontPromise = null;
      var _fontCache = { regular: null, bold: null, semibold: null, display: null };

      // --- Lazy loader : jsPDF library ---
      function loadJsPDF() {
        if (_libPromise) return _libPromise;
        if (typeof window.jspdf !== 'undefined') {
          _libPromise = Promise.resolve(window.jspdf);
          return _libPromise;
        }
        _libPromise = new Promise(function(resolve, reject) {
          var script = document.createElement('script');
          script.src = JSPDF_CDN;
          script.onload = function() { resolve(window.jspdf); };
          script.onerror = function() { reject(new Error('jsPDF CDN load failed')); };
          document.head.appendChild(script);
        });
        return _libPromise;
      }

      // --- Lazy loader : html2canvas library ---
      function loadHtml2Canvas() {
        if (_html2canvasPromise) return _html2canvasPromise;
        if (typeof window.html2canvas !== 'undefined') {
          _html2canvasPromise = Promise.resolve(window.html2canvas);
          return _html2canvasPromise;
        }
        _html2canvasPromise = new Promise(function(resolve, reject) {
          var script = document.createElement('script');
          script.src = HTML2CANVAS_CDN;
          script.onload = function() { resolve(window.html2canvas); };
          script.onerror = function() { reject(new Error('html2canvas CDN load failed')); };
          document.head.appendChild(script);
        });
        return _html2canvasPromise;
      }

      // --- Lazy loader : Plus Jakarta Sans font (TTF → base64) ---
      function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var chunk = 8192;
        for (var i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return window.btoa(binary);
      }

      function fetchFontAsBase64(url) {
        return fetch(url).then(function(r) {
          if (!r.ok) throw new Error('Font fetch failed: ' + r.status);
          return r.arrayBuffer();
        }).then(arrayBufferToBase64);
      }

      function loadFont() {
        if (_fontPromise) return _fontPromise;
        _fontPromise = Promise.all([
          fetchFontAsBase64(FONT_REGULAR_URL),
          fetchFontAsBase64(FONT_BOLD_URL),
          fetchFontAsBase64(FONT_SEMIBOLD_URL),
          fetchFontAsBase64(FONT_DISPLAY_URL)
        ]).then(function(res) {
          _fontCache.regular = res[0];
          _fontCache.bold = res[1];
          _fontCache.semibold = res[2];
          _fontCache.display = res[3];
          return _fontCache;
        });
        return _fontPromise;
      }

      function registerFont(doc) {
        if (!_fontCache.regular) return false;
        try {
          doc.addFileToVFS('PlusJakartaSans-Regular.ttf', _fontCache.regular);
          doc.addFont('PlusJakartaSans-Regular.ttf', 'PlusJakartaSans', 'normal');
          doc.addFileToVFS('PlusJakartaSans-Bold.ttf', _fontCache.bold);
          doc.addFont('PlusJakartaSans-Bold.ttf', 'PlusJakartaSans', 'bold');
          doc.addFileToVFS('PlusJakartaSans-SemiBold.ttf', _fontCache.semibold);
          doc.addFont('PlusJakartaSans-SemiBold.ttf', 'PlusJakartaSans', 'semibold');
          doc.addFont('PlusJakartaSans-Regular.ttf', 'PlusJakartaSans', 'italic');
          doc.addFileToVFS('DMSerifDisplay-Regular.ttf', _fontCache.display);
          doc.addFont('DMSerifDisplay-Regular.ttf', 'DMSerifDisplay', 'normal');
          doc.addFont('DMSerifDisplay-Regular.ttf', 'DMSerifDisplay', 'italic');
          return true;
        } catch(e) {
          /* S3-M4 */ void(e);
          return false;
        }
      }

      // --- Formatting helpers ---
      function fmtNum(n, dec) {
        if (typeof n !== 'number' || isNaN(n)) return '0';
        dec = dec || 0;
        var s = n.toFixed(dec);
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
        return parts.join(',');
      }
      function fmtDate(d) {
        var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
      }
      function pad2(n) { return n < 10 ? '0' + n : '' + n; }
      function genRef() {
        var d = new Date();
        return 'QAL-' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
      }

      // Profile label mapping
      var PROFILE_LABELS = {
        formateur: 'Formateur indépendant',
        coach: 'Coach professionnel',
        enseignant: 'Enseignant en reconversion',
        ingenieurPeda: 'Ingénieur pédagogique',
        consultantBilan: 'Consultant bilan',
        accompagnateurVAE: 'Accompagnateur VAE',
        directeurCFA: 'Directeur de CFA',
        maitreApprentissage: 'Maître d\u2019apprentissage',
        directeurOF: 'Directeur d\u2019OF',
        qualite: 'Responsable qualité'
      };
      var QUALIOPI_LABELS = {
        aspirant: 'Aspirant à la certification',
        initial: 'Audit initial à préparer',
        surveillance: 'Audit de surveillance à préparer',
        stable: 'Certifié stable',
        renouvellement: 'Renouvellement à préparer'
      };

      // --- Page header + footer (drawn on each content page) ---
      function drawPageFrame(doc, pageNum, totalPages, opts) {
        opts = opts || {};
        var pageW = 210, pageH = 297;
        // Header : logo Qalia (text) + référence
        if (!opts.skipHeader) {
          doc.setFont('DMSerifDisplay', 'italic').setFontSize(13).setTextColor.apply(doc, COLORS.bleuCanard);
          doc.text('Qalia', 20, 13);
          var qaliaW = doc.getTextWidth('Qalia');
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(3);
          doc.text('\u2122', 20 + qaliaW + 0.5, 10);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8).setTextColor.apply(doc, COLORS.gris);
          // === Sous-titre PDF dynamique par profil (Sprint S5) ===
          // Brunson Future Pacing : chaque page du PDF rappelle l'identit\u00e9 du prospect
          // P\u00e9lissier Le Compas : personnalisation = signal de s\u00e9rieux
          var headerSub = 'Rapport ROI personnalis\u00e9';
          if (opts.profileSlug) {
            var hSlug = (opts.profileSlug || 'formateur').split('-')[0];
            var hLabel = PROFILE_LABELS[hSlug] || PROFILE_LABELS.formateur;
            headerSub = 'Rapport ROI : ' + hLabel;
          }
          doc.text(headerSub, 20, 17.5);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7).setTextColor.apply(doc, COLORS.grisLeger);
          var ref = opts.ref || '';
          doc.text(ref, pageW - 20, 13, { align: 'right' });
          doc.text(opts.dateStr || '', pageW - 20, 17.5, { align: 'right' });
          // Ligne séparatrice
          doc.setDrawColor.apply(doc, COLORS.borderLight).setLineWidth(0.2);
          doc.line(20, 20, pageW - 20, 20);
        }
        // Footer : pagination + contact
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(7).setTextColor.apply(doc, COLORS.grisLeger);
        doc.setDrawColor.apply(doc, COLORS.borderLight).setLineWidth(0.2);
        doc.line(20, pageH - 15, pageW - 20, pageH - 15);
        doc.text('www.qalia.ai \u00B7 bonjour@qalia.ai \u00B7 +262 693 303 970', 20, pageH - 10);
        doc.text('\u00A9 2026 SAS DARIOT Romuald', pageW / 2, pageH - 10, { align: 'center' });
        doc.text('Page ' + pageNum + ' / ' + totalPages, pageW - 20, pageH - 10, { align: 'right' });
      }

      // Text wrapping helper
      function drawWrapped(doc, text, x, y, maxW, lineH) {
        var lines = doc.splitTextToSize(text, maxW);
        for (var i = 0; i < lines.length; i++) {
          doc.text(lines[i], x, y + i * lineH);
        }
        return y + lines.length * lineH;
      }

      // Draw segmented text with varying font sizes and vertical offsets.
      // Utilise pour le golden ratio 1/phi (0.618) sur "€" (exposant) et "/mois" "/an" (smaller).
      // segments = array of { text, size, dy } ou dy = offset vs baseline y (mm, negatif = plus haut)
      // align = 'left' | 'right' | 'center'
      // Retourne la largeur totale dessinee.
      function drawEuroText(doc, segments, x, y, align) {
        align = align || 'left';
        var prevFont = doc.getFontSize();
        var totalW = 0;
        for (var i = 0; i < segments.length; i++) {
          doc.setFontSize(segments[i].size);
          segments[i].w = doc.getTextWidth(segments[i].text);
          totalW += segments[i].w;
        }
        var startX = x;
        if (align === 'right') startX = x - totalW;
        else if (align === 'center') startX = x - totalW / 2;
        var cursorX = startX;
        for (var j = 0; j < segments.length; j++) {
          doc.setFontSize(segments[j].size);
          doc.text(segments[j].text, cursorX, y + (segments[j].dy || 0));
          cursorX += segments[j].w;
        }
        doc.setFontSize(prevFont);
        return totalW;
      }

      // Construit les segments d'un prix "X €/mois" ou "X €/an" pour drawEuroText.
      // prefix = texte avant le prix (ex : "Investissement Qalia (")
      // numberText = nombre + espace (ex : "297 ")
      // unit = "/mois" ou "/an"
      // suffix = texte apres l'unite (ex : " × 12)")
      // mainSize = taille du texte principal
      // Retourne le tableau segments pret a passer a drawEuroText.
      function buildPriceSegments(prefix, numberText, unit, suffix, mainSize) {
        var smallSize = Math.max(5, Math.round(mainSize * 0.618));
        var unitSize = Math.max(6, Math.round(mainSize * 0.78));
        var supDy = -Math.round(mainSize * 0.24 * 10) / 10 * 0.353; // 0.24 x mainSize en pt -> mm
        var segs = [];
        if (prefix) segs.push({ text: prefix, size: mainSize, dy: 0 });
        if (numberText) segs.push({ text: numberText, size: mainSize, dy: 0 });
        segs.push({ text: '\u20AC', size: smallSize, dy: supDy });
        if (unit) segs.push({ text: unit, size: unitSize, dy: 0 });
        if (suffix) segs.push({ text: suffix, size: mainSize, dy: 0 });
        return segs;
      }

      // Expose module (page builders added below)
      window.QaliaPDF = {
        loadJsPDF: loadJsPDF,
        loadHtml2Canvas: loadHtml2Canvas,
        loadFont: loadFont,
        registerFont: registerFont,
        fmtNum: fmtNum,
        fmtDate: fmtDate,
        genRef: genRef,
        drawPageFrame: drawPageFrame,
        drawWrapped: drawWrapped,
        drawEuroText: drawEuroText,
        buildPriceSegments: buildPriceSegments,
        COLORS: COLORS,
        PROFILE_LABELS: PROFILE_LABELS,
        QUALIOPI_LABELS: QUALIOPI_LABELS,
        patchDocText: patchDocText,
        // generate() is defined in the next script block
        generate: null
      };
    })();

/* --- Part 2 : Page builders + generate() entry point --- */
    (function() {
      'use strict';
      var Q = window.QaliaPDF;
      if (!Q) return;
      var C = Q.COLORS;
      var pageW = 210, pageH = 297;
      var margin = 20;
      var contentW = pageW - 2 * margin;

      // Import dictionnaires depuis le Simulateur IIFE (cross-IIFE bridge via __simAPI)
      var _sim = window.__simAPI || {};
      var SCENARIO_DESCS = _sim.SCENARIO_DESCS || {};
      var REINVEST_LABELS = _sim.REINVEST_LABELS || {};

      // --- Drawing primitives ---
      function setFill(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
      function setText(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }
      function setDraw(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }

      function roundedRect(doc, x, y, w, h, r, fillColor, strokeColor) {
        if (fillColor) { setFill(doc, fillColor); }
        if (strokeColor) { setDraw(doc, strokeColor); doc.setLineWidth(0.3); }
        var style = strokeColor && fillColor ? 'FD' : (fillColor ? 'F' : 'S');
        doc.roundedRect(x, y, w, h, r, r, style);
      }

      // --- Page 1 : COUVERTURE (design premium, aligné sur le hero HTML) ---
      function drawCover(doc, ctx) {
        // === BANDEAU HERO : fond bleu-canard (dark mode cover, tendance 2025) ===
        var heroH = 105;
        // Gradient 160deg simule (bleu-canard fonce → bleu-light)
        var gSteps = 60;
        for (var gs = 0; gs < gSteps; gs++) {
          var gt = gs / (gSteps - 1);
          var gfo = gt * gt * 0.4;
          doc.setFillColor(
            Math.round(C.bleuCanard[0] + (C.bleuLight[0] - C.bleuCanard[0]) * gfo),
            Math.round(C.bleuCanard[1] + (C.bleuLight[1] - C.bleuCanard[1]) * gfo),
            Math.round(C.bleuCanard[2] + (C.bleuLight[2] - C.bleuCanard[2]) * gfo)
          );
          doc.rect(0, heroH * gs / gSteps, pageW, heroH / gSteps + 0.2, 'F');
        }
        // Cercle decoratif (trait fin, miroir hero HTML ::before border)
        var circR = 38;
        var circX = pageW / 2;
        var circY = heroH / 2 + 2;
        // Trait cercle : blanc a ~10% opacite (melange avec fond bleu-canard)
        doc.setDrawColor(
          Math.round(C.bleuCanard[0] + (255 - C.bleuCanard[0]) * 0.15),
          Math.round(C.bleuCanard[1] + (255 - C.bleuCanard[1]) * 0.15),
          Math.round(C.bleuCanard[2] + (255 - C.bleuCanard[2]) * 0.15)
        );
        doc.setLineWidth(0.3);
        doc.circle(circX, circY, circR);
        doc.setLineWidth(0.2);

        // === CONTENU CENTRE (texte align\u00e9 sur l'axe vertical) ===
        var cx = pageW / 2;

        // Logo Qalia + TM (blanc sur fond sombre, centre)
        doc.setFont('DMSerifDisplay', 'italic').setFontSize(18);
        setText(doc, C.blanc);
        var qaliaW = doc.getTextWidth('Qalia');
        doc.text('Qalia', cx - qaliaW / 2, 22);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(5);
        doc.text('\u2122', cx + qaliaW / 2 + 0.5, 18);
        // Tagline
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        doc.text('Co-pilote conformit\u00e9 RNQ V9', cx, 29, { align: 'center' });

        // Titre principal (DM Serif, grande taille, blanc, centre)
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(32);
        setText(doc, C.blanc);
        doc.text('Rapport ROI', cx, 52, { align: 'center' });
        doc.text('personnalis\u00e9', cx, 66, { align: 'center' });
        // Sous-titre
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Projection 12 mois sur votre activit\u00e9 p\u00e9dagogique', cx, 78, { align: 'center' });

        // 3 KPIs hero (grandes cards sur le bandeau, pas des pills)
        var hookY = 86;
        var hookColor = ctx.netResult >= 0 ? C.succes : C.bordeaux;
        var hookItems = [
          { value: Q.fmtNum(ctx.hours) + ' h', label: 'lib\u00e9r\u00e9es' },
          { value: Q.fmtNum(ctx.valueSaved) + ' \u20ac', label: 'r\u00e9cup\u00e9r\u00e9s' },
          { value: '\u00d7' + (ctx.roiDisplayStr || Q.fmtNum(ctx.roi, 1)), label: 'ROI annuel' }
        ];
        var hookCardW = (contentW - 8) / 3;
        var hookCardH = 14;
        hookItems.forEach(function(hi, idx) {
          var hx = margin + idx * (hookCardW + 4);
          // Fond semi-transparent blanc sur le bandeau
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(hx, hookY, hookCardW, hookCardH, 2, 2, 'F');
          // Valeur en gros
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
          setText(doc, hookColor);
          doc.text(hi.value, hx + hookCardW / 2, hookY + 6, { align: 'center' });
          // Label en petit
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          setText(doc, C.gris);
          doc.text(hi.label, hx + hookCardW / 2, hookY + 11.5, { align: 'center' });
        });

        // === LIGNE ACCENT BORDEAUX ===
        setFill(doc, C.bordeaux);
        doc.rect(0, heroH, pageW, 1.5, 'F');

        // === SECTION PROFIL (fond blanc, en-dessous du hero) ===
        var boxY = heroH + 10;
        // Hauteur dynamique : 5 champs de base + metiers (wraps) + douleurs + taches
        var extraLines = 0;
        var painText = (ctx.painLabels && ctx.painLabels.length > 0) ? ctx.painLabels.join(', ') : '';
        var taskText = ctx.activeTaskSummary || '';
        var metierText = ctx.metiersLabel || '';
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        var metierWrapLines = doc.splitTextToSize(metierText, contentW - 58).length;
        if (metierWrapLines > 1) extraLines += (metierWrapLines - 1);
        if (painText) extraLines += Math.ceil(doc.splitTextToSize(painText, contentW - 58).length);
        if (taskText) extraLines += Math.ceil(doc.splitTextToSize(taskText, contentW - 58).length);
        var boxH = 80 + Math.max(0, extraLines - 2) * 5 + (painText ? 7 : 0) + (taskText ? 7 : 0);
        roundedRect(doc, margin, boxY, contentW, boxH, 3, C.bgCard, C.borderLight);
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('PROFIL DE L\u2019UTILISATEUR', margin + 8, boxY + 10);

        var lineY = boxY + 20;
        var lineH = 7;
        var labelX = margin + 8;
        var valX = margin + 50;
        var valMaxW = contentW - 58;

        // Champ : Metier(s), wrapping si trop de profils selectionnes
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Métier(s)', labelX, lineY);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        // Utilise metiersLabelWithEtp si multi-ETP (ex: "2\u00a0Consultant bilan \u2022 1\u00a0Directeur CFA"), sinon label standard
        var _metiersForPdf = ctx.metiersLabelWithEtp || ctx.metiersLabel || '';
        var metierLines = doc.splitTextToSize(_metiersForPdf, valMaxW);
        metierLines.forEach(function(ln, mi) {
          doc.text(ln, valX, lineY);
          if (mi < metierLines.length - 1) lineY += 4.5;
        });
        lineY += lineH;

        // Champ : Contexte
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Contexte', labelX, lineY);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text(ctx.contexteLabel, valX, lineY);
        lineY += lineH;

        // Champ : Statut Qualiopi
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Statut Qualiopi', labelX, lineY);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text(ctx.qualiopiLabel, valX, lineY);
        lineY += lineH;

        // Champ : Volume annuel
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Volume annuel', labelX, lineY);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text(Q.fmtNum(ctx.programs) + ' programmes, ' + Q.fmtNum(ctx.totalOldHours) + ' h de travail manuel', valX, lineY);
        lineY += lineH;

        // Champ : Taux horaire retenu (effectif pond\u00e9r\u00e9 ETP si multi-taux)
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Taux horaire retenu', labelX, lineY);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        var _tjmPdfLabel = Q.fmtNum(ctx.tjm) + ' \u20AC/h';
        if (ctx.tjmHasMultiRates && Array.isArray(ctx.tjmBreakdown) && ctx.tjmBreakdown.length > 1) {
          _tjmPdfLabel += ' (moyenne pond\u00e9r\u00e9e)';
        }
        doc.text(_tjmPdfLabel, valX, lineY);
        lineY += lineH;
        // Footnote d\u00e9taill\u00e9 si multi-taux
        if (ctx.tjmHasMultiRates && Array.isArray(ctx.tjmBreakdown) && ctx.tjmBreakdown.length > 1) {
          doc.setFont('PlusJakartaSans', 'italic').setFontSize(8);
          setText(doc, C.gris);
          var _tjmBreakdownText = 'dont ' + ctx.tjmBreakdown.map(function(b) {
            return Q.fmtNum(b.rate) + ' \u20AC/h pour ' + b.role;
          }).join(', ');
          var _tjmBreakdownLines = doc.splitTextToSize(_tjmBreakdownText, valMaxW);
          _tjmBreakdownLines.forEach(function(ln, bi) {
            doc.text(ln, valX, lineY);
            if (bi < _tjmBreakdownLines.length - 1) lineY += 4;
          });
          lineY += lineH - 2;
        }

        // Champ : Tâches simulées (nouveau)
        if (taskText) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
          setText(doc, C.noir);
          doc.text('Tâches (' + ctx.activeTaskCount + ')', labelX, lineY);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.gris);
          var taskLines = doc.splitTextToSize(taskText, valMaxW);
          taskLines.forEach(function(ln) {
            doc.text(ln, valX, lineY);
            lineY += 4.5;
          });
          lineY += 2.5;
        }

        // Champ : Douleurs identifiées (nouveau)
        if (painText) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(10);
          setText(doc, C.noir);
          doc.text('Douleurs', labelX, lineY);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.gris);
          var painLines = doc.splitTextToSize(painText, valMaxW);
          painLines.forEach(function(ln) {
            doc.text(ln, valX, lineY);
            lineY += 4.5;
          });
        }

        // Attribution discrète en bas de page
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
        setText(doc, C.grisLeger);
        doc.text('\u00a9 2026 Rungo SASU \u00b7 qalia.ai', pageW / 2, 268, { align: 'center' });
      }

      // === Témoignage dynamique par profil (routage slug → Cat. L6313) ===
      // Sources : blockquotes EXACTES du tunnel HTML, raccourcies pour la bande 20 mm du PDF
      // Cat.1 L.9762 (Antonella), L.9785 (Nadine/Gamma), L.9809 (Anthony), L.9832 (Cyril)
      // Cat.2 L.9907 (Shirley), L.9928 (Nadine/Coaching), L.9947 (Véronique)
      // Cat.3 L.9973 (V.B.)  |  Cat.4 L.10020 (ATSEF)
      // Pélissier Le Compas : preuve sociale post-verdict, le prospect s'identifie au pair cité
      // Principe Brunson Epiphany Bridge : le lecteur doit se reconnaître dans le pair cité
      var TESTIMONIAL_MAP = {
        formateur:           { quote: '\u00AB C\u2019est un tr\u00E9sor. Hyper efficace. En moins de deux, j\u2019ai mon programme. \u00BB',                              author: 'Antonella Nella Maville \u00B7 formatrice ind\u00E9pendante, 18 ans d\u2019exp\u00E9rience' },
        coach:               { quote: '\u00AB En deux heures, j\u2019ai tous mes documents et tout mon d\u00E9roul\u00E9. \u00BB',                                        author: 'Nadine F\u00E9lix \u00B7 Coaching, NF Consulting' },
        directeurOF:         { quote: '\u00AB Ing\u00E9nierie complexe, 2 r\u00E9f\u00E9rentiels + 1 certification. Tout structur\u00E9 pendant que je d\u00E9jeunais. \u00BB', author: 'Anthony Beaudet \u00B7 Sapfi, renouvellement Qualiopi r\u00E9ussi avec Qalia' },
        qualite:             { quote: '\u00AB Qalia a tout structur\u00E9 pendant que je d\u00E9jeunais. La charge mentale a disparu. \u00BB',                             author: 'Anthony Beaudet \u00B7 Sapfi, renouvellement Qualiopi r\u00E9ussi avec Qalia' },
        ingenieurPeda:       { quote: '\u00AB 20 modules en 6 jours au lieu de 4 mois. \u00BB',                                                                           author: 'Cyril Negrini \u00B7 expert ing\u00E9nierie p\u00E9dagogique, 20+ modules' },
        enseignant:          { quote: '\u00AB Juste structurer ce que je savais d\u00E9j\u00E0. Sans r\u00E9apprendre un m\u00E9tier. \u00BB',                             author: 'V\u00E9ronique Pizot \u00B7 enseignante BTS, en transition coach-formatrice' },
        consultantBilan:     { quote: '\u00AB En deux heures, tous mes documents, mon sc\u00E9nario et mon d\u00E9roul\u00E9. \u00BB',                                     author: 'Shirley SOWAH \u00B7 coach-formatrice, insertion professionnelle' },
        accompagnateurVAE:   { quote: '\u00AB Vous avez couvert tous les prismes, tous les aspects, tous les axes. \u00BB',                                                author: 'Val\u00E9rie Balay \u00B7 architecte accompagnateur VAE, La R\u00E9union' },
        directeurCFA:        { quote: '\u00AB Qalia ne vous dit pas juste ce qu\u2019il faut faire, elle fait le travail en plus. \u00BB',                                 author: 'ATSEF Le Port \u00B7 centre de formation, La R\u00E9union' },
        maitreApprentissage: { quote: '\u00AB Qalia ne vous dit pas juste ce qu\u2019il faut faire, elle fait le travail en plus. \u00BB',                                 author: 'ATSEF Le Port \u00B7 centre de formation, La R\u00E9union' }
      };

      // --- Page 2 : SYNTHÈSE EXÉCUTIVE ---
      function drawSynthesis(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Synthèse exécutive', margin, y);
        y += 6;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Simulation personnalisée basée sur vos tâches, volumes et contexte', margin, y);
        y += 5;
        if (ctx.contextRecap) {
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.bleuCanard);
          var recapLines = doc.splitTextToSize(ctx.contextRecap, contentW);
          recapLines.slice(0, 2).forEach(function(ln) { doc.text(ln, margin, y); y += 4.5; });
          y += 1;
        } else {
          y += 4;
        }

        // 6 KPIs (2 rangées de 3)
        var boxW = (contentW - 8) / 3;
        var boxH = 22;
        var kpis = (ctx.kpis6 && ctx.kpis6.length === 6) ? ctx.kpis6 : [
          { label: 'Heures libérées / an', value: Q.fmtNum(ctx.hours) + ' h' },
          { label: 'Valeur récupérée', value: Q.fmtNum(ctx.valueSaved) + ' \u20AC' },
          { label: 'Investissement / an', value: Q.fmtNum(ctx.annualCost) + ' \u20AC' },
          { label: 'ROI multiplicateur', value: '\u00D7' + (ctx.roiDisplayStr || Q.fmtNum(ctx.roi, 1)) },
          { label: 'Payback', value: ctx.paybackLabel || ('M' + ctx.paybackMonth) },
          { label: 'Jours libérés', value: Q.fmtNum(ctx.daysFreed) + ' j' }
        ];
        // Fidelite HTML : .sim-metric-value { color: var(--bleu-canard); } pour les 6 valeurs.
        // KPI 3 (investissement) conserve bordeaux comme proxy visuel de l'icone bordeaux HTML (signal cout).
        // KPI 5 (payback) aligne sur bleu-canard (HTML : pas de vert specifique, heritage .sim-metric-value).
        var kpiColors = [C.bleuCanard, C.bleuCanard, C.bordeaux, C.bleuCanard, C.bleuCanard, C.bleuCanard];
        kpis.forEach(function(k, i) {
          var row = Math.floor(i / 3);
          var col = i % 3;
          var x = margin + col * (boxW + 4);
          var ky = y + row * (boxH + 4);
          roundedRect(doc, x, ky, boxW, boxH, 3, C.bgCard, C.borderLight);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(7);
          setText(doc, C.gris);
          doc.text(k.label.toUpperCase(), x + boxW / 2, ky + 6, { align: 'center' });
          // Auto-size : réduire la police si la valeur dépasse la largeur de la box
          var kpiFontSize = 16;
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(kpiFontSize);
          while (kpiFontSize > 10 && doc.getTextWidth(k.value) > boxW - 4) {
            kpiFontSize -= 1;
            doc.setFontSize(kpiFontSize);
          }
          setText(doc, kpiColors[i]);
          doc.text(k.value, x + boxW / 2, ky + 18, { align: 'center' });
        });
        y += boxH * 2 + 4 + 8;

        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('BILAN FINANCIER ANNUEL', margin, y);
        y += 8;
        var maxVal = Math.max(ctx.valueSaved, ctx.annualCost, Math.abs(ctx.netResult));
        var barMaxW = contentW;
        var barH = 6;
        var rows = [
          { label: 'Valeur récupérée', value: ctx.valueSaved, color: C.bleuCanard, colorLight: C.bleuLight, sign: '+' },
          { label: 'Investissement Qalia' + (ctx.billingAnnual ? ' (annuel)' : ''), value: ctx.annualCost, color: C.bordeaux, colorLight: C.bordeauxLight, sign: '\u2212' },
          { label: 'Résultat net cumulé', value: Math.abs(ctx.netResult), color: ctx.netResult >= 0 ? C.vert : C.rouge, colorLight: ctx.netResult >= 0 ? C.succesLight : C.erreurLight, sign: ctx.netResult >= 0 ? '+' : '\u2212', bold: true }
        ];
        rows.forEach(function(r) {
          doc.setFont('PlusJakartaSans', r.bold ? 'bold' : 'normal').setFontSize(9);
          setText(doc, C.noir);
          doc.text(r.label, margin, y + 4);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
          setText(doc, r.color);
          doc.text(r.sign + ' ' + Q.fmtNum(r.value) + ' \u20AC', margin + contentW, y + 4, { align: 'right' });
          y += 6;
          // Barre arrondie avec gradient (technique Copie 30 validee)
          var barW = maxVal > 0 ? Math.max(barH, (r.value / maxVal) * barMaxW) : barH;
          var bRadius = barH / 2;
          var lc = r.color;
          var lEnd = r.colorLight || lc;
          // 1. Cercle gauche (couleur foncee)
          setFill(doc, lc);
          doc.circle(margin + bRadius, y + bRadius, bRadius, 'F');
          // 2. Tranches rect entre les 2 diametres
          var innerW = barW - bRadius * 2;
          var fadeSteps = Math.max(80, Math.round(innerW * 3));
          var lastColor = lc;
          for (var fs = 0; fs < fadeSteps; fs++) {
            var ft = fs / (fadeSteps - 1);
            var fo = ft * ft;
            lastColor = [
              Math.round(lc[0] + (lEnd[0] - lc[0]) * fo),
              Math.round(lc[1] + (lEnd[1] - lc[1]) * fo),
              Math.round(lc[2] + (lEnd[2] - lc[2]) * fo)
            ];
            doc.setFillColor(lastColor[0], lastColor[1], lastColor[2]);
            var fx = margin + bRadius + innerW * fs / fadeSteps;
            var fw = innerW / fadeSteps + 0.3;
            doc.rect(fx, y, fw, barH, 'F');
          }
          // 3. Cercle droit (couleur de la derniere tranche)
          doc.setFillColor(lastColor[0], lastColor[1], lastColor[2]);
          doc.circle(margin + barW - bRadius, y + bRadius, bRadius, 'F');
          y += barH + 5;
        });
        y += 4;

        // === VERDICT \u00c9TENDU (contexte D.U.R. int\u00e9gr\u00e9, sans jargon interne) ===
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('VERDICT', margin, y);
        y += 5;
        var verdictLines = doc.splitTextToSize(ctx.verdictText || '', contentW - 12);
        var durItems = [
          { text: ctx.durDouloureux, color: C.bordeaux },
          { text: ctx.durUrgent, color: C.bleuCanard },
          { text: ctx.durReconnu, color: C.vert }
        ].filter(function(d) { return d.text; });
        var durTotalH = 0;
        durItems.forEach(function(d) {
          var dl = doc.splitTextToSize(d.text, contentW - 18);
          durTotalH += Math.min(dl.length, 2) * 4 + 1;
        });
        var verdictBoxH = 6 + verdictLines.length * 4.5 + 2 + durTotalH + (ctx.cost3y ? 7 : 0) + 3;
        roundedRect(doc, margin, y, contentW, verdictBoxH, 3, C.bgCard, C.borderLight);
        var innerY = y + 5;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.noir);
        verdictLines.forEach(function(ln) {
          doc.text(ln, margin + 6, innerY); innerY += 4.5;
        });
        innerY += 2;
        durItems.forEach(function(d) {
          setFill(doc, d.color);
          doc.circle(margin + 8, innerY - 1, 1, 'F');
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          var dLines = doc.splitTextToSize(d.text, contentW - 18);
          dLines.slice(0, 2).forEach(function(ln) {
            doc.text(ln, margin + 12, innerY); innerY += 4;
          });
          innerY += 1;
        });
        if (ctx.cost3y) {
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(8);
          setText(doc, C.bordeaux);
          doc.text('Co\u00fbt de l\u2019inaction (3 ans) : ' + Q.fmtNum(ctx.cost3y) + ' \u20ac', margin + 6, innerY);
        }
        y += verdictBoxH + 5;

        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('INDICATEUR DE PRIORITÉ (EISENHOWER)', margin, y);
        y += 6;
        // Fallback dynamique : déduction du quadrant Eisenhower depuis ROI + payback
        // (évite l'affichage "À structurer" placeholder si ctx.eisenhowerLabel n'est pas fourni)
        var eisLabel = ctx.eisenhowerLabel;
        var eisText = ctx.eisenhowerText;
        if (!eisLabel) {
          var roiNum = parseFloat(ctx.roi) || 0;
          var pb = parseInt(ctx.paybackMonth, 10) || 12;
          if (roiNum >= 3 && pb <= 3) {
            eisLabel = 'Important et urgent : à engager maintenant';
            eisText = eisText || 'ROI élevé et retour sur investissement rapide. Le coût de l\u2019inaction dépasse le coût de l\u2019action.';
          } else if (roiNum >= 3 && pb > 3) {
            eisLabel = 'Important, à planifier';
            eisText = eisText || 'ROI significatif mais retour plus étalé. Planifier la montée en charge sur le trimestre.';
          } else if (roiNum < 3 && pb <= 3) {
            eisLabel = 'Utile, à tester sur périmètre ciblé';
            eisText = eisText || 'Bénéfice modéré. Commencer par un périmètre restreint avant d\u2019élargir.';
          } else {
            eisLabel = 'À reconsidérer selon votre volume';
            eisText = eisText || 'Bénéfice limité sur le volume actuel. Réévaluer après augmentation du nombre de programmes.';
          }
        }
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(11);
        setText(doc, C.bordeaux);
        doc.text(eisLabel, margin, y + 4);
        y += 10;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.gris);
        Q.drawWrapped(doc, eisText || '', margin, y, contentW, 5);
        y += 10;

        // === Témoignage client (preuve sociale, routé par profil) ===
        // Insecable : titre 6 + bandeau 20 = 26mm
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('R\u00c9SULTATS CLIENTS', margin, y);
        y += 6;
        roundedRect(doc, margin, y, contentW, 16, 3, C.bgCard, C.borderLight);
        var testiSlug = (ctx.metiersSlug || 'formateur').split('-')[0];
        var testi = TESTIMONIAL_MAP[testiSlug] || TESTIMONIAL_MAP.formateur;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.noir);
        doc.text(testi.quote, margin + 6, y + 8);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        setText(doc, C.gris);
        doc.text(testi.author, margin + 6, y + 15);
      }

      // --- Page 3 : VOTRE SITUATION (3 dimensions) ---
      function drawDUR(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('VOTRE SITUATION', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Trois dimensions cl\u00e9s de votre contexte', margin, y + 6);
        y += 18;

        var items = [
          { tag: 'D', label: 'Douloureux', color: C.bordeaux, text: ctx.durDouloureux },
          { tag: 'U', label: 'Urgent', color: C.bleuCanard, text: ctx.durUrgent },
          { tag: 'R', label: 'Reconnu', color: C.vert, text: ctx.durReconnu }
        ];
        items.forEach(function(it) {
          roundedRect(doc, margin, y, contentW, 42, 3, C.bgCard, C.borderLight);
          setFill(doc, it.color);
          doc.circle(margin + 12, y + 14, 7, 'F');
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
          setText(doc, C.blanc);
          doc.text(it.tag, margin + 12, y + 16.5, { align: 'center' });
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(12);
          setText(doc, it.color);
          doc.text(it.label, margin + 24, y + 12);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.noir);
          Q.drawWrapped(doc, it.text, margin + 24, y + 20, contentW - 28, 4.5);
          y += 50;
        });

        if (ctx.cost3y) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('COÛT DE L\u2019INACTION SUR 3 ANS', margin, y);
          y += 8;
          roundedRect(doc, margin, y, contentW, 26, 3, [252, 247, 249], C.bordeaux);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(22);
          setText(doc, C.bordeaux);
          doc.text(Q.fmtNum(ctx.cost3y) + ' \u20AC', margin + 10, y + 14);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.gris);
          doc.text('de coût d\u2019opportunité cumulé (borne haute)', margin + 10, y + 20);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          doc.text('Hypothèse taux horaire appliqué à 100 % du temps libéré', margin + contentW - 10, y + 20, { align: 'right' });
        }
      }

      // --- Page 4 : BILAN FINANCIER DÉTAILLÉ (tableau tâches) ---
      function drawBilan(doc, ctx) {
        var y = 30;
        var pagesCreated = 1;
        var yMax = 260; // limite basse avant saut de page
        var colX = [margin, margin + 82, margin + 108, margin + 130, margin + 152];
        var colLabels = ['Tâche', 'Volume', 'Avant (h)', 'Après (h)', 'Gain (h)'];

        // Titre (une seule fois, en haut de page 1)
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Bilan financier détaillé', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Décomposition tâche par tâche sur ' + Q.fmtNum(ctx.programs) + ' programmes/an', margin, y + 6);
        y += 18;

        function drawTableHeader() {
          setFill(doc, C.bleuCanard);
          // Coins arrondis en haut seulement (style tableau site)
          doc.roundedRect(margin, y, contentW, 8, 3, 3, 'F');
          // Rectangle plein sur la moitie basse pour couvrir les coins bas
          doc.rect(margin, y + 4, contentW, 4, 'F');
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(8);
          setText(doc, C.blanc);
          // Offsets right-align calcul\u00e9s par largeur de colonne (T\u00e2che=82, Vol=26, Avant=22, Apr\u00e8s=22, Gain=18)
          var hOffsets = [3, 24, 20, 20, 16];
          colLabels.forEach(function(l, i) {
            var align = i === 0 ? 'left' : 'right';
            var x = colX[i] + hOffsets[i];
            doc.text(l, x, y + 5.5, { align: align });
          });
          y += 8;
        }

        // Separer taches actives / suggerees
        var allTasks = ctx.tasks || [];
        var activeTasks = allTasks.filter(function(t) { return !t.suggested; });
        var suggestedTasks = allTasks.filter(function(t) { return t.suggested; });
        var suggestedGainSum = 0;
        suggestedTasks.forEach(function(t) { suggestedGainSum += (t.gainH || 0); });
        var suggestedValueSum = Math.round(suggestedGainSum * (ctx.tjm || 70));
        var rowH = 6;

        function drawRow(t, idx) {
          if (y + rowH > yMax) {
            doc.addPage();
            pagesCreated++;
            y = 30;
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(14);
            setText(doc, C.bleuCanard);
            doc.text('Bilan financier détaillé (suite)', margin, y);
            y += 10;
            drawTableHeader();
            doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          }
          if (idx % 2 === 1) {
            setFill(doc, C.beigeClair);
            doc.rect(margin, y, contentW, rowH, 'F');
          }
          setText(doc, C.noir);
          var name = t.name.length > 48 ? t.name.substring(0, 45) + '\u2026' : t.name;
          doc.text(name, colX[0] + 3, y + 4);
          doc.text(Q.fmtNum(t.volume), colX[1] + 24, y + 4, { align: 'right' });
          doc.text(Q.fmtNum(t.marketH, 1), colX[2] + 20, y + 4, { align: 'right' });
          doc.text(Q.fmtNum(t.qaliaH, 1), colX[3] + 20, y + 4, { align: 'right' });
          setText(doc, C.bleuCanard);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(8);
          doc.text(Q.fmtNum(t.gainH, 1), colX[4] + 16, y + 4, { align: 'right' });
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          y += rowH;
        }

        // Section 1 : Vos taches activees
        if (activeTasks.length > 0) {
          drawTableHeader();
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          activeTasks.forEach(drawRow);
        }

        // Section 2 : Taches complementaires (Qalia couvre aussi)
        if (suggestedTasks.length > 0) {
          // Sous-titre insecable (8mm min + 6mm header + 6mm ligne = 20mm)
          if (y + 20 > yMax) {
            doc.addPage(); pagesCreated++; y = 30;
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(14);
            setText(doc, C.bleuCanard);
            doc.text('Bilan financier détaillé (suite)', margin, y);
            y += 10;
          }
          y += 4;
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('Tâches complémentaires que Qalia couvre également', margin, y);
          doc.setFont('PlusJakartaSans', 'italic').setFontSize(7);
          setText(doc, C.gris);
          doc.text('(non activées dans votre simulation, potentiel supplémentaire)', margin, y + 4);
          y += 8;
          drawTableHeader();
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          suggestedTasks.forEach(drawRow);
        }

        // Bloc totaux : insécable, ~35mm + potentiel supplémentaire 10mm si applicable
        var totalsBlockH = 35 + (suggestedTasks.length > 0 ? 10 : 0);
        if (y + totalsBlockH > yMax) {
          doc.addPage();
          pagesCreated++;
          y = 30;
        }

        // Sous-total "potentiel supplémentaire" si taches suggerees
        if (suggestedTasks.length > 0) {
          y += 3;
          setDraw(doc, C.bleuCanard);
          doc.setLineWidth(0.2);
          doc.line(margin, y, margin + contentW, y);
          y += 5;
          doc.setFont('PlusJakartaSans', 'italic').setFontSize(8);
          setText(doc, C.gris);
          doc.text('Potentiel supplémentaire si activées (' + suggestedTasks.length + ' tâches)', margin + 3, y);
          setText(doc, C.bleuCanard);
          doc.text('+ ' + Q.fmtNum(suggestedGainSum, 1) + ' h · + ' + Q.fmtNum(suggestedValueSum) + ' \u20AC', margin + contentW - 3, y, { align: 'right' });
          y += 3;
        }

        y += 4;
        setDraw(doc, C.bleuCanard);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + contentW, y);
        y += 6;
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Total heures libérées / an', margin + 3, y);
        setText(doc, C.bleuCanard);
        doc.text(Q.fmtNum(ctx.hours) + ' h', margin + contentW - 3, y, { align: 'right' });
        y += 7;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.noir);
        doc.text('Valeur récupérée (h \u00D7 taux ' + Q.fmtNum(ctx.tjm) + ' \u20AC/h)', margin + 3, y);
        setText(doc, C.bleuCanard);
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
        doc.text('+ ' + Q.fmtNum(ctx.valueSaved) + ' \u20AC', margin + contentW - 3, y, { align: 'right' });
        y += 6;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.noir);
        // Golden ratio 1/phi (0.618) sur €, /mois, /an
        var invPrefix = 'Investissement Qalia (';
        var invSegs;
        if (ctx.billingAnnual) {
          invSegs = Q.buildPriceSegments(invPrefix, '2\u00a0970\u00a0', '/an', ', 2 mois offerts)', 9);
        } else {
          invSegs = Q.buildPriceSegments(invPrefix, '297\u00a0', '/mois', ' \u00D7 12)', 9);
        }
        Q.drawEuroText(doc, invSegs, margin + 3, y, 'left');
        setText(doc, C.bordeaux);
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
        doc.text('\u2212 ' + Q.fmtNum(ctx.annualCost) + ' \u20AC', margin + contentW - 3, y, { align: 'right' });
        y += 8;
        setDraw(doc, C.noir);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 3, margin + contentW, y - 3);
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(12);
        setText(doc, C.noir);
        doc.text('Résultat net annuel', margin + 3, y + 3);
        setText(doc, ctx.netResult >= 0 ? C.vert : C.rouge);
        doc.text((ctx.netResult >= 0 ? '+ ' : '\u2212 ') + Q.fmtNum(Math.abs(ctx.netResult)) + ' \u20AC', margin + contentW - 3, y + 3, { align: 'right' });

        return pagesCreated;
      }

      // --- Page 5 : GRAPHIQUE ROI (canvas, image) ---
      function drawChart(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Résultat net cumulé mois par mois', margin, y);
        // Sous-titre : golden ratio 1/phi (0.618) sur €, /mois, /an (coherence canvas + HTML title)
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        var subY = y + 6;
        var subPrefix = 'Gains cumul\u00e9s (pond\u00e9r\u00e9s par la saisonnalit\u00e9) moins l\u2019abonnement Qalia (';
        var subSegs;
        if (ctx.billingAnnual) {
          subSegs = Q.buildPriceSegments(subPrefix, '2\u00a0970\u00a0', '/an', ')', 10);
        } else {
          subSegs = Q.buildPriceSegments(subPrefix, '297\u00a0', '/mois', ' \u00D7 12)', 10);
        }
        Q.drawEuroText(doc, subSegs, margin, subY, 'left');
        y += 18;

        // Graphe en barres dessinees (meme style que saisonnalite)
        if (ctx.cumulMonthly && ctx.cumulMonthly.length === 12) {
          var gMonths = ['Avr','Mai','Jun','Jul','Ao\u00fb','Sep','Oct','Nov','D\u00e9c','Jan','F\u00e9v','Mar'];
          var gMaxH = 70;
          var gBarW = (contentW - 24) / 12;
          var gAbsMax = 1;
          ctx.cumulMonthly.forEach(function(v) { if (Math.abs(v) > gAbsMax) gAbsMax = Math.abs(v); });
          var allPos = ctx.cumulMonthly.every(function(v) { return v >= 0; });
          var gBaseY = allPos ? y + gMaxH : y + gMaxH * 0.7;

          // Ligne zero si valeurs negatives
          if (!allPos) {
            setDraw(doc, C.grisLeger);
            doc.setLineDashPattern([1, 1], 0);
            doc.line(margin, gBaseY, margin + contentW, gBaseY);
            doc.setLineDashPattern([], 0);
          }

          // Plage urgence Qualiopi : replique exacte du canvas HTML
          // Gradient vert #2E7D5B -> blanc #E0E0E0 -> rouge #C0392B
          // Pivot a 5 mois (meme echelle que le slider echeance)
          // Chaque bande = 1 mois restant, colore selon la distance a l'echeance
          if (ctx.auditInfo && ctx.auditInfo.monthsAway > 0 && ctx.auditInfo.monthsAway <= 12) {
            var urgM = ctx.auditInfo.monthsAway;
            var urgX1 = margin + 2;
            var urgX2 = margin + 2 + urgM * gBarW;
            var urgTop = gBaseY - (allPos ? gMaxH : gMaxH * 0.7);
            var urgH = gBaseY - urgTop;
            var slMin = 1, slMax = 24, slPivot = 5;
            var pivotPct = (slPivot - slMin) / (slMax - slMin);
            var urgSteps = Math.max(urgM * 3, 12);
            for (var us = 0; us < urgSteps; us++) {
              var monthsRem = urgM - (us / urgSteps) * urgM;
              var vClamp = Math.max(slMin, Math.min(slMax, monthsRem));
              var ratio = (vClamp - slMin) / (slMax - slMin);
              var ur, ug, ub;
              if (ratio <= pivotPct) {
                // Rouge #C0392B -> Blanc #E0E0E0
                var tt = ratio / pivotPct;
                ur = Math.round(192 + (224 - 192) * tt);
                ug = Math.round(57 + (224 - 57) * tt);
                ub = Math.round(43 + (224 - 43) * tt);
              } else {
                // Blanc #E0E0E0 -> Vert #2E7D5B
                var tt2 = (ratio - pivotPct) / (1 - pivotPct);
                ur = Math.round(224 + (46 - 224) * tt2);
                ug = Math.round(224 + (125 - 224) * tt2);
                ub = Math.round(224 + (91 - 224) * tt2);
              }
              // Opacite 0.22 simulee : melange avec blanc (fond page)
              var opc = 0.22;
              var fr = Math.round(ur * opc + 255 * (1 - opc));
              var fg = Math.round(ug * opc + 255 * (1 - opc));
              var fb = Math.round(ub * opc + 255 * (1 - opc));
              doc.setFillColor(fr, fg, fb);
              var ux = urgX1 + (urgX2 - urgX1) * us / urgSteps;
              var uw = (urgX2 - urgX1) / urgSteps + 0.3;
              doc.rect(ux, urgTop, uw, urgH, 'F');
            }
          }

          for (var gi = 0; gi < 12; gi++) {
            var gv = ctx.cumulMonthly[gi];
            var gh = Math.abs(gv) / gAbsMax * (allPos ? gMaxH : gMaxH * 0.7);
            var isPos = gv >= 0;
            // 3 niveaux : fort (> 66%) = succes fonce, moyen (33-66%) = succes, faible (< 33%) = succesLight
            var ratio33 = Math.abs(gv) / gAbsMax;
            var gBaseCol, gLightCol;
            if (!isPos) {
              gBaseCol = C.erreur; gLightCol = C.erreurLight;
            } else if (ratio33 > 0.66) {
              gBaseCol = C.succes; gLightCol = C.succesLight;
            } else if (ratio33 > 0.33) {
              gBaseCol = [55, 130, 100]; gLightCol = C.succesLight; // vert moyen
            } else {
              gBaseCol = C.succesLight; gLightCol = [170, 225, 200]; // vert clair
            }
            var gbx = margin + 2 + gi * gBarW;
            var gbw = gBarW - 3;
            var gby = isPos ? gBaseY - gh : gBaseY;

            if (gh > 1) {
              // Radius proportionnel (phi, identique canvas barRadius)
              var gcR = Math.max(2, Math.min(gbw / 2, Math.round((gbw / 2) / 2.618)));
              doc.setFillColor(gBaseCol[0], gBaseCol[1], gBaseCol[2]);
              if (isPos) {
                // Barre positive : arrondis EN HAUT, coins droits en bas
                doc.roundedRect(gbx, gby, gbw, Math.min(gcR * 2, gh), gcR, gcR, 'F');
                if (gh > gcR * 2) doc.rect(gbx, gby + gcR, gbw, gh - gcR, 'F');
              } else {
                // Barre negative : coins droits en haut, arrondis EN BAS
                if (gh > gcR * 2) doc.rect(gbx, gby, gbw, gh - gcR, 'F');
                doc.roundedRect(gbx, gby + gh - Math.min(gcR * 2, gh), gbw, Math.min(gcR * 2, gh), gcR, gcR, 'F');
              }
              // Degrade clair (fonce en haut/ext, clair en bas/int)
              var fadeSteps = Math.max(20, Math.round(gh * 2));
              for (var gs = 0; gs < fadeSteps; gs++) {
                var gt = gs / fadeSteps;
                var opacity = gt * gt * 0.5;
                var fr = Math.round(gBaseCol[0] + (gLightCol[0] - gBaseCol[0]) * opacity * 2);
                var fg = Math.round(gBaseCol[1] + (gLightCol[1] - gBaseCol[1]) * opacity * 2);
                var fb = Math.round(gBaseCol[2] + (gLightCol[2] - gBaseCol[2]) * opacity * 2);
                doc.setFillColor(fr, fg, fb);
                var fadeStart = isPos ? gby + gcR : gby;
                var fadeH = isPos ? gh - gcR : gh - gcR;
                var sy = fadeStart + fadeH * gs / fadeSteps;
                var sh = fadeH / fadeSteps + 0.2;
                doc.rect(gbx, sy, gbw, sh, 'F');
              }
            }
            // Valeur au-dessus
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(5);
            setText(doc, isPos ? gBaseCol : C.erreur);
            doc.text(Q.fmtNum(gv) + ' \u20ac', gbx + gbw / 2, gby - 1.5, { align: 'center' });
            // Mois
            doc.setFont('PlusJakartaSans', 'normal').setFontSize(6);
            setText(doc, C.gris);
            doc.text(gMonths[gi], gbx + gbw / 2, gBaseY + (allPos ? 4 : (isPos ? 4 : gh + 4)), { align: 'center' });
          }

          // Ligne verticale break-even (seuil de rentabilite, miroir canvas HTML)
          if (ctx.paybackMonth && ctx.paybackMonth > 0 && ctx.paybackMonth <= 12) {
            var brkM = ctx.paybackDays > 0 ? ctx.paybackDays / 30.4 : ctx.paybackMonth;
            var brkX = margin + 2 + Math.max(0.2, brkM) * gBarW;
            var brkTop = gBaseY - (allPos ? gMaxH : gMaxH * 0.7) - 4;
            var brkColor = ctx.netResult >= 0 ? C.bleuCanard : C.bordeaux;
            // Ligne dashed bleue (ou bordeaux si deficit)
            setDraw(doc, brkColor);
            doc.setLineWidth(1.5);
            doc.setLineDashPattern([4, 2.5], 0);
            doc.line(brkX, brkTop, brkX, gBaseY);
            doc.setLineDashPattern([], 0);
            doc.setLineWidth(0.2);
            // Pilule au-dessus du graphe
            var brkLbl = ctx.paybackDays > 0 && ctx.paybackDays <= 60
              ? 'Rentable : ' + ctx.paybackDays + ' jours'
              : 'Rentable : Mois ' + ctx.paybackMonth;
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(6.5);
            var brkTw = doc.getTextWidth(brkLbl);
            var brkPw = brkTw + 8;
            var brkPh = 5.5;
            var brkPx = brkX - brkPw / 2;
            var brkPy = brkTop - brkPh - 1;
            if (brkPx < margin) brkPx = margin;
            if (brkPx + brkPw > margin + contentW) brkPx = margin + contentW - brkPw;
            roundedRect(doc, brkPx, brkPy, brkPw, brkPh, brkPh / 2, brkColor, null);
            setText(doc, C.blanc);
            doc.text(brkLbl, brkPx + brkPw / 2, brkPy + brkPh / 2 + 1.8, { align: 'center' });
          }

          // Ligne verticale echeance Qualiopi (miroir du canvas HTML)
          if (ctx.auditInfo && ctx.auditInfo.monthsAway > 0 && ctx.auditInfo.monthsAway <= 12) {
            var auditM = ctx.auditInfo.monthsAway;
            // Position X : bord droit du mois N (coherent avec le canvas)
            var auditX = margin + 2 + auditM * gBarW;
            // Zone verticale du graphe
            var gChartTop = gBaseY - (allPos ? gMaxH : gMaxH * 0.7) - 4;
            // Ligne dashed bordeaux (epaisseur alignee canvas 2.5px ≈ 1.8pt)
            setDraw(doc, C.bordeaux);
            doc.setLineWidth(1.8);
            doc.setLineDashPattern([4, 2.5], 0);
            doc.line(auditX, gChartTop, auditX, gBaseY);
            doc.setLineDashPattern([], 0);
            doc.setLineWidth(0.2);
            // Pilule bordeaux au-dessus du graphe
            var auditLbl = 'Audit ' + (ctx.auditInfo.typeLabel || 'Qualiopi') + ' \u00b7 M+' + auditM;
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(6.5);
            var auditTw = doc.getTextWidth(auditLbl);
            var auditPw = auditTw + 8;
            var auditPh = 5.5;
            var auditPx = auditX - auditPw / 2;
            var auditPy = gChartTop - auditPh - 1;
            // Garder dans les marges
            if (auditPx < margin) auditPx = margin;
            if (auditPx + auditPw > margin + contentW) auditPx = margin + contentW - auditPw;
            roundedRect(doc, auditPx, auditPy, auditPw, auditPh, auditPh / 2, C.bordeaux, null);
            setText(doc, C.blanc);
            doc.text(auditLbl, auditPx + auditPw / 2, auditPy + auditPh / 2 + 1.8, { align: 'center' });
          }

          // Calculer la hauteur max des barres negatives pour positionner y correctement
          var maxNegH = 0;
          if (!allPos) {
            ctx.cumulMonthly.forEach(function(v) {
              if (v < 0) {
                var nh = Math.abs(v) / gAbsMax * gMaxH * 0.7;
                if (nh > maxNegH) maxNegH = nh;
              }
            });
          }
          y = gBaseY + maxNegH + 14;
        } else if (ctx.chartDataUrl) {
          // Fallback : image PNG si les donnees mensuelles ne sont pas disponibles
          var imgW = contentW;
          var imgH = imgW * (ctx.chartH / ctx.chartW);
          if (imgH > 130) { imgH = 130; imgW = imgH * (ctx.chartW / ctx.chartH); }
          doc.addImage(ctx.chartDataUrl, 'PNG', margin + (contentW - imgW) / 2, y, imgW, imgH);
          y += imgH + 8;
        } else {
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.gris);
          doc.text('[Graphique non disponible]', margin, y);
          y += 8;
        }

        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('POINT DE RENTABILITÉ', margin, y);
        y += 6;
        // Card de fond (clair) -- conserve le pattern d'info-card du rapport
        roundedRect(doc, margin, y, contentW, 26, 3, C.bgCard, C.borderLight);
        // Pill badge : miroir visuel du break-even pill du canvas (meme logique chromatique)
        // Vert si amorti dans l'annee, bordeaux sinon. Texte blanc, radius = height/2 (pill complete).
        var breakColorPdf = (ctx.paybackMonth && ctx.paybackMonth <= 12) ? C.vert : C.bordeaux;
        var paybackTxtPdf = ctx.paybackLabel || ('Mois ' + ctx.paybackMonth);
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
        var txtWPdf = doc.getTextWidth(paybackTxtPdf);
        var pillHPdf = 10;
        var pillPadPdf = 5;
        var pillWPdf = txtWPdf + pillPadPdf * 2;
        var pillXPdf = margin + 8;
        var pillYPdf = y + 4;
        roundedRect(doc, pillXPdf, pillYPdf, pillWPdf, pillHPdf, pillHPdf / 2, breakColorPdf, null);
        setText(doc, C.blanc);
        doc.text(paybackTxtPdf, pillXPdf + pillWPdf / 2, pillYPdf + pillHPdf / 2 + 2.5, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.gris);
        var paybackExpl = ctx.paybackDays > 0 && ctx.paybackDays <= 30
          ? 'Votre investissement Qalia est amorti en ' + ctx.paybackDays + ' jours' + (ctx.billingAnnual ? ' (paiement annuel int\u00e9gral)' : '') + '. La courbe cumul\u00e9e peut temporairement fl\u00e9chir en p\u00e9riode creuse (abonnement fixe, activit\u00e9 r\u00e9duite) avant de repartir.'
          : ctx.paybackMonth <= 12
          ? 'Votre investissement Qalia est amorti d\u00e8s le mois ' + ctx.paybackMonth + '. La courbe cumul\u00e9e peut temporairement fl\u00e9chir en p\u00e9riode creuse (abonnement fixe, activit\u00e9 r\u00e9duite) avant de repartir.'
          : 'L\u2019investissement s\u2019amortit au-del\u00e0 de 12 mois. Un focus sur les t\u00e2ches \u00e0 fort volume acc\u00e9l\u00e9rera la rentabilit\u00e9.';
        Q.drawWrapped(doc, paybackExpl, margin + 8, y + 19, contentW - 16, 4);
      }

      // --- Page 6 : SAISONNALITÉ ---
      function drawSeasonality(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Saisonnalité annuelle', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Charge mensuelle en % de la moyenne annuelle (100 %) \u00b7 bas\u00e9 sur vos t\u00e2ches s\u00e9lectionn\u00e9es', margin, y + 6);
        y += 18;

        if (ctx.seasonData && ctx.seasonData.length === 12) {
          var months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
          var barMaxH = 50;
          var barW = (contentW - 24) / 12;
          var baseY = y + barMaxH + 8;
          setDraw(doc, C.grisLeger);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(margin, y + barMaxH / 2, margin + contentW, y + barMaxH / 2);
          doc.setLineDashPattern([], 0);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          setText(doc, C.grisLeger);
          doc.text('100%', margin + contentW + 2, y + barMaxH / 2 + 1);
          // Barres verticales : 3 niveaux de couleurs (coherent avec Resultat net cumule)
          // Fort (> 115%) = succes fonce, Normal (85-115%) = succes moyen, Creux (< 85%) = erreur
          for (var i = 0; i < 12; i++) {
            var v = ctx.seasonData[i];
            var isVacation = v < 0.5;
            var h = Math.min(v, 2) * (barMaxH / 2);
            var baseCol, lightCol;
            if (v < 0.5) {
              // Vacances : couleur deja attenee (pas d'overlay blanc)
              baseCol = [220, 130, 130]; lightCol = [235, 175, 175];
            } else if (v < 0.85) {
              baseCol = C.erreur; lightCol = C.erreurLight;  // creux (canonique COLORS)
            } else if (v > 1.15) {
              baseCol = C.succes; lightCol = C.succesLight;  // pic (canonique COLORS)
            } else {
              baseCol = C.warning; lightCol = C.warningLight;  // normal (canonique COLORS)
            }
            var bx = margin + 2 + i * barW;
            var bw = barW - 3;
            // Barre avec gradient fonce→clair et arrondis haut (identique canvas HTML)
            if (h > 2) {
              // Radius proportionnel (phi, identique canvas barRadius)
              var capR = Math.max(2, Math.min(bw / 2, Math.round((bw / 2) / 2.618)));
              // 1. Fond plein couleur foncee (roundedRect haut, rect bas)
              doc.setFillColor(baseCol[0], baseCol[1], baseCol[2]);
              doc.roundedRect(bx, baseY - h, bw, Math.min(capR * 2, h), capR, capR, 'F');
              if (h > capR * 2) {
                doc.rect(bx, baseY - h + capR, bw, h - capR, 'F');
              }
              // 2. Degrade clair par-dessus (cubique, bas = clair, steps eleves = doux)
              var fadeSteps = Math.max(20, Math.round(h * 2));
              for (var s = 0; s < fadeSteps; s++) {
                var t = s / fadeSteps;
                var opacity = t * t * 0.5;
                var fr = Math.round(baseCol[0] + (lightCol[0] - baseCol[0]) * opacity * 2);
                var fg = Math.round(baseCol[1] + (lightCol[1] - baseCol[1]) * opacity * 2);
                var fb = Math.round(baseCol[2] + (lightCol[2] - baseCol[2]) * opacity * 2);
                doc.setFillColor(fr, fg, fb);
                var sy = baseY - h + capR + (h - capR) * s / fadeSteps;
                var sh = (h - capR) / fadeSteps + 0.2;
                doc.rect(bx, sy, bw, sh, 'F');
              }
              // Vacances : couleur attenee appliquee directement (baseCol/lightCol)
            }
            // Pourcentage en dessous
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(6);
            setText(doc, baseCol);
            doc.text(Math.round(v * 100) + '%', bx + bw / 2, baseY + 4, { align: 'center' });
            // Mois
            doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
            setText(doc, C.gris);
            doc.text(months[i], bx + bw / 2, baseY + 8, { align: 'center' });
          }
          y = baseY + 14;
          // Legende couleurs
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          var legendItems = [
            { color: C.succes, label: '> 115 % (pic)' },
            { color: C.warning, label: '85\u2013115 % (normal)' },
            { color: C.erreur, label: '< 85 % (creux)' }
          ];
          var lx = margin;
          legendItems.forEach(function(li) {
            setFill(doc, li.color);
            doc.rect(lx, y - 1.5, 3, 3, 'F');
            setText(doc, C.gris);
            doc.text(li.label, lx + 5, y + 0.5);
            lx += doc.getTextWidth(li.label) + 12;
          });
          y += 8;
        }

        var sBoxW = (contentW - 8) / 3;
        var nd = 'n/d';
        var sk = [
          { label: 'Pic de charge', value: ctx.seasonPeakLabel || nd, sub: ctx.seasonPeakPct ? Math.round(ctx.seasonPeakPct * 100) + ' % de la moyenne' : '', color: C.vert },
          { label: 'Écart pic/creux', value: ctx.seasonRatio ? Q.fmtNum(ctx.seasonRatio, 1) + '\u00D7' : nd, sub: ctx.seasonRatioLabel || '', color: C.bordeaux },
          { label: 'Mois en surcharge', value: (ctx.seasonOverloadMonths || 0) + ' / 12', sub: ctx.seasonOverloadLabel || '', color: C.bleuCanard }
        ];
        sk.forEach(function(k, i) {
          var x = margin + i * (sBoxW + 4);
          roundedRect(doc, x, y, sBoxW, 30, 3, C.bgCard, C.borderLight);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
          setText(doc, C.gris);
          doc.text(k.label.toUpperCase(), x + sBoxW / 2, y + 6, { align: 'center' });
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(14);
          setText(doc, k.color);
          doc.text(k.value, x + sBoxW / 2, y + 17, { align: 'center' });
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          setText(doc, C.gris);
          doc.text(k.sub, x + sBoxW / 2, y + 25, { align: 'center' });
        });
        y += 40;

        if (ctx.auditInfo) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bordeaux);
          doc.text('AUDIT DE SURVEILLANCE', margin, y);
          y += 6;
          roundedRect(doc, margin, y, contentW, 22, 3, [252, 247, 249], C.bordeaux);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
          setText(doc, C.noir);
          var auditText = 'Votre audit ' + ctx.auditInfo.typeLabel + ' est prévu dans ' + ctx.auditInfo.monthsAway + ' mois. Qalia constitue votre dossier de preuves en continu dès aujourd\u2019hui, aligné sur les indicateurs applicables du RNQ V9.';
          Q.drawWrapped(doc, auditText, margin + 6, y + 7, contentW - 12, 4.5);
        }
      }

      // --- Page COMPARAISON : 3 scénarios (Sans IA / ChatGPT / Qalia) ---
      function drawComparison(doc, ctx) {
        // Refonte v2 (alignee sur le bloc Comparaison du tunnel HTML) :
        // 1. Titre + sous-titre centres style hero
        // 2. 3 barres horizontales fines (6mm) avec valeur a droite, sous-info dessous
        // 3. Bloc "X h economisees par an" mis en avant
        // 4. Tableau "COMPARAISON DES SOLUTIONS" propre
        var y = 30;
        // Titre aligne gauche (meme style que les autres pages)
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Votre temps de conception : trois sc\u00e9narios', margin, y);
        y += 7;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        var dossiersAn = ctx.programs || 0;
        var tauxH = 70;
        var sousTitre = 'Bas\u00e9 sur vos ' + dossiersAn + ' dossiers/an \u00e0 ' + tauxH + ' \u20ac/h';
        doc.text(sousTitre, margin, y);
        y += 12;

        // === 3 barres scenarios ===
        var scSlug = (ctx.metiersSlug || 'formateur').split('-')[0];
        var scD = SCENARIO_DESCS[scSlug] || SCENARIO_DESCS.formateur;
        // Couleurs alignees STRICTEMENT sur le bilan HTML :
        // .sim-time-bar.market = linear-gradient(--erreur, --bordeaux) = rouge degrade
        // .comparison-bar.chatgpt .bar-fill = linear-gradient(#B03030, #D04848) = rouge degrade
        // .sim-time-bar.qalia = linear-gradient(--bleu-canard, --bleu-light) = bleu degrade
        // Tous les scenarios "concurrence" (Sans IA + ChatGPT) sont en ROUGE dans le HTML.
        // Le PDF doit refleter cette coherence chromatique.
        var scenarios = [
          {
            label: 'Sans IA',
            hours: ctx.totalMarketHours,
            color: C.bordeaux,
            colorLight: C.erreur,
            cost: ctx.totalMarketHours * tauxH,
            confLabel: 'Conformit\u00e9 : manuelle'
          },
          {
            label: 'Avec ChatGPT',
            hours: ctx.totalChatGPTHours,
            color: C.erreur,
            colorLight: C.erreurDark || C.bordeaux,
            cost: ctx.totalChatGPTHours * tauxH,
            confLabel: 'Conformit\u00e9 Qualiopi : non v\u00e9rifi\u00e9e'
          },
          {
            label: 'Avec Qalia',
            hours: ctx.totalQaliaHours,
            color: C.bleuCanard,
            colorLight: C.bleuLight,
            cost: 297,
            confLabel: 'Conformit\u00e9 Qualiopi : int\u00e9gr\u00e9e nativement'
          }
        ];
        var maxH = scenarios[0].hours || 1;
        var barMaxW = contentW;
        var barH = 6; // barre fine style tunnel

        scenarios.forEach(function(s, idx) {
          // Ligne 1 : label gauche + valeur droite
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(11);
          setText(doc, idx === 2 ? C.bleuCanard : C.noir);
          doc.text(s.label, margin, y);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
          setText(doc, C.noir);
          var hText = Q.fmtNum(s.hours) + ' h';
          doc.text(hText, margin + contentW, y, { align: 'right' });
          y += 3;
          // Barre fine arrondie
          // Barre arrondie avec gradient (technique Copie 30 validee)
          var w = maxH > 0 ? Math.max(barH, (s.hours / maxH) * barMaxW) : barH;
          var scR = barH / 2;
          var scl = s.colorLight || s.color;
          // 1. Cercle gauche
          setFill(doc, s.color);
          doc.circle(margin + scR, y + scR, scR, 'F');
          // 2. Rects entre les 2 diametres
          var scInnerW = w - scR * 2;
          var scFadeSteps = Math.max(60, Math.round(scInnerW * 2));
          var scLastCol = s.color;
          for (var sf = 0; sf < scFadeSteps; sf++) {
            var sft = sf / (scFadeSteps - 1);
            var sfo = sft * sft * sft * 0.4;
            scLastCol = [
              Math.round(s.color[0] + (scl[0] - s.color[0]) * sfo * 2),
              Math.round(s.color[1] + (scl[1] - s.color[1]) * sfo * 2),
              Math.round(s.color[2] + (scl[2] - s.color[2]) * sfo * 2)
            ];
            doc.setFillColor(scLastCol[0], scLastCol[1], scLastCol[2]);
            var sfx = margin + scR + scInnerW * sf / scFadeSteps;
            var sfw = scInnerW / scFadeSteps + 0.3;
            doc.rect(sfx, y, sfw, barH, 'F');
          }
          // 3. Cercle droit (couleur derniere tranche)
          doc.setFillColor(scLastCol[0], scLastCol[1], scLastCol[2]);
          doc.circle(margin + w - scR, y + scR, scR, 'F');
          y += barH + 2;
          // Ligne 3 : info gauche (cout) + info droite (conformite)
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          var leftInfo = idx === 2
            ? '297 \u20ac/mois \u00b7 Cr\u00e9ations illimit\u00e9es \u00b7 Couverture documentaire structur\u00e9e'
            : Q.fmtNum(Math.round(s.cost)) + ' \u20ac de votre temps';
          doc.text(leftInfo, margin, y);
          doc.text(s.confLabel, margin + contentW, y, { align: 'right' });
          y += 11;
        });

        // === Bloc central "X h economisees par an" (style hero du tunnel) ===
        y += 4;
        var gainH = ctx.totalMarketHours - ctx.totalQaliaHours;
        var gainEur = gainH * tauxH;
        var gainJours = Math.round(gainH / 8);
        // Card de fond
        roundedRect(doc, margin, y, contentW, 36, 4, C.bgCard, C.borderLight);
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(28);
        setText(doc, C.bleuCanard);
        var bigText = Q.fmtNum(gainH) + ' h \u00e9conomis\u00e9es par an';
        doc.text(bigText, margin + contentW / 2, y + 16, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        var sousBigText = 'Soit ' + Q.fmtNum(gainEur) + ' \u20ac de votre temps r\u00e9cup\u00e9r\u00e9 (environ ' + gainJours + ' jours ouvr\u00e9s)';
        doc.text(sousBigText, margin + contentW / 2, y + 26, { align: 'center' });
        y += 42;

        // === Tableau "COMPARAISON DES SOLUTIONS" ===
        // Titre tab centre style pill
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
        setText(doc, C.bleuCanard);
        doc.text('COMPARAISON DES SOLUTIONS', margin + contentW / 2, y, { align: 'center' });
        y += 5;
        // Tableau 4 colonnes : label / Sans / ChatGPT / Qalia
        var col1W = 50;
        var col234W = (contentW - col1W) / 3;
        var rowH = 8;
        // Header (couleurs alignees sur les barres ci-dessus : rouge pour les 2 concurrents, bleu pour Qalia)
        setFill(doc, C.blancCasse);
        doc.rect(margin + col1W, y, contentW - col1W, rowH, 'F');
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bordeaux);
        doc.text('Sans assistance IA', margin + col1W + col234W / 2, y + 5, { align: 'center' });
        setText(doc, C.erreur);
        doc.text('IA g\u00e9n\u00e9raliste', margin + col1W + col234W * 1.5, y + 5, { align: 'center' });
        setText(doc, C.bleuCanard);
        doc.text('Qalia', margin + col1W + col234W * 2.5, y + 5, { align: 'center' });
        y += rowH;
        // Ligne 1 : Heures/an
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.gris);
        doc.text('Heures/an', margin, y + 5);
        setText(doc, C.noir);
        doc.text(Q.fmtNum(ctx.totalMarketHours) + ' h', margin + col1W + col234W / 2, y + 5, { align: 'center' });
        var pctChatGPT = Math.round((ctx.totalChatGPTHours / ctx.totalMarketHours - 1) * 100);
        doc.text(Q.fmtNum(ctx.totalChatGPTHours) + ' h (' + pctChatGPT + ' %)', margin + col1W + col234W * 1.5, y + 5, { align: 'center' });
        var pctQalia = Math.round((ctx.totalQaliaHours / ctx.totalMarketHours - 1) * 100);
        doc.text(Q.fmtNum(ctx.totalQaliaHours) + ' h (' + pctQalia + ' %)', margin + col1W + col234W * 2.5, y + 5, { align: 'center' });
        // Border bottom
        setDraw(doc, C.borderLight);
        doc.line(margin, y + rowH, margin + contentW, y + rowH);
        y += rowH;
        // Ligne 2 : Conformite RNQ V9
        setText(doc, C.gris);
        doc.text('Conformit\u00e9 RNQ V9', margin, y + 5);
        setText(doc, C.bordeaux);
        doc.text('Manuelle', margin + col1W + col234W / 2, y + 5, { align: 'center' });
        setText(doc, C.erreur);
        doc.text('Non v\u00e9rifi\u00e9e', margin + col1W + col234W * 1.5, y + 5, { align: 'center' });
        setText(doc, C.bleuCanard);
        doc.text('Int\u00e9gr\u00e9e nativement', margin + col1W + col234W * 2.5, y + 5, { align: 'center' });
        y += rowH + 4;

        // Note explicative bas (compacte)
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
        setText(doc, C.gris);
        var noteLines = doc.splitTextToSize(
          'ChatGPT g\u00e9n\u00e9rique ne conna\u00eet pas le RNQ V9 ni les sp\u00e9cificit\u00e9s L6313. '
          + 'Il acc\u00e9l\u00e8re la r\u00e9daction brute mais ne v\u00e9rifie ni la couverture des indicateurs, '
          + 'ni la coh\u00e9rence inter-documents, ni les exigences sp\u00e9cifiques \u00e0 votre cat\u00e9gorie.', contentW
        );
        noteLines.forEach(function(ln) {
          doc.text(ln, margin, y);
          y += 3;
        });
      }

      // --- Page INVESTISSEMENT : tarifs dynamiques ---
      function drawPricing(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Votre investissement', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        var engagementTxt = ctx.billingAnnual ? 'convention 12 mois' : 'sans engagement';
        var subText = ctx.teamMultiplier > 1
          ? 'Tarif ' + ctx.pricingTierName + ' pour ' + ctx.teamMultiplier + ' licences, ' + engagementTxt
          : 'Tarif individuel, ' + engagementTxt;
        doc.text(subText, margin, y + 6);
        y += 20;

        // Deux colonnes : Mensuel / Annuel
        var colW = (contentW - 8) / 2;

        // Colonne 1 : Mensuel
        var isMonthly = !ctx.billingAnnual;
        var mBorder = isMonthly ? C.bleuCanard : C.borderLight;
        var mBg = isMonthly ? [237, 245, 247] : C.bgCard;
        roundedRect(doc, margin, y, colW, 70, 4, mBg, mBorder);
        if (isMonthly) { doc.setLineWidth(0.8); setDraw(doc, C.bleuCanard); doc.roundedRect(margin, y, colW, 70, 4, 4); doc.setLineWidth(0.2); }
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.gris);
        doc.text('MENSUEL', margin + colW / 2, y + 10, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(22);
        setText(doc, C.noir);
        doc.text(Q.fmtNum(ctx.monthlyPrice) + ' \u20AC', margin + colW / 2, y + 28, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.gris);
        doc.text('/mois TTC par licence', margin + colW / 2, y + 36, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        setText(doc, C.gris);
        doc.text('Sans engagement', margin + colW / 2, y + 46, { align: 'center' });
        doc.text('R\u00e9siliation mensuelle', margin + colW / 2, y + 52, { align: 'center' });
        if (isMonthly) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
          setText(doc, C.bleuCanard);
          doc.text('\u2713 Votre choix', margin + colW / 2, y + 62, { align: 'center' });
        }

        // Colonne 2 : Annuel
        var aX = margin + colW + 8;
        var aBorder = ctx.billingAnnual ? C.bleuCanard : C.borderLight;
        var aBg = ctx.billingAnnual ? [237, 245, 247] : C.bgCard;
        roundedRect(doc, aX, y, colW, 70, 4, aBg, aBorder);
        if (ctx.billingAnnual) { doc.setLineWidth(0.8); setDraw(doc, C.bleuCanard); doc.roundedRect(aX, y, colW, 70, 4, 4); doc.setLineWidth(0.2); }
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.gris);
        doc.text('ANNUEL', aX + colW / 2, y + 10, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(22);
        setText(doc, C.noir);
        doc.text(Q.fmtNum(ctx.annualPrice) + ' \u20AC', aX + colW / 2, y + 28, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.gris);
        doc.text('/an TTC par licence', aX + colW / 2, y + 36, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        setText(doc, C.gris);
        doc.text('2 mois offerts', aX + colW / 2, y + 46, { align: 'center' });
        doc.text('Engagement 12 mois', aX + colW / 2, y + 52, { align: 'center' });
        if (ctx.billingAnnual) {
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
          setText(doc, C.bleuCanard);
          doc.text('\u2713 Votre choix', aX + colW / 2, y + 62, { align: 'center' });
        }
        y += 80;

        // === FIX P3 (consensus 10/10 personas) ===
        // Si l'utilisateur a choisi le plan ANNUEL, on affiche TOUT en annuel
        // (tarif annuel + cout total annuel + ChatGPT * 12), avec mention
        // secondaire de l'equivalent mensuel pour reference. Si plan MENSUEL,
        // on affiche tout en mensuel comme avant. Plus de melange annuel/mensuel
        // qui creait la confusion bloquante en COMEX (P3 critique).
        var isAnnual = !!ctx.billingAnnual;
        var qaliaEffective = isAnnual ? ctx.annualPrice : ctx.monthlyPrice;
        var chatgptEffective = isAnnual ? ctx.chatgptMonthlyCost * 12 : ctx.chatgptMonthlyCost;
        var totalEffective = qaliaEffective + chatgptEffective;
        var unitLabel = isAnnual ? '\u20AC/an' : '\u20AC/mois';
        var headerLabel = isAnnual ? 'CO\u00dbT TOTAL ANNUEL' : 'CO\u00dbT TOTAL MENSUEL';

        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text(headerLabel, margin, y);
        y += 6;
        roundedRect(doc, margin, y, contentW, 42, 3, C.bgCard, C.borderLight);
        var ly = y + 10;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        setText(doc, C.noir);
        doc.text('Qalia (' + ctx.pricingTierName + ')' + (isAnnual ? ', annuel (2 mois offerts)' : ''), margin + 6, ly);
        doc.text(Q.fmtNum(qaliaEffective) + ' ' + unitLabel, margin + contentW - 6, ly, { align: 'right' });
        ly += 6;
        doc.text('ChatGPT ' + ctx.chatgptPlanLabel + (isAnnual ? ' (\u00D7 12 mois)' : ''), margin + 6, ly);
        doc.text(Q.fmtNum(chatgptEffective) + ' ' + unitLabel, margin + contentW - 6, ly, { align: 'right' });
        ly += 3;
        setDraw(doc, C.borderLight);
        doc.line(margin + 6, ly, margin + contentW - 6, ly);
        ly += 5;
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(11);
        setText(doc, C.bleuCanard);
        doc.text('Total', margin + 6, ly);
        var totalTxt = Q.fmtNum(totalEffective) + ' ' + unitLabel + ' TTC' + (ctx.teamMultiplier > 1 ? ' \u00D7 ' + ctx.teamMultiplier + ' licences = ' + Q.fmtNum(totalEffective * ctx.teamMultiplier) + ' \u20AC' : '');
        var totalFs = 11;
        while (totalFs > 8 && doc.getTextWidth(totalTxt) + doc.getTextWidth('Total') > contentW - 16) { totalFs--; doc.setFontSize(totalFs); }
        doc.text(totalTxt, margin + contentW - 6, ly, { align: 'right' });
        ly += 6;
        // Mention secondaire de l'equivalent (annuel <-> mensuel) pour reference, en italique gris
        if (isAnnual) {
          var equivMonthly = Math.round((totalEffective / 12) * 100) / 100;
          doc.setFont('PlusJakartaSans', 'italic').setFontSize(7);
          setText(doc, C.gris);
          doc.text('\u00e9quivalent mensuel : ' + Q.fmtNum(equivMonthly) + ' \u20AC/mois (pour comparaison uniquement, facturation annuelle au signature)', margin + contentW / 2, ly + 1, { align: 'center' });
        }
        y += 52;

        // Recap ROI
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('RETOUR SUR INVESTISSEMENT', margin, y);
        y += 6;
        var roiBoxW = (contentW - 8) / 3;
        var roiKpis = [
          { label: 'ROI annuel', value: '\u00D7' + (ctx.roiDisplayStr || Q.fmtNum(ctx.roi, 1)), color: C.bleuCanard },
          { label: 'Payback', value: ctx.paybackLabel || ('Mois ' + ctx.paybackMonth), color: C.vert },
          { label: 'R\u00e9sultat net', value: (ctx.netResult >= 0 ? '+' : '') + Q.fmtNum(ctx.netResult) + ' \u20AC', color: ctx.netResult >= 0 ? C.vert : C.bordeaux }
        ];
        roiKpis.forEach(function(k, i) {
          var x = margin + i * (roiBoxW + 4);
          roundedRect(doc, x, y, roiBoxW, 28, 3, C.bgCard, C.borderLight);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
          setText(doc, C.gris);
          doc.text(k.label.toUpperCase(), x + roiBoxW / 2, y + 7, { align: 'center' });
          var roiFs = 14;
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(roiFs);
          while (roiFs > 9 && doc.getTextWidth(k.value) > roiBoxW - 4) { roiFs--; doc.setFontSize(roiFs); }
          setText(doc, k.color);
          doc.text(k.value, x + roiBoxW / 2, y + 20, { align: 'center' });
        });
        y += 38;

        // CTA
        roundedRect(doc, margin, y, contentW, 24, 4, C.bleuCanard, C.bleuCanard);
        doc.link(margin, y, contentW, 24, { url: 'https://rdv.qalia.ai' });
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(12);
        setText(doc, [255, 255, 255]);
        doc.text('R\u00e9server votre d\u00e9mo offerte', margin + contentW / 2, y + 10, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
        doc.text('rdv.qalia.ai', margin + contentW / 2, y + 18, { align: 'center' });
      }

      // --- Page RNQ : CONFORMITÉ RNQ V9 par catégorie L6313 ---
      // Source : 03-Produit/G1-V4/13-Guide-lecture-Qualiopi-V9.md (32 indicateurs, 7 critères)
      // Couverture : Cat.1 20/32 · Cat.2 25/32 · Cat.3 25/32 · Cat.4 29/32 (dont 4 Guidé CFA)
      function drawRNQ(doc, ctx) {
        var y = 30;
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Conformité RNQ V9', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Couverture documentaire de Qalia par cat\u00e9gorie L6313 (7 crit\u00e8res, 32 indicateurs)', margin, y + 6);
        y += 18;

        // Données canoniques RNQ V9 par catégorie L6313 (source unique : COVERAGE_DATA cf. L.11830)
        var L6313_DATA = [
          { key: 1, label: 'Cat. 1 · Formation',         covered: '21 à 24', applicable: '23 à 26', notes: 'Actions de formation' },
          { key: 2, label: 'Cat. 2 · Bilan compétences', covered: '20', applicable: '22', notes: 'CBC · entretiens · synthèse' },
          { key: 3, label: 'Cat. 3 · VAE',               covered: '22', applicable: '24', notes: 'Validation des acquis' },
          { key: 4, label: 'Cat. 4 · Apprentissage',     covered: '29', applicable: '32', notes: 'CFA · 4 indicateurs spécifiques apprentissage' }
        ];

        // Détection catégorie du profil
        var profileCats = {};
        try {
          var cibles = (ctx.metiersSlug || '').split('-');
          // Map slug → cat (mêmes valeurs que PROFILE_CATS)
          var slugToCats = {
            formateur: [1], coach: [1, 2], directeurOF: [1,2,3,4], qualite: [1,2,3,4],
            ingenieurPeda: [1], enseignant: [1], consultantBilan: [2],
            accompagnateurVAE: [3], directeurCFA: [4], maitreApprentissage: [4]
          };
          cibles.forEach(function(c) {
            (slugToCats[c] || []).forEach(function(cat) { profileCats[cat] = true; });
          });
        } catch(e) {}

        // === Grille cartes catégories : UNIQUEMENT catégories actives du profil simulé ===
        // (Bug fondateur corrigé : ne plus afficher les 4 cat. L6313 si la sim ne les couvre pas)
        var activeCats = L6313_DATA.filter(function(cat) { return profileCats[cat.key]; });
        if (activeCats.length === 0) activeCats = [L6313_DATA[0]]; // fallback Cat.1
        var nbCards = activeCats.length;
        var nbCols = nbCards >= 2 ? 2 : 1;
        var cardGap = 8;
        var cardW = (contentW - cardGap * (nbCols - 1)) / nbCols;
        // Hauteur adaptée : 26mm si 1-2 cartes larges, 30mm si 3-4 cartes étroites (évite superposition)
        var cardH = nbCards >= 3 ? 30 : 26;
        activeCats.forEach(function(cat, i) {
          var row = Math.floor(i / nbCols);
          var col = i % nbCols;
          var x = margin + col * (cardW + cardGap);
          var ky = y + row * (cardH + 4);
          // Carte active : bordure unique (pas de double-bordure qui masque les angles arrondis)
          var borderColor = C.bleuCanard;
          var bgColor = [237, 245, 247];
          doc.setLineWidth(0.6);
          roundedRect(doc, x, ky, cardW, cardH, 3, bgColor, borderColor);
          doc.setLineWidth(0.2);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
          setText(doc, C.bleuCanard);
          doc.text(cat.label.toUpperCase(), x + 4, ky + 6);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(16);
          setText(doc, C.noir);
          doc.text(cat.covered + '/' + cat.applicable, x + 4, ky + 16);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          setText(doc, C.gris);
          // Si carte étroite (≥3 cats, 2 colonnes) : notes sur ligne séparée sous "éléments…"
          if (nbCards >= 3) {
            doc.text('éléments documentaires structurés', x + 4, ky + 21);
            doc.text(cat.notes, x + 4, ky + 25);
          } else {
            doc.text('éléments documentaires structurés', x + 4, ky + 21);
            doc.text(cat.notes, x + cardW - 4, ky + 21, { align: 'right' });
          }
        });
        var nbRows = Math.ceil(nbCards / nbCols);
        y += (cardH + 4) * nbRows + 8;

        // === Tableau 7 critères ===
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('LES 7 CRITÈRES DU RNQ V9', margin, y);
        y += 6;
        var CRITERES = [
          { num: 1, label: 'Conditions d\u2019information du public',                            count: 3, indics: 'I-01 à I-03' },
          { num: 2, label: 'Identification des objectifs et personnalisation',                   count: 5, indics: 'I-04 à I-08' },
          { num: 3, label: 'Adaptation aux publics bénéficiaires',                              count: 8, indics: 'I-09 à I-16' },
          { num: 4, label: 'Moyens pédagogiques, techniques et d\u2019encadrement',            count: 4, indics: 'I-17 à I-20' },
          { num: 5, label: 'Qualification et développement des compétences des personnels',     count: 2, indics: 'I-21, I-22' },
          { num: 6, label: 'Inscription dans l\u2019environnement professionnel',               count: 7, indics: 'I-23 à I-29' },
          { num: 7, label: 'Recueil des appréciations et réclamations',                         count: 3, indics: 'I-30 à I-32' }
        ];
        // Entête tableau
        var col1W = 6, col2W = 92, col3W = 14, col4W = contentW - col1W - col2W - col3W;
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(7);
        setText(doc, C.gris);
        doc.text('C', margin + col1W / 2, y, { align: 'center' });
        doc.text('CRITÈRE', margin + col1W + 2, y);
        doc.text('IND.', margin + col1W + col2W + col3W / 2, y, { align: 'center' });
        doc.text('NUMÉROS', margin + col1W + col2W + col3W + 2, y);
        y += 2;
        setDraw(doc, C.borderLight);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + contentW, y);
        y += 3;
        // Lignes (avec troncature pour éviter superposition sur colonnes IND./NUMÉROS)
        CRITERES.forEach(function(c) {
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('C' + c.num, margin + col1W / 2, y, { align: 'center' });
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          // Afficher le label complet (wrap sur 2 lignes si n\u00e9cessaire)
          var labelMaxW = col2W - 4;
          var labelLines = doc.splitTextToSize(c.label, labelMaxW);
          labelLines.slice(0, 2).forEach(function(ln, j) {
            doc.text(ln, margin + col1W + 2, y + j * 3.5);
          });
          if (labelLines.length > 1) y += (labelLines.length - 1) * 3.5;
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
          setText(doc, C.noir);
          doc.text(String(c.count), margin + col1W + col2W + col3W / 2, y, { align: 'center' });
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          doc.text(c.indics, margin + col1W + col2W + col3W + 2, y);
          y += 5;
        });
        y += 4;

        // === Note de bas (statuts + sources intégrés, plus de légende orpheline) ===
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
        setText(doc, C.gris);
        var note = 'Source : Arrêté du 31 mai 2023 (RNQ V9, annexe) · Guide de lecture Qualiopi V9 (janvier 2024). Intitulés des 7 critères abrégés par Qalia pour lisibilité. Qalia structure les éléments documentaires des indicateurs applicables à votre catégorie L6313 (cartographie Qalia, non opposable en audit). Tous les 32 indicateurs font l\u2019objet d\u2019une triangulation documentaire + entretien + observation terrain en audit ; les preuves terrain (ex. I-08, I-15, I-32) restent sous la responsabilité du prestataire. L\u2019IA propose, vous validez : supervision humaine systématique (aligné sur les principes de transparence et d\u2019oversight de l\u2019AI Act 2024).';
        var noteLines = doc.splitTextToSize(note, contentW);
        noteLines.forEach(function(ln) { doc.text(ln, margin, y); y += 3; });
      }

      // --- Page 7 : DÉCOUVREZ QALIA (livrables + CTA) ---
      function drawActivation(doc, ctx) {
        var y = 30;
        // Peak-End hook : rappel du gain principal (Neuro Peak-End Rule)
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Passez \u00e0 l\u2019action', margin, y);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Votre prochaine \u00e9tape change tout', margin, y + 6);
        y += 14;
        // Rappel gain en pill (Peak-End : dernier souvenir = plus intense)
        var peakColor = ctx.netResult >= 0 ? C.succes : C.bordeaux;
        var peakLabel = Q.fmtNum(ctx.hours) + ' h lib\u00e9r\u00e9es \u00b7 ' + Q.fmtNum(ctx.valueSaved) + ' \u20ac r\u00e9cup\u00e9r\u00e9s \u00b7 ROI \u00d7' + (ctx.roiDisplayStr || Q.fmtNum(ctx.roi, 1));
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(9);
        var peakTw = doc.getTextWidth(peakLabel);
        var peakPw = peakTw + 12;
        var peakPh = 7;
        roundedRect(doc, margin, y, peakPw, peakPh, peakPh / 2, peakColor, null);
        setText(doc, C.blanc);
        doc.text(peakLabel, margin + peakPw / 2, y + peakPh / 2 + 2, { align: 'center' });
        y += peakPh + 8;
        // Sous-titre plan
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Votre plan d\u2019activation, \u00e9tape par \u00e9tape', margin, y);
        y += 8;

        var pagesCreated = 1;
        var yMax = 218; // laisser 52mm pour le CTA en bas de page

        function breakIfNeeded(needed) {
          if (y + needed > yMax) {
            doc.addPage();
            pagesCreated++;
            y = 30;
            doc.setFont('DMSerifDisplay', 'normal').setFontSize(14);
            setText(doc, C.bleuCanard);
            doc.text('Passez \u00e0 l\u2019action (suite)', margin, y);
            y += 10;
          }
        }

        // === Bloc "X jours liberes : qu'en faites-vous ?" (3 cartes) ===
        // Insecable : titre 6mm + 3 cartes 26mm + marge 8mm = 40mm
        if (ctx.reinvestCards && ctx.reinvestCards.daysFreed > 0) {
          breakIfNeeded(42);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text((Q.fmtNum(ctx.reinvestCards.daysFreed) + ' JOURS LIBÉRÉS : QU\u2019EN FAITES-VOUS ?').toUpperCase(), margin, y);
          y += 6;
          var cardW = (contentW - 8) / 3;
          var cardH = 26;
          // Routage profil → labels métier (même dictionnaire que le DOM)
          var reinvSlug = (ctx.metiersSlug || 'formateur').split('-')[0];
          var reinvL = REINVEST_LABELS[reinvSlug] || REINVEST_LABELS.formateur;
          var cards = [
            { lbl: reinvL.lbl1, val: '+' + Q.fmtNum(ctx.reinvestCards.sessions), sub: reinvL.sub1 },
            { lbl: reinvL.lbl2, val: '+' + Q.fmtNum(ctx.reinvestCards.revenue) + ' \u20AC', sub: reinvL.sub2 },
            { lbl: reinvL.lbl3, val: Q.fmtNum(ctx.reinvestCards.weekends), sub: reinvL.sub3 }
          ];
          cards.forEach(function(c, i) {
            var x = margin + i * (cardW + 4);
            roundedRect(doc, x, y, cardW, cardH, 3, C.bgCard, C.borderLight);
            doc.setFont('PlusJakartaSans', 'semibold').setFontSize(8);
            setText(doc, C.bleuCanard);
            doc.text(c.lbl, x + cardW / 2, y + 6, { align: 'center' });
            doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
            setText(doc, C.noir);
            doc.text(c.val, x + cardW / 2, y + 14, { align: 'center' });
            doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
            setText(doc, C.gris);
            var subLines = doc.splitTextToSize(c.sub, cardW - 4);
            subLines.forEach(function(ln, j) {
              doc.text(ln, x + cardW / 2, y + 19 + j * 3, { align: 'center' });
            });
          });
          y += cardH + 8;
        }

        // === Bloc Palier Standardisation equipe (conditionnel) ===
        // Insecable : titre 6mm + bandeau prix 14mm + services 3 lignes 12mm + marge = 36mm
        if (ctx.teamTier) {
          breakIfNeeded(38);
          var tt = ctx.teamTier;
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('DÉPLOIEMENT ÉQUIPE : PALIER STANDARDISATION', margin, y);
          y += 6;
          // Bandeau prix (hauteur 14mm)
          roundedRect(doc, margin, y, contentW, 14, 2, C.bgCard, C.borderLight);
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(13);
          setText(doc, C.noir);
          doc.text((ctx.billingAnnual ? Q.fmtNum(tt.pricePerLicence * 10) + ' \u20AC / licence / an' : Q.fmtNum(tt.pricePerLicence) + ' \u20AC / licence / mois'), margin + 4, y + 6);
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          doc.text(tt.licences + ' licences \u00b7 ' + Q.fmtNum(ctx.billingAnnual ? tt.pricePerLicence * tt.licences * 10 : tt.pricePerLicence * tt.licences) + ' \u20AC' + (ctx.billingAnnual ? ' / an (2 mois offerts)' : ' / mois') + ' \u00b7 Tarif unique ' + (ctx.billingAnnual ? '2\u00a0970 \u20AC/an' : '297 \u20AC/mois') + '/licence', margin + 4, y + 11);
          y += 16;
          // Services inclus
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          doc.text('Inclus : ' + tt.services.join(' \u00B7 '), margin, y);
          y += 8;
        }

        // === PLAN D'ACTION 3 ETAPES (remplace l'ancien catalogue Cat.1-4, redondant avec drawRNQ) ===
        // Fidelite au bilan HTML : positionnement "plan d'action" plutot que "brochure produit".
        // Hauteur insecable : titre 6 + 3 cartes 28 + marge 4 = 38mm
        breakIfNeeded(40);
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('VOTRE PLAN D\u2019ACTION', margin, y);
        y += 6;
        var stepW = (contentW - 8) / 3;
        var stepH = 28;
        var steps = [
          {
            num: '1',
            title: 'R\u00e9servez votre d\u00e9mo',
            sub: '30 min offertes, sans engagement. Romuald vous montre Qalia sur votre cas reel.'
          },
          {
            num: '2',
            title: 'Testez sur un programme',
            sub: 'Activation sous 24 h. Vous generez votre premiere ingenierie complete en 1 h.'
          },
          {
            num: '3',
            title: 'D\u00e9ployez en confiance',
            sub: 'Cercle Qalia, veille RNQ, support r\u00e9actif. Vous n\u2019\u00eates plus seul face \u00e0 Qualiopi.'
          }
        ];
        steps.forEach(function(s, i) {
          var sx = margin + i * (stepW + 4);
          roundedRect(doc, sx, y, stepW, stepH, 3, C.bgCard, C.borderLight);
          // Pastille numero
          setFill(doc, C.bleuCanard);
          doc.circle(sx + 6, y + 7, 3.5, 'F');
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(11);
          setText(doc, C.blanc);
          doc.text(s.num, sx + 6, y + 8.5, { align: 'center' });
          // Titre etape
          doc.setFont('PlusJakartaSans', 'bold').setFontSize(10);
          setText(doc, C.noir);
          doc.text(s.title, sx + 12, y + 9);
          // Description
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.gris);
          var sLines = doc.splitTextToSize(s.sub, stepW - 6);
          sLines.slice(0, 3).forEach(function(ln, j) {
            doc.text(ln, sx + 3, y + 16 + j * 3.5);
          });
        });
        y += stepH + 6;

        // === Bloc Cercle Qalia (anti-isolement, narratif marque) ===
        // Insecable : titre 6 + bandeau 18 = 24mm
        breakIfNeeded(26);
        doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
        setText(doc, C.bleuCanard);
        doc.text('VOUS N\u2019\u00CATES PLUS SEUL', margin, y);
        y += 6;
        roundedRect(doc, margin, y, contentW, 18, 3, C.bgCard, C.borderLight);
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(10);
        setText(doc, C.noir);
        doc.text('Cercle Qalia \u00B7 2 visios / mois avec Romuald (fondateur)', margin + 6, y + 7);
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        setText(doc, C.gris);
        doc.text('45 min, 15 participants max \u00B7 veille r\u00E9glementaire, strat\u00E9gies, questions m\u00E9tier \u00B7 replay Notion', margin + 6, y + 13);
        y += 22;

        // === Contenus utiles int\u00e9gr\u00e9s (ex-annexes, redistribu\u00e9s ici pour \u00e9viter post-CTA) ===
        if (ctx.insight) {
          breakIfNeeded(16);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('VOTRE PROJECTION', margin, y);
          y += 5;
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          var insLines = doc.splitTextToSize(ctx.insight, contentW);
          insLines.slice(0, 3).forEach(function(ln) { doc.text(ln, margin, y); y += 4; });
          y += 3;
        }
        if (ctx.advice) {
          breakIfNeeded(16);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.vert);
          doc.text('CONSEILS D\u2019OPTIMISATION', margin, y);
          y += 5;
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          var advLines = doc.splitTextToSize(ctx.advice, contentW);
          advLines.slice(0, 3).forEach(function(ln) { doc.text(ln, margin, y); y += 4; });
          y += 3;
        }
        if (ctx.teamNeeds) {
          breakIfNeeded(16);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text('BESOINS \u00c9QUIPE', margin, y);
          y += 5;
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
          setText(doc, C.noir);
          var tnLines = doc.splitTextToSize(ctx.teamNeeds, contentW);
          tnLines.slice(0, 3).forEach(function(ln) { doc.text(ln, margin, y); y += 4; });
          y += 3;
        }

        // CTA : toujours en bas de la dernière page (insécable, 45mm)
        // Le disclaimer est place juste au-dessus du CTA, sur la meme page.
        // Fix 2026-04-11 : auparavant breakIfNeeded(14) pour le disclaimer pouvait
        // creer une page "suite" ne contenant que le disclaimer + CTA (page quasi vide).
        // Desormais on calcule d'abord la position du CTA, puis on place le disclaimer
        // juste au-dessus, garantissant qu'ils restent ensemble sans page orpheline.
        var discH = 0;
        var discLinesPdf = [];
        if (ctx.disclaimer) {
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(6);
          discLinesPdf = doc.splitTextToSize(ctx.disclaimer, contentW).slice(0, 4);
          discH = discLinesPdf.length * 2.6 + 3;
        }
        var ctaY = y + 5 + discH;
        if (ctaY + 45 > 272) {
          // Pas assez de place : on remonte le CTA dans l'espace restant
          // au lieu de creer une page quasi-vide
          ctaY = 272 - 45;
        }
        // Si meme ca ne suffit pas (y est deja trop bas), on utilise le bas de page
        if (ctaY < y) ctaY = y + 3;
        // Disclaimer juste au-dessus du CTA
        if (discLinesPdf.length > 0) {
          var discY = ctaY - discH;
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(6);
          setText(doc, C.grisLeger);
          discLinesPdf.forEach(function(ln) {
            doc.text(ln, margin, discY); discY += 2.6;
          });
        }
        roundedRect(doc, margin, ctaY, contentW, 45, 4, C.bleuCanard);

        // === Cercle enso (proxy PDF du ::after .final-cta .container HTML) ===
        // Site : 1 cercle CSS 400x400, border 1px rgba(255,255,255,0.08), centre (50%, 65%), clippe par overflow:hidden
        // PDF : 1 cercle stroke-only avec couleur precalculee (bleu-canard + white@8%)
        // Equation : result = bg + alpha * (fg - bg) sur fond #1B7E94 -> rgb(45, 136, 157)
        // Dimensionne pour rester dans la box de 45mm sans clipping
        var ensoCenterX = margin + contentW / 2;
        var ensoCenterY = ctaY + 22.5; // centre vertical du CTA (50% pour eviter debordement)
        setDraw(doc, [45, 136, 157]);
        doc.setLineWidth(0.25);
        doc.circle(ensoCenterX, ensoCenterY, 20, 'S');
        // Reset line width pour le reste
        doc.setLineWidth(0.3);

        doc.link(margin, ctaY, contentW, 45, { url: 'https://rdv.qalia.ai' });
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(14);
        setText(doc, C.blanc);
        doc.text('Réservez votre démo offerte', margin + contentW / 2, ctaY + 12, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        var ctaPLabel = Q.PROFILE_LABELS[(ctx.metiersSlug || 'formateur').split('-')[0]] || Q.PROFILE_LABELS.formateur;
        doc.text('30 minutes, sans engagement \u00B7 ' + ctaPLabel, margin + contentW / 2, ctaY + 19, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'bold').setFontSize(12);
        doc.text('rdv.qalia.ai', margin + contentW / 2, ctaY + 30, { align: 'center' });
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(8);
        doc.text('bonjour@qalia.ai  \u00B7  +262 693 303 970', margin + contentW / 2, ctaY + 38, { align: 'center' });
        // Disclaimer supprime d'ici : deplace en amont du CTA pour eviter le chevauchement
        // avec le footer global drawPageFrame (ligne 282, texte 287).

        return pagesCreated;
      }

      // --- Pages Annexes : auto-pagination des sections captées du bilan ---
      // Retourne le nombre de pages créées
      function drawAnnexes(doc, ctx) {
        var yMax = 265; // limite basse avant nouvelle page
        var y = 30;
        var pagesCreated = 1;

        function ensureSpace(needed) {
          if (y + needed > yMax) {
            doc.addPage();
            pagesCreated++;
            y = 30;
          }
        }
        function sectionTitle(title, subtitle) {
          ensureSpace(22);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, C.bleuCanard);
          doc.text(title.toUpperCase(), margin, y);
          y += 6;
          if (subtitle) {
            doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
            setText(doc, C.gris);
            doc.text(subtitle, margin, y);
            y += 5;
          }
          setDraw(doc, C.bleuCanard);
          doc.setLineWidth(0.4);
          doc.line(margin, y, margin + 30, y);
          y += 6;
        }
        function paragraph(text, opts) {
          if (!text) return;
          opts = opts || {};
          var size = opts.size || 9;
          var color = opts.color || C.noir;
          var font = opts.font || 'normal';
          doc.setFont('PlusJakartaSans', font).setFontSize(size);
          setText(doc, color);
          var lines = doc.splitTextToSize(text, contentW);
          lines.forEach(function(ln) {
            ensureSpace(size * 0.5 + 1);
            doc.text(ln, margin, y);
            y += size * 0.5 + 1;
          });
          y += 2;
        }
        function block(title, text, accent) {
          if (!text) return;
          var color = accent || C.bleuCanard;
          ensureSpace(16);
          doc.setFont('PlusJakartaSans', 'semibold').setFontSize(9);
          setText(doc, color);
          doc.text(title.toUpperCase(), margin, y);
          y += 5;
          // Split by lines (preserves lists and structure from DOM extraction)
          var rawLines = text.split(/\n/);
          rawLines.forEach(function(line) {
            if (!line.trim()) { y += 2; return; } // blank line = paragraph break
            var trimmed = line.trim();
            // Detect list items (bullets, dashes, numbered)
            var isList = /^[\u2022\u2013\u2014\-\*]\s|^\d+[\.\)]\s/.test(trimmed);
            if (isList) {
              var bullet = trimmed.charAt(0);
              var content = trimmed.replace(/^[\u2022\u2013\u2014\-\*]\s*|^\d+[\.\)]\s*/, '').trim();
              doc.setFont('PlusJakartaSans', 'normal').setFontSize(9);
              setText(doc, C.noir);
              setFill(doc, color);
              ensureSpace(5);
              doc.circle(margin + 2, y - 1.2, 0.7, 'F');
              var itemLines = doc.splitTextToSize(content, contentW - 8);
              itemLines.forEach(function(ln, j) {
                if (j > 0) ensureSpace(5);
                doc.text(ln, margin + 6, y);
                y += 4.5;
              });
            } else {
              // Regular text
              var t = trimmed.replace(/\s+/g, ' ');
              paragraph(t);
            }
          });
          y += 3;
        }

        // --- Titre annexes ---
        doc.setFont('DMSerifDisplay', 'normal').setFontSize(20);
        setText(doc, C.bleuCanard);
        doc.text('Annexes du bilan', margin, y);
        y += 4;
        doc.setFont('PlusJakartaSans', 'normal').setFontSize(10);
        setText(doc, C.gris);
        doc.text('Analyse détaillée, alertes, conformité et conseils', margin, y + 4);
        y += 16;

        // Badge IA + Context recap (contexte global)
        if (ctx.iaBadge) block('Analyse IA Qualiopi', ctx.iaBadge, C.bleuCanard);
        if (ctx.contextRecap) block('Récapitulatif contexte', ctx.contextRecap, C.gris);

        // Verdict complet
        if (ctx.verdictLabel || ctx.verdictFootnote) {
          sectionTitle('Verdict');
          if (ctx.verdictLabel) paragraph(ctx.verdictLabel, { font: 'bold', size: 11, color: C.bleuCanard });
          if (ctx.verdictFootnote) paragraph(ctx.verdictFootnote, { size: 9, color: C.gris });
        }

        // Temps réinvesti
        if (ctx.reinvest) block('Temps réinvesti', ctx.reinvest, C.vert);

        // Qualiopi alert
        if (ctx.qualiopiAlert) block('Alerte Qualiopi', ctx.qualiopiAlert, C.bordeaux);

        // Team needs
        if (ctx.teamNeeds) block('Besoins de l\u2019équipe', ctx.teamNeeds, C.bleuCanard);

        // Audit boost
        if (ctx.auditBoost) block('Préparation audit', ctx.auditBoost, C.bordeaux);

        // Conséquences décisionnelles
        if (ctx.consequences) block('Conséquences de l\u2019inaction', ctx.consequences, C.bordeaux);

        // Conformité RNQ V9
        if (ctx.conformity) block('Conformité RNQ V9 (couverture documentaire)', ctx.conformity, C.bleuCanard);

        // ROI summary (texte sous graphique)
        if (ctx.roiSummary) block('Synthèse ROI', ctx.roiSummary, C.bleuCanard);

        // Season note
        if (ctx.seasonNote) block('Lecture saisonnalité', ctx.seasonNote, C.bleuCanard);

        // Audit note
        if (ctx.auditNoteText) block('Note audit', ctx.auditNoteText, C.bordeaux);

        // Pain response
        if (ctx.painResponse) block('Ce que Qalia change pour vous', ctx.painResponse, C.bordeaux);

        // Insight socratique
        if (ctx.insight) block('Insight', ctx.insight, C.bleuCanard);

        // Conseils d'optimisation
        if (ctx.advice) block('Conseils d\u2019optimisation', ctx.advice, C.vert);

        // Disclaimer
        if (ctx.disclaimer) {
          ensureSpace(20);
          y += 4;
          setDraw(doc, C.borderLight);
          doc.setLineWidth(0.2);
          doc.line(margin, y, margin + contentW, y);
          y += 4;
          doc.setFont('PlusJakartaSans', 'normal').setFontSize(7);
          setText(doc, C.gris);
          var lines = doc.splitTextToSize(ctx.disclaimer, contentW);
          lines.forEach(function(ln) {
            ensureSpace(3);
            doc.text(ln, margin, y);
            y += 3;
          });
        }

        return pagesCreated;
      }

      // ============================================
      // HYBRIDE html2canvas + jsPDF : capture fidèle du Bilan
      // ============================================

      // CAPTURE SECTION-PAR-SECTION : html2canvas tronque les docs > ~1500px
      // On capture chaque section top-level du dashboard dans un hôte isolé,
      // puis on concatène les canvases en un seul bigCanvas vertical.
      // Retourne une Promise<Canvas>
      function captureDashboardSections(html2canvas, ctx) {
        var src = document.querySelector('.sim-dashboard');
        if (!src) return Promise.resolve(null);
        var snapshotW = 1024; // px
        var contentW = snapshotW - 80; // padding 40px*2 = 944px
        // Sélecteurs à supprimer dans chaque section
        var toRemove = [
          '#simShare', '.sim-share', '.sim-share-modal-overlay',
          '#simBack9', '#simRestart', '.sim-results-restart', '.sim-btn-back',
          '.sim-billing-toggle', '.sim-chatgpt-plan', '#simBillingToggle', '#simChatgptPlan',
          '.sim-share-modal', '.sim-time-toggle-wrap'
        ];
        // Récupérer toutes les sections top-level visibles (offsetHeight > 0)
        var sections = [];
        Array.prototype.forEach.call(src.children, function(child) {
          if (child.offsetHeight > 0 && child.offsetWidth > 0) {
            sections.push(child);
          }
        });
        if (sections.length === 0) return Promise.resolve(null);
        var prevScroll = window.scrollY;
        var capturedCanvases = [];

        // Capture d'une section
        function captureSectionPromise(origSection) {
          return new Promise(function(resolve) {
            var host = document.createElement('div');
            host.style.cssText = 'position:absolute; left:0; top:0; width:' + snapshotW + 'px; z-index:999999; background:#ffffff; padding:16px 40px; box-sizing:border-box; font-family:Plus Jakarta Sans,system-ui,sans-serif;';
            var cloneEl = origSection.cloneNode(true);
            cloneEl.style.cssText = 'width:100%; max-width:none; background:#fff;';
            // Nettoyage
            toRemove.forEach(function(sel) {
              cloneEl.querySelectorAll(sel).forEach(function(el) {
                if (el.parentNode) el.parentNode.removeChild(el);
              });
            });
            // Replace canvases par images
            var origCanvases = origSection.querySelectorAll('canvas');
            var cloneCanvases = cloneEl.querySelectorAll('canvas');
            for (var i = 0; i < origCanvases.length && i < cloneCanvases.length; i++) {
              try {
                var dataUrl = origCanvases[i].toDataURL('image/png');
                var img = document.createElement('img');
                img.src = dataUrl;
                var sw = cloneCanvases[i].style.width || (cloneCanvases[i].width + 'px');
                var sh = cloneCanvases[i].style.height || (cloneCanvases[i].height + 'px');
                img.style.cssText = 'width:' + sw + '; height:' + sh + '; display:block; max-width:100%;';
                cloneCanvases[i].parentNode.replaceChild(img, cloneCanvases[i]);
              } catch(e) {}
            }
            host.appendChild(cloneEl);
            document.body.insertBefore(host, document.body.firstChild);
            window.scrollTo(0, 0);
            setTimeout(function() {
              html2canvas(host, { scale: 2, backgroundColor: '#fff', logging: false, useCORS: true })
                .then(function(c) { host.remove(); resolve(c); })
                .catch(function() { host.remove(); resolve(null); });
            }, 100);
          });
        }

        // Chaîner les captures séquentiellement pour éviter les race conditions
        // (pas de header custom : drawPageFrame du PDF ajoute déjà un header par page)
        var chain = Promise.resolve();
        sections.forEach(function(sec) {
          chain = chain.then(function() {
            return captureSectionPromise(sec).then(function(c) {
              if (c) capturedCanvases.push(c);
            });
          });
        });
        return chain.then(function() {
          window.scrollTo(0, prevScroll);
          if (capturedCanvases.length === 0) return null;
          // Concaténer verticalement
          var totalH = capturedCanvases.reduce(function(s, c) { return s + c.height; }, 0);
          var maxW = Math.max.apply(null, capturedCanvases.map(function(c) { return c.width; }));
          var big = document.createElement('canvas');
          big.width = maxW;
          big.height = totalH;
          var bctx = big.getContext('2d');
          bctx.fillStyle = '#ffffff';
          bctx.fillRect(0, 0, maxW, totalH);
          var y = 0;
          capturedCanvases.forEach(function(c) {
            bctx.drawImage(c, 0, y);
            y += c.height;
          });
          return big;
        });
      }

      // Découpe un grand canvas en pages A4 (smart break : évite de couper au milieu d'un élément)
      // Ajoute chaque page à jsPDF
      function addCanvasPagesToPdf(doc, bigCanvas, opts) {
        opts = opts || {};
        var marginMm = opts.margin || 10;
        var topMm = opts.top || 16;
        var bottomMm = opts.bottom || 14;
        var pageW_mm = 210;
        var pageH_mm = 297;
        var contentW_mm = pageW_mm - 2 * marginMm;
        var contentH_mm = pageH_mm - topMm - bottomMm;
        // Le rapport px/mm basé sur la largeur
        var pxPerMm = bigCanvas.width / contentW_mm;
        var pageH_px = Math.floor(contentH_mm * pxPerMm);
        var pagesAdded = 0;
        var y = 0;
        while (y < bigCanvas.height) {
          var sliceH = Math.min(pageH_px, bigCanvas.height - y);
          var tmp = document.createElement('canvas');
          tmp.width = bigCanvas.width;
          tmp.height = sliceH;
          var tctx = tmp.getContext('2d');
          // Fond blanc
          tctx.fillStyle = '#ffffff';
          tctx.fillRect(0, 0, tmp.width, tmp.height);
          tctx.drawImage(bigCanvas, 0, y, bigCanvas.width, sliceH, 0, 0, bigCanvas.width, sliceH);
          doc.addPage();
          pagesAdded++;
          var dataUrl = tmp.toDataURL('image/jpeg', 0.92);
          var imgH_mm = (sliceH / pxPerMm);
          doc.addImage(dataUrl, 'JPEG', marginMm, topMm, contentW_mm, imgH_mm, undefined, 'FAST');
          y += sliceH;
        }
        return pagesAdded;
      }

      // --- Main entry point ---
      Q.generate = function(ctx) {
        // MODE HYBRIDE : capture DOM via html2canvas + jsPDF
        var mode = (ctx && ctx.pdfMode) || 'native';
        if (mode === 'hybrid') {
          return Q.loadJsPDF()
            .then(function(jspdf) {
              return Q.loadHtml2Canvas().then(function(html2canvas) {
                return Q.loadFont().then(function() {
                  return { jspdf: jspdf, html2canvas: html2canvas };
                });
              });
            })
            .then(function(libs) {
              var jsPDFCtor = libs.jspdf.jsPDF || window.jsPDF;
              var doc = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' });
              Q.patchDocText(doc);
              var fontOK = Q.registerFont(doc);
              if (!fontOK) {
                doc.addFont('Helvetica', 'PlusJakartaSans', 'normal');
                doc.addFont('Helvetica-Bold', 'PlusJakartaSans', 'bold');
                doc.addFont('Helvetica-Bold', 'PlusJakartaSans', 'semibold');
                doc.addFont('Helvetica', 'PlusJakartaSans', 'italic');
                doc.addFont('Helvetica', 'DMSerifDisplay', 'normal');
                doc.addFont('Helvetica', 'DMSerifDisplay', 'italic');
              }
              var now = new Date();
              var dateStr = Q.fmtDate(now);
              var ref = Q.genRef();
              ctx.ref = ref;
              ctx.dateStr = dateStr;

              // Page 1 : Couverture jsPDF native (branding)
              drawCover(doc, ctx);
              var coverPage = 1;

              // Capturer le dashboard section-par-section (contourne la troncature html2canvas)
              return captureDashboardSections(libs.html2canvas, ctx).then(function(bigCanvas) {
                if (!bigCanvas) {
                  doc.save('Qalia-ROI-' + (ctx.metiersSlug || 'rapport') + '-' + dateStr.replace(/\s/g, '-') + '.pdf');
                  return { filename: 'Qalia-ROI.pdf', ref: ref, totalPages: 1, mode: 'cover-only' };
                }
                // Ajouter les pages du dashboard
                var dashPages = addCanvasPagesToPdf(doc, bigCanvas, { margin: 10, top: 16, bottom: 14 });
                var totalPages = doc.getNumberOfPages();
                // Overlay frames (headers/footers) sur toutes les pages
                for (var p = 1; p <= totalPages; p++) {
                  doc.setPage(p);
                  Q.drawPageFrame(doc, p, totalPages, {
                    skipHeader: p === 1,
                    ref: ref,
                    dateStr: dateStr,
                    profileSlug: ctx.metiersSlug
                  });
                }
                var profilSlug = (ctx.metiersSlug || 'profil').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                var dateSlug = now.getFullYear() + '-' + ('0'+(now.getMonth()+1)).slice(-2) + '-' + ('0'+now.getDate()).slice(-2);
                var filename = 'Qalia-ROI-' + profilSlug + '-' + dateSlug + '.pdf';
                doc.save(filename);
                return { filename: filename, ref: ref, totalPages: totalPages, mode: 'hybrid', dashPages: dashPages };
              });
            });
        }

        // === MODE NATIF (fallback / legacy) ===
        return Q.loadJsPDF().then(function(jspdf) {
          return Q.loadFont().then(function() {
            var jsPDFCtor = jspdf.jsPDF || window.jsPDF;
            var doc = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            Q.patchDocText(doc);
            var fontOK = Q.registerFont(doc);
            if (!fontOK) {
              doc.addFont('Helvetica', 'PlusJakartaSans', 'normal');
              doc.addFont('Helvetica-Bold', 'PlusJakartaSans', 'bold');
              doc.addFont('Helvetica-Bold', 'PlusJakartaSans', 'semibold');
              doc.addFont('Helvetica', 'PlusJakartaSans', 'italic');
              doc.addFont('Helvetica', 'DMSerifDisplay', 'normal');
              doc.addFont('Helvetica', 'DMSerifDisplay', 'italic');
            }
            var now = new Date();
            var dateStr = Q.fmtDate(now);
            var ref = Q.genRef();
            ctx.ref = ref;
            ctx.dateStr = dateStr;

            // Décide si les annexes ont du contenu
            var hasAnnexes = !!(ctx.iaBadge || ctx.contextRecap || ctx.verdictLabel || ctx.verdictFootnote
              || ctx.reinvest || ctx.qualiopiAlert || ctx.teamNeeds || ctx.auditBoost
              || ctx.consequences || ctx.conformity || ctx.roiSummary || ctx.seasonNote
              || ctx.auditNoteText || ctx.painResponse || ctx.insight || ctx.advice || ctx.disclaimer);
            // Ordre miroir du bilan HTML (source de verite, fidelite 9/10) :
            //   1. Verdict + 6 KPIs (Synthesis)
            //   2. ROI cumule mois par mois (Chart)
            //   3. Temps avant/apres 3 scenarios (Comparison)
            //   4. Conformite Qualiopi (RNQ)
            //   5. Pricing Qalia + plan ChatGPT (Pricing)
            //   6. Bilan detaille par tache (annexe multi-pages)
            //   7. Saisonnalite annuelle (annexe)
            //   8. Activation / plan d'action CTA
            var pageBuilders = [
              { fn: drawCover, skipHeader: true, pages: 1 },
              { fn: drawSynthesis, skipHeader: false, pages: 1 },
              { fn: drawChart, skipHeader: false, pages: 1 },
              { fn: drawComparison, skipHeader: false, pages: 1 },
              { fn: drawRNQ, skipHeader: false, pages: 1 },
              { fn: drawPricing, skipHeader: false, pages: 1 },
              { fn: drawBilan, skipHeader: false, multi: true },
              { fn: drawSeasonality, skipHeader: false, pages: 1 },
              { fn: drawActivation, skipHeader: false, multi: true }
            ];
            // Annexes d\u00e9sactiv\u00e9es (P4) : contenu utile redistribu\u00e9 dans les pages natives

            // 1er passage : rendu des pages (sans frame) + tracking des pages de chaque builder
            var pageMeta = []; // [{ skipHeader, startPage }]
            var currentPage = 1;
            pageBuilders.forEach(function(pb, idx) {
              if (idx > 0) doc.addPage();
              currentPage = doc.getNumberOfPages();
              var startPage = currentPage;
              var created = pb.fn(doc, ctx);
              if (pb.multi) {
                var n = (typeof created === 'number' && created > 0) ? created : 1;
                for (var p = 0; p < n; p++) {
                  pageMeta.push({ skipHeader: pb.skipHeader, pageNum: startPage + p });
                }
              } else {
                pageMeta.push({ skipHeader: pb.skipHeader, pageNum: startPage });
              }
            });

            // Nettoyage page vide (securise)
            try {
              var lastPage = doc.getNumberOfPages();
              if (lastPage > pageMeta.length && lastPage > 1) {
                doc.deletePage(lastPage);
              }
            } catch(e) { /* deletePage non supporte, ignorer */ }

            // 2e passage : frames avec totalPages correct
            var totalPages = doc.getNumberOfPages();
            pageMeta.forEach(function(m) {
              doc.setPage(m.pageNum);
              Q.drawPageFrame(doc, m.pageNum, totalPages, {
                skipHeader: m.skipHeader,
                ref: ref,
                dateStr: dateStr,
                profileSlug: ctx.metiersSlug
              });
            });

            var profilSlug = (ctx.metiersSlug || 'profil').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            var dateSlug = now.getFullYear() + '-' + ('0'+(now.getMonth()+1)).slice(-2) + '-' + ('0'+now.getDate()).slice(-2);
            var filename = 'Qalia-ROI-' + profilSlug + '-' + dateSlug + '.pdf';
            doc.save(filename);
            return { filename: filename, ref: ref, totalPages: totalPages };
          });
        });
      };
    })();
