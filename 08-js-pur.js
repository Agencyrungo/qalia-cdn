    // ---- Nav scroll effect ----
    (function() {
      var nav = document.getElementById('nav');
      var lastScroll = 0;
      window.addEventListener('scroll', function() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
      }, { passive: true });
    })();

    // ---- Sticky CTA mobile (visible après le hero) ----
    (function() {
      var stickyCta = document.getElementById('stickyCta');
      var hero = document.getElementById('hero');
      if (!stickyCta || !hero) return;

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            stickyCta.classList.remove('visible');
          } else {
            stickyCta.classList.add('visible');
          }
        });
      }, { threshold: 0 });

      observer.observe(hero);
    })();

    // ---- F3 retire 2026-04-27 : floatingCta supprime sur demande utilisateur ----
    (function() {
      // No-op : le bouton flottant central a ete retire. Le sticky CTA mobile (#stickyCta) couvre seul ce besoin.
      return;
    })();

    // ---- Intersection Observer for fade-in animations ----
    (function() {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('.fade-in').forEach(function(el) {
        observer.observe(el);
      });
    })();

    // ---- FAQ accordion ----
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.parentElement;
        var isOpen = item.classList.contains('open');

        // Close all others
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('open');
          this.setAttribute('aria-expanded', 'true');

          // Scroll conditionnel apres la transition max-height (0.4s).
          // Ne scroller que si : reponse longue (> 60% viewport) OU
          // question sortie du viewport (mobile surtout).
          var faqItem = item;
          setTimeout(function() {
            var rect = faqItem.getBoundingClientRect();
            var vh = window.innerHeight;
            var answer = faqItem.querySelector('.faq-answer');
            var answerH = answer ? answer.getBoundingClientRect().height : 0;
            var questionSortie = rect.top < 0 || rect.top > vh * 0.85;
            var reponseLongue = answerH > vh * 0.6;
            if (questionSortie || reponseLongue) {
              faqItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 420);
        }
      });
    });

    // ---- FAQ shortcut links : scroll + open ----
    document.querySelectorAll('.faq-shortcut-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-target');
        var targetBtn = document.getElementById(targetId);
        if (!targetBtn) return;

        var item = targetBtn.closest('.faq-item');
        if (!item) return;

        // Fermer tous les autres SANS animation (sinon le scroll calcule
        // la position avant que la fermeture 0.4s ne soit terminee).
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          var answer = openItem.querySelector('.faq-answer');
          if (answer) {
            answer.style.transition = 'none';
          }
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          if (answer) {
            answer.offsetHeight; // force reflow : fermeture instantanee
            answer.style.transition = '';
          }
        });

        // Ouvrir la cible
        item.classList.add('open');
        targetBtn.setAttribute('aria-expanded', 'true');

        // Scroller vers la question (scroll-margin-top: 90px sur .faq-item)
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // ---- Active nav link on scroll ----
    (function() {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.nav-links a');

      window.addEventListener('scroll', function() {
        var scrollY = window.pageYOffset;
        sections.forEach(function(section) {
          var top = section.offsetTop - 100;
          var height = section.offsetHeight;
          var id = section.getAttribute('id');
          if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(function(link) {
              link.style.color = '';
              if (link.getAttribute('href') === '#' + id) {
                link.style.color = '#1B7E94';
              }
            });
          }
        });
      }, { passive: true });
    })();

    // ---- Pipeline toggle (Critères & indicateurs RNQ) ----
    (function() {
      var pipelineBlock = document.getElementById('pipelineBlock');
      var toggleSwitch = document.getElementById('pipelineToggleSwitch');
      var labelOff = document.getElementById('pipelineToggleOff');
      var labelOn = document.getElementById('pipelineToggleOn');
      if (!pipelineBlock || !toggleSwitch) return;

      toggleSwitch.addEventListener('click', function() {
        var isOn = toggleSwitch.classList.toggle('on');
        toggleSwitch.setAttribute('aria-checked', isOn ? 'true' : 'false');
        pipelineBlock.classList.toggle('show-indicators', isOn);
        if (labelOff) labelOff.classList.toggle('active', !isOn);
        if (labelOn) labelOn.classList.toggle('active', isOn);
      });

      // Keyboard support for pipeline toggle
      toggleSwitch.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.click();
        }
      });

      // Animation fade-in progressive des étapes du pipeline
      var steps = pipelineBlock.querySelectorAll('.pipeline-step');
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(steps, entry.target);
            setTimeout(function() { entry.target.classList.add('visible'); }, idx * 120);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      steps.forEach(function(step) { observer.observe(step); });
    })();

    // ---- Pricing toggle (Mensuel / Annuel) ----
    (function() {
      var toggleSwitch = document.getElementById('toggleSwitch');
      var pricingToggle = document.getElementById('pricingToggle');
      var pricingSection = document.querySelector('.pricing');
      var pricingCta = document.getElementById('pricingCta');
      var pricingDirectLink = document.getElementById('pricingDirectLink');
      if (!toggleSwitch || !pricingToggle || !pricingSection) return;

      var labelMonthly = pricingToggle.querySelector('.toggle-label-monthly');
      var labelAnnual = pricingToggle.querySelector('.toggle-label-annual');

      var urlMensuel = 'https://paiement.qalia.ai/b/9B6dR9eDybJVgYd0G2fIs0g';
      var urlAnnuel = 'https://paiement.qalia.ai/b/7sYfZh3YU01d5fv60mfIs0e';

      var pricingTotalCard = document.getElementById('pricingTotalCard');
      var pricingTotalFooter = document.getElementById('pricingTotalFooter');
      // Mensuel : 297 + 23 = 320 €/mois
      // Annuel : 2970/12 + 23 = 247,50 + 23 = 270,50 €/mois (2 mois Qalia offerts, ChatGPT reste mensuel)
      var totalMensuel = '320&nbsp;<span class="u" style="vertical-align:super;">&euro;</span><span class="u">/mois</span>';
      var totalAnnuel = '~271&nbsp;<span class="u" style="vertical-align:super;">&euro;</span><span class="u">/mois</span>';

      // Fonction réutilisable : appliquer l'état annuel/mensuel sur la section pricing
      function applyPricingBilling(isAnnual) {
        // body.billing-annual pilote les spans .price-monthly-txt / .price-annual-txt partout dans la page
        document.body.classList.toggle('billing-annual', isAnnual);
        toggleSwitch.classList.toggle('annual', isAnnual);
        toggleSwitch.setAttribute('aria-checked', isAnnual ? 'true' : 'false');
        pricingSection.classList.toggle('annual', isAnnual);
        pricingToggle.classList.toggle('annual', isAnnual);

        if (labelMonthly) labelMonthly.classList.toggle('active', !isAnnual);
        if (labelAnnual) labelAnnual.classList.toggle('active', isAnnual);

        var targetUrl = isAnnual ? urlAnnuel : urlMensuel;
        if (pricingDirectLink) pricingDirectLink.href = targetUrl;

        // Mettre à jour le coût total affiché
        var total = isAnnual ? totalAnnuel : totalMensuel;
        if (pricingTotalCard) pricingTotalCard.innerHTML = total;
        if (pricingTotalFooter) pricingTotalFooter.innerHTML = total;

        // Propager .annual sur value-stack et sticky CTA (hors scope .pricing)
        var valueStack = document.querySelector('.value-stack');
        if (valueStack) valueStack.classList.toggle('annual', isAnnual);
        var stickyCta = document.getElementById('stickyCta');
        if (stickyCta) stickyCta.classList.toggle('annual', isAnnual);
      }

      toggleSwitch.addEventListener('click', function() {
        var isAnnual = toggleSwitch.classList.contains('annual');
        isAnnual = !isAnnual;
        applyPricingBilling(isAnnual);

        // Notifier le simulateur du changement de facturation
        document.dispatchEvent(new CustomEvent('pricingBillingChanged', { detail: { annual: isAnnual } }));
      });

      // Écouter les changements de facturation depuis le simulateur
      document.addEventListener('simBillingChanged', function(e) {
        applyPricingBilling(e.detail.annual);
      });

      // Keyboard support for pricing toggle
      toggleSwitch.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.click();
        }
      });
    })();

    // ---- Simulateur socratique (Dashboard v2) ----
    (function() {
      var state = {
        step: 1,
        programs: 3,               // derived from taskVolumes (max per_program volume)
        cible: '',
        cibles: [],                // multi-selection of roles
        pourQui: 'self',           // 'self' | 'equipe' | 'tiers'
        tailleEquipe: 1,
        teamBreakdown: {},         // {role: count} per-role headcounts
        qualiopi: '',              // 'aspirant' | 'initial' | 'surveillance' | 'stable' | 'renouvellement'
        echeanceMois: 12,
        totalHoursPerProgram: 28,
        tasks: [],                 // active task keys from TASK_CONFIG
        taskVolumes: {},           // {taskKey: volume} per-task volume overrides
        taskMarketHours: {},       // {taskKey: hours} per-task market hours overrides
        tjm: 70,
        tjmByRole: {},             // {role: rate} per-role hourly rates (optional)
        tjmByRoleActive: false,    // toggle for per-role pricing
        pains: [],
        billingAnnual: false,
        chatgptPlan: 'plus'            // 'plus' (23€/mois) | 'business' (21€/mois)
      };

      var MONTHLY_COST = 297;
      var ANNUAL_COST_MONTHLY = 3564;    // 297 x 12
      var ANNUAL_COST_ANNUAL = 2970;     // 297 x 10 (2 mois offerts)

      // Paliers tarifaires (source : Offres-validées-V8.md)
      // V8 : même tarif par licence quel que soit le palier, seuls les services inclus évoluent
      var PRICING_TIERS = [
        { min: 1, max: 1, name: 'Solo', monthly: 297, annual: 2970, surDevis: false },
        { min: 2, max: 4, name: 'Standardisation', monthly: 297, annual: 2970, surDevis: false },
        { min: 5, max: 10, name: 'Gouvernance', monthly: 297, annual: 2970, surDevis: false },
        { min: 11, max: 999, name: 'Pilotage', monthly: 297, annual: 2970, surDevis: false }
      ];
      function getPricingTier(size) {
        for (var i = 0; i < PRICING_TIERS.length; i++) {
          if (size >= PRICING_TIERS[i].min && size <= PRICING_TIERS[i].max) return PRICING_TIERS[i];
        }
        return PRICING_TIERS[PRICING_TIERS.length - 1];
      }
      // ChatGPT Plus : 23 €/mois, mensuel uniquement (pas de plan annuel chez OpenAI)
      // ChatGPT Business : 21 €/mois (mensuel) ou 17 €/mois (annuel), 5 postes min., exonéré TVA avec n° valide
      // On utilise le tarif mensuel × 12 (conservateur, on ne demande pas le billing ChatGPT)
      // Source : https://chatgpt.com/fr-FR/pricing/ (vérifié avril 2026, screenshots)
      // Plus : 23 €/mois, mensuel uniquement (pas de plan annuel)
      // Business : 21 €/mois (mensuel) ou 17 €/mois (annuel = 204 €/an)
      // On utilise le tarif mensuel × 12 (conservateur, on ne demande pas le billing ChatGPT)
      var CHATGPT_PLANS = {
        already: { label: 'ChatGPT (d\u00e9j\u00e0 abonn\u00e9)', monthly: 0, annual: 0 },
        plus: { label: 'ChatGPT Plus', monthly: 23, annual: 276 },
        business: { label: 'ChatGPT Business', monthly: 21, annual: 252, minSeats: 5 }
      };

      // === BUSINESS PLAN : visibilité conditionnelle (5 postes min.) ===
      // Le plan Business n'a pas de sens en solo (facturé par poste, 5 min.)
      // On le masque quand pourQui === 'self' et on fallback sur Plus si sélectionné
      function updateBusinessVisibility() {
        var bizBtn = document.querySelector('.sim-chatgpt-btn[data-plan="business"]');
        if (!bizBtn) return;
        // Business = 5 postes minimum (source : openai.com/pricing)
        var hideBusinesss = state.pourQui !== 'equipe' || state.tailleEquipe < 5;
        bizBtn.classList.toggle('hidden-solo', hideBusinesss);
        // Si Business \u00e9tait s\u00e9lectionn\u00e9 et ne remplit plus la condition \u2192 fallback Plus
        if (hideBusinesss && state.chatgptPlan === 'business') {
          state.chatgptPlan = 'plus';
          var planBtns = document.querySelectorAll('.sim-chatgpt-btn');
          planBtns.forEach(function(b) {
            b.classList.toggle('selected', b.getAttribute('data-plan') === 'plus');
          });
          if (state.results) computeResults();
        }
      }

      // === GARDE-FOUS EFFECTIFS (source : Panorama branche 2024, AKTO/DARES) ===
      // 76% des OF < 10 salari\u00e9s, m\u00e9diane 1-2 formateurs, max AFPA ~7000
      var MAX_ETP_PER_ROLE = {
        formateur: 50, coach: 20, directeurOF: 5, qualite: 5,
        ingenieurPeda: 10, enseignant: 50,
        consultantBilan: 20, accompagnateurVAE: 20, directeurCFA: 5,
        maitreApprentissage: 30
      };
      var MAX_ETP_TOTAL = 100;  // couvre 97%+ des OF Qualiopi
      var MAX_ROI_DISPLAY = 15; // au-del\u00e0, alerte "v\u00e9rifiez vos param\u00e8tres"
      var SECTOR_AVG_ETP = {
        formateur: 3, coach: 2, directeurOF: 1, qualite: 1,
        ingenieurPeda: 1, enseignant: 4
      };
      var QALIA_CREATION_TIME = 9.5;     // heures Qalia pour une creation (dialogue + relecture + adaptation) - V2.2
      var QALIA_ADAPT_TIME = 2;          // heures Qalia pour une adaptation (dialogue + relecture)

      // === TASK_CONFIG : 17 tâches, médianes V2.2 (12 personas Qalia, 4 personas sans IA et ChatGPT) ===
      // marketHours : temps sans assistance IA (médiane 4 évaluations V1.1)
      // chatgptHours : temps avec IA généraliste (médiane 4 évaluations V1.1, 0% conformité RNQ V9)
      // qaliaHours : temps avec Qalia (médiane 12 évaluations V2.2, conformité native RNQ V9)
      var TASK_CONFIG = {
        /* Cat. 1 : Formation */
        ingenierie:  { label: 'Ingénierie complète du programme', marketHours: 27.5, chatgptHours: 12, qaliaHours: 9.5, level: 'core', frequency: 'per_program', defaultVolume: 3, tooltip: 'Analyse du besoin, cartographie des compétences, plan de formation, scénario. Hors déroulé détaillé et évaluations (tâches séparées ci-dessous). Temps Qalia\u00a0: ~3\u00a0h de dialogue + 4\u00a0à\u00a06\u00a0h de relecture et adaptation. Médiane validée par 12 évaluateurs.' },
        adaptation:  { label: 'Adaptation programme existant',       marketHours: 5.5,  chatgptHours: 2.75, qaliaHours: 2,    level: 'core', frequency: 'per_program', defaultVolume: 3 },
        supports:    { label: 'Supports de cours / contenus',        marketHours: 5,    chatgptHours: 2.25, qaliaHours: 1.75, level: 'frequent', frequency: 'per_program', defaultVolume: 3 },
        slides:      { label: 'Structure de présentation',           marketHours: 4,    chatgptHours: 1.5,  qaliaHours: 1.5,  level: 'frequent', frequency: 'per_program', defaultVolume: 3, tooltip: 'Qalia génère la trame textuelle structurée. La mise en forme dans PowerPoint ou Canva reste à votre charge.' },
        exercices:   { label: 'Exercices / simulations / ateliers',  marketHours: 3.5,  chatgptHours: 2,    qaliaHours: 2,    level: 'frequent', frequency: 'per_program', defaultVolume: 3, tooltip: 'Qalia génère la structure et les consignes. Vous adaptez la difficulté, les erreurs types et les débriefs à votre public.' },
        evaluations: { label: 'Stratégies d\u2019évaluation',        marketHours: 2.75, chatgptHours: 1.5,  qaliaHours: 1.5,  level: 'frequent', frequency: 'per_program', defaultVolume: 3, tooltip: 'Évaluations diagnostiques, formatives et sommatives. Qalia propose une stratégie alignée sur vos objectifs, vous l\u2019adaptez à votre public.' },
        deroule:     { label: 'Déroulé détaillé',                    marketHours: 4,    chatgptHours: 2,    qaliaHours: 2.5,  level: 'frequent', frequency: 'per_program', defaultVolume: 3, tooltip: 'Séquençage minute par minute de chaque session. Qalia produit un déroulé plus complet (conformité RNQ V9 incluse), d\u2019où un temps légèrement supérieur à ChatGPT.' },
        controle:    { label: 'Vérification couverture indicateurs RNQ', marketHours: 6, chatgptHours: 4, qaliaHours: 2.5, level: 'advanced', frequency: 'per_program', defaultVolume: 3, tooltip: 'Contrôle des indicateurs applicables du RNQ V9 sur votre documentation. Qalia structure le contrôle, vous validez chaque point. ChatGPT ne connaît pas le RNQ V9\u00a0: gain limité.' },
        audit:       { label: 'Préparation audit (dossier complet)', marketHours: 45,   chatgptHours: 27.5, qaliaHours: 11.5, level: 'advanced', frequency: 'per_audit', defaultVolume: 1, tooltip: 'Structuration documentaire\u00a0: rassemblement des preuves, mise à jour des indicateurs, contrôle de conformité global. Inclut relecture approfondie et validation terrain. Fréquence\u00a0: tous les 3\u00a0ans (cycle Qualiopi). Médiane validée par 12 évaluateurs.' },
        veille:      { label: 'Veille réglementaire',                marketHours: 30,   chatgptHours: 19,   qaliaHours: 14,   level: 'advanced', frequency: 'annual', defaultVolume: 1, tooltip: 'Qalia intègre nativement le RNQ V9 et ses mises à jour. Il reste ~14\u00a0h/an de veille manuelle\u00a0: circulaires DGEFP, évolutions du Guide de lecture, exigences spécifiques des certificateurs.' },
        corrections: { label: 'Corrections / feedback apprenants',   marketHours: 2.5,  chatgptHours: 1,    qaliaHours: 1,    level: 'advanced', frequency: 'per_program', defaultVolume: 3 },
        /* Cat. 2 : Bilan de compétences */
        bilanPhases: { label: 'Structuration 3 phases bilan (préliminaire, investigation, conclusion)', marketHours: 19, chatgptHours: 9, qaliaHours: 5, level: 'core', frequency: 'per_program', defaultVolume: 4, tooltip: 'Structuration complète du parcours bilan de compétences selon les 3 phases réglementaires\u00a0: convention tripartite (R6313-4), grilles d\u2019entretien, document de synthèse confidentiel (R6313-7), plan d\u2019action personnalisé et traçabilité horaire R6313-8. Médiane validée par 12 évaluateurs.' },
        bilanGrilles: { label: 'Grilles d\u2019entretien et synthèses bilan', marketHours: 5.75, chatgptHours: 2.75, qaliaHours: 2, level: 'frequent', frequency: 'per_program', defaultVolume: 4 },
        /* Cat. 3 : VAE */
        vaeParcours: { label: 'Parcours VAE (livret 1, livret 2, accompagnement)', marketHours: 23.75, chatgptHours: 13.5, qaliaHours: 6.75, level: 'core', frequency: 'per_program', defaultVolume: 2, tooltip: 'Structuration du parcours VAE complet\u00a0: livret 1 (recevabilité), livret 2 (structure documentaire), préparation jury (simulations orales, argumentaire bloc par bloc). Si écarts identifiés\u00a0: plan de formation complémentaire (loi du 21\u00a0décembre 2022). Croisement natif avec le référentiel RNCP/RS. Le livret 2 implique un travail réflexif personnel du candidat que Qalia structure mais ne rédige pas. Médiane validée par 12 évaluateurs.' },
        vaeRNCP: { label: 'Vérification RNCP/RS blocs de compétences', marketHours: 4.5, chatgptHours: 2.5, qaliaHours: 1.5, level: 'frequent', frequency: 'per_program', defaultVolume: 2, tooltip: 'ChatGPT ne dispose pas des référentiels RNCP/RS à jour\u00a0: gain marginal. Qalia intègre nativement le croisement référentiel.' },
        /* Cat. 4 : Apprentissage / CFA */
        cfaProgramme: { label: 'Programme apprentissage (alternance + CFA)', marketHours: 37.5, chatgptHours: 19, qaliaHours: 9, level: 'core', frequency: 'per_program', defaultVolume: 3, tooltip: 'Conception du programme d\u2019apprentissage\u00a0: articulation centre/entreprise, plan d\u2019alternance, livret d\u2019apprentissage, CCF par bloc RNCP et évaluations spécifiques Cat.\u00a04. Complexité Cat.\u00a04 (convention tripartite, alternance, tuteurs). Médiane validée par 12 évaluateurs.' },
        cfaSuivi: { label: 'Livret de suivi et évaluations CFA', marketHours: 7.5, chatgptHours: 3.75, qaliaHours: 2.5, level: 'frequent', frequency: 'per_program', defaultVolume: 3 }
      };

      // === TASK_TO_CAT : mapping tache vers categories L6313 (source : TASK_CONFIG comments) ===
      // Taches transversales (controle, audit, veille, evaluations) applicables a toutes les categories
      var TASK_TO_CAT = {
        ingenierie: [1], adaptation: [1], supports: [1], slides: [1],
        exercices: [1], deroule: [1], corrections: [1],
        evaluations: [1,2,3,4], controle: [1,2,3,4], audit: [1,2,3,4], veille: [1,2,3,4],
        bilanPhases: [2], bilanGrilles: [2],
        vaeParcours: [3], vaeRNCP: [3],
        cfaProgramme: [4], cfaSuivi: [4]
      };

      // === PARENT_MAP : hiérarchie tâche CORE → tâche FREQUENT (anti-double-comptage) ===
      // Chaque tâche FREQUENT liste ses parents CORE. getResidualVolume() déduit le volume déjà couvert.
      var PARENT_MAP = {
        supports: ['ingenierie', 'adaptation', 'bilanPhases', 'vaeParcours'],
        slides: ['ingenierie'],
        exercices: ['ingenierie'],
        evaluations: ['ingenierie', 'bilanPhases', 'vaeParcours', 'cfaProgramme'],
        deroule: ['ingenierie'],
        bilanGrilles: ['bilanPhases'],
        vaeRNCP: ['vaeParcours'],
        cfaSuivi: ['cfaProgramme']
      };

      // === FREQUENT_TOTAL_ESTIMATES : volume total annuel estimé par profil × tâche ===
      // Validé par 16 agents persona (22 runs), 2 perspectives minimum par profil.
      // Utilisé par getResidualVolume() : résiduel = MAX(0, total - parentsCORE).
      // Estimations IA à valider par 5 à 10 utilisateurs réels sur 3 mois.
      var FREQUENT_TOTAL_ESTIMATES = {
        formateur:           { supports: 8, slides: 6, exercices: 5, evaluations: 5, deroule: 5, corrections: 6, controle: 2 },
        coach:               { exercices: 4, evaluations: 4, supports: 5, bilanPhases: 4, bilanGrilles: 4 },
        enseignant:          { slides: 5, exercices: 4, evaluations: 4, supports: 4 },
        ingenieurPeda:       { deroule: 8, evaluations: 8, supports: 12, exercices: 8, controle: 3 },
        consultantBilan:     { evaluations: 7, supports: 5, controle: 2 },
        accompagnateurVAE:   { evaluations: 4, supports: 4, controle: 2 },
        directeurCFA:        { controle: 4, evaluations: 8 },
        maitreApprentissage: { cfaProgramme: 2, evaluations: 3, supports: 3 },
        directeurOF:         { corrections: 8, ingenierie: 3, adaptation: 4, evaluations: 5 },
        qualite:             { evaluations: 8, corrections: 10 }
      };

      // === PROFILE_DEFAULTS : 10 profils sélectionnables ===
      // Corrigé 2026-04-02 : 5 fantômes supprimés, qualité/ingénieurPéda/directeurOF enrichis
      var PROFILE_DEFAULTS = {
        /* Cat. 1 : Formation */
        formateur:          { core: ['ingenierie','adaptation'], frequent: ['supports','slides','exercices','evaluations','deroule','corrections','controle'], defaultHours: 28, showPourQui: false },
        coach:              { core: ['ingenierie','adaptation'], frequent: ['exercices','evaluations','supports','bilanPhases','bilanGrilles'], defaultHours: 28, showPourQui: false },
        directeurOF:        { core: ['controle','audit'], frequent: ['veille','ingenierie','adaptation','corrections','evaluations'], defaultHours: 8, showPourQui: true },
        qualite:            { core: ['controle','audit'], frequent: ['veille','evaluations','corrections'], defaultHours: 8, showPourQui: true },
        ingenieurPeda:      { core: ['ingenierie','adaptation'], frequent: ['deroule','evaluations','supports','exercices','controle'], defaultHours: 28, showPourQui: true },
        enseignant:         { core: ['adaptation'], frequent: ['slides','exercices','evaluations','supports'], defaultHours: 20, showPourQui: false },
        /* Cat. 2 : Bilan de compétences */
        consultantBilan:    { core: ['bilanPhases','bilanGrilles'], frequent: ['evaluations','supports','controle'], defaultHours: 25, showPourQui: false },
        /* Cat. 3 : VAE */
        accompagnateurVAE:  { core: ['vaeParcours','vaeRNCP'], frequent: ['evaluations','supports','controle'], defaultHours: 30, showPourQui: false },
        /* Cat. 4 : Apprentissage */
        directeurCFA:       { core: ['cfaProgramme','cfaSuivi'], frequent: ['controle','audit','veille','evaluations'], defaultHours: 50, showPourQui: true },
        maitreApprentissage:{ core: ['cfaSuivi'], frequent: ['cfaProgramme','evaluations','supports'], defaultHours: 35, showPourQui: false }
      };

      // === VOLUMES PAR DEFAUT PAR PROFIL (programmes/an, tendances marché) ===
      var PROFILE_VOLUMES = {
        formateur: 4,
        coach: 3,
        directeurOF: 8,
        qualite: 8,
        ingenieurPeda: 6,
        enseignant: 3,
        consultantBilan: 6,
        accompagnateurVAE: 4,
        directeurCFA: 5,
        maitreApprentissage: 3
      };

      // === ROLES DE CONTROLE : filtrage pain points, taches avancees, skip Qualiopi ===
      // 5 profils fantômes supprimés (2026-04-02) : auditeur, certificateur, academicien plus sélectionnables
      var CONTROL_ONLY_ROLES = [];
      var CONTROL_ALLOWED_TASKS = ['controle', 'audit', 'veille', 'evaluations'];
      // Profils pour lesquels l'étape Qualiopi est non pertinente (hors certification ou rôle de contrôle)
      var QUALIOPI_SKIP_ROLES = [];

      // === PROFILE_CATS : mapping profil → catégories L6313 (source : N0-Profils-cibles-missions.md) ===
      var PROFILE_CATS = {
        formateur: [1], coach: [1, 2], directeurOF: [1, 2, 3, 4], qualite: [1, 2, 3, 4],
        ingenieurPeda: [1], enseignant: [1],
        consultantBilan: [2], accompagnateurVAE: [3],
        directeurCFA: [4], maitreApprentissage: [4]
      };

      // Déduire les Cat. actives depuis les profils sélectionnés (D42 : PROFILE_CATS = source unique)
      function getActiveCats(cibles) {
        var cats = {};
        (cibles || []).forEach(function(c) {
          (PROFILE_CATS[c] || [1]).forEach(function(cat) { cats[cat] = true; });
        });
        return Object.keys(cats).map(Number).sort();
      }

      // === getResidualVolume : calcul du volume résiduel FREQUENT (anti-double-comptage) ===
      // résiduel = MAX(0, FREQUENT_TOTAL_ESTIMATES[profil][tâche] - somme volumes parents CORE)
      // En multi-profil, un même parent CORE n'est compté qu'une fois (dédupliqué via countedParents).
      function getResidualVolume(taskKey, profileKeys) {
        var parents = PARENT_MAP[taskKey];
        if (!parents || parents.length === 0) {
          // Pas de parent : prendre l'estimation totale du premier profil qui a cette tâche
          for (var i = 0; i < profileKeys.length; i++) {
            var est = FREQUENT_TOTAL_ESTIMATES[profileKeys[i]];
            if (est && est[taskKey]) return est[taskKey];
          }
          return TASK_CONFIG[taskKey] ? TASK_CONFIG[taskKey].defaultVolume || 1 : 1;
        }
        // Trouver l'estimation totale (premier profil qui a cette tâche en FREQUENT)
        var totalEstimate = 0;
        for (var j = 0; j < profileKeys.length; j++) {
          var est2 = FREQUENT_TOTAL_ESTIMATES[profileKeys[j]];
          if (est2 && est2[taskKey]) { totalEstimate = est2[taskKey]; break; }
        }
        if (totalEstimate === 0) return TASK_CONFIG[taskKey] ? TASK_CONFIG[taskKey].defaultVolume || 1 : 1;
        // Calculer le volume couvert par les parents CORE (dédupliqué en multi-profil)
        var parentCOREVol = 0;
        var countedParents = [];
        profileKeys.forEach(function(pk) {
          var profile = PROFILE_DEFAULTS[pk];
          if (!profile) return;
          parents.forEach(function(parentKey) {
            if (profile.core.indexOf(parentKey) > -1 && countedParents.indexOf(parentKey) === -1) {
              countedParents.push(parentKey);
              parentCOREVol += (state.taskVolumes[parentKey] || TASK_CONFIG[parentKey].defaultVolume || 1);
            }
          });
        });
        return Math.max(0, totalEstimate - parentCOREVol);
      }

      var PROFILE_LABELS = {
        formateur: 'Formateurs',
        coach: 'Coachs',
        directeurOF: 'Directeurs OF',
        qualite: 'Resp. qualit\u00e9',
        ingenieurPeda: 'Ing. p\u00e9dagogiques',
        enseignant: 'Enseignants',
        consultantBilan: 'Consultants bilan',
        accompagnateurVAE: 'Accompagnateurs VAE',
        directeurCFA: 'Directeurs CFA',
        maitreApprentissage: 'Ma\u00eetres d\u2019apprentissage'
      };

      // === PAIN_CONFIG : douleurs dynamiques par Cat. L6313 (validé personas 2026-03-27) ===
      // Bloc A = universel, Bloc B-E = Cat-spécifique (source : N0-Matrice-douleur-valeur-écosystème.md)
      var PAIN_CONFIG = {
        // --- BLOC A : Universelles (4 items, affichées pour tous) ---
        tempsVole:    { label: 'Le temps vol\u00e9', desc: 'Trois semaines par ing\u00e9nierie. Des soir\u00e9es sur la doc. Pendant ce temps, vous ne facturez rien.', bloc: 'A', icon: 'clock', cats: [1,2,3,4] },
        echeance:     { label: 'L\u2019\u00e9ch\u00e9ance', desc: 'Audit, contr\u00f4le, renouvellement. Vous relisez vos documents et vous savez qu\u2019il manque quelque chose.', bloc: 'A', icon: 'alert', cats: [1,2,3,4] },
        brouillard:   { label: 'Le brouillard', desc: 'R\u00e9f\u00e9rentiels, indicateurs, cadres l\u00e9gaux. Vous savez former. Mais par o\u00f9 commencer\u00a0?', bloc: 'A', icon: 'maze', cats: [1,2,3,4] },
        isolement:    { label: 'L\u2019isolement', desc: 'Pas de pair, pas de r\u00e9f\u00e9rent qualit\u00e9. Seul face aux 32\u00a0indicateurs.', bloc: 'A', icon: 'person', cats: [1,2,3,4] },
        // --- BLOC B : Cat. 1 Formation ---
        guideQualiopi:{ label: 'Le Guide Qualiopi', desc: '41\u00a0\u00e0\u00a080\u00a0pages de jargon. Vous relisez, relisez encore. Vous ne trouvez pas la r\u00e9ponse.', bloc: 'B', icon: 'book', cats: [1] },
        incoherence:  { label: 'L\u2019incoh\u00e9rence documentaire', desc: '15\u00a0minutes et tout s\u2019\u00e9croule. Un document modifi\u00e9, trois autres obsol\u00e8tes.', bloc: 'B', icon: 'docs', cats: [1] },
        // --- BLOC C : Cat. 2 Bilan ---
        bilanPhases:  { label: 'Les 3\u00a0phases obligatoires', desc: 'Pr\u00e9liminaire, investigation, conclusion. Chaque phase a ses r\u00e8gles propres, ses documents, ses pi\u00e8ges.', bloc: 'C', icon: 'phases', cats: [2] },
        bilanConfusion:{ label: 'Bilan ou coaching\u00a0?', desc: 'La fronti\u00e8re est floue. Votre accompagnement rel\u00e8ve-t-il du bilan (Cat.\u00a02) ou de la formation (Cat.\u00a01)\u00a0?', bloc: 'C', icon: 'question', cats: [2] },
        // --- BLOC D : Cat. 3 VAE ---
        vaeTransposition:{ label: 'Transposer les acquis', desc: 'Votre candidat a l\u2019exp\u00e9rience. Mais formaliser 10\u00a0ans de pratique en blocs RNCP, c\u2019est autre chose.', bloc: 'D', icon: 'transfer', cats: [3] },
        vaeJury:      { label: 'Le jury improvis\u00e9', desc: 'Pr\u00e9parer le candidat au jury sans r\u00e9p\u00e9tition structur\u00e9e. Le trac\u00a0+ l\u2019enjeu\u00a0= \u00e9chec fr\u00e9quent.', bloc: 'D', icon: 'jury', cats: [3] },
        // --- BLOC E : Cat. 4 CFA ---
        cfaCoordination:{ label: 'Centre vs entreprise', desc: 'Coordonner les s\u00e9quences alternance quand le calendrier change chaque trimestre.', bloc: 'E', icon: 'sync', cats: [4] },
        cfaCalendrier:{ label: 'Le calendrier mouvant', desc: 'Chaque semestre, tout bouge. Cong\u00e9s, examens, disponibilit\u00e9 tuteurs. Votre planning est p\u00e9rim\u00e9 avant d\u2019\u00eatre appliqu\u00e9.', bloc: 'E', icon: 'calendar', cats: [4] }
      };

      // SVG icons pour les pain cards (minimalistes)
      var PAIN_ICONS = {
        clock: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        alert: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        maze: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.5" fill="var(--bordeaux)"/></svg>',
        person: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        book: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        docs: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        phases: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><line x1="9" y1="12" x2="15" y2="12"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="10"/></svg>',
        question: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        transfer: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/><polyline points="9 21 3 21 3 15"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
        jury: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><rect x="15" y="11" width="8" height="6" rx="1"/></svg>',
        sync: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        calendar: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
      };

      // Mapping ancien pain ID → nouveau (rétrocompatibilité bilan)
      var PAIN_LEGACY_MAP = {
        admin: 'tempsVole', temps: 'tempsVole', conformite: 'echeance', certification: 'echeance',
        pageblanche: 'brouillard', guide: 'guideQualiopi', revenu: 'tempsVole', isolement: 'isolement'
      };

      // Construire les douleurs visibles selon profil + Cat.
      function getVisiblePainsDynamic(cibles) {
        var cats = getActiveCats(cibles);
        var visible = [];
        var keys = Object.keys(PAIN_CONFIG);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var p = PAIN_CONFIG[k];
          if (p.bloc === 'A') { visible.push(k); continue; }
          // Bloc B-E : afficher si au moins une Cat. du profil correspond
          for (var j = 0; j < p.cats.length; j++) {
            if (cats.indexOf(p.cats[j]) > -1) { visible.push(k); break; }
          }
        }
        return visible;
      }

      // Badges "fréquent" par profil (verdict personas : indices visuels sans pré-cochage)
      var PAIN_FREQUENT = {
        formateur: ['tempsVole','echeance','brouillard','guideQualiopi','incoherence'],
        coach: ['tempsVole','echeance','brouillard','bilanPhases','bilanConfusion'],
        directeurOF: ['echeance','incoherence','tempsVole','brouillard'],
        qualite: ['echeance','incoherence','guideQualiopi'],
        ingenieurPeda: ['tempsVole','brouillard','incoherence'],
        enseignant: ['brouillard','tempsVole','isolement'],
        consultantBilan: ['bilanPhases','bilanConfusion','tempsVole','echeance'],
        accompagnateurVAE: ['vaeTransposition','vaeJury','tempsVole','echeance'],
        directeurCFA: ['cfaCoordination','cfaCalendrier','echeance','tempsVole'],
        maitreApprentissage: ['cfaCoordination','cfaCalendrier','tempsVole']
      };

      // === buildPainStep : génération dynamique des boutons douleurs ===
      function buildPainStep() {
        var grid = document.getElementById('simPainGrid');
        if (!grid) return;
        var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        var visible = getVisiblePainsDynamic(cibles);
        // Exclure "Le Guide Qualiopi" si non concerné par Qualiopi
        if (state.qualiopi === 'non_concerne') {
          visible = visible.filter(function(k) { return k !== 'guideQualiopi'; });
        }
        // Badges "fréquent" : union des fréquents de tous les profils actifs
        var freqSet = {};
        cibles.forEach(function(c) {
          (PAIN_FREQUENT[c] || []).forEach(function(k) { freqSet[k] = true; });
        });
        // Nettoyer state.pains si un pain masqué était sélectionné
        state.pains = state.pains.filter(function(p) { return visible.indexOf(p) > -1; });
        // Construire le HTML
        var html = '';
        for (var i = 0; i < visible.length; i++) {
          var key = visible[i];
          var p = PAIN_CONFIG[key];
          if (!p) continue;
          var isSelected = state.pains.indexOf(key) > -1;
          var isBadge = freqSet[key];
          // Centrer le dernier item s'il est seul sur sa ligne (grille 2 colonnes)
          var isLastAlone = (i === visible.length - 1) && (visible.length % 2 === 1);
          html += '<button class="sim-pain-btn p' + (i + 1) + (isSelected ? ' selected' : '') + '"' + (isLastAlone ? ' style="grid-column:1/-1;max-width:50%;justify-self:center;"' : '') + ' data-pain="' + key + '">';
          html += '<span class="sim-pain-check">&check;</span>';
          html += '<div class="sim-pain-icon" aria-hidden="true">' + (PAIN_ICONS[p.icon] || '') + '</div>';
          html += '<div class="sim-pain-label">' + p.label + '</div>';
          if (isBadge) {
            html += '<span class="sim-pain-badge" style="position:absolute; top:6px; left:6px; font-size:10px; background:var(--bleu-canard); color:#fff; padding:1px 6px; border-radius:8px; opacity:0.85; pointer-events:none;">Fr\u00e9quent</span>';
          }
          html += '</button>';
        }
        grid.innerHTML = html;
        // Delegation événementielle sur le conteneur
        grid.onclick = function(e) {
          var btn = e.target.closest('.sim-pain-btn');
          if (!btn) return;
          btn.classList.toggle('selected');
          var pain = btn.getAttribute('data-pain');
          var idx = state.pains.indexOf(pain);
          if (idx > -1) {
            state.pains.splice(idx, 1);
          } else {
            state.pains.push(pain);
          }
          var next8 = document.getElementById('simNext8');
          if (next8) next8.disabled = state.pains.length === 0;
        };
        // Mettre à jour le bouton suivant
        var next8 = document.getElementById('simNext8');
        if (next8) next8.disabled = state.pains.length === 0;
      }

      // Helper rétrocompatibilité : vérifie si un pain legacy est actif via le nouveau système
      function hasPainLegacy(legacyId) {
        var newId = PAIN_LEGACY_MAP[legacyId];
        if (!newId) return false;
        return state.pains.indexOf(newId) > -1;
      }

      // === ACTIVATION_OUTPUTS : livrables par Cat. L6313 pour le bilan simulateur ===
      var ACTIVATION_OUTPUTS = {
        1: {
          titre: 'Formation (Cat.\u00a01)',
          items: ['Programme de formation', 'Sc\u00e9nario p\u00e9dagogique', 'D\u00e9roul\u00e9 d\u00e9taill\u00e9', 'Grilles d\u2019\u00e9valuation', 'Matrice RNQ V9 (indicateurs applicables)', 'Exercices et ateliers', 'Supports de cours', 'Dossier de pr\u00e9paration audit']
        },
        2: {
          titre: 'Bilan de comp\u00e9tences (Cat.\u00a02)',
          items: ['Convention tripartite (R6313-4)', 'Structuration 3\u00a0phases l\u00e9gales', 'Document de synth\u00e8se', 'Grilles d\u2019investigation', 'Plan d\u2019action personnalis\u00e9', 'Tra\u00e7abilit\u00e9 24\u00a0h max', 'Dossier de pr\u00e9paration audit']
        },
        3: {
          titre: 'VAE (Cat.\u00a03)',
          items: ['Livret\u00a01 (recevabilit\u00e9)', 'Livret\u00a02 par bloc RNCP', 'Simulations orales', 'Plan formation compl\u00e9mentaire', 'Dossier de pr\u00e9paration audit']
        },
        4: {
          titre: 'Apprentissage (Cat.\u00a04)',
          items: ['Calendrier d\u2019alternance', 'Fiches MEST', 'CCF par bloc RNCP', 'Supports tuteur/formateur', 'Dossier de pr\u00e9paration audit']
        }
      };

      // === TASK_TO_OUTPUTS : mapping tâche → livrables ACTIVATION_OUTPUTS (D42, 10 personas) ===
      // Utilisé par renderActivation() en mode gestionnaire (option C) pour différencier pills actives/disponibles.
      var TASK_TO_OUTPUTS = {
        // Cat. 1
        ingenierie:  ['Programme de formation', 'Sc\u00e9nario p\u00e9dagogique', 'Grilles d\u2019\u00e9valuation'],
        adaptation:  ['Programme de formation'],
        supports:    ['Supports de cours'],
        slides:      ['Supports de cours'],
        exercices:   ['Exercices et ateliers'],
        evaluations: ['Grilles d\u2019\u00e9valuation'],
        deroule:     ['D\u00e9roul\u00e9 d\u00e9taill\u00e9'],
        controle:    ['Matrice RNQ V9 (indicateurs applicables)'],
        audit:       ['Dossier de pr\u00e9paration audit'],
        veille:      [],
        corrections: [],
        // Cat. 2
        bilanPhases:    ['Convention tripartite (R6313-4)', 'Structuration 3\u00a0phases l\u00e9gales', 'Document de synth\u00e8se', 'Plan d\u2019action personnalis\u00e9', 'Tra\u00e7abilit\u00e9 24\u00a0h max'],
        bilanGrilles:   ['Grilles d\u2019investigation'],
        // Cat. 3
        vaeParcours:    ['Livret\u00a01 (recevabilit\u00e9)', 'Livret\u00a02 par bloc RNCP', 'Simulations orales', 'Plan formation compl\u00e9mentaire'],
        vaeRNCP:        ['Livret\u00a02 par bloc RNCP'],
        // Cat. 4
        cfaProgramme:   ['Calendrier d\u2019alternance', 'CCF par bloc RNCP'],
        cfaSuivi:       ['Fiches MEST', 'Supports tuteur/formateur']
      };

      // === COVERAGE_DATA : couverture RNQ V9 par Cat. L6313 (source : N1-02-Checklist-RNQ-V9.md L.177-183) ===
      var COVERAGE_DATA = {
        1: { label: 'Formation (Cat.\u00a01)', applicable: '23 \u00e0 26', covered: '21 \u00e0 24', doc: 7, org: '14 \u00e0 17', guided: 0, terrain: 2, terrainList: 'I-8, I-32', note: 'Les formations certifiantes ajoutent I-3, I-7, I-16.' },
        2: { label: 'Bilan (Cat.\u00a02)', applicable: '22', covered: '20', doc: 7, org: 13, guided: 0, terrain: 2, terrainList: 'I-8, I-32', note: 'R\u00e9gi par les articles R6313-4 \u00e0 R6313-8 du Code du travail.' },
        3: { label: 'VAE (Cat.\u00a03)', applicable: '24', covered: '22', doc: 7, org: 15, guided: 0, terrain: 2, terrainList: 'I-8, I-32', note: 'R\u00f4le cl\u00e9 de l\u2019AAP depuis la loi du 21\u00a0d\u00e9cembre 2022.' },
        4: { label: 'CFA (Cat.\u00a04)', applicable: '32', covered: '29', doc: 7, org: 18, guided: 4, terrain: 3, terrainList: 'I-8, I-15, I-32', note: '5 indicateurs exclusifs CFA\u00a0: I-13, I-14, I-15, I-20, I-29.' }
      };

      // === DASHBOARD_LAYOUT : visibilité et mode des sections par segment (D35, arbitrage 11 agents) ===
      // Réf. : N0-2026-04-02-Dashboard-dynamique-spécification.md + N0-2026-04-02-Arbitration-dashboard-11-agents.md
      var DASHBOARD_LAYOUT = {
        solo: {
          kpis:           { count: 3, show: ['hours', 'value', 'cost'] },
          roiChart:       { mode: 'details' },
          dur:            { visible: false },
          eisenhower:     { visible: true },
          consequences:   { mode: 'compact' },
          activation:     { visible: false },
          partage:        { buttons: ['whatsapp', 'email', 'pdf'] },
          tempsReinvesti: { visible: true },
          insight:        { visible: true }
        },
        gestionnaire: {
          kpis:           { count: 6, show: ['hours', 'value', 'cost', 'roi', 'payback', 'days'] },
          roiChart:       { mode: 'open' },
          dur:            { visible: false },
          eisenhower:     { visible: true },
          consequences:   { mode: 'full' },
          activation:     { visible: false },
          partage:        { buttons: ['whatsapp', 'linkedin', 'email', 'pdf'] },
          tempsReinvesti: { visible: true },
          insight:        { visible: true }
        }
      };

      // Mapping profil simulateur vers segment de layout
      var PROFILE_SEGMENT = {
        formateur:           'solo',
        coach:               'solo',
        enseignant:          'solo',
        ingenieurPeda:       'solo',
        consultantBilan:     'solo',
        accompagnateurVAE:   'solo',
        maitreApprentissage: 'solo',
        directeurOF:         'gestionnaire',
        directeurCFA:        'gestionnaire',
        qualite:             'gestionnaire'
      };

      // === Empreinte m\u00e9tier : contenu dynamique par cat\u00e9gorie L6313 + segment ===
      // P\u00e9lissier Le Compas : la preuve de personnalisation renforce la conviction
      // Brunson Epiphany Bridge : le prospect reconna\u00eet SON dossier, pas un gabarit
      // Routage : PROFILE_CATS[state.cible][0] \u2192 cat\u00e9gorie primaire \u2192 EMPREINTE_DATA[cat]
      var EMPREINTE_DATA = {
        1: {
          generic: '\u00ab\u00a0Objectif\u00a0: permettre aux apprenants d\u2019acqu\u00e9rir les comp\u00e9tences n\u00e9cessaires pour ma\u00eetriser les techniques de vente.\u00a0\u00bb',
          qaliaLabel: 'Sortie Qalia (empreinte m\u00e9tier) \u2013 exemple BTP',
          qaliaEx: '\u00ab\u00a0\u00c0 l\u2019issue du module 3, les commerciaux itin\u00e9rants du secteur mat\u00e9riel BTP sauront structurer un rendez-vous chantier en 20\u00a0min avec un chef d\u2019\u00e9quipe press\u00e9 (cas repr\u00e9sentatif bas\u00e9 sur une visite terrain type).\u00a0\u00bb',
          var1Label: 'Variante s\u00e9curit\u00e9 (habilitations)',
          var1Ex: '\u00ab\u00a0\u00c0 l\u2019issue du module habilitation \u00e9lectrique B1V, les \u00e9lectriciens d\u2019exploitation sauront consigner une armoire BT sous contrainte de temps (exemple\u2009: intervention d\u2019urgence sur site industriel, process 3x8).\u00a0\u00bb',
          var2Label: 'Variante soins \u00e0 la personne',
          var2Ex: '\u00ab\u00a0\u00c0 l\u2019issue du module 2, les aides-soignantes en EHPAD sauront g\u00e9rer un refus de soins chez un r\u00e9sident atteint de troubles cognitifs (situation r\u00e9currente\u2009: toilette matinale, r\u00e9sistance verbale).\u00a0\u00bb',
          marqueurs: 'public cible pr\u00e9cis, secteur m\u00e9tier, anecdotes que vous avez v\u00e9cues, retours stagiaires que vous avez collect\u00e9s, ancrages terrain de vos missions. Chaque livrable porte votre identit\u00e9 p\u00e9dagogique, pas un gabarit standardis\u00e9.',
          partSolo: 'Empreinte m\u00e9tier personnelle\u00a0: vos marqueurs restent les v\u00f4tres. Qalia ne publie, ne mutualise, ni ne r\u00e9utilise vos donn\u00e9es entre clients.',
          partGest: 'Empreinte m\u00e9tier partag\u00e9e entre formateurs d\u2019un m\u00eame organisme\u00a0: la charte m\u00e9tier + marqueurs saisis par le directeur sont mutualis\u00e9s sur tous les comptes formateurs de votre OF, garantissant l\u2019homog\u00e9n\u00e9it\u00e9 documentaire attendue par l\u2019auditeur lors du renouvellement.'
        },
        2: {
          generic: '\u00ab\u00a0Objectif\u00a0: accompagner le b\u00e9n\u00e9ficiaire dans l\u2019exploration de ses comp\u00e9tences pour d\u00e9finir un projet professionnel r\u00e9aliste.\u00a0\u00bb',
          qaliaLabel: 'Sortie Qalia (empreinte m\u00e9tier) \u2013 b\u00e9n\u00e9ficiaire en reconversion',
          qaliaEx: '\u00ab\u00a0Phase d\u2019investigation\u00a0: la b\u00e9n\u00e9ficiaire, comptable en cabinet depuis 12\u00a0ans, explore un projet de m\u00e9diation animale. Grille RIASEC crois\u00e9e avec ses savoir-faire transf\u00e9rables (gestion de dossiers complexes, rigueur normative) pour \u00e9valuer la faisabilit\u00e9 financi\u00e8re et les passerelles certification.\u00a0\u00bb',
          var1Label: 'Variante burn-out professionnel',
          var1Ex: '\u00ab\u00a0Phase pr\u00e9liminaire\u00a0: le b\u00e9n\u00e9ficiaire, cadre en arr\u00eat depuis 4\u00a0mois, d\u00e9crit une saturation d\u00e9cisionnelle. L\u2019entretien s\u2019appuie sur un questionnaire de valeurs personnalis\u00e9 (et non un test g\u00e9n\u00e9rique) pour r\u00e9ancrer l\u2019exploration dans ses motivations profondes.\u00a0\u00bb',
          var2Label: 'Variante \u00e9volution interne',
          var2Ex: '\u00ab\u00a0Phase de conclusion\u00a0: le b\u00e9n\u00e9ficiaire, technicien en industrie agroalimentaire, vise un poste de responsable qualit\u00e9 chez son employeur. Le plan d\u2019action identifie 2\u00a0blocs CQP compl\u00e9mentaires et un calendrier de formation compatible avec les cycles de production.\u00a0\u00bb',
          marqueurs: 'profil type de vos b\u00e9n\u00e9ficiaires, secteurs d\u2019origine fr\u00e9quents, outils d\u2019investigation que vous utilisez, approche sp\u00e9cifique de la phase de conclusion, cadre d\u00e9ontologique de votre cabinet. Chaque livrable porte votre identit\u00e9 de consultant, pas un gabarit standardis\u00e9.',
          partSolo: 'Empreinte m\u00e9tier personnelle\u00a0: vos marqueurs restent les v\u00f4tres. Qalia ne publie, ne mutualise, ni ne r\u00e9utilise vos donn\u00e9es entre clients.',
          partGest: 'Empreinte m\u00e9tier partag\u00e9e entre consultants d\u2019un m\u00eame cabinet\u00a0: la charte m\u00e9tier + marqueurs saisis par le responsable sont mutualis\u00e9s sur tous les comptes consultants de votre centre, garantissant l\u2019homog\u00e9n\u00e9it\u00e9 documentaire attendue par l\u2019auditeur.'
        },
        3: {
          generic: '\u00ab\u00a0Objectif\u00a0: accompagner le candidat dans la valorisation de son exp\u00e9rience professionnelle en vue de l\u2019obtention d\u2019une certification.\u00a0\u00bb',
          qaliaLabel: 'Sortie Qalia (empreinte m\u00e9tier) \u2013 candidat m\u00e9dico-social',
          qaliaEx: '\u00ab\u00a0Livret\u00a02, bloc 3 (RNCP aide-soignant)\u00a0: la candidate, auxiliaire de vie depuis 8\u00a0ans en SAD, d\u00e9crit sa gestion d\u2019une situation d\u2019urgence domicile (chute personne \u00e2g\u00e9e diab\u00e9tique, protocole d\u2019alerte, relev\u00e9 glyc\u00e9mique, transmission m\u00e9decin traitant). Structur\u00e9 selon le r\u00e9f\u00e9rentiel activit\u00e9s/comp\u00e9tences.\u00a0\u00bb',
          var1Label: 'Variante reconversion b\u00e2timent',
          var1Ex: '\u00ab\u00a0Livret\u00a02, bloc 1 (RNCP conducteur de travaux)\u00a0: le candidat, chef d\u2019\u00e9quipe ma\u00e7onnerie depuis 15\u00a0ans, d\u00e9crit le pilotage d\u2019un chantier de r\u00e9habilitation en site occup\u00e9 (coordination 4\u00a0corps de m\u00e9tier, planning sous contrainte r\u00e9sidents, gestion al\u00e9a approvisionnement).\u00a0\u00bb',
          var2Label: 'Variante tertiaire (validation partielle)',
          var2Ex: '\u00ab\u00a0Plan de formation compl\u00e9mentaire post-jury\u00a0: la candidate, assistante de direction depuis 6\u00a0ans, a valid\u00e9 3\u00a0blocs sur 5 du BTS. Le plan cible les 2\u00a0blocs restants (anglais professionnel + gestion de projet) avec un calendrier compatible avec son emploi du temps salari\u00e9.\u00a0\u00bb',
          marqueurs: 'certifications que vous accompagnez fr\u00e9quemment, profil type de vos candidats, secteurs d\u2019exp\u00e9rience dominants, votre m\u00e9thode d\u2019entretien explicitation, sp\u00e9cificit\u00e9s de votre r\u00e9gion (jury, certificateurs). Chaque livrable porte votre identit\u00e9 d\u2019accompagnateur, pas un gabarit standardis\u00e9.',
          partSolo: 'Empreinte m\u00e9tier personnelle\u00a0: vos marqueurs restent les v\u00f4tres. Qalia ne publie, ne mutualise, ni ne r\u00e9utilise vos donn\u00e9es entre clients.',
          partGest: 'Empreinte m\u00e9tier partag\u00e9e entre accompagnateurs d\u2019un m\u00eame organisme\u00a0: la charte m\u00e9tier + marqueurs saisis par le responsable sont mutualis\u00e9s sur tous les comptes accompagnateurs, garantissant l\u2019homog\u00e9n\u00e9it\u00e9 documentaire attendue par l\u2019auditeur.'
        },
        4: {
          generic: '\u00ab\u00a0Objectif\u00a0: permettre \u00e0 l\u2019apprenti d\u2019acqu\u00e9rir les comp\u00e9tences du r\u00e9f\u00e9rentiel en alternant p\u00e9riodes en centre et en entreprise.\u00a0\u00bb',
          qaliaLabel: 'Sortie Qalia (empreinte m\u00e9tier) \u2013 alternance industrie',
          qaliaEx: '\u00ab\u00a0S\u00e9quence entreprise S3 (BTS maintenance industrielle)\u00a0: l\u2019apprenti r\u00e9alise un diagnostic vibratoire sur presse hydraulique 200\u00a0T, sous supervision du ma\u00eetre d\u2019apprentissage. \u00c9valuation en situation de travail (MEST) crois\u00e9e avec le bloc 2 du RNCP. Fiche navette sign\u00e9e tripartite.\u00a0\u00bb',
          var1Label: 'Variante tertiaire (commerce)',
          var1Ex: '\u00ab\u00a0CCF bloc 3 (BTS MCO)\u00a0: l\u2019apprenti pilote une op\u00e9ration promotionnelle en point de vente (TG saisonnier, calcul marge, brief \u00e9quipe 4\u00a0vendeurs). Grille CCF align\u00e9e sur le r\u00e9f\u00e9rentiel activit\u00e9s du bloc \u00ab\u00a0Animation et dynamisation de l\u2019offre commerciale\u00a0\u00bb.\u00a0\u00bb',
          var2Label: 'Variante sant\u00e9 (aide-soignant)',
          var2Ex: '\u00ab\u00a0Calendrier d\u2019alternance ajust\u00e9 au roulement de l\u2019\u00e9tablissement\u00a0: 3\u00a0semaines centre / 3\u00a0semaines EHPAD, avec d\u00e9calage nuit au S4 pour valider le bloc comp\u00e9tences \u00ab\u00a0Accompagnement dans les actes de la vie quotidienne\u00a0\u00bb (sp\u00e9cificit\u00e9 horaire valid\u00e9e par le ma\u00eetre d\u2019apprentissage).\u00a0\u00bb',
          marqueurs: 'fili\u00e8res RNCP de votre CFA, profil type de vos apprentis, secteurs employeurs dominants, organisation de votre alternance (rythme, dur\u00e9es), sp\u00e9cificit\u00e9s de vos ma\u00eetres d\u2019apprentissage. Chaque livrable porte l\u2019identit\u00e9 de votre CFA, pas un gabarit standardis\u00e9.',
          partSolo: 'Empreinte m\u00e9tier personnelle\u00a0: vos marqueurs restent les v\u00f4tres. Qalia ne publie, ne mutualise, ni ne r\u00e9utilise vos donn\u00e9es entre clients.',
          partGest: 'Empreinte m\u00e9tier partag\u00e9e entre formateurs et tuteurs d\u2019un m\u00eame CFA\u00a0: la charte m\u00e9tier + marqueurs saisis par le directeur sont mutualis\u00e9s sur tous les comptes du CFA, garantissant l\u2019homog\u00e9n\u00e9it\u00e9 documentaire attendue par l\u2019auditeur.'
        }
      };

      // === Labels réinvestissement dynamiques par profil (routage slug → vocabulaire métier) ===
      // Chaque profil voit des labels adaptés à son activité dans la section « Temps réinvesti »
      // Pélissier Le Compas : le prospect reçoit une projection concrète de SON ROI
      // Principe Brunson Future Pacing (Expert Secrets) : le prospect se projette dans SON quotidien
      // Alignement HCP D35 : exploitation COVERAGE_DATA au-delà des 20% actuels
      var REINVEST_LABELS = {
        formateur:           { lbl1: 'Accompagnement',      sub1: 'sessions de formation possibles',       lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        coach:               { lbl1: 'Coaching',             sub1: 's\u00e9ances de coaching possibles',    lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        enseignant:          { lbl1: 'P\u00e9dagogie',       sub1: 'heures de formation possibles',         lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        ingenieurPeda:       { lbl1: 'Conception',           sub1: 'modules suppl\u00e9mentaires possibles', lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        consultantBilan:     { lbl1: 'Bilans',               sub1: 'bilans de comp\u00e9tences possibles',  lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        accompagnateurVAE:   { lbl1: 'VAE',                  sub1: 'parcours VAE suppl\u00e9mentaires',     lbl2: 'Facturation',             sub2: 'de capacit\u00e9 facturable',                 lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        maitreApprentissage: { lbl1: 'Suivi alternants',     sub1: 'visites de suivi possibles',            lbl2: 'Tutorat',                 sub2: 'heures de tutorat r\u00e9cup\u00e9r\u00e9es',     lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an' },
        directeurOF:         { lbl1: 'D\u00e9veloppement',   sub1: 'r\u00e9unions prospects possibles',     lbl2: 'Chiffre d\u2019affaires', sub2: 'de CA suppl\u00e9mentaire',                   lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an et par collaborateur' },
        directeurCFA:        { lbl1: 'Pilotage',             sub1: 'r\u00e9unions d\u2019\u00e9quipe possibles', lbl2: 'Alternance',          sub2: 'contrats suppl\u00e9mentaires g\u00e9rables', lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an et par collaborateur' },
        qualite:             { lbl1: 'Audits qualit\u00e9',  sub1: 'audits internes suppl\u00e9mentaires',  lbl2: 'Am\u00e9lioration continue', sub2: 'heures qualit\u00e9 r\u00e9cup\u00e9r\u00e9es', lbl3: 'Vie personnelle', sub3: 'week-ends r\u00e9cup\u00e9r\u00e9s par an et par collaborateur' }
      };

      // === Descriptions scénarios dynamiques (page Comparaison PDF) ===
      // Personnalise "Sans IA" et "Qalia" par profil. ChatGPT reste universel (vérité sur l'outil).
      // Pélissier Le Compas : le prospect reconnaît SA réalité dans le scénario
      // Brunson Stack & Close (Expert Secrets ch.17) : l'écart visuel construit la valeur perçue
      // Schwartz Awareness Level 3→4 : de "problem aware" à "solution aware" via comparaison
      var SCENARIO_DESCS = {
        formateur:           { manual: 'Programmes et preuves r\u00e9dig\u00e9s \u00e0 la main',     qalia: 'Ing\u00e9nierie guid\u00e9e, conforme RNQ V9' },
        coach:               { manual: 'Bilans et sc\u00e9narios cr\u00e9\u00e9s manuellement',       qalia: 'Parcours structur\u00e9s, pr\u00eats pour l\u2019audit' },
        enseignant:          { manual: 'Supports produits sans cadre structurant',                     qalia: 'Conception assist\u00e9e, cadre RNQ V9' },
        ingenieurPeda:       { manual: 'Modules con\u00e7us et document\u00e9s manuellement',         qalia: 'Conception acc\u00e9l\u00e9r\u00e9e, alignement RNQ V9' },
        consultantBilan:     { manual: 'Grilles et rapports de bilans manuels',                       qalia: 'Bilans structur\u00e9s, preuves natives' },
        accompagnateurVAE:   { manual: 'Dossiers VAE compil\u00e9s manuellement',                    qalia: 'Parcours VAE guid\u00e9, conforme RNQ V9' },
        maitreApprentissage: { manual: 'Documents de suivi alternants manuels',                       qalia: 'Suivi structur\u00e9, preuves de tutorat' },
        directeurOF:         { manual: 'Documentation qualit\u00e9 en file d\u2019attente',           qalia: 'Documentation centralis\u00e9e, pilotage clair' },
        directeurCFA:        { manual: 'Dossiers qualit\u00e9 et pilotage manuels',                   qalia: 'Pilotage unifi\u00e9, preuves centralis\u00e9es' },
        qualite:             { manual: 'Preuves et audits internes manuels',                          qalia: 'Preuves continues, audits facilit\u00e9s' }
      };

      // === applyDashboardLayout() : applique le layout adaptatif en fin de computeResults() (D35) ===
      function applyDashboardLayout() {
        var cible = state.cible || 'formateur';
        // Multi-profil : si au moins 1 profil gestionnaire, utiliser layout gestionnaire
        if (state.cibles && state.cibles.length > 1) {
          var hasGest = state.cibles.some(function(c) {
            return PROFILE_SEGMENT[c] === 'gestionnaire';
          });
          if (hasGest) cible = 'directeurOF';
        }

        var segment = PROFILE_SEGMENT[cible] || 'solo';
        var layout = DASHBOARD_LAYOUT[segment];

        // --- KPIs : masquer les secondaires pour solos (U8, 10/11 agents) ---
        var metricRoi = document.getElementById('simMetricRoi');
        var metricPayback = document.getElementById('simMetricPayback');
        var metricDays = document.getElementById('simMetricDays');
        if (layout.kpis.count <= 3) {
          if (metricRoi) metricRoi.style.display = 'none';
          if (metricPayback) metricPayback.style.display = 'none';
          if (metricDays) metricDays.style.display = 'none';
        }

        // --- ROI Chart : dans <details> pour solos (D-2, résolution fondateur) ---
        var roiCanvas = document.getElementById('simRoiCanvas');
        var roiChartCard = roiCanvas ? roiCanvas.closest('.sim-chart-card') : null;
        var roiChartWrap = roiChartCard ? roiChartCard.closest('.sim-dashboard-full') : null;
        if (layout.roiChart.mode === 'details' && roiChartWrap) {
          if (!roiChartWrap.querySelector('details.sim-roi-details')) {
            var detailsEl = document.createElement('details');
            detailsEl.className = 'sim-roi-details';
            var summaryEl = document.createElement('summary');
            summaryEl.textContent = 'R\u00e9sultat net cumul\u00e9 mois par mois (gains \u2212 investissement)';
            summaryEl.style.cssText = 'cursor:pointer; font-weight:600; padding:var(--space-xs) 0; color:var(--bleu-canard);';
            detailsEl.appendChild(summaryEl);
            detailsEl.appendChild(roiChartCard);
            roiChartWrap.appendChild(detailsEl);
          }
        }

        // --- D.U.R. : masqué partout (unanime 11/11, D37) ---
        var durEl = document.getElementById('simDur');
        if (durEl) durEl.style.display = 'none';

        // --- Activation : visible (version full, pills retirées du CTA pour éviter redondance) ---

        // --- Partage : adapter les boutons par segment (D38) ---
        var allowedBtns = layout.partage.buttons;
        var btnMap = {
          whatsapp: 'simShareWhatsapp',
          linkedin: 'simShareLinkedin',
          facebook: 'simShareFacebook',
          x:        'simShareX',
          email:    'simShareEmail',
          pdf:      'simSharePrint'
        };
        Object.keys(btnMap).forEach(function(key) {
          var btn = document.getElementById(btnMap[key]);
          if (btn) btn.style.display = allowedBtns.indexOf(key) > -1 ? '' : 'none';
        });
      }

      // === getCompactActivationPills() : pills de livrables compactes pour le CTA (U6/D36) ===
      function getCompactActivationPills() {
        var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        // Cats effectives = union des profils MONO-CAT seulement (exclut les transversaux directeurOF/qualite)
        var TRANSVERSAL_STATE = ['directeurOF', 'qualite'];
        var monoCibles = cibles.filter(function(c) { return TRANSVERSAL_STATE.indexOf(c) === -1; });
        var cats;
        if (monoCibles.length > 0) {
          var monoCatsMap = {};
          monoCibles.forEach(function(c) {
            (PROFILE_CATS[c] || [1]).forEach(function(cat) { monoCatsMap[cat] = true; });
          });
          cats = Object.keys(monoCatsMap).map(Number).sort();
        } else {
          cats = getActiveCats(cibles);
        }
        if (cats.length === 0) cats = [1];
        var html = '<div style="display:flex; flex-wrap:wrap; gap:var(--space-2xs); justify-content:center; margin-bottom:var(--space-sm); max-width:560px; margin-left:auto; margin-right:auto;">';
        cats.forEach(function(cat) {
          var o = ACTIVATION_OUTPUTS[cat];
          if (!o) return;
          var items = o.items.slice(0, 4);
          items.forEach(function(item) {
            html += '<span class="output-pill" style="font-size:var(--fs-caption); padding:3px 8px; border:1px solid rgba(27,126,148,0.2); border-radius:20px; color:var(--bleu-canard); background:rgba(27,126,148,0.05);">' + item + '</span>';
          });
          if (o.items.length > 4) {
            html += '<span style="font-size:var(--fs-caption); color:var(--gris);">+\u00a0' + (o.items.length - 4) + ' livrables</span>';
          }
        });
        html += '</div>';
        return html;
      }

      function renderActivation() {
        var wrap = document.getElementById('simActivationWrap');
        var content = document.getElementById('simActivationContent');
        if (!wrap || !content) return;
        var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        // Cats effectives = union des profils MONO-CAT seulement (exclut les transversaux directeurOF/qualite)
        var TRANSVERSAL_STATE = ['directeurOF', 'qualite'];
        var monoCibles = cibles.filter(function(c) { return TRANSVERSAL_STATE.indexOf(c) === -1; });
        var cats;
        if (monoCibles.length > 0) {
          var monoCatsMap = {};
          monoCibles.forEach(function(c) {
            (PROFILE_CATS[c] || [1]).forEach(function(cat) { monoCatsMap[cat] = true; });
          });
          cats = Object.keys(monoCatsMap).map(Number).sort();
        } else {
          cats = getActiveCats(cibles);
        }
        if (cats.length === 0) cats = [1];
        var html = '<div style="display:flex; align-items:center; justify-content:center; gap:var(--space-xs); margin-bottom:var(--space-sm);">';
        html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        html += '<span style="font-size:var(--fs-h4); font-weight:700; color:var(--noir);">D\u00e9couvrez Qalia d\u00e8s l\u2019activation</span>';
        html += '</div>';
        html += '<p style="font-size:var(--fs-body); color:var(--gris); line-height:var(--lh-body); max-width:560px; margin:0 auto var(--space-md);">D\u00e8s votre licence activ\u00e9e, deux tutoriels complets vous accompagnent pour vos premiers pas dans Qalia (<a href="https://www.qalia.ai/tutos-qalia" target="_blank" rel="noopener" style="color:var(--bleu-canard); font-weight:600; text-decoration:underline; text-underline-offset:2px;"><svg width="16" height="16" viewBox="0 0 32 32" fill="none" style="vertical-align:middle; margin-right:3px;" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.716 29.2178L2.27664 24.9331C1.44913 23.9023 1 22.6346 1 21.3299V5.81499C1 3.86064 2.56359 2.23897 4.58071 2.10125L20.5321 1.01218C21.691 0.933062 22.8428 1.24109 23.7948 1.8847L29.3992 5.67391C30.4025 6.35219 31 7.46099 31 8.64426V26.2832C31 28.1958 29.4626 29.7793 27.4876 29.9009L9.78333 30.9907C8.20733 31.0877 6.68399 30.4237 5.716 29.2178Z" fill="currentColor"/><path d="M11.2481 13.5787V13.3756C11.2481 12.8607 11.6605 12.4337 12.192 12.3982L16.0633 12.1397L21.417 20.0235V13.1041L20.039 12.9204V12.824C20.039 12.303 20.4608 11.8732 20.9991 11.8456L24.5216 11.6652V12.1721C24.5216 12.41 24.3446 12.6136 24.1021 12.6546L23.2544 12.798V24.0037L22.1906 24.3695C21.3018 24.6752 20.3124 24.348 19.8036 23.5803L14.6061 15.7372V23.223L16.2058 23.5291L16.1836 23.6775C16.1137 24.1423 15.7124 24.4939 15.227 24.5155L11.2481 24.6926C11.1955 24.1927 11.5701 23.7456 12.0869 23.6913L12.6103 23.6363V13.6552L11.2481 13.5787Z" fill="#fff"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20.6749 2.96678L4.72347 4.05585C3.76799 4.12109 3.02734 4.88925 3.02734 5.81499V21.3299C3.02734 22.1997 3.32676 23.0448 3.87843 23.7321L7.3178 28.0167C7.87388 28.7094 8.74899 29.0909 9.65435 29.0352L27.3586 27.9454C28.266 27.8895 28.9724 27.1619 28.9724 26.2832V8.64426C28.9724 8.10059 28.6979 7.59115 28.2369 7.27951L22.6325 3.49029C22.0613 3.10413 21.3702 2.91931 20.6749 2.96678ZM5.51447 6.057C5.29261 5.89274 5.3982 5.55055 5.6769 5.53056L20.7822 4.44711C21.2635 4.41259 21.7417 4.54512 22.1309 4.82088L25.1617 6.96813C25.2767 7.04965 25.2228 7.22563 25.0803 7.23338L9.08387 8.10336C8.59977 8.12969 8.12193 7.98747 7.73701 7.7025L5.51447 6.057ZM8.33357 10.8307C8.33357 10.311 8.75341 9.88177 9.29027 9.85253L26.203 8.93145C26.7263 8.90296 27.1667 9.30534 27.1667 9.81182V25.0853C27.1667 25.604 26.7484 26.0328 26.2126 26.0633L9.40688 27.0195C8.8246 27.0527 8.33357 26.6052 8.33357 26.0415V10.8307Z" fill="currentColor"/></svg> acc\u00e8s libre, sans inscription</a>). Voici ce que Qalia g\u00e9n\u00e8re pour vous\u00a0:</p>';
        // D42 : affichage adaptatif par segment (A=solo, C=gestionnaire)
        var cible = state.cible || 'formateur';
        if (state.cibles && state.cibles.length > 1) {
          var hasGest = state.cibles.some(function(c) { return PROFILE_SEGMENT[c] === 'gestionnaire'; });
          if (hasGest) cible = 'directeurOF';
        }
        var isGestionnaire = PROFILE_SEGMENT[cible] === 'gestionnaire';
        // Collecter les livrables actifs (liés aux tâches cochées)
        var activeOutputs = {};
        if (isGestionnaire) {
          (state.tasks || []).forEach(function(key) {
            var outputs = TASK_TO_OUTPUTS[key];
            if (outputs) outputs.forEach(function(o) { activeOutputs[o] = true; });
          });
        }
        cats.forEach(function(cat) {
          var o = ACTIVATION_OUTPUTS[cat];
          if (!o) return;
          if (cats.length > 1) {
            html += '<p style="font-size:var(--fs-small); font-weight:700; color:var(--bleu-canard); margin:var(--space-sm) 0 var(--space-2xs); text-transform:uppercase; letter-spacing:0.05em;">' + o.titre + '</p>';
          }
          // Séparer pills actives et disponibles (gestionnaire mode C)
          var activePills = [];
          var availablePills = [];
          o.items.forEach(function(item) {
            if (!isGestionnaire || activeOutputs[item]) {
              activePills.push(item);
            } else {
              availablePills.push(item);
            }
          });
          html += '<div style="display:flex; flex-wrap:wrap; gap:var(--space-2xs); justify-content:center; margin-bottom:' + (availablePills.length > 0 ? 'var(--space-3xs)' : 'var(--space-xs)') + ';">';
          activePills.forEach(function(item) {
            html += '<span class="output-pill" style="font-size:var(--fs-caption); padding:4px 10px; border:1px solid rgba(27,126,148,0.2); border-radius:20px; color:var(--bleu-canard); background:rgba(27,126,148,0.05);">' + item + '</span>';
          });
          html += '</div>';
          if (availablePills.length > 0) {
            html += '<p style="font-size:10px; color:var(--gris); text-transform:uppercase; letter-spacing:0.05em; margin:var(--space-3xs) 0 var(--space-3xs); text-align:center;">\u00c9galement disponible</p>';
            html += '<div style="display:flex; flex-wrap:wrap; gap:var(--space-2xs); justify-content:center; margin-bottom:var(--space-xs);">';
            availablePills.forEach(function(item) {
              html += '<span class="output-pill" style="font-size:var(--fs-caption); padding:4px 10px; border:1px solid rgba(27,126,148,0.12); border-radius:20px; color:var(--bleu-canard); background:rgba(27,126,148,0.02); opacity:0.55; font-style:italic;">' + item + '</span>';
            });
            html += '</div>';
          }
        });
        // Liens interpage vers la section "Ce que fait Qalia" pour chaque Cat. active
        html += '<div style="display:flex; flex-wrap:wrap; gap:var(--space-xs); justify-content:center; margin-top:var(--space-sm);">';
        cats.forEach(function(cat) {
          var o = ACTIVATION_OUTPUTS[cat];
          if (!o) return;
          html += '<a href="#productions" onclick="(function(c){setTimeout(function(){var t=document.querySelector(\'.cat-tab[data-cat=&quot;\'+c+\'&quot;]\');if(t){t.click();}},300);})('+cat+'); return true;" style="display:inline-flex; align-items:center; gap:var(--space-2xs); font-size:var(--fs-small); color:var(--bleu-canard); font-weight:600; text-decoration:none; border:1px solid rgba(27,126,148,0.25); padding:var(--space-2xs) var(--space-sm); border-radius:0.5rem; transition:background 0.2s;" onmouseover="this.style.background=\'rgba(27,126,148,0.06)\'" onmouseout="this.style.background=\'transparent\'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg> Voir le d\u00e9tail ' + o.titre + '</a>';
        });
        html += '</div>';
        html += '<p style="display:flex; align-items:center; justify-content:center; gap:var(--space-2xs); font-size:var(--fs-caption); color:var(--gris); margin-top:var(--space-sm);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Chaque document porte la mention \u00ab\u00a0G\u00e9n\u00e9r\u00e9 avec l\u2019assistance de Qalia\u00a0\u00bb \u2013 tra\u00e7abilit\u00e9 IA Act</p>';
        content.innerHTML = html;
        wrap.style.display = 'block';
      }

      // === PROFILE_COPY : copywriting centralisé par profil ===
      var PROFILE_COPY = {
        formateur: {
          badge: 'Analyse propuls\u00e9e par une architecture IA sp\u00e9cialis\u00e9e RNQ V9 : simulateur d\u2019opportunit\u00e9',
          insight: function(d) { return '<strong>Dans 12 mois</strong>, imaginez ' + fmtNum(d.weekends) + ' week-ends non sacrifi\u00e9s. Chaque euro investi vous en rapporte <strong>\u00d7' + d.roi + '</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es pour approfondir vos ing\u00e9nieries et d\u00e9velopper votre activit\u00e9.'); },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), fmtNum(d.weekends) + ' week-ends r\u00e9cup\u00e9r\u00e9s', 'S\u00e9r\u00e9nit\u00e9 audit'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Courbe d\u2019apprentissage initiale'],
            opportunites: ['Temps lib\u00e9r\u00e9 pour facturer', 'Conformit\u00e9 indicateurs RNQ V9 applicables', 'Scalabilit\u00e9 si croissance'],
            menaces: ['Audit surveillance rat\u00e9 : reconstruction dossier en urgence', 'Perte financements publics et mutualis\u00e9s (OPCO, CPF, France VAE, France Travail)', 'Isolement face \u00e0 la complexit\u00e9 r\u00e9glementaire']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, ') + fmtNum(d.weekends) + ' week-ends r\u00e9cup\u00e9r\u00e9s. ROI \u00d7' + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de retour sur investissement. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es = ') + fmtNum(d.weekends) + ' week-ends en plus. La s\u00e9r\u00e9nit\u00e9 conformit\u00e9 Qualiopi, en prime.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es + s\u00e9curit\u00e9 conformit\u00e9 indicateurs applicables. Le ROI n\u2019est pas financier mais il est r\u00e9el.'); }
        },
        coach: {
          badge: 'Architecture IA sp\u00e9cialis\u00e9e : efficacit\u00e9 multi-casquettes, couverture RNQ V9',
          insight: function(d) { return '<strong>Chaque heure lib\u00e9r\u00e9e = une session coaching suppl\u00e9mentaire</strong>. ROI \u00d7' + d.roi + ' sur ' + fmtNum(d.totalPrograms) + ' programmes. ' + fmtNum(d.daysFreed) + ' jours r\u00e9cup\u00e9r\u00e9s pour vos clients.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Multi-casquettes facilit\u00e9', 'Productivit\u00e9 d\u00e9cupl\u00e9e'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Temps d\u2019adoption'],
            opportunites: ['Sessions coaching suppl\u00e9mentaires', 'Couverture documentaire structur\u00e9e', 'R\u00e9putation professionnelle'],
            menaces: ['Multi-casquettes sans filet : NC sur un programme contamine l\u2019ensemble', 'Temps administratif qui grignote le temps client', 'Renouvellement Qualiopi compromis sans architecture documentaire solide']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, ') + fmtNum(d.daysFreed) + ' jours pour mes clients. ROI \u00d7' + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. ' + fmtNum(d.daysFreed) + ' jours lib\u00e9r\u00e9s pour coacher, animer, facturer. Multi-casquettes facilit\u00e9.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. Moins de paperasse, plus de coaching. La conformit\u00e9 ne devrait pas \u00eatre un frein.'); }
        },
        directeurOF: {
          badge: 'Architecture IA sp\u00e9cialis\u00e9e : indicateurs RNQ V9 applicables, gouvernance int\u00e9gr\u00e9e',
          insight: function(d) { return '<strong>\u00c0 ' + fmtNum(d.totalPrograms * 3) + ' programmes/an</strong>, votre \u00e9quipe produit 3\u00d7 plus. Co\u00fbt/programme\u00a0: ' + fmtNum(d.costPerProg) + '\u00a0<span class="u">\u20ac</span>. Gain/programme\u00a0: ' + fmtNum(d.savedPerProg) + '\u00a0<span class="u">\u20ac</span>. Payback ' + (d.paybackLabel || 'Mois\u00a0' + d.paybackMonth) + ', ROI \u00d7' + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, 'Co\u00fbt/programme : ' + fmtNum(d.costPerProg) + ' <span class="u">\u20ac</span>', 'Gain/programme : ' + fmtNum(d.savedPerProg) + ' <span class="u">\u20ac</span>', 'Standardisation \u00e9quipe'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', '1 licence = 1 compte ChatGPT', 'Formation \u00e9quipe n\u00e9cessaire'],
            opportunites: ['Scalabilit\u00e9 multi-formateurs', 'Gouvernance qualit\u00e9', 'Payback ' + (d.paybackLabel || 'Mois\u00a0' + d.paybackMonth)],
            menaces: ['Non-conformit\u00e9 syst\u00e9mique : tous vos formateurs expos\u00e9s simultan\u00e9ment', 'Perte financements sur l\u2019ensemble du catalogue', 'Audit de surveillance transform\u00e9 en audit de suivi renforc\u00e9']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH('/an lib\u00e9r\u00e9es, co\u00fbt/programme ') + fmtNum(d.costPerProg) + ' \u20ac, ROI \u00d7' + d.roi + '. Payback ' + (d.paybackLabel || 'Mois\u00a0' + d.paybackMonth) + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? 'ROI \u00d7' + d.roi + '. Co\u00fbt/programme : ' + fmtNum(d.costPerProg) + ' <span class="u">\u20ac</span>. Payback ' + (d.paybackLabel || 'Mois\u00a0' + d.paybackMonth) + '. Standardisation qualit\u00e9 pour toute l\u2019\u00e9quipe.' : fmtNum(d.costPerProg) + ' \u20ac/programme. Volume insuffisant pour le ROI mais la gouvernance qualit\u00e9 se chiffre diff\u00e9remment.'; }
        },
        qualite: {
          badge: 'Pilotage qualit\u00e9 assist\u00e9 par IA : indicateurs RNQ V9 applicables, tra\u00e7abilit\u00e9 documentaire int\u00e9gr\u00e9e',
          insight: function(d) { return '<strong>Indicateurs applicables structur\u00e9s et v\u00e9rifi\u00e9s avec vous</strong> \u00e0 chaque g\u00e9n\u00e9ration. Tra\u00e7abilit\u00e9 compl\u00e8te, pr\u00e9paration \u00e0 l\u2019audit int\u00e9gr\u00e9e. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es pour l\u2019am\u00e9lioration continue. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['Indicateurs RNQ V9 applicables structur\u00e9s', 'Tra\u00e7abilit\u00e9 int\u00e9gr\u00e9e', 'Pr\u00e9paration \u00e0 l\u2019audit int\u00e9gr\u00e9e', fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an')],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'Compl\u00e9mentaire (pas LMS)', 'D\u00e9pendance IA externe'],
            opportunites: ['R\u00e9duction du risque NC documentaire', 'Pr\u00e9paration audit continue', 'Export structur\u00e9 natif'],
            menaces: ['NC documentaire non d\u00e9tect\u00e9e avant le jour J de l\u2019audit', 'Veille r\u00e9glementaire lacunaire : RNQ V9 \u2192 V10 sans mise \u00e0 niveau', 'Tra\u00e7abilit\u00e9 insuffisante : preuves terrain non structur\u00e9es avant contr\u00f4le']
          }; },
          shareShort: function(d) { return 'Indicateurs RNQ V9 applicables structur\u00e9s \u00e0 la conception, ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. indicateurs RNQ V9 applicables structur\u00e9s \u00e0 la conception. Tra\u00e7abilit\u00e9 + pr\u00e9paration \u00e0 l\u2019audit int\u00e9gr\u00e9e.' : 'Indicateurs RNQ V9 applicables structur\u00e9s. Le co\u00fbt de la non-conformit\u00e9 d\u00e9passe le co\u00fbt de l\u2019outil.'; }
        },
        ingenieurPeda: {
          badge: 'IA sp\u00e9cialis\u00e9e conception p\u00e9dagogique : alignement constructif natif',
          insight: function(d) { return '<strong>Conception p\u00e9dagogique acc\u00e9l\u00e9r\u00e9e</strong> : ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an pour l\u2019innovation p\u00e9dagogique. Alignement constructif v\u00e9rifi\u00e9 nativement. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Alignement constructif natif', 'Conformit\u00e9 RNQ V9'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Cadrage p\u00e9dagogique initial'],
            opportunites: ['Industrialisation de la conception', 'R\u00e9duction erreurs p\u00e9dagogiques', 'Portfolio enrichi'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', 'D\u00e9pendance outil', '\u00c9volution r\u00e9f\u00e9rentiels']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, conception p\u00e9dagogique acc\u00e9l\u00e9r\u00e9e. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Conception p\u00e9dagogique acc\u00e9l\u00e9r\u00e9e + couverture RNQ V9 structur\u00e9e.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La qualit\u00e9 p\u00e9dagogique m\u00e9rite un copilote sp\u00e9cialis\u00e9.'); }
        },
        enseignant: {
          badge: 'IA sp\u00e9cialis\u00e9e formation professionnelle : transition acad\u00e9mique fluide',
          insight: function(d) { return '<strong>Transition vers la formation professionnelle simplifi\u00e9e</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Qalia structure vos programmes aux normes Qualiopi sans que vous deveniez expert conformit\u00e9. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Couverture Qualiopi structur\u00e9e', 'Transition acad\u00e9mique facilit\u00e9e'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Apprentissage vocabulaire Qualiopi'],
            opportunites: ['Nouveau march\u00e9 formation pro', 'Compl\u00e9ment de revenus', 'Cr\u00e9dibilit\u00e9 certifi\u00e9e'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', 'Concurrence formateurs exp\u00e9riment\u00e9s', 'R\u00e8glementation \u00e9volutive']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, transition formation pro facilit\u00e9e. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Transition acad\u00e9mique \u2192 formation pro sans friction.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La conformit\u00e9 Qualiopi ne devrait pas freiner votre transition.'); }
        },
        enseignantChercheur: {
          badge: 'IA sp\u00e9cialis\u00e9e valorisation expertise : de la recherche \u00e0 la formation',
          insight: function(d) { return '<strong>Valorisez votre expertise de recherche en formation certifi\u00e9e</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an pour la recherche. Vos publications deviennent des programmes structur\u00e9s. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Expertise valoris\u00e9e', 'Couverture documentaire structur\u00e9e'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Adaptation vocabulaire'],
            opportunites: ['Publications \u2192 formations', 'Revenus compl\u00e9mentaires', 'Impact soci\u00e9tal'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', 'Temps de prise en main', '\u00c9volution r\u00e9f\u00e9rentiels']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, expertise recherche valoris\u00e9e. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Votre expertise de recherche transform\u00e9e en formations certifi\u00e9es.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. Votre expertise m\u00e9rite d\u2019\u00eatre valoris\u00e9e en formation.'); }
        },
        docteur: {
          badge: 'IA sp\u00e9cialis\u00e9e valorisation doctorale : expertise \u2192 formation certifi\u00e9e',
          insight: function(d) { return '<strong>Votre doctorat, transform\u00e9 en programme de formation certifi\u00e9</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Qalia structure votre expertise pointue aux normes Qualiopi. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Expertise doctorale valoris\u00e9e', 'Programmes certifi\u00e9s'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Courbe d\u2019apprentissage'],
            opportunites: ['Th\u00e8se \u2192 formation', 'March\u00e9 formation continue', 'L\u00e9gitimit\u00e9 acad\u00e9mique'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', 'Concurrence formateurs terrain', 'Adaptation p\u00e9dagogique']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, expertise doctorale valoris\u00e9e. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Doctorat valoris\u00e9 en formation certifi\u00e9e Qualiopi.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. Votre expertise doctorale m\u00e9rite un cadre certifi\u00e9.'); }
        },
        academicien: {
          badge: 'IA sp\u00e9cialis\u00e9e validation acad\u00e9mique : rigueur + conformit\u00e9',
          insight: function(d) { return '<strong>Votre regard d\u2019expert au service de la qualit\u00e9</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Structuration des indicateurs RNQ V9 applicables. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, 'Indicateurs applicables structur\u00e9s', fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Rigueur acad\u00e9mique'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'P\u00e9rim\u00e8tre contr\u00f4le', 'D\u00e9pendance IA'],
            opportunites: ['Validation int\u00e9gr\u00e9e', 'Caution scientifique', 'Expertise demand\u00e9e'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', '\u00c9volution normes', 'Obsolescence']
          }; },
          shareShort: function(d) { return 'Indicateurs applicables structur\u00e9s, ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Validation acad\u00e9mique + couverture RNQ V9 structur\u00e9e.' : 'Indicateurs applicables structur\u00e9s. La rigueur a un co\u00fbt, la non-conformit\u00e9 en a un plus grand.'; }
        },
        auditeur: {
          badge: 'IA sp\u00e9cialis\u00e9e pr\u00e9paration audit : indicateurs RNQ V9 applicables structur\u00e9s',
          insight: function(d) { return '<strong>Pr\u00e9paration audit int\u00e9gr\u00e9e nativement</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Indicateurs applicables contr\u00f4l\u00e9s en continu, tra\u00e7abilit\u00e9 compl\u00e8te. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, 'Indicateurs applicables contr\u00f4l\u00e9s', 'Tra\u00e7abilit\u00e9 compl\u00e8te', fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an')],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'Compl\u00e9mentaire audit terrain', 'D\u00e9pendance IA'],
            opportunites: ['Contr\u00f4le continu', 'D\u00e9tection pr\u00e9coce NC', 'Dossier audit pr\u00eat'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', '\u00c9volution r\u00e9f\u00e9rentiel', 'Faux sentiment de s\u00e9curit\u00e9']
          }; },
          shareShort: function(d) { return 'Indicateurs applicables contr\u00f4l\u00e9s, ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Pr\u00e9paration audit continue + indicateurs applicables structur\u00e9s.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La pr\u00e9vention audit a un ROI non chiffrable.'); }
        },
        certificateur: {
          badge: 'IA sp\u00e9cialis\u00e9e couverture RNQ V9 : structuration indicateurs applicables',
          insight: function(d) { return '<strong>Aide \u00e0 la couverture documentaire</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Les indicateurs RNQ V9 applicables sont structur\u00e9s \u00e0 chaque g\u00e9n\u00e9ration. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['Indicateurs applicables structur\u00e9s', 'Couverture RNQ V9', fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Tra\u00e7abilit\u00e9'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'P\u00e9rim\u00e8tre documentaire', 'D\u00e9pendance IA'],
            opportunites: ['V\u00e9rification continue', 'R\u00e9duction charge contr\u00f4le', 'Qualit\u00e9 homog\u00e8ne'],
            menaces: ['Risque NC majeure : suspension certification, plan d\u2019action 3 mois', '\u00c9volution RNQ', 'Limites v\u00e9rification auto']
          }; },
          shareShort: function(d) { return 'Indicateurs RNQ V9 applicables structurés documentairement par Qalia. ROI \u00d7' + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Indicateurs applicables structur\u00e9s selon le RNQ V9.' : 'Couverture documentaire structur\u00e9e. Le co\u00fbt de la non-conformit\u00e9 d\u00e9passe l\u2019investissement.'; }
        },
        consultantBilan: {
          badge: 'IA sp\u00e9cialis\u00e9e bilan de comp\u00e9tences : 3 phases r\u00e9glementaires structur\u00e9es',
          insight: function(d) { return '<strong>Chaque bilan structur\u00e9 = un accompagnement plus fluide</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an pour vos b\u00e9n\u00e9ficiaires. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), '3 phases r\u00e9glementaires structur\u00e9es', 'Grilles et synth\u00e8ses g\u00e9n\u00e9r\u00e9es'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Adaptation initiale'],
            opportunites: ['Plus de bilans r\u00e9alis\u00e9s/an', 'Conformit\u00e9 Cat. 2 structur\u00e9e', 'Qualit\u00e9 documentaire constante'],
            menaces: ['NC sur documentation bilan', 'Perte habilitation', 'Non-conformit\u00e9 r\u00e9glementaire']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, bilans structur\u00e9s. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. 3 phases r\u00e9glementaires structur\u00e9es nativement.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La structuration bilan m\u00e9rite un copilote sp\u00e9cialis\u00e9.'); }
        },
        accompagnateurVAE: {
          badge: 'IA sp\u00e9cialis\u00e9e VAE : parcours RNCP/RS, livrets 1 et 2',
          insight: function(d) { return '<strong>Chaque parcours VAE mieux structur\u00e9 = un candidat mieux pr\u00e9par\u00e9</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. V\u00e9rification RNCP/RS int\u00e9gr\u00e9e. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Coh\u00e9rence RNCP/RS v\u00e9rifi\u00e9e', 'Livrets structur\u00e9s'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Courbe d\u2019apprentissage'],
            opportunites: ['Plus d\u2019accompagnements/an', 'Taux de r\u00e9ussite am\u00e9lior\u00e9', 'Documentation VAE compl\u00e8te'],
            menaces: ['Incoh\u00e9rence r\u00e9f\u00e9rentiel', 'Refus recevabilit\u00e9', '\u00c9chec jury']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, parcours VAE structur\u00e9s. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Parcours VAE structur\u00e9s avec v\u00e9rification RNCP/RS.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La rigueur documentaire VAE m\u00e9rite un copilote.'); }
        },
        directeurCFA: {
          badge: 'IA sp\u00e9cialis\u00e9e apprentissage : Cat. 4, crit\u00e8res suppl\u00e9mentaires CFA',
          insight: function(d) { return '<strong>' + fmtNum(d.totalPrograms) + ' programmes d\u2019apprentissage structur\u00e9s</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an. Crit\u00e8res suppl\u00e9mentaires CFA int\u00e9gr\u00e9s. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Crit\u00e8res CFA int\u00e9gr\u00e9s', 'Suivi alternance structur\u00e9'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Formation \u00e9quipe'],
            opportunites: ['Scalabilit\u00e9 multi-formations', 'Conformit\u00e9 Cat. 4 compl\u00e8te', 'Gain administratif'],
            menaces: ['NC sur crit\u00e8res suppl\u00e9mentaires', 'Perte certification CFA', 'Non-conformit\u00e9 alternance']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, programmes CFA structur\u00e9s. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Programmes apprentissage + crit\u00e8res CFA int\u00e9gr\u00e9s.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. La conformit\u00e9 Cat. 4 est un investissement.'); }
        },
        maitreApprentissage: {
          badge: 'IA sp\u00e9cialis\u00e9e apprentissage : suivi, \u00e9valuations, livret',
          insight: function(d) { return '<strong>Suivi p\u00e9dagogique structur\u00e9</strong>. ' + fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an pour accompagner vos apprentis. ROI \u00d7') + d.roi + '.'; },
          swot: function(d) { return {
            forces: ['ROI \u00d7' + d.roi, fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es/an'), 'Livret de suivi structur\u00e9', '\u00c9valuations CFA int\u00e9gr\u00e9es'],
            faiblesses: ['Co\u00fbt ' + fmtNum(d.annualCost) + ' <span class="u">\u20ac/an</span>', 'N\u00e9cessite ChatGPT', 'Adaptation initiale'],
            opportunites: ['Meilleur accompagnement apprentis', 'Documentation compl\u00e8te', 'S\u00e9r\u00e9nit\u00e9 suivi'],
            menaces: ['Non-conformit\u00e9 suivi', 'Rupture contrat apprentissage', 'D\u00e9faut documentaire']
          }; },
          shareShort: function(d) { return fmtNum(d.hours) + fH(' lib\u00e9r\u00e9es, suivi apprentissage structur\u00e9. ROI \u00d7') + d.roi + '.'; },
          shareConclusion: function(d) { return d.netResult > 0 ? '\u00d7' + d.roi + ' de ROI. Suivi apprentissage + \u00e9valuations structur\u00e9s.' : fmtNum(d.hours) + fH(' \u00e9conomis\u00e9es. Un bon suivi p\u00e9dagogique m\u00e9rite un copilote.'); }
        }
      };

      // === QUALIOPI_COPY : surcharges par statut Qualiopi ===
      var QUALIOPI_COPY = {
        aspirant: {
          urgency: 'Vous pr\u00e9parez votre premi\u00e8re certification : chaque document structur\u00e9 vous rapproche du succ\u00e8s.',
          swotExtra: { opportunites: 'Construction dossier initial guid\u00e9e', menaces: '\u00c9chec audit initial si documentation insuffisante' },
          eisenhowerBoost: 1000,
          durUrgent: 'Premi\u00e8re certification \u00e0 pr\u00e9parer : chaque mois compte'
        },
        initial: {
          urgency: 'Audit initial programm\u00e9 : le compte \u00e0 rebours a commenc\u00e9.',
          swotExtra: { opportunites: 'Pr\u00e9paration audit structur\u00e9e', menaces: 'NC majeure d\u00e8s le premier audit' },
          eisenhowerBoost: 3000,
          durUrgent: 'Audit initial imminent : urgence maximale'
        },
        surveillance: {
          urgency: 'Surveillance entre M+14 et M+22 : maintenez votre conformit\u00e9.',
          swotExtra: { opportunites: 'Maintien continu de la conformit\u00e9', menaces: 'NC majeure = perte certification' },
          eisenhowerBoost: 2000,
          durUrgent: 'Surveillance M+14 \u00e0 M+22 : v\u00e9rification continue requise'
        },
        stable: {
          urgency: '',
          swotExtra: { opportunites: 'Temps pour optimiser et scaler', menaces: 'Complaisance = risque latent' },
          eisenhowerBoost: 0,
          durUrgent: 'Pas d\u2019\u00e9ch\u00e9ance imm\u00e9diate : moment id\u00e9al pour industrialiser'
        },
        renouvellement: {
          urgency: 'Renouvellement \u00e0 pr\u00e9parer : dossier complet + veille r\u00e9glementaire.',
          swotExtra: { opportunites: 'Dossier renouvellement complet', menaces: 'Perte certification si non-renouvellement' },
          eisenhowerBoost: 2500,
          durUrgent: 'Renouvellement triennal : dossier complet \u00e0 constituer'
        },
        non_concerne: {
          urgency: '',
          swotExtra: null,
          eisenhowerBoost: 0,
          durUrgent: 'Qualiopi non applicable : focus productivit\u00e9 et qualit\u00e9'
        }
      };

      // === TEAM_COPY : surcharges contexte \u00e9quipe (source : Offres-valid\u00e9es-V8.md) ===
      var TEAM_COPY = {
        standardisation: {
          label: 'Standardisation (2-4 licences)',
          needs: ['Onboarding \u00e9quipe 1 h avec Romuald', 'Harmonisation documentaire (templates \u00e9quipe)', 'Espace Client avanc\u00e9 (8 ressources N3)'],
          cta: 'R\u00e9servez une d\u00e9mo \u00e9quipe'
        },
        gouvernance: {
          label: 'Gouvernance (5-10 licences)',
          needs: ['Support prioritaire 24 h ouvr\u00e9es', 'Gouvernance documentaire (workflow validation Notion)', 'Checkpoint trimestriel avec le fondateur', 'Onboarding \u00e9quipe 1 h avec Romuald', 'Harmonisation documentaire', 'Espace Client avanc\u00e9 (8 ressources N3)'],
          cta: 'R\u00e9servez une d\u00e9mo \u00e9quipe'
        },
        pilotage: {
          label: 'Pilotage (10+ licences)',
          needs: ['Liaison directe avec le fondateur', 'Convention partenariat formalis\u00e9e', 'Comit\u00e9 de pilotage semestriel (1 h visio)', 'Support prioritaire 24 h ouvr\u00e9es', 'Gouvernance documentaire', 'Checkpoint trimestriel', 'Onboarding \u00e9quipe 1 h', 'Harmonisation documentaire', 'Espace Client avanc\u00e9 (8 ressources N3)'],
          cta: 'R\u00e9servez une d\u00e9mo \u00e9quipe'
        }
      };

      // === HELPERS : fonctions utilitaires ===
      function getTeamTier(size) {
        if (size >= 10) return 'pilotage';
        if (size >= 5) return 'gouvernance';
        return 'standardisation';
      }

      function getActiveTasks(cible) {
        var profile = PROFILE_DEFAULTS[cible] || PROFILE_DEFAULTS.formateur;
        return profile.core.concat(profile.frequent);
      }

      // Helper : tâche non per_program (annual ou per_audit)
      function isFixedFreqTask(t) {
        return t && (t.frequency === 'annual' || t.frequency === 'per_audit');
      }
      // Diviseur d'annualisation : per_audit = cycle 3 ans
      function annualDivisor(t) {
        return (t && t.frequency === 'per_audit') ? 3 : 1;
      }

      function computeTaskHours(tasks) {
        var totalMarket = 0;
        var totalChatGPT = 0;
        var totalQalia = 0;
        var breakdown = [];

        tasks.forEach(function(key) {
          var t = TASK_CONFIG[key];
          if (!t) return;
          var vol = (state.taskVolumes[key] != null) ? state.taskVolumes[key] : (t.defaultVolume || 1);
          var unitMarket = state.taskMarketHours[key] || t.marketHours;
          var divisor = annualDivisor(t);
          var market = (unitMarket * vol) / divisor;
          var chatgpt = ((t.chatgptHours || t.marketHours) * vol) / divisor;
          var qalia = (t.qaliaHours * vol) / divisor;
          totalMarket += market;
          totalChatGPT += chatgpt;
          totalQalia += qalia;
          breakdown.push({
            key: key,
            label: t.label,
            market: Math.round(market * 10) / 10,
            chatgpt: Math.round(chatgpt * 10) / 10,
            qalia: Math.round(qalia * 10) / 10,
            volume: vol,
            unitMarket: unitMarket,
            unitChatGPT: t.chatgptHours || t.marketHours,
            unitQalia: t.qaliaHours,
            frequency: t.frequency || 'per_program'
          });
        });

        // Derive programs as max per_program volume
        var maxVol = 0;
        tasks.forEach(function(key) {
          var t = TASK_CONFIG[key];
          if (t && !isFixedFreqTask(t)) {
            var v = (state.taskVolumes[key] != null) ? state.taskVolumes[key] : (t.defaultVolume || 1);
            if (v > maxVol) maxVol = v;
          }
        });
        state.programs = maxVol || 3;

        return { totalMarket: totalMarket, totalChatGPT: totalChatGPT, totalQalia: totalQalia, breakdown: breakdown };
      }

      // Remapped steps: 1=Profil, 2=Qualiopi, 3=Échéance, 4=Tarif, 5=Tâches, 6=Douleurs, 7=Bilan
      var steps = [
        document.getElementById('simStep2'),  // 1: Profil
        document.getElementById('simStep4'),  // 2: Qualiopi
        document.getElementById('simStep5'),  // 3: Échéance
        document.getElementById('simStep7'),  // 4: Tarif+Volume
        document.getElementById('simStep6'),  // 5: Tâches
        document.getElementById('simStep8'),  // 6: Douleurs
        document.getElementById('simStep9')   // 7: Bilan
      ];
      var progressSteps = document.querySelectorAll('#simProgress .sim-progress-step');
      if (!steps[0]) return;

      var STEP_LABELS = ['Profil','Qualiopi','\u00c9ch\u00e9ance','Tarif','T\u00e2ches','Douleurs','Bilan'];

      function isStepSkipped(stepNum) {
        // Allow BRANCHE overrides to force-skip specific steps
        if (state.forcedSkips && state.forcedSkips.indexOf(stepNum) !== -1) return true;
        // Step 2 (Qualiopi) : skip si TOUS les profils sont non concernés par Qualiopi
        // (contrôle pur : auditeur/certificateur/académicien)
        if (stepNum === 2) {
          var ciblesQ = state.cibles && state.cibles.length > 0 ? state.cibles : (state.cible ? [state.cible] : []);
          if (ciblesQ.length === 0) return false;
          var hasQualiopi = ciblesQ.some(function(c) { return QUALIOPI_SKIP_ROLES.indexOf(c) === -1; });
          return !hasQualiopi;
        }
        // Step 3 (Echéance) : skip if stable or no qualiopi status
        if (stepNum === 3) {
          return !state.qualiopi || state.qualiopi === 'stable' || state.qualiopi === 'aspirant' || state.qualiopi === 'non_concerne';
        }
        return false;
      }

      // getVisiblePains remplacé par getVisiblePainsDynamic() (PAIN_CONFIG)

      function getNextStep(current) {
        var next = current + 1;
        while (next <= 7 && isStepSkipped(next)) next++;
        return Math.min(next, 7);
      }

      function getPrevStep(current) {
        var prev = current - 1;
        while (prev >= 1 && isStepSkipped(prev)) prev--;
        return Math.max(prev, 1);
      }

      var _simFirstRender = true;
      function showStep(n) {
        state.step = n;
        steps.forEach(function(s, i) {
          if (i === n - 1) {
            s.classList.remove('active');
            void s.offsetHeight; // force reflow for simFadeIn re-trigger
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
        // Update progress bar : masquer les steps skippees et renumeroter
        var visibleNum = 0;
        progressSteps.forEach(function(ps, i) {
          var stepNum = i + 1;
          ps.className = 'sim-progress-step';
          if (isStepSkipped(stepNum)) {
            ps.style.display = 'none';
          } else {
            ps.style.display = '';
            visibleNum++;
            // Renumeroter dynamiquement
            var numEl = ps.querySelector('.sim-progress-num');
            if (numEl) numEl.textContent = visibleNum;
            // Mettre a jour le label
            var labelEl = ps.querySelector('.sim-progress-label');
            if (labelEl) labelEl.textContent = STEP_LABELS[i];
            if (stepNum < n) ps.classList.add('done');
            if (stepNum === n) ps.classList.add('current');
          }
        });
        // Widen sim-box for profile step and dashboard
        var simBox = document.getElementById('simBox');
        var leavingDashboard = simBox.classList.contains('sim-box-dashboard') && n !== 7;
        simBox.classList.remove('sim-box-wide', 'sim-box-dashboard');
        if (n === 1) {
          simBox.classList.add('sim-box-wide');
        } else if (n === 7) {
          simBox.classList.add('sim-box-dashboard');
        }
        // Step 6 (Douleurs) : construire dynamiquement les boutons depuis PAIN_CONFIG
        if (n === 6) {
          buildPainStep();
        }
        // Scroll to stepper on step change (skip on first render to avoid auto-scroll)
        // Instant scroll when leaving dashboard to avoid layout-shift glitch (D.O.M. collapse)
        if (_simFirstRender) {
          _simFirstRender = false;
        } else {
          var simStepper = document.getElementById('simProgress');
          if (simStepper) simStepper.scrollIntoView({ behavior: leavingDashboard ? 'instant' : 'smooth', block: 'start' });
        }
      }

      // Stepper cliquable : retour aux étapes déjà visitées
      progressSteps.forEach(function(ps) {
        ps.addEventListener('click', function() {
          if (!ps.classList.contains('done')) return;
          var stepNum = parseInt(ps.getAttribute('data-step'), 10);
          showStep(stepNum);
        });
      });

      // Utility: format number with French thousand separators
      /* Unité golden ratio pour innerHTML */
      var U = '<span class="u">';
      var _U = '</span>';
      /** @var _lastFmtHasUnit – flag set by fmtH/fmtGain when output already contains h/min */
      var _lastFmtHasUnit = false;
      function fH(s) {
        var t = _lastFmtHasUnit ? '' : (' ' + U + 'h' + _U);
        _lastFmtHasUnit = false;
        if (!s) return t;
        s = s.replace(/\/an/g, U + '/an' + _U);
        s = s.replace(/\/mois/g, U + '/mois' + _U);
        s = s.replace(/\/h\b/g, U + '/h' + _U);
        return t + (t ? s : ' ' + s);
      }
      /* Version texte brut de fH() pour les messages de partage (WhatsApp, email, etc.) */
      function fT(s) {
        var t = ' h';
        if (!s) return t;
        return t + s;
      }
      /* Supprime les balises <span class="u"> des chaînes pour le partage texte brut */
      function stripU(s) {
        return s.replace(/<span class="u"[^>]*>/g, '').replace(/<\/span>/g, '');
      }

      /**
       * Formate un nombre pour affichage HTML et canvas.
       * Remplace U+202F (narrow no-break space, quasi-invisible en HTML/canvas) par U+00A0 (espace insecable visible).
       * Correction globale : tous les separateurs de milliers sont desormais visibles partout.
       */
      function fmtNum(n, decimals) {
        var raw;
        if (typeof decimals === 'number' && decimals > 0) {
          raw = n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        } else {
          raw = Math.round(n).toLocaleString('fr-FR');
        }
        return raw.replace(/\u202f/g, '\u00a0');
      }

      /** Alias retrocompatible, fmtNum inclut desormais le remplacement U+202F. */
      function fmtCanvas(n, decimals) {
        return fmtNum(n, decimals);
      }

      /**
       * Calcule le payback en jours, modele « recuperation de cout ».
       * Mensuel : combien de jours pour couvrir UNE mensualite ?
       * Annuel  : combien de jours pour couvrir l'engagement annuel total ?
       * Garantit une differentiation ~10x entre les deux modes de facturation.
       * @returns {number} nombre de jours (0 si non rentable)
       */
      function computePaybackDays(valueSaved, annualCost, billingAnnual) {
        if (valueSaved <= 0 || annualCost <= 0) return 0;
        var dailySaving = valueSaved / 365;
        if (dailySaving <= 0) return 0;
        // Mensuel : cout a recuperer = 1 mois ; Annuel : cout = engagement 12 mois
        var costToRecover = billingAnnual ? annualCost : (annualCost / 12);
        var days = Math.ceil(costToRecover / dailySaving);
        return days > 0 ? days : 0;
      }

      /**
       * Formate le payback en label lisible et TOUJOURS differenciable.
       * Affiche le nombre exact de jours pour les paybacks courts,
       * ce qui garantit un label DIFFERENT entre mensuel (~3j) et annuel (~30j).
       */
      function formatPaybackLabel(paybackMonth, paybackDays, isProfitable) {
        if (paybackDays <= 0) return isProfitable ? '<\u00a01\u00a0an' : 'N/A';
        if (paybackDays === 1) return '1\u00a0jour';
        if (paybackDays <= 3)  return paybackDays + '\u00a0jours';
        if (paybackDays <= 7)  return '~1\u00a0sem.';
        if (paybackDays <= 14) return '~2\u00a0sem.';
        if (paybackDays <= 21) return '~3\u00a0sem.';
        if (paybackDays <= 30) return '~1\u00a0mois';
        if (paybackDays <= 60) return 'Mois\u00a02';
        if (paybackDays <= 90) return 'Mois\u00a03';
        if (paybackMonth > 0)  return 'Mois\u00a0' + paybackMonth;
        return isProfitable ? '<\u00a01\u00a0an' : 'N/A';
      }

      /**
       * Formate un nombre d'heures en format humain (h + min).
       * 0.75 → "45 min"  |  1.5 → "1 h 30"  |  8 → "8"  |  43 → "43"
       * Pas de ",0" sur les heures entières. Pas de "h" (ajouté par fH() après).
       */
      function fmtH(n) {
        if (n == null || isNaN(n)) return '0';
        var abs = Math.abs(n);
        var sign = n < 0 ? '\u2212' : '';
        var h = Math.floor(abs);
        var frac = abs - h;
        var min = Math.round(frac * 60);
        if (min === 60) { h++; min = 0; }
        if (h === 0 && min > 0) { _lastFmtHasUnit = true; return sign + min + '\u00a0' + U + 'min' + _U; }
        if (min === 0) { _lastFmtHasUnit = false; return sign + fmtNum(h); }
        _lastFmtHasUnit = true;
        return sign + fmtNum(h) + '\u00a0' + U + 'h' + _U + '\u00a0' + (min < 10 ? '0' : '') + min;
      }

      /**
       * Formate un gain annuel en heures (pour les −XXX h/an).
       * Entier si rond, sinon h+min.
       */
      function fmtGain(n) {
        var abs = Math.abs(n);
        var h = Math.floor(abs);
        var frac = abs - h;
        var min = Math.round(frac * 60);
        if (min === 60) { h++; min = 0; }
        if (min === 0) { _lastFmtHasUnit = false; return '\u2212' + fmtNum(h); }
        if (h === 0) { _lastFmtHasUnit = true; return '\u2212' + min + '\u00a0' + U + 'min' + _U; }
        _lastFmtHasUnit = true;
        return '\u2212' + fmtNum(h) + '\u00a0' + U + 'h' + _U + '\u00a0' + (min < 10 ? '0' : '') + min;
      }

      // Golden ratio font scale (descending) for auto-fit
      var _fontScale = [1.728, 1.44, 1.32, 1.2, 1, 0.833, 0.694];

      function animateValue(el, target, suffix, duration, decimals) {
        var startTime = null;
        var dec = decimals || 0;
        function tick(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          var value = eased * target;
          var display = dec > 0
            ? fmtNum(value, dec)
            : fmtNum(value);
          el.innerHTML = display + ' <span class="u">' + suffix + '</span>';
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            // Auto-fit: shrink font if value overflows its container
            fitMetricValue(el);
          }
        }
        requestAnimationFrame(tick);
      }

      function fitMetricValue(el) {
        // Only apply to metric values inside dashboard
        if (!el.closest('.sim-box-dashboard')) return;
        // Reset any previous 2-line override
        el.style.whiteSpace = 'nowrap';
        el.style.fontSize = '';
        var sm = el.querySelector('small');
        if (sm) sm.style.fontSize = '';

        var cs = getComputedStyle(el);
        var rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        var currentSize = parseFloat(cs.fontSize) / rootSize;
        // Find current position in scale
        var idx = 0;
        for (var i = 0; i < _fontScale.length; i++) {
          if (Math.abs(_fontScale[i] - currentSize) < 0.05) { idx = i; break; }
        }
        // Shrink until it fits or we hit minimum
        while (el.scrollWidth > el.clientWidth + 2 && idx < _fontScale.length - 1) {
          idx++;
          el.style.fontSize = _fontScale[idx] + 'rem';
          if (sm) sm.style.fontSize = _fontScale[Math.min(idx + 2, _fontScale.length - 1)] + 'rem';
        }
        // If still overflowing at minimum font, allow 2-line wrap
        if (el.scrollWidth > el.clientWidth + 2) {
          el.style.whiteSpace = 'normal';
          el.style.lineHeight = '1.2';
          el.style.overflowWrap = 'break-word';
        }
      }

      // --- Couleur dynamique des sliders ---
      // TJM : rouge fonce (20) -> blanc (70) -> vert fonce (200)
      // Echeance : rouge (1 mois, urgent) -> vert (24 mois, serein)
      // Autres : vert -> bleu-canard -> orange
      function updateSliderColor(slider) {
        var min = parseFloat(slider.min);
        var max = parseFloat(slider.max);
        var val = parseFloat(slider.value);
        var pct = (val - min) / (max - min) * 100;
        var r, g, b;
        var isTjm = slider.id === 'simTjm';
        var isEcheance = slider.id === 'simEcheance';
        if (isTjm) {
          // TJM : rouge fonce (#C0392B) a 20, blanc (#e0e0e0) a 70, vert fonce (#2E7D5B) a 200
          var pivotVal = 70;
          var pivotPct = (pivotVal - min) / (max - min);
          var ratio = (val - min) / (max - min);
          if (ratio <= pivotPct) {
            // rouge fonce (#C0392B) -> blanc/neutre (#e0e0e0)
            var t = ratio / pivotPct;
            r = Math.round(192 + (224 - 192) * t);
            g = Math.round(57 + (224 - 57) * t);
            b = Math.round(43 + (224 - 43) * t);
          } else {
            // blanc/neutre (#e0e0e0) -> vert fonce (#2E7D5B)
            var t2 = (ratio - pivotPct) / (1 - pivotPct);
            r = Math.round(224 + (46 - 224) * t2);
            g = Math.round(224 + (125 - 224) * t2);
            b = Math.round(224 + (91 - 224) * t2);
          }
        } else if (isEcheance) {
          // Echeance : pivot a 5 mois (source : delais marche Qualiopi)
          // < 3 mois = rouge critique, 3-5 = orange, > 5 = vert
          var echPivot = 5;
          var echPivotPct = (echPivot - min) / (max - min);
          var echRatio = (val - min) / (max - min);
          if (echRatio <= echPivotPct) {
            // rouge fonce (#C0392B) -> blanc/neutre (#e0e0e0)
            var t = echRatio / echPivotPct;
            r = Math.round(192 + (224 - 192) * t);
            g = Math.round(57 + (224 - 57) * t);
            b = Math.round(43 + (224 - 43) * t);
          } else {
            // blanc/neutre (#e0e0e0) -> vert fonce (#2E7D5B)
            var t2 = (echRatio - echPivotPct) / (1 - echPivotPct);
            r = Math.round(224 + (46 - 224) * t2);
            g = Math.round(224 + (125 - 224) * t2);
            b = Math.round(224 + (91 - 224) * t2);
          }
        } else {
          if (pct <= 50) {
            // vert (#4ECDC4) -> bleu-canard (#1B7E94)
            var t = pct / 50;
            r = Math.round(78 + (27 - 78) * t);
            g = Math.round(205 + (126 - 205) * t);
            b = Math.round(196 + (148 - 196) * t);
          } else {
            // bleu-canard (#1B7E94) -> orange (#e07040)
            var t2 = (pct - 50) / 50;
            r = Math.round(27 + (224 - 27) * t2);
            g = Math.round(126 + (112 - 126) * t2);
            b = Math.round(148 + (64 - 148) * t2);
          }
        }
        var color = 'rgb(' + r + ',' + g + ',' + b + ')';
        if (isTjm) {
          // Gradient rouge fonce -> blanc au pivot -> vert fonce
          var pivotPctCSS = ((70 - min) / (max - min) * 100);
          if (pct <= pivotPctCSS) {
            slider.style.background = 'linear-gradient(to right, #C0392B 0%, ' + color + ' ' + pct + '%, #e0e0e0 ' + pct + '%, #e0e0e0 100%)';
          } else {
            slider.style.background = 'linear-gradient(to right, #C0392B 0%, #e0e0e0 ' + pivotPctCSS + '%, ' + color + ' ' + pct + '%, #e0e0e0 ' + pct + '%, #e0e0e0 100%)';
          }
        } else if (isEcheance) {
          // Echeance : rouge -> blanc au pivot (5 mois) -> vert
          var echPivotPctCSS = ((5 - min) / (max - min) * 100);
          if (pct <= echPivotPctCSS) {
            slider.style.background = 'linear-gradient(to right, #C0392B 0%, ' + color + ' ' + pct + '%, #e0e0e0 ' + pct + '%, #e0e0e0 100%)';
          } else {
            slider.style.background = 'linear-gradient(to right, #C0392B 0%, #e0e0e0 ' + echPivotPctCSS + '%, ' + color + ' ' + pct + '%, #e0e0e0 ' + pct + '%, #e0e0e0 100%)';
          }
        } else {
          var startColor = 'rgb(78,205,196)';
          slider.style.background = 'linear-gradient(to right, ' + startColor + ' 0%, ' + color + ' ' + pct + '%, #e0e0e0 ' + pct + '%, #e0e0e0 100%)';
        }
      }

      // Appliquer la couleur a tous les sliders au chargement
      function initSliderColors() {
        document.querySelectorAll('.sim-slider').forEach(function(s) {
          updateSliderColor(s);
        });
      }

      // === STEP 1 : Volume (calibres 1, 2-4, 5-10, +10) ===
      var choices1 = document.querySelectorAll('#simChoices1 .sim-choice');
      var next1 = document.getElementById('simNext1');
      choices1.forEach(function(btn) {
        btn.addEventListener('click', function() {
          choices1.forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.programs = parseInt(btn.getAttribute('data-value'), 10);
          next1.disabled = false;
        });
      });
      next1.addEventListener('click', function() { if (state.programs) showStep(2); });

      // === STEP 1 (Roles) : Identification cible (12 profils, multi-selection) + ETP ===
      function buildEtpSection() {
        var section = document.getElementById('simEtpSection');
        var container = document.getElementById('simEtpInputs');
        var totalEl = document.getElementById('simEtpTotal');
        if (!section || !container) return;
        if (state.cibles.length === 0) {
          section.style.display = 'none';
          return;
        }
        section.style.display = '';
        var html = '';
        state.cibles.forEach(function(role) {
          var label = PROFILE_LABELS[role] || role;
          var count = state.teamBreakdown[role] || 1;
          var maxRole = MAX_ETP_PER_ROLE[role] || 50;
          var avgRole = SECTOR_AVG_ETP[role] || '';
          var avgHint = avgRole ? ' <span style="color:var(--gris); font-size:var(--fs-caption);" title="Moyenne secteur formation (source\u00a0: Panorama branche 2024)">moy.\u00a0' + avgRole + '</span>' : '';
          html += '<div style="display:flex; align-items:center; gap:var(--space-xs); margin-bottom:var(--space-2xs);">'
            + '<span style="font-size:var(--fs-small); flex:1; color:var(--noir);">' + label + avgHint + '</span>'
            + '<button class="sim-etp-minus" data-role="' + role + '" style="width:32px; height:32px; border:1px solid var(--gris-clair); border-radius:0.75rem; background:#fff; cursor:pointer; font-size:var(--fs-body); line-height:1; flex-shrink:0;">\u2212</button>'
            + '<input type="number" class="sim-etp-input" data-role="' + role + '" value="' + count + '" min="1" max="' + maxRole + '" style="width:52px; text-align:center; font-size:var(--fs-body); font-weight:700; color:var(--bleu-canard); border:1px solid var(--gris-clair); border-radius:0.75rem; padding:2px 4px; -moz-appearance:textfield; appearance:textfield; flex-shrink:0;">'
            + '<button class="sim-etp-plus" data-role="' + role + '" style="width:32px; height:32px; border:1px solid var(--gris-clair); border-radius:0.75rem; background:#fff; cursor:pointer; font-size:var(--fs-body); line-height:1; flex-shrink:0;">+</button>'
            + '</div>';
        });
        container.innerHTML = html;
        // Bind +/- buttons
        container.querySelectorAll('.sim-etp-minus').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var role = btn.getAttribute('data-role');
            var cur = state.teamBreakdown[role] || 1;
            if (cur > 1) {
              state.teamBreakdown[role] = cur - 1;
              var inp = container.querySelector('.sim-etp-input[data-role="' + role + '"]');
              if (inp) inp.value = state.teamBreakdown[role];
              updateEtpTotal();
            } else {
              // cur === 1 : retirer le profil
              delete state.teamBreakdown[role];
              var idx = state.cibles.indexOf(role);
              if (idx > -1) state.cibles.splice(idx, 1);
              state.cible = state.cibles.length > 0 ? state.cibles[0] : null;
              // Désélectionner visuellement le bouton profil
              var profileBtn = document.querySelector('#simChoicesCible .sim-choice[data-value="' + role + '"]');
              if (profileBtn) profileBtn.classList.remove('selected');
              // Désactiver Suivant si plus aucun profil
              var next2 = document.getElementById('simNext2');
              if (next2) next2.disabled = state.cibles.length === 0;
              // Reconstruire la section ETP
              buildEtpSection();
              syncSimToProfiles();
            }
          });
        });
        container.querySelectorAll('.sim-etp-plus').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var role = btn.getAttribute('data-role');
            var cur = state.teamBreakdown[role] || 1;
            var maxRole = MAX_ETP_PER_ROLE[role] || 50;
            if (cur >= maxRole) return; // Plafond atteint
            state.teamBreakdown[role] = cur + 1;
            var inp = container.querySelector('.sim-etp-input[data-role="' + role + '"]');
            if (inp) inp.value = state.teamBreakdown[role];
            updateEtpTotal();
          });
        });
        // Bind direct input
        container.querySelectorAll('.sim-etp-input').forEach(function(inp) {
          inp.addEventListener('change', function() {
            var role = inp.getAttribute('data-role');
            var val = parseInt(inp.value, 10);
            var maxRole = MAX_ETP_PER_ROLE[role] || 50;
            if (isNaN(val) || val < 1) val = 1;
            if (val > maxRole) val = maxRole;
            inp.value = val;
            state.teamBreakdown[role] = val;
            updateEtpTotal();
          });
        });
        function updateEtpTotal() {
          var total = 0;
          state.cibles.forEach(function(c) { total += (state.teamBreakdown[c] || 1); });
          // Plafond total tous r\u00f4les confondus
          if (total > MAX_ETP_TOTAL) {
            // R\u00e9duire proportionnellement le dernier r\u00f4le modifi\u00e9
            var excess = total - MAX_ETP_TOTAL;
            for (var i = state.cibles.length - 1; i >= 0 && excess > 0; i--) {
              var c = state.cibles[i];
              var cur = state.teamBreakdown[c] || 1;
              var reduce = Math.min(excess, cur - 1);
              if (reduce > 0) {
                state.teamBreakdown[c] = cur - reduce;
                var inp = container.querySelector('.sim-etp-input[data-role="' + c + '"]');
                if (inp) inp.value = state.teamBreakdown[c];
                excess -= reduce;
              }
            }
            total = MAX_ETP_TOTAL;
          }
          // Synchroniser state.tailleEquipe avec le total plafonn\u00e9
          state.tailleEquipe = total;
          state.pourQui = total > 1 ? 'equipe' : 'self';
          updateBusinessVisibility();
          if (total > 1) {
            var msg = 'Total\u00a0: ' + fmtNum(total) + ' personnes';
            if (total >= MAX_ETP_TOTAL) msg += ' (maximum)';
            else msg += ' (mode \u00e9quipe)';
            totalEl.textContent = msg;
            totalEl.style.color = total >= MAX_ETP_TOTAL ? 'var(--erreur)' : 'var(--bleu-canard)';
            totalEl.style.fontWeight = '600';
          } else {
            totalEl.textContent = '';
          }
        }
        // Initial total display
        updateEtpTotal();
      }

      var choicesCible = document.querySelectorAll('#simChoicesCible .sim-choice');
      var next2 = document.getElementById('simNext2');
      state.cibles = [];

      function syncSimToProfiles() {
        if (window._qaliaSyncing) return;
        window._qaliaSyncing = true;
        // Déléguer au profile router via son API publique
        if (window.__profileRouter && window.__profileRouter.setProfilesBySimValues) {
          window.__profileRouter.setProfilesBySimValues(state.cibles);
        }
        window._qaliaSyncing = false;
      }

      choicesCible.forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Multi-sélection : toggle le profil cliqué
          var val = btn.getAttribute('data-value');
          var idx = state.cibles.indexOf(val);
          if (idx !== -1) {
            // Désélectionner
            btn.classList.remove('selected');
            state.cibles.splice(idx, 1);
            delete state.teamBreakdown[val];
          } else {
            // Sélectionner
            btn.classList.add('selected');
            state.cibles.push(val);
            state.teamBreakdown[val] = 1;
          }
          state.cible = state.cibles.length > 0 ? state.cibles[0] : null;
          next2.disabled = state.cibles.length === 0;
          buildEtpSection();
          // Synchroniser vers les profils cards
          syncSimToProfiles();
        });
      });
      next2.addEventListener('click', function() {
        if (state.cibles.length === 0 && !state.cible) return;
        // Auto-detect team mode from ETP inputs
        var totalEtp = 0;
        var cibles = state.cibles.length > 0 ? state.cibles : [state.cible];
        cibles.forEach(function(c) {
          totalEtp += (state.teamBreakdown[c] || 1);
        });
        if (totalEtp > MAX_ETP_TOTAL) totalEtp = MAX_ETP_TOTAL;
        state.tailleEquipe = totalEtp;
        state.pourQui = totalEtp > 1 ? 'equipe' : 'self';
        updateBusinessVisibility();
        // Set default tasks based on merged profiles (CORE only, FREQUENT dans le dropdown)
        var mergedTasks = [];
        var maxHours = 0;
        cibles.forEach(function(c) {
          var p = PROFILE_DEFAULTS[c] || PROFILE_DEFAULTS.formateur;
          p.core.forEach(function(k) {
            if (mergedTasks.indexOf(k) === -1) mergedTasks.push(k);
          });
          if (p.defaultHours > maxHours) maxHours = p.defaultHours;
        });
        state.tasks = mergedTasks;
        state.totalHoursPerProgram = maxHours;
        // Set profile-appropriate default volumes (market trends)
        var maxProfileVol = 3;
        cibles.forEach(function(c) {
          var pv = PROFILE_VOLUMES[c] || 3;
          if (pv > maxProfileVol) maxProfileVol = pv;
        });
        mergedTasks.forEach(function(key) {
          var t = TASK_CONFIG[key];
          if (t) {
            var etp = state.tailleEquipe || 1;
            state.taskVolumes[key] = isFixedFreqTask(t) ? (t.defaultVolume || 1) : maxProfileVol * etp;
          }
        });
        buildTaskStep();
        // Si Qualiopi est skippé (profils non concernés), forcer non_concerne
        if (isStepSkipped(2)) {
          state.qualiopi = 'non_concerne';
        }
        showStep(getNextStep(1));
      });
      // Step 1 has no back button
      var back2Btn = document.getElementById('simBack2');
      if (back2Btn) back2Btn.style.display = 'none';

      // === STEP 3 : Pour qui (conditionnel) ===
      var choicesPourQui = document.querySelectorAll('#simChoicesPourQui .sim-choice');
      var next3 = document.getElementById('simNext3');
      var teamSizeWrap = document.getElementById('simTeamSizeWrap');
      var teamSizeSlider = document.getElementById('simTeamSize');
      var teamSizeDisplay = document.getElementById('simTeamSizeDisplay');

      var teamRoleBreakdown = document.getElementById('simTeamRoleBreakdown');

      function buildTeamBreakdown() {
        if (!teamRoleBreakdown) return;
        var roles = state.cibles && state.cibles.length > 1 ? state.cibles : [];
        if (roles.length <= 1) {
          teamRoleBreakdown.style.display = 'none';
          state.teamBreakdown = {};
          return;
        }
        teamRoleBreakdown.style.display = '';
        // Distribute total evenly by default
        var total = state.tailleEquipe;
        var base = Math.floor(total / roles.length);
        var remainder = total - (base * roles.length);
        state.teamBreakdown = {};
        var html = '<div style="font-size:var(--fs-small); color:var(--gris); font-weight:600; margin-bottom:var(--space-xs);">R\u00e9partition par r\u00f4le\u00a0:</div>';
        roles.forEach(function(role, idx) {
          var count = base + (idx < remainder ? 1 : 0);
          state.teamBreakdown[role] = count;
          var label = PROFILE_LABELS[role] || role;
          html += '<div style="display:flex; align-items:center; gap:var(--space-xs); margin-bottom:var(--space-2xs);">'
            + '<span style="font-size:var(--fs-small); min-width:120px; color:var(--noir);">' + label + '</span>'
            + '<input type="range" class="sim-slider sim-team-role-slider" data-role="' + role + '" min="0" max="' + total + '" value="' + count + '" step="1" style="flex:1; height:6px;">'
            + '<span class="sim-team-role-count" data-role="' + role + '" style="font-size:var(--fs-small); font-weight:700; color:var(--bleu-canard); min-width:24px; text-align:right;">' + count + '</span>'
            + '</div>';
        });
        html += '<div style="font-size:var(--fs-small); color:var(--gris); margin-top:var(--space-2xs);" id="simTeamBreakdownTotal">Total\u00a0: ' + fmtNum(total) + '</div>';
        teamRoleBreakdown.innerHTML = html;

        // Bind sub-sliders
        var roleSliders = teamRoleBreakdown.querySelectorAll('.sim-team-role-slider');
        roleSliders.forEach(function(sl) {
          sl.addEventListener('input', function() {
            var changedRole = sl.getAttribute('data-role');
            var newVal = parseInt(sl.value, 10);
            state.teamBreakdown[changedRole] = newVal;
            // Recalc total from breakdown (plafonn\u00e9)
            var sum = 0;
            for (var r in state.teamBreakdown) { sum += state.teamBreakdown[r]; }
            if (sum > MAX_ETP_TOTAL) sum = MAX_ETP_TOTAL;
            state.tailleEquipe = sum;
            teamSizeSlider.value = sum;
            teamSizeDisplay.innerHTML = fmtNum(sum) + ' <small>personnes</small>';
            updateSliderColor(teamSizeSlider);
            // Update count display
            var countEl = teamRoleBreakdown.querySelector('.sim-team-role-count[data-role="' + changedRole + '"]');
            if (countEl) countEl.textContent = newVal;
            // Update max on all sliders
            roleSliders.forEach(function(s) { s.max = Math.max(sum, 500); });
            var totalEl = document.getElementById('simTeamBreakdownTotal');
            if (totalEl) totalEl.textContent = 'Total\u00a0: ' + fmtNum(sum);
          });
        });
      }

      choicesPourQui.forEach(function(btn) {
        btn.addEventListener('click', function() {
          choicesPourQui.forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.pourQui = btn.getAttribute('data-value');
          updateBusinessVisibility();
          next3.disabled = false;
          teamSizeWrap.style.display = state.pourQui === 'equipe' ? '' : 'none';
          if (state.pourQui === 'equipe') buildTeamBreakdown();
        });
      });
      if (teamSizeSlider) {
        teamSizeSlider.addEventListener('input', function() {
          state.tailleEquipe = Math.min(parseInt(this.value, 10), MAX_ETP_TOTAL);
          teamSizeDisplay.innerHTML = fmtNum(state.tailleEquipe) + ' <small>personnes</small>';
          this.setAttribute('aria-valuenow', state.tailleEquipe);
          this.setAttribute('aria-valuetext', state.tailleEquipe + ' personnes');
          updateSliderColor(this);
          buildTeamBreakdown();
        });
      }
      next3.addEventListener('click', function() {
        if (!state.pourQui) return;
        showStep(getNextStep(2));
      });
      document.getElementById('simBack3').addEventListener('click', function() { showStep(getPrevStep(2)); });

      // === Cycle Qualiopi dynamique (adapte le contenu selon le statut) ===
      var CYCLE_CONTENT = {
        aspirant: {
          title: 'Qualiopi est un marathon, pas un sprint',
          intro: 'Obtenir Qualiopi n\u2019est que la premi\u00e8re \u00e9tape. D\u00e8s la certification, un cycle permanent s\u2019enclenche\u00a0: surveillance, renouvellement, \u00e9volutions r\u00e9glementaires. Qalia vous pr\u00e9pare d\u00e8s le d\u00e9part pour chaque \u00e9ch\u00e9ance.',
          highlight: 0
        },
        initial: {
          title: 'Votre audit initial approche\u00a0: chaque livrable compte',
          intro: 'L\u2019audit initial est le plus exigeant\u00a0: tous les indicateurs sont \u00e9valu\u00e9s. Apr\u00e8s cette \u00e9tape, le cycle Qualiopi continue avec surveillance et renouvellement. Qalia structure vos dossiers pour passer chaque \u00e9ch\u00e9ance sereinement.',
          highlight: 0
        },
        surveillance: {
          title: 'Surveillance \u00e0 M+18\u00a0: restez pr\u00eat en continu',
          intro: 'L\u2019audit de surveillance approche. 14 \u00e0 22 mois apr\u00e8s la certification, l\u2019auditeur v\u00e9rifie que votre d\u00e9marche qualit\u00e9 vit. Avec Qalia, chaque nouveau dossier maintient votre conformit\u00e9 documentaire \u00e0 jour.',
          highlight: 1
        },
        stable: {
          title: 'Certifi\u00e9 stable\u00a0: pourquoi chaque mois compte',
          intro: 'Pas d\u2019\u00e9ch\u00e9ance imm\u00e9diate, mais le cycle ne s\u2019arr\u00eate pas. Chaque nouveau programme, chaque \u00e9volution r\u00e9glementaire doit \u00eatre document\u00e9e. Qalia maintient votre conformit\u00e9 sans effort suppl\u00e9mentaire.',
          highlight: 3
        },
        renouvellement: {
          title: 'Renouvellement \u00e0 3 ans\u00a0: le r\u00e9f\u00e9rentiel est re-audit\u00e9 de z\u00e9ro',
          intro: 'Le renouvellement est un audit complet\u00a0: tous les indicateurs sont r\u00e9\u00e9valu\u00e9s depuis la derni\u00e8re certification. Qalia assure que 3 ans de dossiers sont structur\u00e9s et tra\u00e7ables.',
          highlight: 2
        }
      };

      function updateCycleQualiopi(status) {
        var cw = document.getElementById('roiCycleWrap');
        if (!cw) return;
        if (!status || status === 'non_concerne') {
          cw.style.display = 'none';
          return;
        }
        cw.style.display = '';
        var content = CYCLE_CONTENT[status];
        if (!content) return;
        // Mettre a jour titre et intro
        var h3 = cw.querySelector('h3');
        var intro = cw.querySelector(':scope > p');
        if (h3) h3.textContent = content.title;
        if (intro) intro.innerHTML = content.intro;
        // Mettre en surbrillance l'item pertinent
        var items = cw.querySelectorAll('.cycle-item');
        for (var i = 0; i < items.length; i++) {
          items[i].classList.toggle('cycle-item--highlight', i === content.highlight);
        }
      }

      // === STEP 4 : Statut Qualiopi ===
      var choicesQualiopi = document.querySelectorAll('#simChoicesQualiopi .sim-choice');
      var next4 = document.getElementById('simNext4');
      choicesQualiopi.forEach(function(btn) {
        btn.addEventListener('click', function() {
          choicesQualiopi.forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.qualiopi = btn.getAttribute('data-value');
          next4.disabled = false;
          // Mise a jour preventive et dynamique du cycle Qualiopi
          updateCycleQualiopi(state.qualiopi);
        });
      });
      next4.addEventListener('click', function() {
        if (!state.qualiopi) return;
        initSliderColors();
        showStep(getNextStep(2));
        // Pré-initialiser les inputs TJM par rôle pour l'étape Tarif
        if (typeof buildTjmByRoleInputs === 'function') buildTjmByRoleInputs();
      });
      document.getElementById('simBack4').addEventListener('click', function() { showStep(getPrevStep(2)); });

      // === STEP 5 : Echeance (conditionnel) ===
      var echeanceSlider = document.getElementById('simEcheance');
      var echeanceDisplay = document.getElementById('simEcheanceDisplay');
      if (echeanceSlider) {
        echeanceSlider.addEventListener('input', function() {
          state.echeanceMois = parseInt(this.value, 10);
          echeanceDisplay.innerHTML = state.echeanceMois + ' <span class="u">mois</span>';
          this.setAttribute('aria-valuenow', state.echeanceMois);
          this.setAttribute('aria-valuetext', state.echeanceMois + ' <span class="u">mois</span>');
          updateSliderColor(this);
        });
      }
      document.getElementById('simNext5').addEventListener('click', function() { showStep(getNextStep(3)); });
      document.getElementById('simBack5').addEventListener('click', function() { showStep(getPrevStep(3)); });

      // === STEP 2 : T\u00e2ches avec volume ind\u00e9pendant par t\u00e2che ===
      function buildTaskStep() {
        // Use state.tasks as source of truth (set by next2 click handler or user interactions)
        // Remove duplicates if any
        var seen = {};
        state.tasks = state.tasks.filter(function(k) {
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });
        var activeTasks = state.tasks;

        // Set default volumes for tasks not yet customized
        activeTasks.forEach(function(key) {
          if (!state.taskVolumes[key]) {
            state.taskVolumes[key] = TASK_CONFIG[key].defaultVolume || 3;
          }
        });

        // === Role toggle bar (select/deselect roles) ===
        var roleTogglesDiv = document.getElementById('simRoleToggles');
        if (roleTogglesDiv) {
          roleTogglesDiv.innerHTML = '';
          // Catégories des profils sim (5 fantômes supprimés 2026-04-02)
          var SIM_CATS = {
            formateur: 1, coach: 1, enseignant: 1, ingenieurPeda: 1,
            consultantBilan: 2,
            accompagnateurVAE: 3,
            directeurCFA: 4, maitreApprentissage: 4,
            directeurOF: 5, qualite: 5
          };
          // Profils par catégorie (ordre d'affichage)
          var CATS_ROLES = {
            1: ['formateur', 'coach', 'enseignant', 'ingenieurPeda'],
            2: ['consultantBilan'],
            3: ['accompagnateurVAE'],
            4: ['directeurCFA', 'maitreApprentissage'],
            5: ['directeurOF', 'qualite']
          };
          var activeCibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
          // Identifier les catégories touchées par la sélection
          var activeCats = {};
          activeCibles.forEach(function(r) {
            var cat = SIM_CATS[r];
            if (cat) activeCats[cat] = true;
          });
          // Profils transversaux : croiser avec le catSelector du Profile Router
          var TRANSVERSAL_TOGGLE = ['directeurOF', 'qualite'];
          var hasTransversal = activeCibles.some(function(c) { return TRANSVERSAL_TOGGLE.indexOf(c) !== -1; });
          if (hasTransversal) {
            try {
              var routerCats = sessionStorage.getItem('qalia_cat_selector');
              if (routerCats) {
                JSON.parse(routerCats).forEach(function(c) { activeCats[Number(c)] = true; });
              }
            } catch(e) {}
          }
          // Règle gouvernance transversale : 2+ profils → afficher Cat 5 (direction/qualité)
          if (activeCibles.length >= 2) activeCats[5] = true;
          // Construire allRoles : tous les profils des catégories touchées
          var allRoles = [];
          var catOrder = [1, 2, 3, 4, 5];
          catOrder.forEach(function(cat) {
            if (!activeCats[cat]) return;
            CATS_ROLES[cat].forEach(function(r) {
              if (allRoles.indexOf(r) === -1) allRoles.push(r);
            });
          });
          // Règle 5 : compteur de profils actifs
          var counterSpan = document.createElement('span');
          counterSpan.className = 'sim-role-counter';
          counterSpan.textContent = activeCibles.length + ' profil' + (activeCibles.length > 1 ? 's' : '') + ' actif' + (activeCibles.length > 1 ? 's' : '');
          roleTogglesDiv.appendChild(counterSpan);
          allRoles.forEach(function(role) {
            var tag = document.createElement('button');
            tag.type = 'button';
            tag.className = 'sim-role-toggle' + (activeCibles.indexOf(role) > -1 ? ' active' : '');
            tag.textContent = PROFILE_LABELS[role] || role;
            tag.setAttribute('data-role', role);
            tag.addEventListener('click', function() {
              // Multi-sélection : toggle le profil cliqué
              var idx = state.cibles.indexOf(role);
              if (idx > -1) {
                // Empêcher de tout désélectionner (min 1 profil actif)
                if (state.cibles.length <= 1) return;
                state.cibles.splice(idx, 1);
              } else {
                state.cibles.push(role);
              }
              state.cible = state.cibles[0];
              // Recalculate tasks as union of CORE profiles only (FREQUENT dans le dropdown)
              var mergedTasks = [];
              state.cibles.forEach(function(c) {
                var p = PROFILE_DEFAULTS[c] || PROFILE_DEFAULTS.formateur;
                p.core.forEach(function(k) {
                  if (mergedTasks.indexOf(k) === -1) mergedTasks.push(k);
                });
              });
              state.tasks = mergedTasks;
              buildTaskStep();
              // Synchroniser vers les profils cards
              syncSimToProfiles();
            });
            roleTogglesDiv.appendChild(tag);
          });
        }

        var cardsDiv = document.getElementById('simTaskCards');
        cardsDiv.innerHTML = '';

        // Helper : get roles that use a given task key
        function getTaskRoles(key) {
          var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
          var roles = [];
          cibles.forEach(function(role) {
            var p = PROFILE_DEFAULTS[role] || PROFILE_DEFAULTS.formateur;
            if (p.core.indexOf(key) > -1 || p.frequent.indexOf(key) > -1) {
              roles.push(role);
            }
          });
          return roles;
        }

        // Helper : render a single task card
        function renderTaskCard(key, parent) {
          var t = TASK_CONFIG[key];
          if (!t) return;
          // Volume scales with team size (each ETP produces programs independently)
          var etp = state.tailleEquipe || 1;
          var baseVol = t.defaultVolume || 1;
          var vol = (state.taskVolumes[key] != null) ? state.taskVolumes[key] : (isFixedFreqTask(t) ? baseVol : baseVol * etp);
          var volMax = isFixedFreqTask(t) ? Math.max(12, etp) : Math.max(50, etp * 20);
          var mktH = state.taskMarketHours[key] || t.marketHours;
          var totalMarket = mktH * vol;
          var totalQalia = t.qaliaHours * vol;
          var gain = totalMarket - totalQalia;
          var freqUnit = t.frequency === 'per_audit' ? ' /cycle 3\u00a0ans' : (t.frequency === 'annual' ? '/an' : ' <span class="u">fois/an</span>');
          var tooltipHtml = '';
          if (t.tooltip) {
            tooltipHtml = ' <span class="sim-task-info-trigger">?<span class="sim-task-info-tooltip">' + t.tooltip + '</span></span>';
          }
          // Role badges for multi-role (truncate when > maxVisible)
          var badgesHtml = '';
          var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [];
          if (cibles.length > 1) {
            var taskRoles = getTaskRoles(key);
            if (taskRoles.length > 0) {
              var maxVisible = cibles.length > 4 ? 3 : taskRoles.length;
              badgesHtml = '<div class="sim-task-role-badges">';
              taskRoles.slice(0, maxVisible).forEach(function(r) {
                badgesHtml += '<span class="sim-task-role-badge">' + (PROFILE_LABELS[r] || r) + '</span>';
              });
              if (taskRoles.length > maxVisible) {
                var hiddenNames = taskRoles.slice(maxVisible).map(function(r) { return PROFILE_LABELS[r] || r; }).join(', ');
                badgesHtml += '<span class="sim-task-role-badge sim-task-role-badge--more" title="' + hiddenNames + '">+' + (taskRoles.length - maxVisible) + '</span>';
              }
              badgesHtml += '</div>';
            }
          }
          var card = document.createElement('div');
          card.className = 'sim-task-card';
          card.style.cssText = 'padding:var(--space-sm); margin-bottom:var(--space-xs); background:var(--blanc-casse); border-radius:10px; border:1px solid var(--gris-clair);';
          card.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2xs); gap:var(--space-sm);">'
            + '<label style="font-size:var(--fs-small); font-weight:600; color:var(--noir); display:flex; align-items:center; gap:var(--space-2xs); white-space:nowrap; flex-shrink:0;">'
            + '<input type="checkbox" checked data-task="' + key + '" style="accent-color:var(--bleu-canard);">'
            + t.label + tooltipHtml + '</label>'
            + badgesHtml
            + '</div>'
            + '<div class="sim-task-grid">'
            + '<span><input type="number" class="sim-task-vol" data-task="' + key + '" value="' + vol + '" min="1" max="' + volMax + '" '
            + 'style="width:60px; text-align:center; border:1px solid var(--gris-clair); border-radius:0.75rem; padding:2px 4px; font-size:var(--fs-small); font-weight:600; color:var(--bleu-canard);">'
            + freqUnit + '</span>'
            + '<span>Sans IA\u00a0: <input type="number" class="sim-task-market" data-task="' + key + '" value="' + (state.taskMarketHours[key] || t.marketHours) + '" min="0.5" max="200" step="0.5" '
            + 'style="width:60px; text-align:center; border:1px solid var(--gris-clair); border-radius:0.75rem; padding:2px 4px; font-size:var(--fs-small); font-weight:600; color:var(--bordeaux);">'
            + fH('</span>')
            + '<span>Qalia\u00a0: <strong style="color:var(--bleu-canard);">' + fmtH(t.qaliaHours) + fH('</strong></span>')
            + '<span style="color:var(--succes); font-weight:600;">' + fmtGain(gain) + fH('/an</span>')
            + '</div>';
          parent.appendChild(card);
        }

        // Helper : render a section header
        function renderSectionHeader(text, parent) {
          var h = document.createElement('div');
          h.style.cssText = 'font-size:var(--fs-caption); font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--bleu-canard); margin:var(--space-sm) 0 var(--space-2xs); padding-bottom:var(--space-3xs); border-bottom:1px solid rgba(27,126,148,0.15);';
          h.textContent = text;
          parent.appendChild(h);
        }

        // Flat list grouped by level (core/frequent/advanced) with role badges
        // This ensures all roles are visible even when tasks overlap (transversal tasks)
        var cibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        var coreKeys = [];
        var freqKeys = [];
        var otherKeys = [];
        activeTasks.forEach(function(k) {
          var cfg = TASK_CONFIG[k];
          if (!cfg) return;
          if (cfg.level === 'core') coreKeys.push(k);
          else if (cfg.level === 'frequent') freqKeys.push(k);
          else otherKeys.push(k);
        });

        if (coreKeys.length > 0) {
          renderSectionHeader('T\u00e2ches principales', cardsDiv);
          coreKeys.forEach(function(k) { renderTaskCard(k, cardsDiv); });
        }
        if (freqKeys.length > 0) {
          renderSectionHeader('T\u00e2ches fr\u00e9quentes', cardsDiv);
          freqKeys.forEach(function(k) { renderTaskCard(k, cardsDiv); });
        }
        if (otherKeys.length > 0) {
          renderSectionHeader('Autres t\u00e2ches', cardsDiv);
          otherKeys.forEach(function(k) { renderTaskCard(k, cardsDiv); });
        }

        // === Dropdown : FREQUENT tasks (avec volumes résiduels) + autres tâches ===
        var advDiv = document.getElementById('simTasksAdvanced');
        advDiv.innerHTML = '';
        var usedKeys = activeTasks;
        var profileKeys = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];

        // 1. Collecter les tâches FREQUENT des profils actifs (non déjà dans CORE)
        var frequentKeys = [];
        profileKeys.forEach(function(pk) {
          var p = PROFILE_DEFAULTS[pk] || PROFILE_DEFAULTS.formateur;
          (p.frequent || []).forEach(function(k) {
            if (frequentKeys.indexOf(k) === -1 && usedKeys.indexOf(k) === -1) {
              frequentKeys.push(k);
            }
          });
        });

        // 2. Afficher les FREQUENT avec volume résiduel
        if (frequentKeys.length > 0) {
          var freqHeader = document.createElement('div');
          freqHeader.style.cssText = 'font-size:var(--fs-caption); font-weight:600; color:var(--bleu-canard); margin-bottom:var(--space-2xs); opacity:0.8;';
          freqHeader.textContent = 'T\u00e2ches fr\u00e9quentes de vos profils';
          advDiv.appendChild(freqHeader);
        }
        frequentKeys.forEach(function(key) {
          var t = TASK_CONFIG[key];
          if (!t) return;
          var displayVol = getResidualVolume(key, profileKeys);
          var isProfileFrequent = true;
          var label = document.createElement('label');
          label.className = 'sim-task-check sim-task-frequent';
          label.style.cssText = 'display:flex; align-items:center; gap:var(--space-xs); padding:var(--space-2xs) 0; font-size:var(--fs-small);';
          label.setAttribute('data-residual', displayVol);
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = false;
          if (displayVol === 0) { cb.disabled = true; cb.style.opacity = '0.4'; label.style.opacity = '0.6'; label.title = 'Volume enti\u00e8rement couvert par vos t\u00e2ches principales'; }
          cb.setAttribute('data-task', key);
          cb.addEventListener('change', function() {
            if (this.checked) {
              if (state.tasks.indexOf(key) === -1) {
                state.tasks.push(key);
              }
              state.taskVolumes[key] = displayVol;
            } else {
              var idx = state.tasks.indexOf(key);
              if (idx > -1) state.tasks.splice(idx, 1);
              delete state.taskVolumes[key];
            }
            buildTaskStep();
          });
          label.appendChild(cb);
          var span = document.createElement('span');
          span.innerHTML = t.label + ' (' + t.marketHours + fH(' \u2192 ') + t.qaliaHours + fH(')');
          if (displayVol > 0) {
            span.innerHTML += ' <em style="color:var(--bleu-canard); font-size:0.85em;">\u2248' + fmtNum(displayVol) + '/an r\u00e9siduel</em>';
          } else {
            span.innerHTML += ' <em style="color:var(--gris); font-size:0.85em;">couvert par vos t\u00e2ches principales</em>';
          }
          label.appendChild(span);
          advDiv.appendChild(label);
        });

        // 3. Autres tâches (ni CORE ni FREQUENT des profils actifs)
        var allFreqAndCore = usedKeys.concat(frequentKeys);
        var otherAvailable = [];
        Object.keys(TASK_CONFIG).forEach(function(key) {
          if (allFreqAndCore.indexOf(key) === -1) otherAvailable.push(key);
        });
        if (otherAvailable.length > 0 && frequentKeys.length > 0) {
          var otherHeader = document.createElement('div');
          otherHeader.style.cssText = 'font-size:var(--fs-caption); font-weight:600; color:var(--gris); margin-top:var(--space-xs); margin-bottom:var(--space-2xs); opacity:0.7;';
          otherHeader.textContent = 'Autres t\u00e2ches disponibles';
          advDiv.appendChild(otherHeader);
        }
        otherAvailable.forEach(function(key) {
          var t = TASK_CONFIG[key];
          var label = document.createElement('label');
          label.className = 'sim-task-check';
          label.style.cssText = 'display:flex; align-items:center; gap:var(--space-xs); padding:var(--space-2xs) 0; font-size:var(--fs-small);';
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = false;
          cb.setAttribute('data-task', key);
          cb.addEventListener('change', function() {
            if (this.checked) {
              if (state.tasks.indexOf(key) === -1) {
                state.tasks.push(key);
              }
              state.taskVolumes[key] = t.defaultVolume || 1;
            } else {
              var idx = state.tasks.indexOf(key);
              if (idx > -1) state.tasks.splice(idx, 1);
              delete state.taskVolumes[key];
            }
            buildTaskStep();
          });
          label.appendChild(cb);
          var span = document.createElement('span');
          span.innerHTML = t.label + ' (' + t.marketHours + fH(' \u2192 ') + t.qaliaHours + fH(')');
          label.appendChild(span);
          advDiv.appendChild(label);
        });

        // Bind volume inputs and checkboxes
        bindTaskCardEvents();
        updateTaskSummary();
      }

      function bindTaskCardEvents() {
        // Volume inputs : reactivite immediate (input) + validation finale (change)
        document.querySelectorAll('.sim-task-vol').forEach(function(input) {
          function applyVol() {
            var key = input.getAttribute('data-task');
            var val = parseInt(input.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            var maxVal = parseInt(input.max, 10) || 50;
            if (val > maxVal) val = maxVal;
            input.value = val;
            state.taskVolumes[key] = val;
            updateTaskSummary();
          }
          input.addEventListener('input', applyVol);
          input.addEventListener('change', function() { applyVol(); buildTaskStep(); });
        });
        // Market hours inputs (editable)
        document.querySelectorAll('.sim-task-market').forEach(function(input) {
          input.addEventListener('input', function() {
            var key = input.getAttribute('data-task');
            var val = parseFloat(input.value);
            if (!isNaN(val) && val >= 0.5 && val <= 200) {
              state.taskMarketHours[key] = val;
              updateTaskSummary();
            }
          });
          input.addEventListener('change', function() {
            var key = input.getAttribute('data-task');
            var val = parseFloat(input.value);
            if (val < 0.5) val = 0.5;
            if (val > 200) val = 200;
            input.value = val;
            state.taskMarketHours[key] = val;
            updateTaskSummary();
          });
        });
        // Task checkboxes (deselect)
        document.querySelectorAll('#simTaskCards input[type="checkbox"]').forEach(function(cb) {
          cb.addEventListener('change', function() {
            var key = cb.getAttribute('data-task');
            if (!cb.checked) {
              var idx = state.tasks.indexOf(key);
              if (idx > -1) state.tasks.splice(idx, 1);
              delete state.taskVolumes[key];
              buildTaskStep();
            }
          });
        });
      }

      function updateTaskSummary() {
        var result = computeTaskHours(state.tasks);
        var summaryDiv = document.getElementById('simTaskSummary');
        if (!summaryDiv) return;
        var gain = Math.round(result.totalMarket - result.totalQalia);
        summaryDiv.innerHTML = '<div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:var(--space-xs);">'
          + '<span>Total actuel : <strong style="color:var(--bordeaux);">' + fmtH(result.totalMarket) + fH('/an</strong></span>')
          + '<span>Total Qalia : <strong style="color:var(--bleu-canard);">' + fmtH(result.totalQalia) + fH('/an</strong></span>')
          + '<span style="color:var(--succes); font-weight:700;">' + fmtGain(gain) + fH(' lib\u00e9r\u00e9es/an</span>')
          + '</div>';
      }

      // Legacy stubs (removed: old slider/expert mode)
      function updateActiveTasks() { buildTaskStep(); }
      function updateComparisonPill() {}
      function updateTaskBreakdown() { updateTaskSummary(); }

      document.getElementById('simNext6').addEventListener('click', function() {
        showStep(getNextStep(5));
      });
      document.getElementById('simBack6').addEventListener('click', function() { showStep(getPrevStep(5)); });

      // === STEP 7 : TJM (20-200 EUR) ===
      var tjmSlider = document.getElementById('simTjm');
      var tjmDisplay = document.getElementById('simTjmDisplay');
      tjmSlider.addEventListener('input', function() {
        state.tjm = parseInt(this.value, 10);
        tjmDisplay.innerHTML = fmtNum(state.tjm) + ' \u00a0<span class="u" style="vertical-align:super;">\u20ac</span><span class="u">/h</span>';
        this.setAttribute('aria-valuenow', state.tjm);
        this.setAttribute('aria-valuetext', fmtNum(state.tjm) + ' euros par heure');
        updateSliderColor(this);
      });
      // Per-role TJM toggle + inputs
      var tjmByRoleToggle = document.getElementById('simTjmByRoleToggle');
      var tjmByRoleCheck = document.getElementById('simTjmByRoleCheck');
      var tjmByRoleInputs = document.getElementById('simTjmByRoleInputs');

      function buildTjmByRoleInputs() {
        // Show toggle only when multi-role
        if (!state.cibles || state.cibles.length <= 1) {
          tjmByRoleToggle.style.display = 'none';
          state.tjmByRoleActive = false;
          tjmByRoleCheck.checked = false;
          return;
        }
        tjmByRoleToggle.style.display = '';
        if (!state.tjmByRoleActive) {
          tjmByRoleInputs.style.display = 'none';
          return;
        }
        tjmByRoleInputs.style.display = '';
        var html = '';
        state.cibles.forEach(function(role) {
          var label = PROFILE_LABELS[role] || role;
          var val = state.tjmByRole[role] || state.tjm;
          html += '<div style="display:flex; align-items:center; gap:var(--space-xs); margin-bottom:var(--space-2xs);">'
            + '<span style="font-size:var(--fs-small); min-width:140px; color:var(--noir);">' + label + '</span>'
            + '<input type="number" class="sim-tjm-role-input" data-role="' + role + '" value="' + val + '" min="20" max="500" step="5" '
            + 'style="width:70px; text-align:center; font-size:var(--fs-body); font-weight:700; color:var(--bleu-canard); border:1px solid var(--gris-clair); border-radius:0.75rem; padding:4px 6px; -moz-appearance:textfield; appearance:textfield;">'
            + '<span style="font-size:var(--fs-small); color:var(--gris);"><sup class="u">\u20ac</sup><span class="u">/h</span></span>'
            + '</div>';
        });
        tjmByRoleInputs.innerHTML = html;
        // Bind inputs
        tjmByRoleInputs.querySelectorAll('.sim-tjm-role-input').forEach(function(inp) {
          inp.addEventListener('change', function() {
            var role = inp.getAttribute('data-role');
            var val = parseInt(inp.value, 10);
            if (isNaN(val) || val < 20) val = 20;
            if (val > 500) val = 500;
            inp.value = val;
            state.tjmByRole[role] = val;
          });
        });
      }

      tjmByRoleCheck.addEventListener('change', function() {
        state.tjmByRoleActive = this.checked;
        if (this.checked) {
          // Pre-fill with global rate
          state.cibles.forEach(function(role) {
            if (!state.tjmByRole[role]) state.tjmByRole[role] = state.tjm;
          });
        } else {
          state.tjmByRole = {};
        }
        buildTjmByRoleInputs();
      });

      document.getElementById('simNext7').addEventListener('click', function() {
        showStep(getNextStep(4));
        // Construire les tâches quand on arrive à l'étape Tâches depuis Tarif
        buildTaskStep();
      });
      document.getElementById('simBack7').addEventListener('click', function() { showStep(getPrevStep(4)); });

      // === STEP 8 : Douleurs (délégation événementielle via buildPainStep) ===
      // Les clics sur les boutons sont gérés par grid.onclick dans buildPainStep()
      var next8 = document.getElementById('simNext8');
      next8.addEventListener('click', function() {
        if (state.pains.length === 0) return;
        showStep(7); // Apply dashboard layout FIRST (sim-box-dashboard class)
        // Small delay to let the layout reflow, then compute+draw charts at full width
        requestAnimationFrame(function() {
          computeResults();
          populatePersonalRoi();
        });
      });
      document.getElementById('simBack8').addEventListener('click', function() { showStep(getPrevStep(6)); });
      // Back from bilan (step 9 = step 7 in remapped)
      document.getElementById('simBack9').addEventListener('click', function() { showStep(getPrevStep(7)); });

      // === BILLING TOGGLE (mensuel/annuel dans resultats) ===
      var billingSwitch = document.getElementById('simBillingSwitch');
      var billingMonthlyLabel = document.querySelector('.sim-billing-monthly');
      var billingAnnualLabel = document.querySelector('.sim-billing-annual');
      // Fonction réutilisable : appliquer l'état billing sur le toggle simulateur
      function applySimBilling(isAnnual) {
        state.billingAnnual = isAnnual;
        // body.billing-annual pilote les spans .price-monthly-txt / .price-annual-txt partout dans la page
        document.body.classList.toggle('billing-annual', isAnnual);
        if (billingSwitch) {
          billingSwitch.classList.toggle('annual', isAnnual);
          billingSwitch.setAttribute('aria-checked', isAnnual ? 'true' : 'false');
        }
        if (billingMonthlyLabel) billingMonthlyLabel.classList.toggle('active', !isAnnual);
        if (billingAnnualLabel) billingAnnualLabel.classList.toggle('active', isAnnual);
        // Toggler la classe annual sur le container sim-box (variantes texte CSS)
        var simBox = document.getElementById('simBox');
        if (simBox) simBox.classList.toggle('annual', isAnnual);
        // Propager .annual sur value-stack et sticky CTA (hors scope sim-box)
        var valueStack = document.querySelector('.value-stack');
        if (valueStack) valueStack.classList.toggle('annual', isAnnual);
        var stickyCta = document.getElementById('stickyCta');
        if (stickyCta) stickyCta.classList.toggle('annual', isAnnual);
      }

      if (billingSwitch) {
        billingSwitch.addEventListener('click', function() {
          var isAnnual = billingSwitch.classList.contains('annual');
          isAnnual = !isAnnual;
          applySimBilling(isAnnual);
          computeResults();

          // Notifier la section pricing du changement de facturation
          document.dispatchEvent(new CustomEvent('simBillingChanged', { detail: { annual: isAnnual } }));
        });
      }

      // Écouter les changements de facturation depuis la section pricing
      document.addEventListener('pricingBillingChanged', function(e) {
        applySimBilling(e.detail.annual);
        if (state.results) computeResults();
      });

      // === CHATGPT PLAN SELECTOR ===
      (function() {
        var planBtns = document.querySelectorAll('.sim-chatgpt-btn');
        planBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            planBtns.forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            state.chatgptPlan = btn.getAttribute('data-plan');
            computeResults();
          });
        });
      })();

      // Time chart toggle "Proposition augmentee"
      var timeToggleSwitch = document.getElementById('simTimeToggleSwitch');
      if (timeToggleSwitch) {
        timeToggleSwitch.addEventListener('click', function() {
          _timeChartState.showSuggested = !_timeChartState.showSuggested;
          timeToggleSwitch.classList.toggle('active', _timeChartState.showSuggested);
          timeToggleSwitch.setAttribute('aria-checked', _timeChartState.showSuggested ? 'true' : 'false');
          var lblA = document.getElementById('simTimeToggleLabelA');
          var lblB = document.getElementById('simTimeToggleLabelB');
          if (lblA) lblA.classList.toggle('active', !_timeChartState.showSuggested);
          if (lblB) lblB.classList.toggle('active', _timeChartState.showSuggested);
          renderTimeBars();
        });
      }

      // === PALETTE CENTRALISEE POUR CANVAS ===
      // Lecture dynamique des CSS Custom Properties (tokens Design System)
      var _cs = getComputedStyle(document.documentElement);
      function _tok(name) { return (_cs.getPropertyValue(name) || '').trim(); }
      var PALETTE = {
        succes: _tok('--succes') || '#2D6E54',
        succesLight: _tok('--succes-light') || '#2ABF7E',
        erreur: _tok('--erreur') || '#C94040',
        erreurLight: _tok('--erreur-light') || '#D04848',
        bleuCanard: _tok('--bleu-canard') || '#1B7E94',
        bleuLight: _tok('--bleu-light') || '#2A9DB6',
        bordeaux: _tok('--bordeaux') || '#932951',
        bordeauxLight: _tok('--bordeaux-light') || '#B33562',
        grisLabel: _tok('--gris') || '#5A6A70',
        grisLigne: '#666',
        grisFond: _tok('--gris-ui') || '#F8F9FA',
        grisGrille: '#eaeaea'
      };


      // Moyenne pond\u00e9r\u00e9e : formule Sigma(ETP * TJM) / Sigma(ETP)
      // Identique au calcul de computeResults(), utilis\u00e9e ici pour l'affichage live
      function computeDisplayWeightedTjm() {
        if (!state.cibles || !state.tjmByRoleActive) return state.tjm;
        var totalEtp = 0, weightedSum = 0;
        state.cibles.forEach(function(role) {
          var etp = (state.teamBreakdown && state.teamBreakdown[role]) ? state.teamBreakdown[role] : 1;
          var rate = (state.tjmByRole && state.tjmByRole[role]) ? state.tjmByRole[role] : state.tjm;
          weightedSum += etp * rate;
          totalEtp += etp;
        });
        return totalEtp > 0 ? Math.round(weightedSum / totalEtp) : state.tjm;
      }


      // === SECTION ROI PERSONNALISEE (source unique : state.results, calcule par computeResults) ===
      function populatePersonalRoi() {
        // Lire depuis state.results (plus de double calcul)
        if (!state.results) return;
        var sr = state.results;
        var totalOldH = sr.totalOldHours;
        var totalNewH = sr.totalQaliaHours;
        var hSaved = sr.hRound;
        var effectiveRate = sr.effectiveTjm;
        var vSaved = sr.valueSaved;
        var annCost = sr.annualCost;
        var netResult = sr.netRound;
        var roi = sr.roiMultiple;
        var teamMul = sr.teamMultiplier;
        // Payback : source unique depuis state.results (plus de double calcul)
        var payback = sr.paybackMonth || 0;
        var paybackLbl = sr.paybackLabel || (payback > 0 ? 'Mois ' + payback : 'N/A');
        // Source unique : _profileCard (depuis SIM_COMPUTED si disponible)
        var _pc = (sr.SIM_COMPUTED && sr.SIM_COMPUTED.profileCard) || null;
        var progs = _pc ? _pc.programsCount : (state.programs || 3);
        var fN = function(n) { return fmtCanvas(n); };

        // Titre dynamique
        var titleEl = document.getElementById('roiDynTitle');
        if (netResult > 0) {
          titleEl.innerHTML = fN(hSaved) + '&nbsp;<span class="u">heures</span> lib&eacute;r&eacute;es, ' + fN(netResult) + '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span> &eacute;conomis&eacute;s';
        } else {
          titleEl.innerHTML = fN(hSaved) + '&nbsp;<span class="u">heures</span> lib&eacute;r&eacute;es par an';
        }
        var subEl = document.getElementById('roiDynSubtitle');
        // Lit depuis _profileCard : m\u00eames r\u00f4les et m\u00eame taux que le dashboard r\u00e9cap
        var _rolesForSub = _pc ? _pc.rolesJoinedWithEtp : ((state.cibles || [state.cible || 'formateur']).map(function(c) { return PROFILE_LABELS[c] || c; }).join(', '));
        var _tjmForSub = _pc ? _pc.tjmEffective : Math.round(effectiveRate);
        // Mention "moy. pond\u00e9r\u00e9e" si plusieurs taux horaires (source : _profileCard)
        var _tjmSuffix = (_pc && _pc.tjmHasMultiRates)
          ? '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span>/h&nbsp;<span style="font-size:0.75em;opacity:0.7;">(moy.&nbsp;pond\u00e9r\u00e9e)</span>'
          : '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span>/h';
        subEl.innerHTML = 'R&eacute;sultat personnalis&eacute; pour\u00a0: ' + _rolesForSub + ' (' + progs + ' programmes/an, ' + _tjmForSub + _tjmSuffix + ')';

        // KPIs
        document.getElementById('roiKpiHours').innerHTML = fN(hSaved) + '&nbsp;<span class="u">h</span>';
        document.getElementById('roiKpiMoney').innerHTML = (netResult >= 0 ? '+' : '') + fN(netResult) + '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span>';
        // ROI prudent (cap \u00d73+) depuis SIM_COMPUTED.roi.displayStr (source unique)
        var _roiDisplay = (sr.SIM_COMPUTED && sr.SIM_COMPUTED.roi && sr.SIM_COMPUTED.roi.displayStr)
          ? sr.SIM_COMPUTED.roi.displayStr
          : (roi * 0.5 >= 3 ? '3+' : fmtNum(Math.round(roi * 0.5 * 10) / 10, 1)); // fallback : m\u00eame r\u00e8gle prudente (x0.5 fill rate, plafond x3+)
        document.getElementById('roiKpiRoi').innerHTML = roi > 0 ? '&times;' + _roiDisplay : 'N/A';
        document.getElementById('roiKpiPayback').innerHTML = paybackLbl;

        // Barres de comparaison : m\u00eame taux affich\u00e9 que le dashboard r\u00e9cap (_pc.tjmEffective)
        document.getElementById('roiDynPrograms').textContent = progs;
        document.getElementById('roiDynRate').textContent = _tjmForSub;
        document.getElementById('roiBarOldHours').innerHTML = fN(Math.round(totalOldH)) + '&nbsp;<span class="u">h</span>';
        document.getElementById('roiBarNewHours').innerHTML = fN(Math.round(totalNewH)) + '&nbsp;<span class="u">h</span>';
        document.getElementById('roiBarOldCost').innerHTML = fN(Math.round(totalOldH * effectiveRate)) + '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span> de votre temps';
        var pctNew = totalOldH > 0 ? Math.max(5, Math.round((totalNewH / totalOldH) * 100)) : 50;
        document.getElementById('roiBarOldFill').style.width = '100%';
        document.getElementById('roiBarNewFill').style.width = pctNew + '%';

        // Barre ChatGPT (peuplement dynamique)
        var chatH = sr.totalChatGPTHours || 0;
        var pctChatGPT = totalOldH > 0 ? Math.max(5, Math.round((chatH / totalOldH) * 100)) : 70;
        document.getElementById('roiBarChatGPTHours').innerHTML = fN(Math.round(chatH)) + '&nbsp;<span class="u">h</span>';
        document.getElementById('roiBarChatGPTFill').style.width = pctChatGPT + '%';
        document.getElementById('roiBarChatGPTCost').innerHTML = fN(Math.round(chatH * effectiveRate)) + '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span> de votre temps';

        // Conformité Qalia : formulation qualitative (D42-ZAP3, convergence 6/11 personas)
        var conformityEl = document.getElementById('roiBarQaliaConformity');
        if (conformityEl) {
          conformityEl.innerHTML = 'Conformit\u00e9 Qualiopi\u00a0: int\u00e9gr\u00e9e nativement';
        }

        document.getElementById('roiSavingsHours').innerHTML = fN(hSaved) + '&nbsp;<span class="u">h</span> &eacute;conomis&eacute;es par an';
        var savingsText = 'Soit ' + fN(Math.round(vSaved)) + '&nbsp;<span class="u" style="vertical-align:super;">&euro;</span> de votre temps r&eacute;cup&eacute;r&eacute; (environ ' + fN(Math.round(hSaved / 8)) + ' jours ouvr&eacute;s)';
        document.getElementById('roiSavingsText').innerHTML = savingsText;

        // === COMPARAISON 3 COLONNES : Sans IA / ChatGPT / Qalia ===
        // chatH déjà déclaré ci-dessus (peuplement barre ChatGPT)
        var compEl = document.getElementById('roiThreeColumns');
        if (!compEl) {
          compEl = document.createElement('div');
          compEl.id = 'roiThreeColumns';
          var refNode = document.getElementById('roiSavingsText');
          if (refNode && refNode.parentElement) {
            refNode.parentElement.insertBefore(compEl, refNode.nextSibling);
          }
        }
        var pctChat = totalOldH > 0 ? Math.round((chatH / totalOldH) * 100) : 60;
        var pctQalia = totalOldH > 0 ? Math.round((totalNewH / totalOldH) * 100) : 30;

        // Styles d'animation du tableau (injecter une seule fois, idempotent)
        var _cmpStyleEl = document.getElementById('simCmpAnimStyles');
        if (!_cmpStyleEl) {
          _cmpStyleEl = document.createElement('style');
          _cmpStyleEl.id = 'simCmpAnimStyles';
          document.head.appendChild(_cmpStyleEl);
        }
        _cmpStyleEl.textContent = [
          // En-t\u00eates : trait color\u00e9 se dessine de gauche \u00e0 droite (background-size 0\u2192100%)
          '.sim-cmp-th{position:relative;background-repeat:no-repeat;background-position:bottom left;',
          'background-size:0% 3px;transition:background-color .22s ease,transform .2s ease,box-shadow .22s ease;cursor:default;}',
          '.sim-cmp-b{background-image:linear-gradient(to right,#932951,#B33562);',
          'animation:simCmpDraw .55s .05s cubic-bezier(.25,.46,.45,.94) both;}',
          '.sim-cmp-e{background-image:linear-gradient(to right,#B03030,#D04848);',
          'animation:simCmpDraw .55s .20s cubic-bezier(.25,.46,.45,.94) both;}',
          '.sim-cmp-q{background-image:linear-gradient(to right,#1B7E94,#2A9DB6);',
          'animation:simCmpDraw .55s .35s cubic-bezier(.25,.46,.45,.94) both;}',
          '@keyframes simCmpDraw{to{background-size:100% 3px;}}',
          // Survol en-t\u00eate : l\u00e9g\u00e8re \u00e9l\u00e9vation + halo color\u00e9 + trait \u00e9paissi
          '.sim-cmp-b:hover{background-color:rgba(147,41,81,.10)!important;background-size:100% 4px!important;',
          'box-shadow:0 5px 14px rgba(147,41,81,.18);transform:translateY(-2px);}',
          '.sim-cmp-e:hover{background-color:rgba(201,64,64,.10)!important;background-size:100% 4px!important;',
          'box-shadow:0 5px 14px rgba(201,64,64,.18);transform:translateY(-2px);}',
          '.sim-cmp-q:hover{background-color:rgba(27,126,148,.12)!important;background-size:100% 4px!important;',
          'box-shadow:0 5px 16px rgba(27,126,148,.22);transform:translateY(-2px);}',
          // Cellules : transition douce sur le fond
          '.sim-cmp-td{transition:background-color .18s ease;}',
          // Survol ligne : renforce la teinte de chaque colonne
          '.sim-cmp-tr{border-bottom:1px solid var(--gris-clair,#e5e7eb);}',
          '.sim-cmp-tr:hover .sim-cmp-tb{background-color:rgba(147,41,81,.09)!important;}',
          '.sim-cmp-tr:hover .sim-cmp-te{background-color:rgba(201,64,64,.09)!important;}',
          '.sim-cmp-tr:hover .sim-cmp-tq{background-color:rgba(27,126,148,.11)!important;}',
          // Accessibilit\u00e9 : pas d\'animation si l\'utilisateur le demande
          '@media(prefers-reduced-motion:reduce){',
          '.sim-cmp-th{animation:none!important;background-size:100% 3px!important;}',
          '.sim-cmp-b:hover,.sim-cmp-e:hover,.sim-cmp-q:hover{transform:none;}}'
        ].join('');

        // Variables r\u00e9utilis\u00e9es dans le balisage
        var _tdP = 'padding:var(--space-2xs) var(--space-xs);text-align:center;';
        var _thP = 'padding:var(--space-xs) var(--space-xs) var(--space-3xs);text-align:center;font-weight:700;border-radius:8px 8px 0 0;';

        compEl.innerHTML = '<div style="margin:var(--space-md) 0;padding:var(--space-sm);background:var(--blanc-casse);border-radius:12px;border:1px solid var(--gris-clair);">'
          + '<div style="font-size:var(--fs-caption);font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--bleu-canard);margin-bottom:var(--space-xs);">Comparaison des solutions</div>'
          + '<table style="width:100%;border-collapse:separate;border-spacing:0;font-size:var(--fs-small);">'
          + '<thead><tr>'
          + '<th style="text-align:left;padding:var(--space-xs);"></th>'
          + '<th class="sim-cmp-th sim-cmp-b" style="' + _thP + 'color:var(--bordeaux);background-color:rgba(147,41,81,.05);">Sans assistance IA</th>'
          + '<th class="sim-cmp-th sim-cmp-e" style="' + _thP + 'color:#C94040;background-color:rgba(201,64,64,.05);">IA g\u00e9n\u00e9raliste</th>'
          + '<th class="sim-cmp-th sim-cmp-q" style="' + _thP + 'color:var(--bleu-canard);background-color:rgba(27,126,148,.06);">Qalia</th>'
          + '</tr></thead><tbody>'
          + '<tr class="sim-cmp-tr">'
          + '<td style="padding:var(--space-2xs) var(--space-xs);font-weight:600;color:var(--noir);">Heures/an</td>'
          + '<td class="sim-cmp-td sim-cmp-tb" style="' + _tdP + 'color:var(--bordeaux);background:rgba(147,41,81,.05);">' + fN(Math.round(totalOldH)) + '\u00a0h</td>'
          + '<td class="sim-cmp-td sim-cmp-te" style="' + _tdP + 'color:#C94040;background:rgba(201,64,64,.05);">' + fN(Math.round(chatH)) + '\u00a0h\u00a0<em style="font-size:.8em;opacity:.7;">(-' + (100 - pctChat) + '%)</em></td>'
          + '<td class="sim-cmp-td sim-cmp-tq" style="' + _tdP + 'color:var(--bleu-canard);font-weight:700;background:rgba(27,126,148,.06);">' + fN(Math.round(totalNewH)) + '\u00a0h\u00a0<em style="font-size:.8em;opacity:.7;">(-' + (100 - pctQalia) + '%)</em></td>'
          + '</tr>'
          + '<tr class="sim-cmp-tr" style="border-bottom:none;">'
          + '<td style="padding:var(--space-2xs) var(--space-xs);font-weight:600;color:var(--noir);">Conformit\u00e9 RNQ\u00a0V9</td>'
          + '<td class="sim-cmp-td sim-cmp-tb" style="' + _tdP + 'color:var(--bordeaux);background:rgba(147,41,81,.05);">Manuelle</td>'
          + '<td class="sim-cmp-td sim-cmp-te" style="' + _tdP + 'color:#C94040;background:rgba(201,64,64,.05);">Non structur\u00e9e</td>'
          + '<td class="sim-cmp-td sim-cmp-tq" style="' + _tdP + 'color:var(--succes);font-weight:700;background:rgba(27,126,148,.06);">Int\u00e9gr\u00e9e nativement</td>'
          + '</tr>'
          + '</tbody></table></div>';

        // Cycle Qualiopi : contenu dynamique selon statut + bottom personnalise
        updateCycleQualiopi(state.qualiopi);
        var cycleEl = document.getElementById('roiCycleBottom');
        if (cycleEl && state.qualiopi && state.qualiopi !== 'non_concerne') {
          var avgPerDossier = progs > 0 ? Math.round((totalOldH - totalNewH) / (teamMul > 1 ? teamMul : 1) / progs) : 35;
          cycleEl.innerHTML = 'Chaque mois avec Qalia, vous gagnez du temps et restez pr\u00eat pour le prochain audit.<br>Sans Qalia, ce sont ~' + avgPerDossier + '\u00a0<span class="u">h</span> par dossier \u00e0 retrouver. Seul.';
        }

        // Reveler la section ROI et masquer le fallback
        var roiSection = document.getElementById('roi');
        roiSection.style.display = '';
        var roiFallback = document.getElementById('roiFallback');
        if (roiFallback) roiFallback.style.display = 'none';
      }


      // === GRAPHIQUE ROI : BALANCE NETTE TRIMESTRIELLE ===
      var _lastRoiArgs = null; // for print handler
      var _roiTooltipBounds = []; // for hover tooltip

      // === SEASON_PROFILES : distribution mensuelle par type de frequence de tache ===
      // Calibres sur saisonnalite OF documentee (sources : Evolublog, SNES, enquetes OF) :
      // - Fev : creux (2 sem. vacances hiver national + budgets pas debloques)
      // - Q2 (Avr-Mai-Juin) : crescendo, trimestre fort
      // - Juil : reduit / Aout : zero (fermeture OF et clients en conges)
      // - Sep : reprise forte (rentree)
      // - Nov : pic (pression fin d'annee sur budgets)
      // - Dec : eleve (consommation budget avant 31/12, puis ralenti derniere sem.)
      // Somme des coefficients = 12 (moyenne 1/mois)
      // J    F    M    A    M    J    J    A    S    O    N    D
      var SEASON_PROFILES = {
        // per_program : production formation/bilan/VAE/CFA, colle au calendrier client
        per_program: [0.70, 0.60, 1.00, 1.30, 1.40, 1.50, 0.30, 0.00, 1.20, 1.30, 1.60, 1.10],
        // per_audit : preparation audit concentree avant echeances (printemps + automne)
        per_audit:   [0.60, 0.90, 1.50, 1.80, 1.20, 0.60, 0.30, 0.00, 0.90, 1.40, 1.80, 1.00],
        // annual : veille reglementaire en contre-saison (comble les creux de production)
        annual:      [1.80, 1.40, 0.90, 0.90, 0.90, 0.60, 0.40, 0.00, 0.90, 1.10, 1.50, 1.60]
      };

      // Calcule un profil saisonnier composite, pondere par les heures gagnees par frequence.
      // taskBreakdown : [{ key, market, qalia, ... }, ...]
      // Retourne [12] floats dont la somme = 12 (moyenne 1/mois), ou null si donnees insuffisantes.
      function buildCompositeSeasonFromTasks(taskBreakdown) {
        if (!taskBreakdown || taskBreakdown.length === 0) return null;
        var hoursByFreq = { per_program: 0, per_audit: 0, annual: 0 };
        for (var i = 0; i < taskBreakdown.length; i++) {
          var t = taskBreakdown[i];
          var cfg = TASK_CONFIG[t.key];
          if (!cfg) continue;
          var gain = Math.max(0, (t.market || 0) - (t.qalia || 0));
          if (gain <= 0) continue;
          var freq = cfg.frequency || 'per_program';
          if (hoursByFreq[freq] === undefined) freq = 'per_program';
          hoursByFreq[freq] += gain;
        }
        var total = hoursByFreq.per_program + hoursByFreq.per_audit + hoursByFreq.annual;
        if (total <= 0) return null;
        var composite = [0,0,0,0,0,0,0,0,0,0,0,0];
        var freqKeys = ['per_program', 'per_audit', 'annual'];
        for (var fk = 0; fk < freqKeys.length; fk++) {
          var f = freqKeys[fk];
          var w = hoursByFreq[f] / total;
          var p = SEASON_PROFILES[f];
          for (var m = 0; m < 12; m++) composite[m] += p[m] * w;
        }
        return composite;
      }

      function drawRoiChart(monthlySaving, monthlyCost, totalPrograms, costPerProg, savedPerProg, roiMultiple, skipAnim, seasonOverride, auditInfo, paybackDays) {
        _lastRoiArgs = [monthlySaving, monthlyCost, totalPrograms, costPerProg, savedPerProg, roiMultiple, seasonOverride, auditInfo, paybackDays];
        var canvas = document.getElementById('simRoiCanvas');
        if (!canvas || !canvas.getContext) return;

        var dpr = Math.max(2, window.devicePixelRatio || 2);
        var parentW = canvas.parentElement ? canvas.parentElement.clientWidth - 32 : 560;
        var displayW = Math.max(320, Math.min(parentW, 900));
        var displayH = Math.round(displayW * 0.55);
        canvas.width = Math.round(displayW * dpr);
        canvas.height = Math.round(displayH * dpr);
        canvas.style.width = displayW + 'px';
        canvas.style.height = displayH + 'px';
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        var W = displayW;
        var H = displayH;
        var fontSize = W < 400 ? 8 : W < 600 ? 9 : 10;
        var pad = { top: 30, right: 20, bottom: 44, left: W < 400 ? 55 : 70 };
        var chartW = W - pad.left - pad.right;
        var chartH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Saisonnalit\u00e9 : par defaut calendrier OF global ; si seasonOverride fourni (composite
        // pondere par les taches selectionnees), il remplace le profil uniforme.
        var SEASON_BASE = (seasonOverride && seasonOverride.length === 12)
          ? seasonOverride.slice()
          : [0.80, 0.60, 1.00, 1.30, 1.40, 1.40, 0.30, 0.00, 1.10, 1.30, 1.50, 1.30];
        var LABEL_BASE = ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c'];

        // Rotation calendaire : le graph d\u00e9marre au mois courant
        var startMonth = new Date().getMonth(); // 0 = janvier
        var SEASON = SEASON_BASE.slice(startMonth).concat(SEASON_BASE.slice(0, startMonth));
        var MONTH_LABELS = LABEL_BASE.slice(startMonth).concat(LABEL_BASE.slice(0, startMonth));

        // Cumul mensuel avec saisonnalité
        // monthlyCost peut être un nombre (coût fixe/mois) ou un tableau de 12 coûts
        // (billing annuel : paiement intégral M1 + ChatGPT mensuel M2-12)
        var monthValues = [];
        var cumul = 0;
        for (var m = 0; m < 12; m++) {
          var mSaving = monthlySaving * SEASON[m];
          var mCost = Array.isArray(monthlyCost) ? monthlyCost[m] : monthlyCost;
          cumul += mSaving - mCost;
          monthValues.push(Math.round(cumul));
        }

        var absMax = 1;
        monthValues.forEach(function(v) { if (Math.abs(v) > absMax) absMax = Math.abs(v); });

        // Dynamic zero line
        var allPositive = monthValues.every(function(v) { return v >= 0; });
        var allNegative = monthValues.every(function(v) { return v <= 0; });
        var zeroY, posH, negH;
        if (allPositive) {
          zeroY = Math.round(pad.top + chartH);
          posH = chartH;
          negH = 0;
        } else if (allNegative) {
          zeroY = Math.round(pad.top);
          posH = 0;
          negH = chartH;
        } else {
          var maxPos = 0, maxNeg = 0;
          monthValues.forEach(function(v) { if (v > maxPos) maxPos = v; if (v < maxNeg) maxNeg = v; });
          var ratio = maxPos / (maxPos + Math.abs(maxNeg));
          zeroY = Math.round(pad.top + chartH * ratio);
          posH = zeroY - pad.top;
          negH = chartH - posH;
        }

        // Background
        ctx.fillStyle = PALETTE.grisFond;
        ctx.fillRect(Math.round(pad.left), Math.round(pad.top), Math.round(chartW), Math.round(chartH));
        if (posH > 0) {
          ctx.fillStyle = 'rgba(58, 138, 106, 0.04)';
          ctx.fillRect(Math.round(pad.left), Math.round(pad.top), Math.round(chartW), Math.round(posH));
        }
        if (negH > 0) {
          ctx.fillStyle = 'rgba(201, 64, 64, 0.04)';
          ctx.fillRect(Math.round(pad.left), Math.round(zeroY), Math.round(chartW), Math.round(negH));
        }

        // Horizontal grid
        ctx.strokeStyle = PALETTE.grisGrille;
        ctx.lineWidth = 1;
        var gridSteps = 4;
        for (var i = 0; i <= gridSteps; i++) {
          var yGrid = Math.round(pad.top + (chartH / gridSteps) * i) + 0.5;
          ctx.beginPath();
          ctx.moveTo(Math.round(pad.left), yGrid);
          ctx.lineTo(Math.round(W - pad.right), yGrid);
          ctx.stroke();
          var gridVal;
          if (allPositive) {
            gridVal = Math.round(absMax * (1 - i / gridSteps));
          } else if (allNegative) {
            gridVal = Math.round(-absMax * i / gridSteps);
          } else {
            var maxPos2 = Math.max.apply(null, monthValues);
            var maxNeg2 = Math.abs(Math.min.apply(null, monthValues));
            var topVal = maxPos2;
            var botVal = -maxNeg2;
            gridVal = Math.round(topVal + (botVal - topVal) * (i / gridSteps));
          }
          ctx.fillStyle = '#999';
          ctx.font = fontSize + 'px Plus Jakarta Sans, system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          var labelTxt = fmtCanvas(gridVal);
          var labelX = Math.round(pad.left - 8);
          ctx.fillText(labelTxt, labelX, yGrid);
          var supSize = Math.round(fontSize * 0.7);
          ctx.font = supSize + 'px Plus Jakarta Sans, system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('\u20ac', labelX + 2, yGrid - Math.round(fontSize * 0.25));
          ctx.textAlign = 'right';
        }

        // Zero line (bold), only if mixed
        if (!allPositive && !allNegative) {
          ctx.strokeStyle = PALETTE.grisLigne;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.round(pad.left), zeroY + 0.5);
          ctx.lineTo(Math.round(W - pad.right), zeroY + 0.5);
          ctx.stroke();
        }

        // Detect break-even month (first month cumul >= 0)
        var breakMonth = -1;
        for (var m3 = 0; m3 < 12; m3++) {
          if (monthValues[m3] >= 0) {
            if (m3 === 0) { breakMonth = 0.5; }
            else {
              var prev2 = monthValues[m3 - 1];
              var curr2 = monthValues[m3];
              breakMonth = m3 + (-prev2) / (curr2 - prev2);
            }
            break;
          }
        }

        // Bar dimensions for 12 months
        var groupW = chartW / 12;
        var barW = Math.max(8, Math.floor(groupW * 0.55));
        var barRadius = Math.min(4, Math.floor(barW / 4));
        var scaleH = allPositive ? posH : allNegative ? negH : Math.max(posH, negH);
        _roiTooltipBounds = [];

        function drawBars(progress) {
          ctx.clearRect(Math.round(pad.left), Math.round(pad.top) - 1, Math.round(chartW), Math.round(chartH) + 2);
          ctx.fillStyle = PALETTE.grisFond;
          ctx.fillRect(Math.round(pad.left), Math.round(pad.top), Math.round(chartW), Math.round(chartH));
          if (posH > 0) {
            ctx.fillStyle = 'rgba(58, 138, 106, 0.04)';
            ctx.fillRect(Math.round(pad.left), Math.round(pad.top), Math.round(chartW), Math.round(posH));
          }
          if (negH > 0) {
            ctx.fillStyle = 'rgba(201, 64, 64, 0.04)';
            ctx.fillRect(Math.round(pad.left), Math.round(zeroY), Math.round(chartW), Math.round(negH));
          }

          // === Gradient urgence Qualiopi : continu, replique exacte du slider echeance ===
          // Chaque position X = mois restants jusqu'a l'audit, colore selon la meme echelle
          // que updateSliderColor (min=1, max=24, pivot=5) : rouge #C0392B -> blanc #e0e0e0 -> vert #2E7D5B.
          if (auditInfo && auditInfo.monthsAway > 0 && auditInfo.monthsAway <= 12) {
            var auditM = auditInfo.monthsAway;
            var gradX1 = Math.round(pad.left);
            var gradX2 = Math.round(pad.left + auditM * groupW);
            var urgGrad = ctx.createLinearGradient(gradX1, 0, gradX2, 0);
            var slMin = 1, slMax = 24, slPivot = 5;
            var pivotPct = (slPivot - slMin) / (slMax - slMin);
            var steps = Math.max(auditM, 1);
            for (var gi = 0; gi <= steps; gi++) {
              var monthsRem = auditM - gi; // mb=0: remaining=auditM ; mb=auditM: remaining=0
              var vClamp = Math.max(slMin, Math.min(slMax, monthsRem));
              var ratio = (vClamp - slMin) / (slMax - slMin);
              var cr, cg, cb;
              if (ratio <= pivotPct) {
                var tt = ratio / pivotPct;
                cr = Math.round(192 + (224 - 192) * tt);
                cg = Math.round(57 + (224 - 57) * tt);
                cb = Math.round(43 + (224 - 43) * tt);
              } else {
                var tt2 = (ratio - pivotPct) / (1 - pivotPct);
                cr = Math.round(224 + (46 - 224) * tt2);
                cg = Math.round(224 + (125 - 224) * tt2);
                cb = Math.round(224 + (91 - 224) * tt2);
              }
              var stopPos = gi / steps;
              urgGrad.addColorStop(stopPos, 'rgba(' + cr + ',' + cg + ',' + cb + ',0.22)');
            }
            ctx.fillStyle = urgGrad;
            ctx.fillRect(gradX1, Math.round(pad.top), Math.max(1, gradX2 - gradX1), Math.round(chartH));
          }

          ctx.strokeStyle = PALETTE.grisGrille;
          ctx.lineWidth = 1;
          for (var gi = 0; gi <= gridSteps; gi++) {
            var gyGrid = Math.round(pad.top + (chartH / gridSteps) * gi) + 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.round(pad.left), gyGrid);
            ctx.lineTo(Math.round(W - pad.right), gyGrid);
            ctx.stroke();
          }
          if (!allPositive && !allNegative) {
            ctx.strokeStyle = PALETTE.grisLigne;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(Math.round(pad.left), zeroY + 0.5);
            ctx.lineTo(Math.round(W - pad.right), zeroY + 0.5);
            ctx.stroke();
          }

          _roiTooltipBounds = [];
          for (var mb = 0; mb < 12; mb++) {
            var mProgress = Math.min(1, Math.max(0, (progress - mb * 0.06) / 0.5));
            var eased = 1 - Math.pow(1 - mProgress, 3);
            var net = monthValues[mb];
            var fullBarH;
            if (allPositive) {
              fullBarH = Math.abs(net) / absMax * posH;
            } else if (allNegative) {
              fullBarH = Math.abs(net) / absMax * negH;
            } else {
              fullBarH = net >= 0 ? Math.abs(net) / Math.max.apply(null, monthValues) * posH : Math.abs(net) / Math.abs(Math.min.apply(null, monthValues)) * negH;
            }
            var barH = Math.round(fullBarH * eased);
            var bx = Math.round(pad.left + (mb + 0.5) * groupW - barW / 2);
            var by;

            var grad;
            var isVacation = SEASON[mb] < 0.5;
            if (net >= 0) {
              by = Math.round(zeroY - barH);
              grad = ctx.createLinearGradient(bx, by, bx, Math.round(zeroY));
              grad.addColorStop(0, PALETTE.succes);
              grad.addColorStop(1, PALETTE.succesLight);
            } else {
              by = Math.round(zeroY);
              grad = ctx.createLinearGradient(bx, by, bx, Math.round(by + barH));
              grad.addColorStop(0, PALETTE.erreur);
              grad.addColorStop(1, PALETTE.erreurLight);
            }

            if (barH > 1) {
              ctx.fillStyle = grad;
              if (isVacation) ctx.globalAlpha = 0.5;
              ctx.beginPath();
              var r = Math.min(barRadius, barH / 2);
              if (net >= 0) {
                ctx.moveTo(bx + r, by);
                ctx.lineTo(bx + barW - r, by);
                ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
                ctx.lineTo(bx + barW, Math.round(zeroY));
                ctx.lineTo(bx, Math.round(zeroY));
                ctx.lineTo(bx, by + r);
                ctx.quadraticCurveTo(bx, by, bx + r, by);
              } else {
                ctx.moveTo(bx, Math.round(zeroY));
                ctx.lineTo(bx + barW, Math.round(zeroY));
                ctx.lineTo(bx + barW, by + barH - r);
                ctx.quadraticCurveTo(bx + barW, by + barH, bx + barW - r, by + barH);
                ctx.lineTo(bx + r, by + barH);
                ctx.quadraticCurveTo(bx, by + barH, bx, by + barH - r);
              }
              ctx.fill();
              ctx.globalAlpha = 1;
            }

            // Vacation hatching pattern (diagonal lines)
            if (isVacation && barH > 3) {
              ctx.save();
              ctx.strokeStyle = 'rgba(150,150,150,0.25)';
              ctx.lineWidth = 1;
              var hatchStep = 6;
              var hatchTop = net >= 0 ? by : Math.round(zeroY);
              var hatchBot = net >= 0 ? Math.round(zeroY) : Math.round(by + barH);
              ctx.beginPath();
              ctx.rect(bx, hatchTop, barW, hatchBot - hatchTop);
              ctx.clip();
              for (var hx = bx - (hatchBot - hatchTop); hx < bx + barW + barH; hx += hatchStep) {
                ctx.beginPath();
                ctx.moveTo(hx, hatchBot);
                ctx.lineTo(hx + (hatchBot - hatchTop), hatchTop);
                ctx.stroke();
              }
              ctx.restore();
            }

            _roiTooltipBounds.push({
              x: bx, w: barW, val: net, month: mb + 1, label: MONTH_LABELS[mb], season: SEASON[mb]
            });

            // X label
            ctx.fillStyle = isVacation ? '#bbb' : '#999';
            ctx.font = (isVacation ? 'italic ' : '') + fontSize + 'px Plus Jakarta Sans, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(MONTH_LABELS[mb], Math.round(pad.left + (mb + 0.5) * groupW), Math.round(H - pad.bottom + 14));

            // Saisonnalite % sous le label mois (tous les mois, couleur selon niveau)
            // Creux (<0.85) = rouge pale ; Pic (>1.15) = vert bold ; Normal = gris
            var sv = SEASON[mb];
            var svPct = Math.round(sv * 100);
            var svColor, svWeight;
            if (sv < 0.85) { svColor = '#C0392B'; svWeight = ''; }
            else if (sv > 1.15) { svColor = '#2E7D5B'; svWeight = 'bold '; }
            else { svColor = '#aaa'; svWeight = ''; }
            ctx.fillStyle = svColor;
            ctx.font = svWeight + (fontSize - 1) + 'px Plus Jakarta Sans, system-ui, sans-serif';
            ctx.fillText(svPct + '%', Math.round(pad.left + (mb + 0.5) * groupW), Math.round(H - pad.bottom + 26));
          }

          // Break-even line - position precise basee sur paybackDays (jours)
          // paybackDays varie structurellement ~10x entre mensuel et annuel
          var effectiveBreak = (paybackDays > 0 && paybackDays < 366) ? (paybackDays / 30.4) : breakMonth;
          if (effectiveBreak > 0 && effectiveBreak <= 12 && progress >= 0.85) {
            var lineProgress = Math.min(1, (progress - 0.85) / 0.15);
            var lineEased = 1 - Math.pow(1 - lineProgress, 3);
            // Minimum visible 0.2 mois pour eviter la superposition avec l'axe Y
            var visBreak = Math.max(0.2, effectiveBreak);
            var breakX = Math.round(pad.left + visBreak * groupW);
            var lineEndY = Math.round(pad.top + chartH * lineEased);

            ctx.save();
            var breakColor = monthValues[11] >= 0 ? '#1B7E94' : '#932951';
            ctx.strokeStyle = breakColor;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(breakX + 0.5, Math.round(pad.top));
            ctx.lineTo(breakX + 0.5, lineEndY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            if (lineProgress >= 1) {
              // Label avec nombre de jours exact (cle de la differenciation visuelle)
              var breakLabel;
              if (paybackDays > 0 && paybackDays < 366) {
                if (paybackDays === 1) breakLabel = 'Rentable : 1 jour';
                else if (paybackDays <= 60) breakLabel = 'Rentable : ' + paybackDays + ' jours';
                else breakLabel = 'Rentable : Mois ' + Math.ceil(paybackDays / 30);
              } else {
                var breakMIdx = Math.ceil(effectiveBreak);
                breakLabel = monthValues[11] >= 0 ? 'Rentable M' + breakMIdx : 'D\u00e9ficit';
              }

              // Pilule blanche derriere le label pour la lisibilite
              ctx.font = 'bold ' + (fontSize + 1) + 'px Plus Jakarta Sans, system-ui, sans-serif';
              var lblW = ctx.measureText(breakLabel).width;
              var pillPad = 8;
              var pillH = 22;
              var pillX = breakX - lblW / 2 - pillPad;
              var pillY = Math.round(pad.top - pillH - 8);
              // Clamp horizontal pour rester dans la zone du graphique
              if (pillX < pad.left) pillX = pad.left;
              if (pillX + lblW + 2 * pillPad > W - pad.right) pillX = W - pad.right - lblW - 2 * pillPad;

              ctx.fillStyle = 'rgba(255,255,255,0.95)';
              ctx.fillRect(pillX, pillY, lblW + 2 * pillPad, pillH);
              ctx.strokeStyle = breakColor;
              ctx.lineWidth = 1.5;
              ctx.strokeRect(pillX, pillY, lblW + 2 * pillPad, pillH);

              var lblCenterX = pillX + (lblW + 2 * pillPad) / 2;
              ctx.fillStyle = breakColor;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(breakLabel, lblCenterX, pillY + pillH / 2);
            }
          }

          // Verticale audit Qualiopi (sobre, trait fin pointille bordeaux)
          if (auditInfo && auditInfo.monthsAway > 0 && auditInfo.monthsAway <= 12 && progress >= 0.85) {
            var auditXV = Math.round(pad.left + auditInfo.monthsAway * groupW);
            ctx.save();
            ctx.strokeStyle = PALETTE.bordeaux;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(auditXV + 0.5, Math.round(pad.top));
            ctx.lineTo(auditXV + 0.5, Math.round(pad.top + chartH));
            ctx.stroke();
            ctx.setLineDash([]);
            // Label : aligne a droite de la verticale, fond blanc pour lisibilite
            var auditLbl = 'Audit ' + (auditInfo.typeLabel || 'Qualiopi') + ' \u00b7 M+' + auditInfo.monthsAway;
            ctx.font = fontSize + 'px Plus Jakarta Sans, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            var lblW = ctx.measureText(auditLbl).width;
            var lblY = Math.round(pad.top + 8);
            // Background rectangle blanc pour isoler le label des grilles
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fillRect(auditXV - lblW - 8, lblY - fontSize, lblW + 6, fontSize + 4);
            ctx.fillStyle = PALETTE.bordeaux;
            ctx.fillText(auditLbl, auditXV - 4, lblY - Math.round(fontSize / 2) + 2);
            ctx.restore();
          }
        }

        // Result net annotation (static, drawn once)
        var endNet = monthValues[11];
        if (endNet !== 0) {
          var netColor = endNet > 0 ? PALETTE.succes : PALETTE.erreur;
          var netSign = endNet > 0 ? '+' : '';
          ctx.fillStyle = netColor;
          var annFS = fontSize + 1;
          ctx.font = 'bold ' + annFS + 'px Plus Jakarta Sans, system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          var annY = Math.round(pad.top - 10);
          var annXR = Math.round(W - pad.right);

          if (endNet > 0) {
            var roiDisplayVal = roiMultiple > MAX_ROI_DISPLAY ? fmtNum(MAX_ROI_DISPLAY, 0) + '+' : fmtNum(roiMultiple, 1);
            var annSuffix = ' (\u00d7' + roiDisplayVal + ')';
            var annSuffixW = ctx.measureText(annSuffix).width;
            ctx.fillText(annSuffix, annXR, annY);
            var annSupFS = Math.round(annFS * 0.7);
            ctx.font = 'bold ' + annSupFS + 'px Plus Jakarta Sans, system-ui, sans-serif';
            var euroW = ctx.measureText('\u20ac').width;
            ctx.fillText('\u20ac', Math.round(annXR - annSuffixW), annY - Math.round(annFS * 0.25));
            ctx.font = 'bold ' + annFS + 'px Plus Jakarta Sans, system-ui, sans-serif';
            ctx.fillText('R\u00e9sultat net cumul\u00e9\u00a0: ' + netSign + fmtCanvas(endNet), Math.round(annXR - annSuffixW - euroW), annY);
          } else {
            var annSupFS2 = Math.round(annFS * 0.7);
            ctx.font = 'bold ' + annSupFS2 + 'px Plus Jakarta Sans, system-ui, sans-serif';
            var euroW2 = ctx.measureText('\u20ac').width;
            ctx.fillText('\u20ac', annXR, annY - Math.round(annFS * 0.25));
            ctx.font = 'bold ' + annFS + 'px Plus Jakarta Sans, system-ui, sans-serif';
            ctx.fillText('R\u00e9sultat net cumul\u00e9\u00a0: ' + fmtCanvas(endNet), Math.round(annXR - euroW2), annY);
          }
        }

        // Y-axis labels (static)
        for (var yi = 0; yi <= gridSteps; yi++) {
          var yy = Math.round(pad.top + (chartH / gridSteps) * yi);
          var gv;
          if (allPositive) { gv = Math.round(absMax * (1 - yi / gridSteps)); }
          else if (allNegative) { gv = Math.round(-absMax * yi / gridSteps); }
          else {
            var mxP = Math.max.apply(null, monthValues);
            var mxN = Math.abs(Math.min.apply(null, monthValues));
            gv = Math.round(mxP + (-mxN - mxP) * (yi / gridSteps));
          }
          ctx.fillStyle = '#999';
          ctx.font = fontSize + 'px Plus Jakarta Sans, system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          var gvTxt = fmtCanvas(gv);
          var gvX = Math.round(pad.left - 8);
          ctx.fillText(gvTxt, gvX, yy);
          var supSz = Math.round(fontSize * 0.7);
          ctx.font = supSz + 'px Plus Jakarta Sans, system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('\u20ac', gvX + 2, yy - Math.round(fontSize * 0.25));
          ctx.textAlign = 'right';
        }

        // === Indicateur mode de facturation (coin haut-droit du canvas) ===
        var billingLabel = Array.isArray(monthlyCost)
          ? 'Annuel : ' + fmtCanvas(monthlyCost[0]) + '\u20ac M1 puis ' + fmtCanvas(monthlyCost[1]) + '\u20ac/mois'
          : 'Mensuel : ' + fmtCanvas(Math.round(monthlyCost)) + '\u20ac/mois';
        ctx.fillStyle = '#999';
        ctx.font = (fontSize - 1) + 'px Plus Jakarta Sans, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(billingLabel, W - pad.right, 4);

        // Animate or draw static (IntersectionObserver : anime au scroll, comme Z1)
        if (skipAnim) {
          drawBars(1);
        } else {
          drawBars(0);
          function startRoiAnim() {
            var animStart = null;
            var animDur = 1500;
            function animFrame(ts) {
              if (!animStart) animStart = ts;
              var p = Math.min(1, (ts - animStart) / animDur);
              drawBars(p);
              if (p < 1) requestAnimationFrame(animFrame);
            }
            requestAnimationFrame(animFrame);
          }
          if ('IntersectionObserver' in window) {
            var roiAnimObs = new IntersectionObserver(function(entries) {
              if (entries[0].isIntersecting) {
                roiAnimObs.disconnect();
                startRoiAnim();
              }
            }, { threshold: 0.3 });
            roiAnimObs.observe(canvas);
          } else {
            startRoiAnim();
          }
        }
      }

      // Static version for print
      function drawRoiChartStatic() {
        if (_lastRoiArgs) {
          drawRoiChart(_lastRoiArgs[0], _lastRoiArgs[1], _lastRoiArgs[2], _lastRoiArgs[3], _lastRoiArgs[4], _lastRoiArgs[5], true, _lastRoiArgs[6], _lastRoiArgs[7], _lastRoiArgs[8]);
        }
      }

      // Resize handler
      var _roiResizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(_roiResizeTimer);
        _roiResizeTimer = setTimeout(function() {
          if (_lastRoiArgs) drawRoiChartStatic();
        }, 200);
      });

      // Print: ROI chart redraw is handled by preparePrintLayout() in the share section

      // Hover tooltip for ROI chart
      (function() {
        var canvas = document.getElementById('simRoiCanvas');
        if (!canvas) return;
        var tip = document.createElement('div');
        tip.style.cssText = 'position:absolute;display:none;padding:4px 8px;background:rgba(0,0,0,0.8);color:#fff;font-size:11px;border-radius:4px;pointer-events:none;z-index:100;white-space:nowrap;';
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(tip);

        canvas.addEventListener('mousemove', function(e) {
          var rect = canvas.getBoundingClientRect();
          var mx = e.clientX - rect.left;
          var found = false;
          for (var ti = 0; ti < _roiTooltipBounds.length; ti++) {
            var b = _roiTooltipBounds[ti];
            if (mx >= b.x && mx <= b.x + b.w) {
              var sign = b.val >= 0 ? '+' : '';
              var seasonPct = Math.round(b.season * 100);
              var seasonTag = ' \u00b7 activit\u00e9 ' + seasonPct + '\u00a0% vs moyenne';
              tip.style.maxWidth = 'none';
              tip.style.whiteSpace = 'nowrap';
              tip.innerHTML = b.label + '\u00a0: ' + sign + fmtNum(Math.round(b.val)) + '\u00a0<sup style="font-size:0.7em">\u20ac</sup>' + seasonTag;
              tip.style.display = 'block';
              tip.style.left = Math.round(b.x + b.w / 2 - 30) + 'px';
              tip.style.top = (e.clientY - rect.top - 30) + 'px';
              found = true;
              break;
            }
          }
          if (!found) tip.style.display = 'none';
        });
        canvas.addEventListener('mouseleave', function() { tip.style.display = 'none'; });
      })();

      // === CHART 2 : Temps Avant/Apres (HTML/CSS barres) ===
      var _timeChartState = { activeTab: 'all', showSuggested: false, breakdown: [], allBreakdown: [] };

      function renderTimeComparisonHTML(taskBreakdown) {
        _timeChartState.breakdown = taskBreakdown;
        var container = document.getElementById('simTimeBars');
        if (!container) return;

        // Build tabs if multiple roles
        var tabsDiv = document.getElementById('simTimeTabs');
        var cibles = state.cibles && state.cibles.length > 1 ? state.cibles : [];
        if (tabsDiv) {
          if (cibles.length > 1) {
            var tabHtml = '<button class="sim-time-tab active" data-filter="all">Tous</button>';
            cibles.forEach(function(role) {
              var label = PROFILE_LABELS[role] || role;
              tabHtml += '<button class="sim-time-tab" data-filter="' + role + '">' + label + '</button>';
            });
            tabsDiv.innerHTML = tabHtml;
            tabsDiv.style.display = '';
            tabsDiv.querySelectorAll('.sim-time-tab').forEach(function(tab) {
              tab.addEventListener('click', function() {
                tabsDiv.querySelectorAll('.sim-time-tab').forEach(function(t) { t.classList.remove('active'); });
                tab.classList.add('active');
                _timeChartState.activeTab = tab.getAttribute('data-filter');
                renderTimeBars();
              });
            });
          } else {
            tabsDiv.innerHTML = '';
            tabsDiv.style.display = 'none';
          }
        }

        // Toggle for "Proposition augmentee" - always visible
        var toggleWrap = document.getElementById('simTimeToggleWrap');
        if (toggleWrap) {
          toggleWrap.style.display = '';
        }

        // Build "Proposition augmentee" data: all profile tasks, including non-selected ones
        var allCibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        var suggestedKeys = [];
        allCibles.forEach(function(c) {
          var p = PROFILE_DEFAULTS[c] || PROFILE_DEFAULTS.formateur;
          p.core.concat(p.frequent).forEach(function(k) {
            if (suggestedKeys.indexOf(k) === -1) suggestedKeys.push(k);
          });
        });
        // Also add tasks not in current selection, filtered by active categories
        var suggestCats = getActiveCats(allCibles);
        Object.keys(TASK_CONFIG).forEach(function(k) {
          if (suggestedKeys.indexOf(k) === -1) {
            var taskCats = TASK_TO_CAT[k] || [1];
            var relevant = taskCats.some(function(c) { return suggestCats.indexOf(c) !== -1; });
            if (relevant) suggestedKeys.push(k);
          }
        });
        // Build full breakdown including suggested tasks
        var allBreakdown = taskBreakdown.slice(); // copy current
        var currentKeys = taskBreakdown.map(function(t) { return t.key; });
        suggestedKeys.forEach(function(k) {
          if (currentKeys.indexOf(k) === -1) {
            var t = TASK_CONFIG[k];
            if (!t) return;
            var vol = state.taskVolumes[k] || t.defaultVolume || 3;
            var mktH = state.taskMarketHours[k] || t.marketHours;
            var divisor = annualDivisor(t);
            var market = (mktH * vol) / divisor;
            var qalia = (t.qaliaHours * vol) / divisor;
            allBreakdown.push({
              key: k,
              label: t.label,
              market: Math.round(market * 10) / 10,
              qalia: Math.round(qalia * 10) / 10,
              volume: vol,
              unitMarket: mktH,
              unitQalia: t.qaliaHours,
              frequency: t.frequency || 'per_program',
              suggested: true
            });
          }
        });
        _timeChartState.allBreakdown = allBreakdown;

        _timeChartState.activeTab = 'all';
        _timeChartState.showSuggested = false;
        // Reset toggle visual state
        var toggleBtn2 = document.getElementById('simTimeToggleSwitch');
        if (toggleBtn2) toggleBtn2.classList.remove('active');
        var lblA2 = document.getElementById('simTimeToggleLabelA');
        var lblB2 = document.getElementById('simTimeToggleLabelB');
        if (lblA2) lblA2.classList.add('active');
        if (lblB2) lblB2.classList.remove('active');
        renderTimeBars();
      }

      function renderTimeBars() {
        var container = document.getElementById('simTimeBars');
        if (!container) return;
        var taskBreakdown = _timeChartState.showSuggested ? (_timeChartState.allBreakdown || _timeChartState.breakdown) : _timeChartState.breakdown;
        var filter = _timeChartState.activeTab;

        // "Tous" tab with multi-role : show insight cards per role + ROI summary
        var multiCibles = state.cibles && state.cibles.length > 1 ? state.cibles : [];
        if (filter === 'all' && multiCibles.length > 1) {
          var allMkt = 0, allQal = 0;
          taskBreakdown.forEach(function(t) { allMkt += t.market; allQal += t.qalia; });
          var insightsHtml = '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-sm); margin-bottom:var(--space-sm);">';
          multiCibles.forEach(function(role) {
            var p = PROFILE_DEFAULTS[role] || PROFILE_DEFAULTS.formateur;
            var roleKeys = (p.core || []).concat(p.frequent || []);
            var roleMkt = 0, roleQal = 0, roleCount = 0;
            taskBreakdown.forEach(function(t) {
              if (roleKeys.indexOf(t.key) > -1) { roleMkt += t.market; roleQal += t.qalia; roleCount++; }
            });
            var roleGain = Math.round((roleMkt - roleQal) * 10) / 10;
            var label = PROFILE_LABELS[role] || role;
            insightsHtml += '<div style="background:rgba(27,126,148,0.06); border:1px solid rgba(27,126,148,0.12); border-radius:1rem; padding:var(--space-sm);">';
            insightsHtml += '<div style="font-size:var(--fs-small); font-weight:700; color:#932951; margin-bottom:var(--space-xs);">' + label + '</div>';
            insightsHtml += '<div style="font-size:var(--fs-small); color:var(--noir); line-height:var(--lh-body);">';
            var roleTjm = (state.tjmByRole && state.tjmByRole[role]) ? state.tjmByRole[role] : state.tjm;
            var roleValueSaved = Math.round(roleGain * roleTjm);
            insightsHtml += '<div>' + roleCount + ' t\u00e2ches \u00b7 <span style="color:#932951;">' + fmtH(roleMkt) + fH('</span> \u2192 <span style="color:#1B7E94;">') + fmtH(roleQal) + fH('</span></div>');
            insightsHtml += '<div style="color:var(--succes); font-weight:600; margin-top:var(--space-2xs);">' + fmtGain(roleGain) + fH(' lib\u00e9r\u00e9es/an \u00b7 <span style="color:var(--bleu-canard);">+') + fmtNum(roleValueSaved) + '\u00a0<sup class="u">\u20ac</sup></span></div>';
            insightsHtml += '</div></div>';
          });
          insightsHtml += '</div>';
          // Global summary
          var totalGainAll = Math.round((allMkt - allQal) * 10) / 10;
          var pctGainAll = allMkt > 0 ? Math.round((totalGainAll / allMkt) * 100) : 0;
          insightsHtml += '<div style="margin-top:var(--space-xs); padding:var(--space-sm); background:rgba(27,126,148,0.06); border-radius:10px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:var(--space-xs); font-size:var(--fs-small); font-weight:600;">';
          var allValueSaved = Math.round(totalGainAll * state.tjm);
          insightsHtml += '<span>Total avant\u00a0: <strong style="color:#932951;">' + fmtH(allMkt) + fH('/an</strong></span>');
          insightsHtml += '<span>Total Qalia\u00a0: <strong style="color:#1B7E94;">' + fmtH(allQal) + fH('/an</strong></span>');
          insightsHtml += '<span style="color:var(--succes); font-weight:700;">' + fmtGain(totalGainAll) + fH(' \u00b7 +') + fmtNum(allValueSaved) + '\u00a0<sup class="u">\u20ac</sup> (\u2212' + pctGainAll + '\u00a0<span class="u">%</span>)</span>';
          insightsHtml += '</div>';
          container.innerHTML = insightsHtml;
          return;
        }

        // Filter by role if tab selected
        var filtered = taskBreakdown;
        if (filter !== 'all') {
          var roleProfile = PROFILE_DEFAULTS[filter];
          if (roleProfile) {
            var roleKeys = (roleProfile.core || []).concat(roleProfile.frequent || []);
            filtered = taskBreakdown.filter(function(t) {
              return roleKeys.indexOf(t.key) > -1;
            });
          }
        }

        // Group filtered tasks by level (core, frequent, advanced)
        var groups = { core: [], frequent: [], advanced: [] };
        filtered.forEach(function(task) {
          var cfg = TASK_CONFIG[task.key];
          var level = cfg ? (cfg.level || 'advanced') : 'advanced';
          groups[level].push(task);
        });
        var groupLabels = { core: 'T\u00e2ches principales', frequent: 'T\u00e2ches fr\u00e9quentes', advanced: 'T\u00e2ches avanc\u00e9es' };

        // Echelle ADAPTATIVE par groupe (core/frequent/advanced)
        // Chaque groupe a son propre maxVal pour preserver la representativite visuelle
        // (evite que la tache la plus longue ecrase les tâches courtes du meme groupe)
        var groupMaxVals = { core: 1, frequent: 1, advanced: 1 };
        ['core', 'frequent', 'advanced'].forEach(function(level) {
          groups[level].forEach(function(t) {
            if (t.market > groupMaxVals[level]) groupMaxVals[level] = t.market;
          });
        });

        var html = '';
        var totalMarketTime = 0;
        var totalQaliaTime = 0;

        ['core', 'frequent', 'advanced'].forEach(function(level) {
          var tasks = groups[level];
          if (tasks.length === 0) return;
          var catMarket = 0;
          var catQalia = 0;
          var levelMax = groupMaxVals[level];
          // Category header
          html += '<div style="font-size:var(--fs-caption); font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--bleu-canard); margin:var(--space-sm) 0 var(--space-2xs); padding-bottom:var(--space-3xs); border-bottom:1px solid rgba(27,126,148,0.15);">' + groupLabels[level] + '</div>';
          tasks.forEach(function(task) {
            catMarket += task.market;
            catQalia += task.qalia;
            totalMarketTime += task.market;
            totalQaliaTime += task.qalia;
            var mPct = Math.max(1, Math.round(task.market / levelMax * 100));
            var qPct = Math.max(1, Math.round(task.qalia / levelMax * 100));
            var sugClass = task.suggested ? ' suggested' : '';
            var cfg = TASK_CONFIG[task.key];
            var tipHtml = (cfg && cfg.tooltip) ? ' <span class="sim-task-info-trigger">?<span class="sim-task-info-tooltip">' + cfg.tooltip + '</span></span>' : '';
            html += '<div class="sim-time-group' + sugClass + '">';
            html += '<div class="sim-time-label">' + task.label + tipHtml + '</div>';
            html += '<div class="sim-time-bar-wrap"><div class="sim-time-bar-header market-header"><span>Sans IA</span><span>' + fmtH(task.market) + fH('</span></div><div class="sim-time-bar-track"><div class="sim-time-bar market" data-width="') + mPct + '"></div></div></div>';
            html += '<div class="sim-time-bar-wrap"><div class="sim-time-bar-header qalia-header"><span>Avec Qalia</span><span>' + fmtH(task.qalia) + fH('</span></div><div class="sim-time-bar-track"><div class="sim-time-bar qalia" data-width="') + qPct + '"></div></div></div>';
            html += '</div>';
          });
          // Per-category sub-total
          var catGain = Math.round((catMarket - catQalia) * 10) / 10;
          html += '<div style="font-size:var(--fs-small); color:var(--gris); text-align:right; margin-bottom:var(--space-2xs);">'
            + '<span style="color:var(--bordeaux);">' + fmtNum(catMarket) + fH('</span>')
            + ' \u2192 <span style="color:var(--bleu-canard);">' + fmtNum(catQalia, 1) + fH('</span>')
            + ' <span style="color:var(--succes); font-weight:600;">(\u2212' + fmtNum(catGain, 1) + fH(')</span></div>');
        });

        // Total insights (before/after summary)
        var totalGain = Math.round((totalMarketTime - totalQaliaTime) * 10) / 10;
        var pctGain = totalMarketTime > 0 ? Math.round((totalGain / totalMarketTime) * 100) : 0;
        html += '<div style="margin-top:var(--space-sm); padding:var(--space-sm); background:rgba(27,126,148,0.06); border-radius:10px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:var(--space-xs); font-size:var(--fs-small); font-weight:600;">';
        html += '<span>Total avant\u00a0: <strong style="color:var(--bordeaux);">' + fmtH(totalMarketTime) + fH('/an</strong></span>');
        html += '<span>Total Qalia\u00a0: <strong style="color:var(--bleu-canard);">' + fmtH(totalQaliaTime) + fH('/an</strong></span>');
        html += '<span style="color:var(--succes); font-weight:700;">' + fmtGain(totalGain) + fH(' lib\u00e9r\u00e9es (\u2212') + pctGain + '\u00a0<span class="u">%</span>)</span>';
        html += '</div>';
        // Note relecture HITL : le temps Qalia couvre le dialogue IA ; la relecture humaine
        // obligatoire n'est pas un "coût caché" mais la valeur ajoutée du praticien réflexif (Schön).
        var relectureMin = Math.round(totalQaliaTime * 1.2);
        var relectureMax = Math.round(totalQaliaTime * 2.8);
        html += '<p class="info-callout" style="font-size:var(--fs-caption); color:var(--gris); line-height:1.55; margin-top:var(--space-xs); padding:var(--space-xs) var(--space-sm); background:rgba(27,126,148,0.05); text-align:left; padding-left:var(--space-md);"><strong style="color:var(--bleu-canard);">Temps de relecture int\u00e9gr\u00e9 au calcul\u00a0:</strong> Qalia produit une premi\u00e8re version structur\u00e9e. Votre relecture p\u00e9dagogique reste indispensable\u00a0: comptez ' + fmtNum(relectureMin) + '\u00a0\u00e0\u00a0' + fmtNum(relectureMax) + fH(' de validation et adaptation par an. Ce temps est ce qui fait votre valeur ajout\u00e9e. Il n\u2019est pas comptabilis\u00e9 comme perdu.</p>');
        container.innerHTML = html;

        // Trigger animation after insertion (stagger 150ms per group = 75ms per bar)
        var bars = container.querySelectorAll('.sim-time-bar');
        setTimeout(function() {
          for (var bi = 0; bi < bars.length; bi++) {
            (function(bar, delay) {
              setTimeout(function() {
                bar.style.width = bar.getAttribute('data-width') + '%';
              }, delay);
            })(bars[bi], bi * 75);
          }
        }, 50);
      }

      // === CHART 3 : Donut rentabilite par programme ===
      function drawProgramDonutChart(costPerProg, savedPerProg, roiPerProg) {
        var canvas = document.getElementById('simDonutCanvas');
        if (!canvas || !canvas.getContext) return;
        var dpr = Math.max(2, window.devicePixelRatio || 2);
        var parentW = canvas.parentElement ? canvas.parentElement.clientWidth - 32 : 280;
        var displayW = Math.max(200, Math.min(parentW, 360));
        var displayH = displayW;
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
        canvas.style.width = displayW + 'px';
        canvas.style.height = displayH + 'px';
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, displayW, displayH);

        var cx = displayW / 2;
        var cy = displayH / 2;
        var outerR = Math.min(cx, cy) - 20;
        var innerR = outerR * 0.6;
        var total = costPerProg + savedPerProg;
        if (total <= 0) total = 1;

        var costAngle = (costPerProg / total) * 2 * Math.PI;
        var savedAngle = (savedPerProg / total) * 2 * Math.PI;
        var startAngle = -Math.PI / 2;

        // Saved arc (bleu-canard)
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + savedAngle);
        ctx.arc(cx, cy, innerR, startAngle + savedAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = '#1B7E94';
        ctx.fill();

        // Cost arc (bordeaux)
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle + savedAngle, startAngle + savedAngle + costAngle);
        ctx.arc(cx, cy, innerR, startAngle + savedAngle + costAngle, startAngle + savedAngle, true);
        ctx.closePath();
        ctx.fillStyle = '#932951';
        ctx.fill();

        // Centre text
        ctx.fillStyle = roiPerProg > 1 ? '#1B7E94' : '#932951';
        ctx.font = 'bold 28px Plus Jakarta Sans, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u00d7' + fmtNum(roiPerProg, 1), cx, cy - 8);

        ctx.fillStyle = '#666';
        ctx.font = '11px Plus Jakarta Sans, system-ui, sans-serif';
        ctx.fillText('ROI/programme', cx, cy + 16);

        // Legend bottom
        var legendY = displayH - 10;
        ctx.font = '10px Plus Jakarta Sans, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1B7E94';
        ctx.fillText('Gain : ' + fmtCanvas(savedPerProg) + ' \u20ac', cx - 60, legendY);
        ctx.fillStyle = '#932951';
        ctx.fillText('Co\u00fbt : ' + fmtCanvas(costPerProg) + ' \u20ac', cx + 60, legendY);
      }

      // === SWOT GENERATOR (uses PROFILE_COPY + QUALIOPI_COPY) ===
      function generateSWOT(data) {
        var profileCopy = PROFILE_COPY[data.cible] || PROFILE_COPY.formateur;
        var config = profileCopy.swot(data);
        // Enrich with Qualiopi status
        var qCopy = QUALIOPI_COPY[data.qualiopi];
        if (qCopy && qCopy.swotExtra) {
          config.opportunites.push(qCopy.swotExtra.opportunites);
          config.menaces.push(qCopy.swotExtra.menaces);
        }
        // Enrich with team context
        if (data.pourQui === 'equipe') {
          config.forces.push('Standardisation \u00e9quipe (' + data.tailleEquipe + ' formateurs)');
          config.menaces.push('NC syst\u00e9mique si \u00e9quipe non align\u00e9e');
        }
        var fmt = function(arr) { return arr.map(function(t) { return '\u2022 ' + t; }).join('<br>'); };
        document.getElementById('simSwotForces').innerHTML = fmt(config.forces);
        document.getElementById('simSwotFaiblesses').innerHTML = fmt(config.faiblesses);
        document.getElementById('simSwotOpportunites').innerHTML = fmt(config.opportunites);
        document.getElementById('simSwotMenaces').innerHTML = fmt(config.menaces);
      }

      // === INDICATEUR DE PRIORITÉ (enrichi par contexte Qualiopi) ===
      function renderEisenhower(netResult, qualiopi, echeanceMois) {
        var el = document.getElementById('simEisenhower');
        var boost = 0;
        var qCopy = QUALIOPI_COPY[qualiopi];
        if (qCopy) boost = qCopy.eisenhowerBoost || 0;
        // Extra boost if deadline < 6 months
        if (echeanceMois && echeanceMois < 6) boost += 2000;
        var adjusted = netResult + boost;

        var cls, icon, text;
        if (adjusted > 5000) {
          cls = 'faire'; icon = '\u2714'; text = 'PRIORIT\u00c9 HAUTE : \u00c0 engager';
        } else if (adjusted > 2000) {
          cls = 'planifier'; icon = '\u2605'; text = '\u00c0 PLANIFIER : Important';
        } else if (adjusted > 0) {
          cls = 'considerer'; icon = '\u2601'; text = '\u00c0 APPROFONDIR : Analysez votre cas';
        } else {
          cls = 'explorer'; icon = '\u21bb'; text = '\u00c0 EXPLORER : Testez d\u2019abord';
        }
        el.className = 'sim-eisenhower ' + cls;
        var boostNote = '';
        if (boost > 0) {
          boostNote = '<div style="font-size:var(--fs-caption); color:var(--gris); margin-top:var(--space-2xs);">'
            + 'Priorit\u00e9 ajust\u00e9e\u00a0: votre contexte Qualiopi'
            + (echeanceMois && echeanceMois < 6 ? ' et votre \u00e9ch\u00e9ance \u00e0 ' + echeanceMois + '\u00a0mois' : '')
            + ' rehausse l\u2019urgence de la d\u00e9cision.</div>';
        }
        el.innerHTML = '<span>' + icon + '</span> <strong>' + text + '</strong>' + boostNote;
        return text;
      }

      // === D.U.R. (Pelissier) - enriched with Qualiopi status ===
      function renderDUR(data) {
        var el = document.getElementById('simDur');
        var qCopy = QUALIOPI_COPY[data.qualiopi];
        var urgentText = qCopy ? qCopy.durUrgent : 'Prochaine \u00e9ch\u00e9ance audit (surveillance M+14 \u00e0 M+22 ou renouvellement 3 ans)';
        var html = '';
        html += '\u2022 ' + fmtH(data.totalOldHours) + fH('/an de travail manuel.<br>')
          + 'Soit ' + fmtNum(data.totalOldHours * data.tjm) + '\u00a0<sup class="u">\u20ac</sup> de co\u00fbt r\u00e9el.<br>';
        html += '\u2022 ' + urgentText;
        if (data.qualiopi !== 'non_concerne' && data.echeanceMois && data.echeanceMois < 12) {
          html += ' (' + data.echeanceMois + ' <span class="u">mois</span> restants)';
        }
        html += '<br>';
        html += '\u2022 84 <span class="u">%</span> des concepteurs p\u00e9dagogiques ont essay\u00e9 ChatGPT g\u00e9n\u00e9raliste sans impact significatif (enqu\u00eate Hardman/Synthesia, 400+ professionnels, 2024)';
        el.innerHTML = html;
        el.style.display = 'block';
      }

      // === CONSEQUENCES ===
      function renderConsequences(data) {
        var el = document.getElementById('simConsequences');
        var hours3y = Math.round(data.hoursSaved * 3);
        if (data.netResult <= 0) {
          var html = '<strong>Le ROI financier n\u2019est pas au rendez-vous.</strong><br>';
          html += 'Avec le volume actuel, l\u2019investissement d\u00e9passe les gains directs.<br>';
          html += 'Augmentez le volume de t\u00e2ches ou le tarif horaire pour atteindre la rentabilit\u00e9.';
          if (data.pains.indexOf('echeance') > -1) {
            html += '<br>Risque NC majeure\u00a0: perte certification + activit\u00e9 + cr\u00e9dibilit\u00e9 (>10\u00a0000\u00a0<sup class="u">\u20ac</sup>).';
          }
          el.innerHTML = html;
        } else {
          var cost3y = Math.round(data.valueSaved * 3);
          var html = '<strong>Co\u00fbt de l\u2019inaction sur 3 ans</strong>&nbsp;:<br>';
          html += 'Sans changement\u00a0: <strong>' + fmtNum(hours3y) + fH(' perdues</strong>.<br>')
            + 'Soit <strong>' + fmtNum(cost3y) + '\u00a0<sup class="u">\u20ac</sup></strong> de manque \u00e0 gagner.';
          if (data.pains.indexOf('echeance') > -1) {
            html += '<br>Risque NC majeure\u00a0: perte certification + activit\u00e9 + cr\u00e9dibilit\u00e9 (>10\u00a0000\u00a0<sup class="u">\u20ac</sup>).';
          }
          el.innerHTML = html;
        }
        el.style.display = 'block';
      }

      // === INSIGHT TEXT (uses PROFILE_COPY) ===
      function getInsightText(data) {
        var c = data.cible || 'formateur';
        if (data.netResult <= 0) {
          var base = '<strong>Constat honn\u00eate</strong>&nbsp;: avec ' + fmtNum(data.totalPrograms) + '\u00a0programmes \u00e0 ' + fmtNum(data.tjm) + '\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span>, '
            + 'la rentabilit\u00e9 purement financi\u00e8re n\u2019est pas au rendez-vous sur 1\u00a0an.';
          if (data.pains.indexOf('echeance') > -1) {
            base += '<br>Cependant, le co\u00fbt d\u2019une certification perdue d\u00e9passe largement ' + fmtNum(data.annualCost) + '\u00a0<sup class="u">\u20ac</sup>.';
          }
          // Add Qualiopi urgency
          var qCopy = QUALIOPI_COPY[data.qualiopi];
          if (qCopy && qCopy.urgency) base += ' ' + qCopy.urgency;
          return base;
        }
        var profileCopy = PROFILE_COPY[c] || PROFILE_COPY.formateur;
        var text = profileCopy.insight(data);
        // Add Qualiopi context
        var qCopy2 = QUALIOPI_COPY[data.qualiopi];
        if (qCopy2 && qCopy2.urgency) text += ' ' + qCopy2.urgency;
        return text;
      }

      // === IA BADGE ADAPTATION (uses PROFILE_COPY) ===
      function updateIaBadge(cible) {
        var el = document.getElementById('simIaBadge');
        if (!el) return;
        var profileCopy = PROFILE_COPY[cible] || PROFILE_COPY.formateur;
        el.textContent = profileCopy.badge;
      }

      // === CALCUL DES RESULTATS (multi-t\u00e2ches) ===
      function computeResults() {
        // Taux de mon\u00e9tisation prudent : 50\u00a0% des heures lib\u00e9r\u00e9es effectivement refactur\u00e9es
        // Utilis\u00e9 pour le ROI fourchette et le r\u00e9sultat net r\u00e9aliste
        var FILL_RATE = 0.5;
        // === GARDE-FOUS : validation des entr\u00e9es ===
        // Plafonner effectif total (anti-abus)
        if (state.tailleEquipe > MAX_ETP_TOTAL) state.tailleEquipe = MAX_ETP_TOTAL;
        // Plafonner chaque r\u00f4le
        state.cibles.forEach(function(role) {
          var maxR = MAX_ETP_PER_ROLE[role] || 50;
          if ((state.teamBreakdown[role] || 1) > maxR) state.teamBreakdown[role] = maxR;
        });
        // Recalculer tailleEquipe apr\u00e8s plafonnement
        var recalcTotal = 0;
        state.cibles.forEach(function(c) { recalcTotal += (state.teamBreakdown[c] || 1); });
        if (recalcTotal > MAX_ETP_TOTAL) recalcTotal = MAX_ETP_TOTAL;
        if (state.pourQui === 'equipe') state.tailleEquipe = recalcTotal;
        // TJM guard
        if (state.tjm < 20) state.tjm = 20;

        // Compute hours using multi-task system (3 colonnes : sans IA / ChatGPT / Qalia)
        var taskResult = computeTaskHours(state.tasks);
        var totalOldHours = taskResult.totalMarket;
        var totalChatGPTHours = taskResult.totalChatGPT;
        var totalQaliaHours = taskResult.totalQalia;
        var hoursSaved = totalOldHours - totalQaliaHours;
        var hoursSavedVsChatGPT = totalChatGPTHours - totalQaliaHours;
        var totalPrograms = state.programs;

        if (hoursSaved < 0) hoursSaved = 0;
        if (hoursSavedVsChatGPT < 0) hoursSavedVsChatGPT = 0;

        // Team multiplier for cost (paliers tarifaires)
        var teamMultiplier = (state.pourQui === 'equipe' && state.tailleEquipe > 1) ? state.tailleEquipe : 1;
        var pricingTier = getPricingTier(teamMultiplier);
        var annualCostPerLicense = state.billingAnnual ? pricingTier.annual : (pricingTier.monthly * 12);
        var annualCost = annualCostPerLicense;
        var totalAnnualCost = annualCost * teamMultiplier;
        // Heures : les volumes (taskVolumes) incluent déjà le facteur ETP
        // (maxProfileVol × tailleEquipe). Ne PAS remultiplier par teamMultiplier
        // sinon double-comptage. Le coût seul doit scaler par licence.
        annualCost = totalAnnualCost;
        // Add ChatGPT subscription cost
        var chatgptPlanData = CHATGPT_PLANS[state.chatgptPlan] || CHATGPT_PLANS.plus;
        var chatgptAnnualCost = chatgptPlanData.annual * teamMultiplier;
        annualCost += chatgptAnnualCost;
        // Calculate value saved using per-role rates if active
        var effectiveTjm = state.tjm;
        if (state.tjmByRoleActive && state.cibles && state.cibles.length > 1) {
          // Weighted average rate based on ETP per role
          var totalEtp = 0, weightedSum = 0;
          state.cibles.forEach(function(role) {
            var etp = state.teamBreakdown[role] || 1;
            var rate = state.tjmByRole[role] || state.tjm;
            weightedSum += etp * rate;
            totalEtp += etp;
          });
          effectiveTjm = totalEtp > 0 ? weightedSum / totalEtp : state.tjm;
        }
        var valueSaved = hoursSaved * effectiveTjm;
        var netResult = valueSaved - annualCost;
        var daysFreed = Math.round(hoursSaved / 8);
        var roiMultiple = annualCost > 0 ? (valueSaved / annualCost) : 0;
        var costPerProgram = totalPrograms > 0 ? Math.round(annualCost / totalPrograms) : 0;
        var savedPerProgram = totalPrograms > 0 ? Math.round(valueSaved / totalPrograms) : 0;

        // Arrondi modeste : heures arrondies à l'heure inférieure (pas de fausse précision)
        var hRound = Math.floor(hoursSaved);
        var vRound = Math.round(valueSaved);
        var netRound = Math.round(netResult);

        // === SOURCE UNIQUE : stocker les résultats pour populatePersonalRoi() ===
        state.results = {
          totalOldHours: totalOldHours, totalChatGPTHours: totalChatGPTHours, totalQaliaHours: totalQaliaHours,
          hoursSaved: hoursSaved, hoursSavedVsChatGPT: hoursSavedVsChatGPT,
          hRound: hRound, vRound: vRound, netRound: netRound,
          valueSaved: valueSaved, netResult: netResult, annualCost: annualCost,
          roiMultiple: roiMultiple, daysFreed: daysFreed, effectiveTjm: effectiveTjm,
          teamMultiplier: teamMultiplier, pricingTier: pricingTier,
          totalPrograms: totalPrograms, costPerProgram: costPerProgram,
          savedPerProgram: savedPerProgram, chatgptPlanData: chatgptPlanData,
          breakdown: taskResult.breakdown
        };

        // ═══════════════════════════════════════════════════════════════════
        // _profileCard : source unique pour l'affichage du profil utilisateur
        // Construit AVANT les affichages pour que tous les consommateurs lisent
        // la m\u00eame source (dashboard r\u00e9cap, tooltips, roiDynSubtitle, PDF, partage).
        // Sera attach\u00e9 \u00e0 SIM_COMPUTED.profileCard plus bas.
        // ═══════════════════════════════════════════════════════════════════
        var _profileCard = (function() {
          var _ciblesList = (state.cibles && state.cibles.length > 0) ? state.cibles : [state.cible || 'formateur'];
          var _qualiopiLabels = {
            aspirant: 'Aspirant \u00e0 la certification',
            initial: 'Audit initial \u00e0 pr\u00e9parer',
            surveillance: 'Audit de surveillance \u00e0 pr\u00e9parer',
            stable: 'Certifi\u00e9 stable',
            renouvellement: 'Renouvellement \u00e0 pr\u00e9parer'
          };
          var _painLabelsMap = (typeof PAIN_CONFIG === 'object' && PAIN_CONFIG) ? PAIN_CONFIG : {};

          var _rolesLabeled = _ciblesList.map(function(c) { return PROFILE_LABELS[c] || c; });
          // Format ETP : "N R\u00f4le" (homog\u00e9n\u00e9it\u00e9 : m\u00eame si n===1 en multi-r\u00f4les)
          var _isMulti = _ciblesList.length > 1;
          var _rolesWithEtp = _ciblesList.map(function(c) {
            var lbl = PROFILE_LABELS[c] || c;
            var n = (state.teamBreakdown && state.teamBreakdown[c]) ? state.teamBreakdown[c] : 1;
            // Affiche le chiffre si n>1 OU si contexte multi-r\u00f4les (homog\u00e9n\u00e9it\u00e9 visuelle)
            if (n > 1 || _isMulti) return n + '\u00a0' + lbl;
            return lbl;
          });

          var _tjmHasMultiRates = false;
          if (state.tjmByRoleActive && state.tjmByRole && _ciblesList.length > 1) {
            _tjmHasMultiRates = !_ciblesList.every(function(c) {
              return (state.tjmByRole[c] || state.tjm) === (state.tjmByRole[_ciblesList[0]] || state.tjm);
            });
          }
          var _tjmBreakdown = _ciblesList.map(function(c) {
            return { role: PROFILE_LABELS[c] || c, rate: state.tjmByRole && state.tjmByRole[c] ? state.tjmByRole[c] : state.tjm };
          });
          var _tjmEffectiveRounded = Math.round(effectiveTjm);

          var _contextLabel = (state.pourQui === 'equipe' && state.tailleEquipe > 1)
            ? '\u00c9quipe de ' + state.tailleEquipe + ' personnes'
            : 'Solo';

          var _qualiopiBase = state.qualiopi && _qualiopiLabels[state.qualiopi] ? _qualiopiLabels[state.qualiopi] : '';
          var _qualiopiFull = _qualiopiBase;
          if (_qualiopiBase && state.echeanceMois && state.echeanceMois < 12) {
            _qualiopiFull = _qualiopiBase + ' (\u00e9ch\u00e9ance ' + state.echeanceMois + '\u00a0mois)';
          }

          var _tasksList = Array.isArray(state.tasks) ? state.tasks.slice() : [];
          var _tasksLabels = _tasksList.map(function(t) {
            if (typeof t === 'string' && TASK_CONFIG[t]) return TASK_CONFIG[t].label || t;
            return t;
          });

          var _painsLabels = (state.pains || []).map(function(p) {
            return (_painLabelsMap[p] && _painLabelsMap[p].label) ? _painLabelsMap[p].label : p;
          });

          return {
            roles: _ciblesList.slice(),
            rolesLabeled: _rolesLabeled,
            rolesWithEtp: _rolesWithEtp,
            rolesJoined: _rolesLabeled.join(', '),
            rolesJoinedWithEtp: _rolesWithEtp.join(' \u2022 '),
            contextLabel: _contextLabel,
            isTeam: (state.pourQui === 'equipe' && state.tailleEquipe > 1),
            teamSize: state.tailleEquipe || 1,
            qualiopiStatus: state.qualiopi || '',
            qualiopiLabel: _qualiopiBase,
            qualiopiFull: _qualiopiFull,
            qualiopiIsUrgent: !!(state.echeanceMois && state.echeanceMois < 12),
            echeanceMois: state.echeanceMois || 0,
            programsCount: totalPrograms,
            programsLabel: totalPrograms + '\u00a0programme' + (totalPrograms > 1 ? 's' : ''),
            totalOldHours: Math.round(totalOldHours),
            totalOldHoursLabel: Math.round(totalOldHours) + '\u00a0h de travail manuel',
            tjmEffective: _tjmEffectiveRounded,
            tjmEffectiveLabel: _tjmEffectiveRounded + '\u00a0\u20ac/h',
            tjmHasMultiRates: _tjmHasMultiRates,
            tjmBreakdown: _tjmBreakdown,
            tjmDeclared: state.tjm,
            tasksCount: _tasksList.length,
            tasksLabel: _tasksList.length + '\u00a0t\u00e2che' + (_tasksList.length > 1 ? 's' : ''),
            tasksKeys: _tasksList,
            tasksLabels: _tasksLabels,
            tasksJoined: _tasksLabels.join(', '),
            pains: (state.pains || []).slice(),
            painsLabels: _painsLabels,
            painsJoined: _painsLabels.join(', ')
          };
        })();

        // Affichage metriques
        document.getElementById('simResPrograms').textContent = fmtNum(totalPrograms);
        // Context recap : lit UNIQUEMENT depuis _profileCard (source unique)
        var recapEl = document.getElementById('simContextRecap');
        if (recapEl) {
          var recapParts = [];
          // R\u00f4les avec ETP si >1 (pas de mention de taux par r\u00f4le pour \u00e9viter confusion)
          recapParts.push(_profileCard.rolesJoinedWithEtp);
          // Taux horaire : UN SEUL chiffre (pond\u00e9r\u00e9 ETP si multi-taux)
          var _tjmRecapStr = _profileCard.tjmEffective + '\u00a0<span class="u">\u20ac/h</span>';
          if (_profileCard.tjmHasMultiRates) {
            _tjmRecapStr += '\u00a0<span class="u">(moyenne pond\u00e9r\u00e9e)</span>';
          }
          recapParts.push(_tjmRecapStr);
          // Volume programmes + t\u00e2ches
          recapParts.push(_profileCard.programsLabel);
          recapParts.push(_profileCard.tasksLabel);
          // Qualiopi (si applicable)
          if (_profileCard.qualiopiStatus && _profileCard.qualiopiStatus !== 'non_concerne') {
            recapParts.push(_profileCard.qualiopiFull);
          }
          // Contexte \u00e9quipe (si applicable)
          if (_profileCard.isTeam) {
            recapParts.push(_profileCard.contextLabel);
          }
          recapEl.innerHTML = recapParts.join(' | ');
          // Alias pour la suite du bloc (garde-fou combinatoire)
          var ciblesRecap = _profileCard.roles;
          // Garde-fou profil combinatoire : alerter si l'utilisateur combine 3 rôles ou plus
          // (formateur + directeurOF + accompagnateurVAE = cas rare, réalisme à vérifier)
          // Nettoyer une éventuelle alerte précédente (anti-duplication)
          var existingAlert = document.querySelector('.sim-profil-combinatoire-alert');
          if (existingAlert && existingAlert.parentNode) existingAlert.parentNode.removeChild(existingAlert);
          if (ciblesRecap.length >= 3 && (!teamMultiplier || teamMultiplier <= ciblesRecap.length)) {
            var alertProfil = document.createElement('p');
            alertProfil.className = 'sim-profil-combinatoire-alert info-callout info-callout--orange';
            alertProfil.style.cssText = 'margin-top:var(--space-xs); padding:var(--space-2xs) var(--space-xs) var(--space-2xs) var(--space-md); font-size:var(--fs-caption); color:var(--noir); background-color:rgba(255,183,77,0.12); line-height:var(--lh-body);';
            var _lic = (teamMultiplier || 1);
            alertProfil.innerHTML = '<strong>Profil combinatoire rare :</strong> vous cumulez ' + ciblesRecap.length + ' rôles sur ' + _lic + ' licence' + (_lic > 1 ? 's' : '') + '. Vérifiez que cette configuration reflète votre réalité terrain. Pour un OF multi-rôles internalisés, augmentez le palier équipe ; pour un indépendant polyvalent, conservez ce profil.';
            recapEl.parentNode.insertBefore(alertProfil, recapEl.nextSibling);
          }
          // Disclaimer VAE : le ratio Livret 2 reflète la préparation assistée du candidat,
          // pas la rédaction à sa place (obligation d'accompagnement humain certifié, France VAE)
          var hasVAE = ciblesRecap.indexOf('accompagnateurVAE') > -1 || ciblesRecap.indexOf('coach') > -1 && ciblesRecap.indexOf('directeurOF') > -1;
          var hasVAEStrict = ciblesRecap.indexOf('accompagnateurVAE') > -1;
          var existingVaeNote = document.querySelector('.sim-vae-disclaimer');
          if (hasVAEStrict) {
            if (!existingVaeNote) {
              var vaeNote = document.createElement('p');
              vaeNote.className = 'sim-vae-disclaimer info-callout';
              vaeNote.style.cssText = 'margin-top:var(--space-xs); padding:var(--space-2xs) var(--space-xs) var(--space-2xs) var(--space-md); font-size:var(--fs-caption); color:var(--noir); background-color:rgba(27,126,148,0.06); line-height:var(--lh-body);';
              vaeNote.innerHTML = '<strong>VAE, Livret 2 :</strong> le ratio horaire couvre la structuration et la préparation assistée du candidat. La rédaction finale, l\u2019accompagnement humain certifié et la soutenance devant jury restent obligatoires (cadre France VAE, art. L.6412-1 et suivants du Code du travail).';
              recapEl.parentNode.insertBefore(vaeNote, recapEl.nextSibling);
            }
          } else if (existingVaeNote && existingVaeNote.parentNode) {
            existingVaeNote.parentNode.removeChild(existingVaeNote);
          }
        }
        animateValue(document.getElementById('simResHours'), hRound, 'h', 800, 0);
        animateValue(document.getElementById('simResValue'), vRound, '<sup class="u">\u20ac</sup>', 1000, 0);
        animateValue(document.getElementById('simResCost'), annualCost, '<sup class="u">\u20ac</sup>', 600, 0);

        // Infobulles ROI : d\u00e9tail du calcul au survol (transparence)
        var hoursMetric = document.getElementById('simResHours');
        if (hoursMetric && hoursMetric.parentElement) {
          hoursMetric.parentElement.title = 'Heures march\u00e9 (' + fmtNum(totalOldHours) + ' h) \u2212 Heures Qalia (' + fmtNum(totalQaliaHours) + ' h) = ' + fmtNum(hRound) + ' h lib\u00e9r\u00e9es. Bas\u00e9 sur ' + state.tasks.length + ' t\u00e2ches \u00d7 ' + fmtNum(totalPrograms) + ' programmes.';
        }
        var valueMetric = document.getElementById('simResValue');
        if (valueMetric && valueMetric.parentElement) {
          // Utilise le taux effectif (pond\u00e9r\u00e9 ETP si multi-taux), coh\u00e9rent avec le calcul interne
          var _tjmTooltip = _profileCard.tjmEffective;
          var _tjmTooltipLabel = _profileCard.tjmHasMultiRates ? ' \u20ac/h (moyenne pond\u00e9r\u00e9e)' : ' \u20ac/h (votre taux horaire)';
          valueMetric.parentElement.title = fmtNum(hRound) + ' h \u00d7 ' + fmtNum(_tjmTooltip) + _tjmTooltipLabel + ' = ' + fmtNum(vRound) + ' \u20ac de valeur r\u00e9cup\u00e9r\u00e9e.';
        }
        var costMetric = document.getElementById('simResCost');
        if (costMetric && costMetric.parentElement) {
          costMetric.parentElement.title = (state.billingAnnual ? '2\u00a0970 \u20ac/an TTC (247,50 \u20ac/mois, 2 mois offerts)' : '297 \u20ac/mois TTC \u00d7 12 mois') + ' = ' + fmtNum(annualCost) + ' \u20ac/an' + (teamMultiplier > 1 ? ' (palier ' + teamMultiplier + ' licences)' : '') + '.';
        }

        // Nouveaux KPIs
        var roiDisplay = document.getElementById('simResRoi');
        var paybackDisplay = document.getElementById('simResPayback');
        var daysDisplay = document.getElementById('simResDays');
        var metricRoiCard = document.getElementById('simMetricRoi');
        var metricPaybackCard = document.getElementById('simMetricPayback');
        var metricDaysCard = document.getElementById('simMetricDays');

        // Payback : modele « recuperation de cout »
        // Mensuel : jours pour couvrir 1 mensualite ; Annuel : jours pour couvrir l'engagement total
        // Differentiation structurelle ~10x entre mensuel et annuel
        var paybackDays = computePaybackDays(valueSaved, annualCost, state.billingAnnual);
        var paybackMonth = paybackDays > 0 ? Math.ceil(paybackDays / 30) : 0;
        if (paybackMonth === 0 && valueSaved > annualCost) paybackMonth = 1;

        // Masquer les 3 KPIs secondaires si non rentable (bruit visuel)
        var isProfitable = netRound > 0;
        var paybackLabel = formatPaybackLabel(paybackMonth, paybackDays, isProfitable);
        // Enrichir state.results avec les données payback (source unique pour populatePersonalRoi)
        state.results.paybackMonth = paybackMonth;
        state.results.paybackDays = paybackDays;
        state.results.paybackLabel = paybackLabel;
        var isRoiAberrant = roiMultiple > MAX_ROI_DISPLAY;

        // ═══════════════════════════════════════════════════════════════════
        // SIM_COMPUTED : source unique de vérité pour tous les consommateurs
        // ═══════════════════════════════════════════════════════════════════
        // Règle d'or : aucun consommateur downstream (dashboard, tooltip,
        // verdict, templates, canvas, partage, PDF) ne doit recalculer ces
        // valeurs. Ils lisent SIM_COMPUTED.*.
        //
        // Toute nouvelle valeur dérivée affichée à l'utilisateur rejoint
        // ce bloc, jamais de calcul inline dans une phrase affichée.
        // ═══════════════════════════════════════════════════════════════════
        var _roiPrudentRaw = annualCost > 0 ? (Math.round(valueSaved * FILL_RATE) / annualCost) : 0;
        var _realisticValue = Math.round(valueSaved * FILL_RATE);
        var _realisticNet = _realisticValue - annualCost;
        var _nbPersonnesPalier = Math.max(1, teamMultiplier || 1);
        var _weekendsBruts = Math.round(hoursSaved / 16);
        var _weekendsParPersonne = Math.round(_weekendsBruts / _nbPersonnesPalier);
        var _weekendsFreedGlobal = Math.min(_weekendsParPersonne, 52);

        var SIM_COMPUTED = {
          roi: {
            raw: roiMultiple,              // théorique brut (interne uniquement)
            prudentRaw: _roiPrudentRaw,    // prudent brut 50 % (interne uniquement)
            // Règle d'affichage unique : >=3 donne '3+', sinon valeur réelle à 1 décimale
            displayStr: _roiPrudentRaw >= 3 ? '3+' : fmtNum(_roiPrudentRaw, 1),
            isAberrant: isRoiAberrant      // pour styling conditionnel
          },
          hours: {
            saved: hoursSaved,             // brut
            rounded: hRound,               // arrondi inférieur (display)
            oldTotal: totalOldHours,
            qaliaTotal: totalQaliaHours,
            vsChatGPT: hoursSavedVsChatGPT
          },
          value: {
            saved: valueSaved,             // brut
            rounded: vRound,               // arrondi (display)
            realistic: _realisticValue,    // prudent 50 %
            perProgram: savedPerProgram
          },
          cost: {
            annual: annualCost,
            perProgram: costPerProgram,
            chatgptAnnual: chatgptAnnualCost
          },
          net: {
            raw: netResult,
            rounded: netRound,
            sign: netRound >= 0 ? '+' : '',
            isProfitable: isProfitable,
            realistic: _realisticNet,
            realisticSign: _realisticNet >= 0 ? '+' : ''
          },
          days: {
            freed: daysFreed
          },
          weekends: {
            global: _weekendsFreedGlobal,
            perPerson: _weekendsParPersonne,
            brut: _weekendsBruts
          },
          payback: {
            months: paybackMonth,
            days: paybackDays,
            label: paybackLabel
          },
          profile: {
            programs: totalPrograms,
            teamMultiplier: teamMultiplier,
            pricingTier: pricingTier,
            effectiveTjm: effectiveTjm,
            chatgptPlan: chatgptPlanData
          }
        };

        // Attache _profileCard (construit plus haut) \u00e0 SIM_COMPUTED
        SIM_COMPUTED.profileCard = _profileCard;

        // Exposer sur state.results pour compat descendante (populatePersonalRoi, etc.)
        state.results.SIM_COMPUTED = SIM_COMPUTED;
        if (isProfitable) {
          metricRoiCard.style.display = '';
          metricPaybackCard.style.display = '';
          metricDaysCard.style.display = '';
          // Toutes les valeurs lues depuis SIM_COMPUTED (source unique)
          roiDisplay.innerHTML = '&times;' + SIM_COMPUTED.roi.displayStr;
          roiDisplay.style.color = SIM_COMPUTED.roi.isAberrant ? 'var(--succes)' : '';
          fitMetricValue(roiDisplay);
          var roiSubLabelEl = document.getElementById('simRoiSubLabel');
          if (roiSubLabelEl) { roiSubLabelEl.textContent = 'm\u00e9diane OF observ\u00e9e'; }
          metricRoiCard.title = 'M\u00e9diane observ\u00e9e sur les OF Qualiopi\u00a0: \u00d7' + SIM_COMPUTED.roi.displayStr
            + '. Calcul\u00a0: 50\u00a0% des heures lib\u00e9r\u00e9es converties en CA r\u00e9el (taux de remplissage m\u00e9dian OF). '
            + 'Formule\u00a0: valeur g\u00e9n\u00e9r\u00e9e ' + fmtNum(SIM_COMPUTED.value.rounded) + '\u00a0\u20ac \u00d7 0,5 \u00f7 investissement ' + fmtNum(SIM_COMPUTED.cost.annual) + '\u00a0\u20ac.';
          paybackDisplay.innerHTML = SIM_COMPUTED.payback.label;
          fitMetricValue(paybackDisplay);
          metricPaybackCard.title = 'Rentabilisation en ' + (SIM_COMPUTED.payback.days > 0 ? SIM_COMPUTED.payback.days + ' jours' : SIM_COMPUTED.payback.months + ' mois') + ' : l\u2019investissement Qalia est couvert gr\u00e2ce \u00e0 ' + fmtNum(Math.round(SIM_COMPUTED.value.saved / 12)) + ' \u20ac/mois d\u2019\u00e9conomie.';
          animateValue(daysDisplay, SIM_COMPUTED.days.freed, 'j', 700, 0);
          metricDaysCard.title = fmtNum(SIM_COMPUTED.hours.rounded) + ' heures lib\u00e9r\u00e9es \u00f7 8 h/jour = ' + fmtNum(SIM_COMPUTED.days.freed) + ' jours r\u00e9investissables par an.';
        } else {
          metricRoiCard.style.display = 'none';
          metricPaybackCard.style.display = 'none';
          metricDaysCard.style.display = 'none';
        }

        // Alias legacy pour compat descendante avec les consommateurs downstream
        // (sera supprim\u00e9 apr\u00e8s migration compl\u00e8te vers SIM_COMPUTED)
        var weekendsFreedGlobal = SIM_COMPUTED.weekends.global;
        var roiFormatted = SIM_COMPUTED.roi.displayStr;

        // Bilan financier
        document.getElementById('simBalanceValue').innerHTML = '+' + fmtNum(vRound) + '\u00a0<sup class="u">\u20ac</sup>';

        var costLabel = document.getElementById('simBalanceCostLabel');
        var costValue = document.getElementById('simBalanceCostValue');
        var tierLabel = teamMultiplier > 1 ? ' \u00b7 Palier ' + pricingTier.name + ' (' + teamMultiplier + ' licences)' : '';
        var surDevisNote = pricingTier.surDevis ? ' <small style="color:var(--bleu-canard);">\u2193 tarif d\u00e9gressif en d\u00e9mo</small>' : '';
        var isAlreadySub = state.chatgptPlan === 'already';
        var chatgptSuffix = '';
        if (!isAlreadySub) {
          chatgptSuffix = ' + ' + chatgptPlanData.label + ' (' + chatgptPlanData.monthly + '\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>)';
        }
        if (state.billingAnnual) {
          costLabel.innerHTML = 'Investissement Qalia (2\u00a0970\u00a0<sup class="u">\u20ac</sup><span class="u">/an</span>)' + chatgptSuffix + tierLabel + surDevisNote;
        } else {
          costLabel.innerHTML = 'Investissement Qalia (297\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>)' + chatgptSuffix + tierLabel + surDevisNote;
        }
        costValue.innerHTML = '\u2212' + fmtNum(annualCost) + '\u00a0<sup class="u">\u20ac</sup>';

        var balanceNet = document.getElementById('simBalanceNet');
        var balanceTotal = document.getElementById('simBalanceTotal');
        var balanceTotalLabel = balanceTotal ? balanceTotal.querySelector('span') : null;
        // Balance financier : lit SIM_COMPUTED (source unique)
        balanceNet.innerHTML = SIM_COMPUTED.net.sign + fmtNum(SIM_COMPUTED.net.rounded) + '\u00a0<sup class="u">\u20ac</sup>';
        balanceTotal.className = 'sim-balance-row sim-balance-total ' + (SIM_COMPUTED.net.rounded >= 0 ? 'positif' : 'negatif');
        if (balanceTotalLabel) {
          balanceTotalLabel.innerHTML = 'R\u00e9sultat net sur 1\u00a0an';
        }
        // Ligne secondaire : estimation prudente (50\u00a0% des heures mon\u00e9tis\u00e9es)
        var balanceRealistic = document.getElementById('simBalanceRealistic');
        if (!balanceRealistic) {
          balanceRealistic = document.createElement('div');
          balanceRealistic.id = 'simBalanceRealistic';
          balanceRealistic.className = 'sim-balance-row';
          balanceRealistic.style.cssText = 'border-top:1px dashed rgba(27,126,148,0.25); padding-top:var(--space-xs); margin-top:var(--space-2xs); font-size:var(--fs-small); opacity:0.7;';
          balanceTotal.parentNode.insertBefore(balanceRealistic, balanceTotal.nextSibling);
        }
        balanceRealistic.innerHTML = '<span style="color:var(--gris);">Estimation prudente (50\u00a0% mon\u00e9tis\u00e9)</span><strong style="color:var(--gris); font-weight:normal;">' + SIM_COMPUTED.net.realisticSign + fmtNum(SIM_COMPUTED.net.realistic) + '\u00a0<sup class="u">\u20ac</sup></strong>';

        // Verdict enrichi
        var verdict = document.getElementById('simVerdict');
        var verdictIcon = document.getElementById('simVerdictIcon');
        var verdictText = document.getElementById('simVerdictText');
        var verdictFootnote = document.getElementById('simVerdictFootnote');
        verdict.className = 'sim-verdict';

        if (isRoiAberrant) {
          verdict.classList.add('vert');
          verdictIcon.textContent = '\ud83d\ude80';
          verdictText.innerHTML = 'ROI exceptionnel*\u00a0: Qalia lib\u00e8re un potentiel massif pour votre structure';
          verdictFootnote.textContent = '* Estimation fond\u00e9e sur vos param\u00e8tres. R\u00e9sultat r\u00e9el variable selon contexte.';
          verdictFootnote.style.display = '';
        } else if (netRound > 5000) {
          verdict.classList.add('vert');
          verdictIcon.textContent = '\u2714';
          verdictText.textContent = 'Retour estim\u00e9\u00a0: \u00d7' + SIM_COMPUTED.roi.displayStr + ' selon votre pipeline';
          verdictFootnote.textContent = 'M\u00e9diane observ\u00e9e sur les OF\u00a0: 50\u00a0% des heures lib\u00e9r\u00e9es converties en CA r\u00e9el, pond\u00e9r\u00e9e par votre taux de remplissage.';
          verdictFootnote.style.display = '';
        } else if (netRound > 2000) {
          verdict.classList.add('vert');
          verdictIcon.textContent = '\u2714';
          verdictText.textContent = 'Retour estim\u00e9\u00a0: \u00d7' + SIM_COMPUTED.roi.displayStr + ' selon votre pipeline';
          verdictFootnote.textContent = 'M\u00e9diane observ\u00e9e sur les OF\u00a0: 50\u00a0% des heures lib\u00e9r\u00e9es converties en CA r\u00e9el, pond\u00e9r\u00e9e par votre taux de remplissage.';
          verdictFootnote.style.display = '';
        } else if (netRound > 0) {
          verdict.classList.add('jaune');
          verdictIcon.textContent = '\u2601';
          verdictText.textContent = 'Rentable, \u00e0 consid\u00e9rer attentivement';
          verdictFootnote.style.display = 'none';
        } else {
          verdict.classList.add('rouge');
          verdictIcon.textContent = '\u2717';
          verdictText.textContent = 'Pas rentable avec ces param\u00e8tres';
          verdictFootnote.style.display = 'none';
        }

        // === DISCLAIMER HITL (Human-In-The-Loop) ===
        var hitlDisclaimer = document.getElementById('simHitlDisclaimer');
        if (!hitlDisclaimer) {
          hitlDisclaimer = document.createElement('p');
          hitlDisclaimer.id = 'simHitlDisclaimer';
          hitlDisclaimer.style.cssText = 'font-size:var(--fs-caption); color:var(--gris); line-height:1.5; margin-top:var(--space-xs); text-align:center;';
          // Anchor AFTER verdictFootnote, not after verdict: otherwise dynamic insertions
          // push the footnote below hitlDisclaimer and recurringEl in the visual flow.
          verdictFootnote.parentNode.insertBefore(hitlDisclaimer, verdictFootnote.nextSibling);
        }
        hitlDisclaimer.innerHTML = '<strong>Vous gardez la main sur l\u2019essentiel</strong>\u00a0: objectifs apprenants, adaptation individuelle, d\u00e9cisions didactiques, preuves terrain. Qalia prend en charge ce qui vous vole le plus de temps\u00a0: la forme documentaire, la structuration RNQ V9, la tra\u00e7abilit\u00e9. L\u2019IA propose, vous validez (cadre l\u00e9gal\u00a0: art. L.6316-1 C. trav.).<br>Vos donn\u00e9es restent dans votre navigateur. Aucune information n\u2019est transmise ni stock\u00e9e par Qalia.';

        // === VALEUR R\u00c9CURRENTE (r\u00e9pond \u00e0 l\u2019objection "payer 1 mois et annuler") ===
        var recurringEl = document.getElementById('simRecurringValue');
        if (!recurringEl) {
          recurringEl = document.createElement('div');
          recurringEl.id = 'simRecurringValue';
          hitlDisclaimer.parentNode.insertBefore(recurringEl, hitlDisclaimer.nextSibling);
        }
        // Always re-apply overflow-safe styles (not only at creation)
        recurringEl.style.cssText = 'margin-top:var(--space-sm); padding:var(--space-sm) var(--space-md); background:rgba(27,126,148,0.04); border:1px solid rgba(27,126,148,0.15); border-radius:0.75rem; font-size:var(--fs-small); line-height:1.6; color:var(--noir); overflow-wrap:break-word; word-wrap:break-word; max-width:100%; box-sizing:border-box; width:100%; display:none;';
        if (paybackMonth <= 6 && isProfitable) {
          var qSituation = state.qualiopi || '';
          var isNonConcerne = (qSituation === 'non_concerne');
          var catNums = getActiveCats(state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur']);
          var isCat2 = catNums.indexOf(2) !== -1;
          var isCat3 = catNums.indexOf(3) !== -1;
          var isCat4 = catNums.indexOf(4) !== -1;

          // Phrase 1 : contexte selon le statut Qualiopi
          var cycleInfo = '';
          if (isNonConcerne) {
            cycleInfo = 'Votre activit\u00e9 ne d\u00e9pend pas de Qualiopi, mais vos dispositifs \u00e9voluent.';
          } else if (qSituation === 'aspirant') {
            cycleInfo = 'Obtenir Qualiopi n\u2019est que la premi\u00e8re \u00e9tape\u00a0: ensuite viendra la surveillance, puis le renouvellement.';
          } else if (qSituation === 'surveillance') {
            cycleInfo = 'Votre audit de surveillance approche\u00a0: les documents devront \u00eatre \u00e0 jour le jour\u00a0J.';
          } else if (qSituation === 'renouvellement') {
            cycleInfo = 'Votre renouvellement n\u00e9cessite une mise \u00e0 jour compl\u00e8te du dossier.';
          } else if (qSituation === 'initial') {
            cycleInfo = 'Votre audit initial sera suivi d\u2019une surveillance entre 14 et 22\u00a0mois.';
          } else if (qSituation === 'stable') {
            cycleInfo = 'Stable aujourd\u2019hui, mais le cycle Qualiopi continue\u00a0: la prochaine \u00e9ch\u00e9ance viendra.';
          } else {
            cycleInfo = 'Le cycle Qualiopi (initial \u2192 surveillance \u2192 renouvellement) exige des documents \u00e0 jour en continu.';
          }

          // Phrase 2 : justification par cat\u00e9gorie
          var catValue = '';
          if (isNonConcerne) {
            if (isCat2) catValue = 'Nouveaux dossiers d\u2019accompagnement, \u00e9volutions des grilles et des phases r\u00e9glementaires';
            else if (isCat3) catValue = 'Nouveaux parcours VAE, mises \u00e0 jour RNCP, \u00e9volution des attendus jury';
            else if (isCat4) catValue = 'Nouveaux programmes d\u2019alternance, suivi p\u00e9dagogique, \u00e9volutions CCF';
            else catValue = 'Nouveaux programmes, mises \u00e0 jour p\u00e9dagogiques, \u00e9volutions de vos contenus';
            catValue += '\u00a0: vos documents restent structur\u00e9s dans la dur\u00e9e.';
          } else {
            if (isCat2) catValue = 'Qalia \u00e9volue avec le cadre r\u00e9glementaire du bilan. Nouveaux dossiers, mises \u00e0 jour des phases, pr\u00e9paration audit\u00a0: vos documents restent conformes dans la dur\u00e9e.';
            else if (isCat3) catValue = 'Qalia \u00e9volue avec les r\u00e9f\u00e9rentiels RNCP et les attendus VAE. Nouveaux parcours, \u00e9volutions du jury, pr\u00e9paration audit\u00a0: vos documents restent conformes dans la dur\u00e9e.';
            else if (isCat4) catValue = 'Qalia \u00e9volue avec les exigences de l\u2019apprentissage. Programmes d\u2019alternance, suivi, CCF, pr\u00e9paration audit\u00a0: vos documents restent conformes dans la dur\u00e9e.';
            else catValue = 'Qalia est mis \u00e0 jour pour refl\u00e9ter les \u00e9volutions du r\u00e9f\u00e9rentiel. Nouveaux programmes, mises \u00e0 jour p\u00e9dagogiques, pr\u00e9paration du prochain audit\u00a0: vos documents restent \u00e0 jour dans la dur\u00e9e.';
          }

          recurringEl.innerHTML = '<strong style="color:var(--bleu-canard);">Pourquoi un abonnement\u00a0?</strong><br>'
            + cycleInfo + ' ' + catValue;
          recurringEl.style.display = '';
        } else {
          recurringEl.style.display = 'none';
        }

        // === TEMPS R\u00c9INVESTI ===
        var reinvestWrap = document.getElementById('simReinvestWrap');
        var reinvestContent = document.getElementById('simReinvestContent');
        if (reinvestWrap && reinvestContent && daysFreed > 0) {
          var reinvL = REINVEST_LABELS[state.cible || 'formateur'] || REINVEST_LABELS.formateur;
          var hoursPerDay = 8;
          var reinvestHtml = '<div class="sim-chart-card">';
          reinvestHtml += '<p class="sim-chart-title">' + fmtNum(daysFreed) + ' jours lib\u00e9r\u00e9s : qu\u2019en faites-vous\u00a0?</p>';
          reinvestHtml += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:var(--space-sm);">';
          // Option 1 : Accompagnement
          var extraSessions = Math.round(hoursSaved / 1.5);
          reinvestHtml += '<div style="background:rgba(27,126,148,0.06); border-radius:1rem; padding:var(--space-sm); text-align:center;">';
          reinvestHtml += '<div style="font-size:1.5rem; margin-bottom:var(--space-2xs);">\ud83c\udfaf</div>';
          reinvestHtml += '<div style="font-size:var(--fs-small); font-weight:700; color:var(--bleu-canard); margin-bottom:var(--space-2xs);">' + reinvL.lbl1 + '</div>';
          reinvestHtml += '<div style="font-size:var(--fs-small); color:var(--noir);">+' + fmtNum(extraSessions) + ' ' + reinvL.sub1 + '</div>';
          reinvestHtml += '</div>';
          // Option 2 : Facturation
          var extraRevenue = Math.round(hoursSaved * effectiveTjm);
          reinvestHtml += '<div style="background:rgba(27,126,148,0.06); border-radius:1rem; padding:var(--space-sm); text-align:center;">';
          reinvestHtml += '<div style="font-size:1.5rem; margin-bottom:var(--space-2xs);">\ud83d\udcb0</div>';
          reinvestHtml += '<div style="font-size:var(--fs-small); font-weight:700; color:var(--bleu-canard); margin-bottom:var(--space-2xs);">' + reinvL.lbl2 + '</div>';
          reinvestHtml += '<div style="font-size:var(--fs-small); color:var(--noir);">+' + fmtNum(extraRevenue) + '\u00a0\u20ac ' + reinvL.sub2 + '</div>';
          reinvestHtml += '</div>';
          // Option 3 : Vie personnelle
          var weekendsBack = Math.round((hoursSaved / (teamMultiplier || 1)) / 16);
          reinvestHtml += '<div style="background:rgba(27,126,148,0.06); border-radius:1rem; padding:var(--space-sm); text-align:center;">';
          reinvestHtml += '<div style="font-size:1.5rem; margin-bottom:var(--space-2xs);">\u2600\ufe0f</div>';
          reinvestHtml += '<div style="font-size:var(--fs-small); font-weight:700; color:var(--bleu-canard); margin-bottom:var(--space-2xs);">' + reinvL.lbl3 + '</div>';
          var _sub3 = (teamMultiplier > 1) ? 'week\u2011ends r\u00e9cup\u00e9r\u00e9s par an par collaborateur' : reinvL.sub3;
          reinvestHtml += '<div style="font-size:var(--fs-small); color:var(--noir);">' + fmtNum(weekendsBack) + ' ' + _sub3 + '</div>';
          reinvestHtml += '</div>';
          reinvestHtml += '</div></div>';
          reinvestContent.innerHTML = reinvestHtml;
          reinvestWrap.style.display = 'block';
        } else if (reinvestWrap) {
          reinvestWrap.style.display = 'none';
        }

        // === VALORISATION DES DOULEURS (nouveaux IDs PAIN_CONFIG) ===
        var painDiv = document.getElementById('simPainResponse');
        var painHtml = '';
        if (state.pains.length > 0) {
          painHtml = '<h4>Ce que Qalia change pour vous</h4>';
          // --- Bloc A : Universelles ---
          if (state.pains.indexOf('tempsVole') > -1) {
            painHtml += '<p>\u2192 <strong>Le temps vol\u00e9</strong>&nbsp;: chaque programme con\u00e7u manuellement mobilise des heures que vous ne facturez pas.<br>Qalia r\u00e9duit ce temps de cr\u00e9ation en structurant le dialogue, les gabarits et la conformit\u00e9 RNQ\u00a0V9.<br>Les heures lib\u00e9r\u00e9es deviennent du temps facturable ou personnel (voir vos KPIs ci-dessus).</p>';
          }
          if (state.pains.indexOf('echeance') > -1) {
            painHtml += '<p>\u2192 <strong>L\u2019\u00e9ch\u00e9ance</strong>&nbsp;: 20\u00a0\u00e0\u00a029\u00a0indicateurs RNQ\u00a0V9 structurés documentairement par Qalia selon votre cat\u00e9gorie, v\u00e9rifi\u00e9s \u00e0 chaque g\u00e9n\u00e9ration.<br>Matrice de couverture documentaire + pr\u00e9paration \u00e0 l\u2019audit.<br>Co\u00fbt d\u2019une NC majeure\u00a0: >10\u00a0000\u00a0<sup class="u">\u20ac</sup>. Co\u00fbt de la pr\u00e9vention\u00a0: ' + (state.billingAnnual ? '247,50\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span> (2\u00a0970\u00a0<sup class="u">\u20ac</sup><span class="u">/an</span>)' : '297\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>') + '.</p>';
          }
          if (state.pains.indexOf('brouillard') > -1) {
            painHtml += '<p>\u2192 <strong>Le brouillard</strong>&nbsp;: plus besoin de savoir par o\u00f9 commencer.<br>Qalia lance un dialogue guid\u00e9 qui produit un premier jet structur\u00e9 en moins de 10\u00a0<span class="u">minutes</span>.<br>Fini la paralysie du d\u00e9marrage.</p>';
          }
          if (state.pains.indexOf('isolement') > -1) {
            painHtml += '<p>\u2192 <strong>L\u2019isolement</strong>&nbsp;: 84\u00a0<span class="u">%</span> des concepteurs ont essay\u00e9 ChatGPT sans impact significatif (Hardman, 2024).<br>Qalia inclut le Cercle Qalia (2x/mois en visio avec Romuald, fondateur) + Espace Client Notion avec 16 ressources qualit\u00e9.<br>Vous n\u2019\u00eates plus seul.</p>';
          }
          // --- Bloc B : Cat. 1 Formation ---
          if (state.pains.indexOf('guideQualiopi') > -1) {
            painHtml += '<p>\u2192 <strong>Le Guide Qualiopi</strong>&nbsp;: 41\u00a0pages denses, vocabulaire technique, mur psychologique.<br>Qalia traduit les exigences des 32\u00a0indicateurs en questions simples et directes.<br>Vous n\u2019avez plus besoin de lire le Guide.</p>';
          }
          if (state.pains.indexOf('incoherence') > -1) {
            painHtml += '<p>\u2192 <strong>L\u2019incoh\u00e9rence documentaire</strong>&nbsp;: un document modifi\u00e9, trois autres obsol\u00e8tes.<br>Qalia g\u00e9n\u00e8re vos documents de mani\u00e8re coordonn\u00e9e\u00a0: les r\u00e9f\u00e9rences restent coh\u00e9rentes par construction.<br>Plus de 15\u00a0<span class="u">minutes</span> perdues \u00e0 tout revoir.</p>';
          }
          // --- Bloc C : Cat. 2 Bilan ---
          if (state.pains.indexOf('bilanPhases') > -1) {
            painHtml += '<p>\u2192 <strong>Les 3\u00a0phases obligatoires</strong>&nbsp;: pr\u00e9liminaire, investigation, conclusion (R6313-4).<br>Qalia structure chaque phase avec les documents sp\u00e9cifiques et les indicateurs Cat.\u00a02.<br>Dur\u00e9e 24\u00a0<span class="u">h</span> max trac\u00e9e, confidentialit\u00e9 int\u00e9gr\u00e9e.</p>';
          }
          if (state.pains.indexOf('bilanConfusion') > -1) {
            painHtml += '<p>\u2192 <strong>Bilan ou coaching\u00a0?</strong>&nbsp;: Qalia identifie nativement si votre accompagnement rel\u00e8ve de la Cat.\u00a01 (formation) ou Cat.\u00a02 (bilan).<br>Le bon cadre l\u00e9gal, les bons indicateurs, d\u00e8s le d\u00e9part.</p>';
          }
          // --- Bloc D : Cat. 3 VAE ---
          if (state.pains.indexOf('vaeTransposition') > -1) {
            painHtml += '<p>\u2192 <strong>Transposer les acquis</strong>&nbsp;: 10\u00a0ans d\u2019exp\u00e9rience \u00e0 formaliser en blocs RNCP.<br>Qalia guide l\u2019analyse d\u2019exp\u00e9rience bloc par bloc avec un dialogue socratique adapt\u00e9 VAE.<br>Le Livret\u00a02 se construit naturellement.</p>';
          }
          if (state.pains.indexOf('vaeJury') > -1) {
            painHtml += '<p>\u2192 <strong>Le jury improvis\u00e9</strong>&nbsp;: pr\u00e9parer le candidat au jury sans r\u00e9p\u00e9tition structur\u00e9e\u00a0= \u00e9chec fr\u00e9quent.<br>Qalia g\u00e9n\u00e8re des simulations orales guid\u00e9es par bloc RNCP.<br>Le candidat arrive pr\u00e9par\u00e9, pas stress\u00e9.</p>';
          }
          // --- Bloc E : Cat. 4 CFA ---
          if (state.pains.indexOf('cfaCoordination') > -1) {
            painHtml += '<p>\u2192 <strong>Centre vs entreprise</strong>&nbsp;: coordonner les s\u00e9quences alternance quand tout bouge.<br>Qalia structure le calendrier, les fiches MEST et les CCF par bloc RNCP.<br>Les 3\u00a0lieux (centre, entreprise, mixte) sont align\u00e9s.</p>';
          }
          if (state.pains.indexOf('cfaCalendrier') > -1) {
            painHtml += '<p>\u2192 <strong>Le calendrier mouvant</strong>&nbsp;: chaque semestre, les plannings sont p\u00e9rim\u00e9s.<br>Qalia r\u00e9g\u00e9n\u00e8re rapidement le calendrier d\u2019alternance align\u00e9 sur les blocs RNCP.<br>Moins de friction, plus de continuit\u00e9 p\u00e9dagogique.</p>';
          }
          painDiv.innerHTML = painHtml;
          painDiv.style.display = 'block';
        } else {
          painDiv.style.display = 'none';
        }

        // Graphique ROI enrichi
        // Saisonnalite composite : ponderee par les frequences des taches selectionnees
        // (per_program, per_audit, annual) plutot qu'un profil OF uniforme.
        var compositeSeason = buildCompositeSeasonFromTasks(taskResult.breakdown);
        // Fallback normalise (somme=12, moyenne 1/mois) : profil OF generique documente
        var SEASON_BASE_DEFAULT = [0.80, 0.60, 1.00, 1.30, 1.40, 1.40, 0.30, 0.00, 1.10, 1.30, 1.50, 1.30];
        var SEASON_FOR_CHART = compositeSeason || SEASON_BASE_DEFAULT;
        // Normalisation : monthlySaving * sum(SEASON) doit = vRound pour aligner graph et bilan
        var SEASON_SUM = 0;
        for (var ssi = 0; ssi < SEASON_FOR_CHART.length; ssi++) SEASON_SUM += SEASON_FOR_CHART[ssi];
        if (SEASON_SUM <= 0) SEASON_SUM = 9.2;
        var monthlySaving = vRound / SEASON_SUM;
        // Planning coûts mensuels réaliste :
        // - Mensuel : coût fixe identique chaque mois (Qalia + ChatGPT)
        // - Annuel : Qalia payé intégralement en M1, ChatGPT reste mensuel
        var monthlyCostForChart;
        if (state.billingAnnual) {
          var qaliaUpfront = pricingTier.annual * teamMultiplier;
          var chatgptMonthlyUnit = (chatgptPlanData ? chatgptPlanData.monthly : 0) * teamMultiplier;
          monthlyCostForChart = [];
          for (var mci = 0; mci < 12; mci++) {
            monthlyCostForChart.push(mci === 0 ? (qaliaUpfront + chatgptMonthlyUnit) : chatgptMonthlyUnit);
          }
        } else {
          monthlyCostForChart = annualCost / 12;
        }

        // === Echeance audit Qualiopi (verticale + gradient urgence 6 mois) ===
        // Donnees saisies en step 4 (state.qualiopi) et step 5 (state.echeanceMois).
        // 'stable' et 'non_concerne' : aucune echeance imminente, on n'affiche rien.
        // Hors scope (>12 mois) : mention textuelle sous le graph (pas d'extension).
        var QUALIOPI_TYPE_LABELS = {
          'aspirant': 'initial', 'initial': 'initial',
          'surveillance': 'surveillance', 'renouvellement': 'renouvellement'
        };
        var auditInfo = null;
        if (state.echeanceMois > 0 && QUALIOPI_TYPE_LABELS[state.qualiopi]) {
          auditInfo = {
            monthsAway: state.echeanceMois,
            type: state.qualiopi,
            typeLabel: QUALIOPI_TYPE_LABELS[state.qualiopi]
          };
        }

        drawRoiChart(monthlySaving, monthlyCostForChart, totalPrograms, costPerProgram, savedPerProgram, roiMultiple, false, compositeSeason, auditInfo, paybackDays, SIM_COMPUTED.roi.displayStr);

        // Titre du graphique dynamique (montre le mode de facturation)
        // Golden ratio 1/phi (0.618) : <sup class="u">€</sup> + <span class="u">/mois</span> /an
        var roiChartTitle = document.getElementById('simRoiChartTitle');
        if (roiChartTitle) {
          var costLabel = state.billingAnnual
            ? 'abonnement annuel 2\u00a0970\u00a0<sup class="u">\u20ac</sup><span class="u">/an</span>'
            : 'abonnement mensuel 297\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span> \u00d7 12';
          roiChartTitle.innerHTML = 'R\u00e9sultat net cumul\u00e9 mois par mois (gains \u2212 ' + costLabel + ')';
        }

        // Mention textuelle si audit hors scope (>12 mois)
        var auditNote = document.getElementById('simRoiAuditNote');
        if (auditNote) {
          if (auditInfo && auditInfo.monthsAway > 12) {
            auditNote.innerHTML = '<strong>Votre audit ' + auditInfo.typeLabel + '</strong> est pr\u00e9vu dans <strong>' + auditInfo.monthsAway + '\u00a0mois</strong> (hors graphique 12\u00a0mois). Qalia constitue votre dossier de preuves en continu d\u00e8s aujourd\u2019hui.';
            auditNote.style.display = 'block';
          } else {
            auditNote.style.display = 'none';
          }
        }

        // === Soutenabilit\u00e9 annuelle : 3 m\u00e9triques r\u00e9partition charge (persona consensus Option 3) ===
        // Calcul depuis SEASON_FOR_CHART (profil saisonnalit\u00e9 composite). Commence au mois courant.
        var soutBloc = document.getElementById('simRoiSoutenabilite');
        var soutGrid = document.getElementById('simSoutenabiliteGrid');
        if (soutBloc && soutGrid) {
          var soutMoisNoms = ['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
          var soutStart = new Date().getMonth();
          var soutSeason = SEASON_FOR_CHART.slice();
          var soutMoy = SEASON_SUM / 12;
          // Pic (exclut Ao\u00fbt=0) : mois absolu le plus charg\u00e9
          var picVal = 0, picIdx = -1;
          var minVal = Infinity, minIdx = -1;
          var surchargeCount = 0;
          for (var si = 0; si < 12; si++) {
            var realMonth = (soutStart + si) % 12;
            var v = soutSeason[realMonth];
            if (v > picVal) { picVal = v; picIdx = realMonth; }
            if (v > 0 && v < minVal) { minVal = v; minIdx = realMonth; }
            if (v > 1.2 * soutMoy) surchargeCount++;
          }
          // Ratio pic/creux non nul
          var ratio = (minVal > 0 && minVal < Infinity) ? (picVal / minVal) : 0;
          var picPct = soutMoy > 0 ? Math.round((picVal / soutMoy) * 100) : 0;
          // Verdict ratio
          var ratioLabel = '';
          if (ratio === 0) ratioLabel = 'Charge liss\u00e9e';
          else if (ratio < 2.5) ratioLabel = 'Liss\u00e9';
          else if (ratio < 4.0) ratioLabel = 'Saisonnalit\u00e9 marqu\u00e9e';
          else ratioLabel = 'Saisonnalit\u00e9 forte';
          // Verdict surcharge
          var surLabel = surchargeCount === 0 ? 'Aucun' : (surchargeCount <= 2 ? 'G\u00e9rable' : (surchargeCount <= 4 ? '\u00c0 anticiper' : 'Tension forte'));
          // Rendu : 3 tuiles
          var tileStyle = 'padding:var(--space-sm) var(--space-xs); background:rgba(27,126,148,0.04); border-radius:0.5rem;';
          var valStyle = 'font-size:var(--fs-lead); font-weight:700; color:var(--bleu-canard); line-height:1.2; display:block;';
          var lblStyle = 'font-size:0.75rem; color:var(--gris); text-transform:uppercase; letter-spacing:0.03em; display:block; margin-bottom:0.25rem;';
          var subStyle = 'font-size:0.75rem; color:var(--gris); display:block; margin-top:0.25rem;';
          var picMoisNom = picIdx >= 0 ? soutMoisNoms[picIdx] : '\u2014';
          var ratioTxt = ratio > 0 ? ratio.toFixed(1).replace('.', ',') + '\u00d7' : '\u2014';
          soutGrid.innerHTML =
            '<div style="' + tileStyle + '">' +
              '<span style="' + lblStyle + '">Pic de charge</span>' +
              '<span style="' + valStyle + '">' + picMoisNom + '</span>' +
              '<span style="' + subStyle + '">' + picPct + '\u00a0% de la moyenne</span>' +
            '</div>' +
            '<div style="' + tileStyle + '" title="Votre mois le plus charg\u00e9 produit ' + ratioTxt + ' plus que votre mois le moins charg\u00e9 (hors ao\u00fbt). Indique si la charge annuelle est r\u00e9guli\u00e8re ou concentr\u00e9e.">' +
              '<span style="' + lblStyle + '">\u00c9cart pic/creux</span>' +
              '<span style="' + valStyle + '">' + ratioTxt + '</span>' +
              '<span style="' + subStyle + '">Pic ' + ratioTxt + ' plus charg\u00e9 que creux<br><span style="font-style:italic;">' + ratioLabel + '</span></span>' +
            '</div>' +
            '<div style="' + tileStyle + '">' +
              '<span style="' + lblStyle + '">Mois en surcharge</span>' +
              '<span style="' + valStyle + '">' + surchargeCount + '\u202f/\u202f12</span>' +
              '<span style="' + subStyle + '">' + surLabel + '</span>' +
            '</div>';
          soutBloc.style.display = 'block';
        }

        // Note saisonnière : expliquer les mois déficitaires pour anticiper l'objection "je résilie en été"
        var seasonNote = document.getElementById('simRoiSeasonNote');
        if (seasonNote) {
          var startMonth = new Date().getMonth();
          var SEASON_ROT = SEASON_FOR_CHART.slice(startMonth).concat(SEASON_FOR_CHART.slice(0, startMonth));
          var deficitMonths = 0;
          for (var sm = 0; sm < 12; sm++) {
            var mCostHere = Array.isArray(monthlyCostForChart) ? monthlyCostForChart[sm] : monthlyCostForChart;
            var mNet = (monthlySaving * SEASON_ROT[sm]) - mCostHere;
            if (mNet < 0) deficitMonths++;
          }
          if (deficitMonths > 0 && netRound > 0) {
            // Seul cas : ROI positif avec creux saisonniers. 1 phrase actionnable, pas de répétition du résultat net (déjà dans simRoiSummary)
            var seasonCible = state.cible || 'formateur';
            var seasonAction = 'structurer vos prochaines ing\u00e9nieries en avance, c\u2019est du temps gagn\u00e9 \u00e0 la rentr\u00e9e.';
            if (seasonCible === 'consultantBilan') seasonAction = 'pr\u00e9parer vos prochains dossiers d\u2019accompagnement en avance, c\u2019est du temps gagn\u00e9 sur la reprise.';
            else if (seasonCible === 'accompagnateurVAE') seasonAction = 'structurer vos prochains parcours VAE en avance, c\u2019est du temps gagn\u00e9 sur la reprise.';
            else if (seasonCible === 'directeurCFA' || seasonCible === 'maitreApprentissage') seasonAction = 'pr\u00e9parer vos prochains programmes d\u2019alternance en avance, c\u2019est du temps gagn\u00e9 \u00e0 la rentr\u00e9e.';
            else if (seasonCible === 'directeurOF' || seasonCible === 'qualite') seasonAction = 'structurer vos prochains dispositifs en avance, c\u2019est du temps gagn\u00e9 \u00e0 la rentr\u00e9e.';
            seasonNote.innerHTML = 'Les mois \u00e0 activit\u00e9 r\u00e9duite sont votre <strong style="color:var(--bleu-canard); font-style:normal;">fen\u00eatre pour anticiper</strong>\u00a0:<br>' + seasonAction;
            seasonNote.style.display = 'block';
          } else {
            // ROI négatif : Insight + Consequences + Advice couvrent déjà les leviers. Pas de note redondante.
            seasonNote.style.display = 'none';
          }
        }

        // ROI summary (HTML selectable text alternative) : lit SIM_COMPUTED
        var roiSummaryEl = document.getElementById('simRoiSummary');
        if (roiSummaryEl) {
          if (SIM_COMPUTED.net.isProfitable) {
            var billingTag = state.billingAnnual ? '(annuel 2\u00a0970\u00a0\u20ac/an)' : '(mensuel 297\u00a0\u20ac/mois)';
            roiSummaryEl.innerHTML = 'R\u00e9sultat net cumul\u00e9 : <strong style="color:var(--succes);">' + SIM_COMPUTED.net.sign + fmtCanvas(SIM_COMPUTED.net.rounded) + '\u00a0<sup class="u">\u20ac</sup></strong>'
              + ' \u00b7 ROI \u00d7' + SIM_COMPUTED.roi.displayStr
              + (SIM_COMPUTED.payback.months > 0 ? ' \u00b7 Rentable d\u00e8s ' + SIM_COMPUTED.payback.label : '')
              + ' <span style="color:var(--gris); font-size:var(--fs-caption);">' + billingTag + '</span>';
          } else {
            roiSummaryEl.innerHTML = 'R\u00e9sultat net cumul\u00e9 : <strong style="color:var(--erreur);">' + fmtCanvas(SIM_COMPUTED.net.rounded) + '\u00a0<sup class="u">\u20ac</sup></strong>';
          }
        }

        // Chart 2 : Temps Avant/Apres (multi-taches)
        renderTimeComparisonHTML(taskResult.breakdown);

        // Donnees partagees pour tous les generateurs adaptatifs
        // Donnees partagees pour tous les generateurs adaptatifs
        // TOUTES les valeurs restent des NOMBRES bruts.
        // Le formatage (fmtNum) est applique UNIQUEMENT aux points d'affichage
        // dans les templates (insight, swot, share, etc.)
        var dashData = {
          cible: state.cible || 'formateur',
          roi: roiFormatted,
          hours: hRound,
          weekends: weekendsFreedGlobal,
          daysFreed: daysFreed,
          annualCost: annualCost,
          costPerProg: costPerProgram,
          savedPerProg: savedPerProgram,
          paybackMonth: paybackMonth,
          paybackDays: paybackDays,
          paybackLabel: paybackLabel,
          totalPrograms: totalPrograms,
          totalOldHours: Math.round(totalOldHours),
          tjm: state.tjm,
          valueSaved: valueSaved,
          hoursSaved: hoursSaved,
          netResult: netRound,
          pains: state.pains,
          qualiopi: state.qualiopi,
          echeanceMois: state.echeanceMois,
          pourQui: state.pourQui,
          tailleEquipe: state.tailleEquipe,
          // Donnees enrichies pour QaliaPDF (snapshot du contexte complet)
          seasonArray: (typeof SEASON_FOR_CHART !== 'undefined') ? SEASON_FOR_CHART.slice() : null,
          taskBreakdown: (typeof taskResult !== 'undefined' && taskResult.breakdown) ? taskResult.breakdown : null,
          // Comparaison 3 scenarios (Sans IA / ChatGPT / Qalia)
          totalChatGPTHours: Math.round(totalChatGPTHours),
          totalQaliaHours: Math.round(totalQaliaHours),
          hoursSavedVsChatGPT: Math.round(hoursSavedVsChatGPT),
          // Pricing dynamique
          billingAnnual: state.billingAnnual || false,
          pricingTierName: pricingTier.name,
          monthlyPrice: pricingTier.monthly,
          annualPrice: pricingTier.annual,
          chatgptPlanLabel: (chatgptPlanData && chatgptPlanData.label) || 'Plus',
          chatgptMonthlyCost: (chatgptPlanData && chatgptPlanData.monthly) || 23
        };


        // Eisenhower tag
        var eisenhowerTag = renderEisenhower(netRound, state.qualiopi, state.echeanceMois);

        // D.U.R. (Pelissier)
        renderDUR(dashData);

        // Consequences (#15 Decision Book)
        renderConsequences(dashData);

        // IA badge adaptatif
        updateIaBadge(dashData.cible);

        // Insight socratique adaptatif (F.U.E.L.)
        var insightText = getInsightText(dashData);
        document.getElementById('simInsight').innerHTML = insightText;

        // Conseils d'optimisation (toujours visibles si au moins 1 nudge applicable)
        // 3 zones : vert (net>2000), jaune (0<net<=2000), rouge (net<=0)
        var adviceDiv = document.getElementById('simAdvice');
        var adviceItems = [];
        var isVert = netRound > 2000;
        var isJaune = netRound > 0 && netRound <= 2000;
        // rouge = netRound <= 0

        // 1. Tarif horaire sous médiane marché (70€/h)
        if (effectiveTjm < 70) {
          var projectedAt70 = fmtNum(Math.round(hoursSaved * 70 - annualCost));
          if (isVert) {
            adviceItems.push('<li><strong>Tarif horaire</strong>\u00a0: \u00e0 ' + fmtNum(effectiveTjm) + '\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span>, votre \u00e9conomie est d\u00e9j\u00e0 de ' + fmtNum(netRound) + '\u00a0<sup class="u">\u20ac</sup>. \u00c0 70\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span> (m\u00e9diane march\u00e9), elle passerait \u00e0 ' + projectedAt70 + '\u00a0<sup class="u">\u20ac</sup>.</li>');
          } else if (isJaune) {
            adviceItems.push('<li><strong>Tarif horaire</strong>\u00a0: \u00e0 ' + fmtNum(effectiveTjm) + '\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span>, votre rentabilit\u00e9 reste fragile (' + fmtNum(netRound) + '\u00a0<sup class="u">\u20ac</sup>/an). \u00c0 70\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span> (m\u00e9diane march\u00e9), elle passerait \u00e0 ' + projectedAt70 + '\u00a0<sup class="u">\u20ac</sup>\u00a0\u2013\u00a0un \u00e9cart qui change le verdict.</li>');
          } else {
            adviceItems.push('<li><strong>Tarif horaire</strong>\u00a0: \u00e0 ' + fmtNum(effectiveTjm) + '\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span>, votre temps est sous-valoris\u00e9. \u00c0 70\u00a0<sup class="u">\u20ac</sup><span class="u">/h</span> (m\u00e9diane march\u00e9), le calcul change radicalement.</li>');
          }
        }

        // 2. Volume faible (<5 programmes)
        if (totalPrograms < 5) {
          if (isVert) {
            adviceItems.push('<li><strong>Volume</strong>\u00a0: avec ' + fmtNum(totalPrograms) + '\u00a0programmes/an, votre ROI est d\u00e9j\u00e0 positif. D\u00e8s 5\u00a0programmes, la rentabilit\u00e9 s\u2019acc\u00e9l\u00e8re.</li>');
          } else if (isJaune) {
            adviceItems.push('<li><strong>Volume</strong>\u00a0: avec ' + fmtNum(totalPrograms) + '\u00a0programmes/an, le ROI reste serr\u00e9. Un programme suppl\u00e9mentaire suffirait \u00e0 basculer dans le vert.</li>');
          } else {
            adviceItems.push('<li><strong>Volume</strong>\u00a0: avec ' + fmtNum(totalPrograms) + '\u00a0programmes/an, Qalia n\u2019est pas amorti. D\u00e8s 5\u00a0programmes, l\u2019\u00e9quation s\u2019inverse.</li>');
          }
        }

        // 3. Facturation mensuelle → annuelle
        if (!state.billingAnnual) {
          if (isJaune) {
            adviceItems.push('<li><strong>Facturation annuelle</strong>\u00a0: \u00e9conomisez 594\u00a0<sup class="u">\u20ac</sup> (2\u00a0<span class="u">mois</span> offerts). Avec votre \u00e9conomie actuelle de ' + fmtNum(netRound) + '\u00a0<sup class="u">\u20ac</sup>, passer \u00e0 l\u2019annuel rendrait le verdict nettement positif.</li>');
          } else {
            adviceItems.push('<li><strong>Facturation annuelle</strong>\u00a0: \u00e9conomisez 594\u00a0<sup class="u">\u20ac</sup> (2\u00a0<span class="u">mois</span> offerts) en passant \u00e0 l\u2019annuel.</li>');
          }
        }

        // 4. Valeur assurantielle (si Qualiopi actif MAIS douleur "échéance" PAS déjà affichée) (D39/Z6-D14)
        // Quand "échéance" est sélectionné dans les douleurs, la section Douleurs couvre déjà le coût NC.
        var hasEcheancePain = state.pains && state.pains.indexOf('echeance') > -1;
        var hasQualiopi = state.qualiopi && state.qualiopi !== 'non_concerne';
        if (hasQualiopi && !hasEcheancePain) {
          if (isJaune) {
            adviceItems.push('<li><strong>Valeur assurantielle</strong>\u00a0: au-del\u00e0 du ROI chiffr\u00e9, le co\u00fbt d\u2019une NC majeure (perte certification + clients + financement) d\u00e9passe typiquement 10\u00a0000\u00a0<sup class="u">\u20ac</sup>. \u00c0 ' + (state.billingAnnual ? '247,50\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span> (2\u00a0970\u00a0<sup class="u">\u20ac</sup><span class="u">/an</span>)' : '297\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>') + ', Qalia fonctionne aussi comme assurance conformit\u00e9.</li>');
          } else {
            adviceItems.push('<li><strong>Valeur assurantielle</strong>\u00a0: le co\u00fbt d\u2019une NC majeure (perte certification + clients + financement) est typiquement >10\u00a0000\u00a0<sup class="u">\u20ac</sup>. Qalia comme assurance qualit\u00e9 \u00e0 ' + (state.billingAnnual ? '247,50\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>' : '297\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span>') + ' reste rationnel.</li>');
          }
        }

        // 5. Nudge "démo offerte" supprimé (D39/Z6-D13) : redondant avec le CTA enrichi juste en dessous

        // Afficher si au moins 1 nudge spécifique
        if (adviceItems.length > 0) {
          var adviceHeading = isVert ? 'Ce que vous pouvez optimiser' : (isJaune ? 'Quelques ajustements changeraient le verdict' : 'Ce que vous pouvez ajuster');
          adviceDiv.innerHTML = '<h4>' + adviceHeading + '</h4><ul>' + adviceItems.join('') + '</ul>';
          adviceDiv.style.display = 'block';
        } else {
          adviceDiv.style.display = 'none';
        }

        // CTA adapte au verdict + contexte equipe + profil (Brunson Future Pacing)
        var ctaDiv = document.getElementById('simCTA');
        var ctaPdfL = (window.QaliaPDF && window.QaliaPDF.PROFILE_LABELS) || {};
        var ctaLabel = ctaPdfL[state.cible] || ctaPdfL.formateur || state.cible;
        var isTeam = state.pourQui === 'equipe' && state.tailleEquipe > 1;
        if (isTeam) {
          ctaDiv.innerHTML = '<a href="https://rdv.qalia.ai" class="btn btn-primary" target="_blank" rel="nofollow noopener">R\u00e9servez une d\u00e9mo \u00e9quipe</a>'
            + '<p style="font-size:var(--fs-small); color:var(--gris); margin-top:var(--space-xs);">' + state.tailleEquipe + '\u00a0licences \u00b7 45\u00a0<span class="u">min</span> (30\u00a0min de d\u00e9mo + 15\u00a0min de questions) \u00b7 Sans engagement</p>';
        } else if (netRound > 0) {
          ctaDiv.innerHTML = '<a href="https://rdv.qalia.ai" class="btn btn-primary" target="_blank" rel="nofollow noopener">Je r\u00e9serve ma d\u00e9mo offerte</a>'
            + '<p style="font-size:var(--fs-small); color:var(--gris); margin-top:var(--space-xs);">45\u00a0<span class="u">min</span> \u00b7 Sans engagement \u00b7 R\u00e9sultats concrets \u00b7 ' + ctaLabel + '</p>';
        } else {
          ctaDiv.innerHTML = '<a href="https://rdv.qalia.ai" class="btn btn-primary" style="background:var(--bordeaux); border-color:var(--bordeaux);" target="_blank" rel="nofollow noopener">Testez sur votre cas r\u00e9el</a>'
            + '<p style="font-size:var(--fs-small); color:var(--gris); margin-top:var(--space-xs);">'
            + 'Qalia n\u2019est pas pour tout le monde, et c\u2019est normal. Mais une d\u00e9mo offerte ne co\u00fbte rien.</p>';
        }

        // === SECTIONS CONDITIONNELLES DU DASHBOARD ===
        // Qualiopi alert
        var qualiopiAlertWrap = document.getElementById('simQualiopiAlertWrap');
        if (qualiopiAlertWrap) {
          var showAlert = state.qualiopi && state.qualiopi !== 'non_concerne' && ['initial', 'surveillance', 'renouvellement'].indexOf(state.qualiopi) > -1 && state.echeanceMois < 12;
          if (showAlert) {
            var mois = state.echeanceMois;
            var alertClass = mois < 6 ? 'critique' : '';
            qualiopiAlertWrap.innerHTML = '<div class="sim-qualiopi-alert ' + alertClass + '">'
              + '<strong>\u26a0 \u00c9ch\u00e9ance ' + (state.qualiopi === 'initial' ? 'audit initial' : state.qualiopi === 'surveillance' ? 'surveillance' : 'renouvellement') + ' dans ' + mois + '\u00a0mois</strong>'
              + '<p style="margin:var(--space-2xs) 0 0; font-size:var(--fs-small);">'
              + (mois < 6 ? 'Urgence \u00e9lev\u00e9e.<br>Chaque semaine compte pour pr\u00e9parer votre dossier.' : 'Anticipez d\u00e8s maintenant.<br>\u00c9vitez le stress de derni\u00e8re minute.')
              + '</p></div>';
            qualiopiAlertWrap.style.display = 'block';
          } else {
            qualiopiAlertWrap.style.display = 'none';
          }
        }

        // Team needs section
        var teamNeedsWrap = document.getElementById('simTeamNeedsWrap');
        if (teamNeedsWrap) {
          if (isTeam) {
            var tier = getTeamTier(state.tailleEquipe);
            var teamInfo = TEAM_COPY[tier];
            var teamDesc = '';
            if (state.teamBreakdown && Object.keys(state.teamBreakdown).length > 1) {
              var parts = [];
              for (var role in state.teamBreakdown) {
                if (state.teamBreakdown[role] > 0) {
                  var cnt = state.teamBreakdown[role];
                  var lbl = (PROFILE_LABELS[role] || role).toLowerCase();
                  // Accord singulier/pluriel : si count === 1, retirer le 's' final du premier mot
                  if (cnt === 1) {
                    // Singulariser chaque segment (g\u00e8re noms compos\u00e9s : enseignants-chercheurs \u2192 enseignant-chercheur)
          lbl = lbl.split(/([\s\-])/).map(function(seg){ return seg.replace(/s$/,''); }).join('');
                  }
                  parts.push(cnt + ' ' + lbl);
                }
              }
              teamDesc = parts.join(' + ');
            } else {
              teamDesc = state.tailleEquipe + ' personnes';
            }
            var needsHtml = '<div class="sim-team-needs"><h4>Besoins \u00e9quipe d\u00e9tect\u00e9s : Palier ' + teamInfo.label + ' (' + teamDesc + ')</h4><ul>';
            teamInfo.needs.forEach(function(n) { needsHtml += '<li>' + n + '</li>'; });
            needsHtml += '</ul>';
            var teamPriceTier = getPricingTier(state.tailleEquipe);
            var teamCostHtml = fmtNum(teamPriceTier.monthly * state.tailleEquipe) + '\u00a0<sup class="u">\u20ac</sup><span class="u">/mois</span> (' + state.tailleEquipe + ' licences \u00e0 ' + fmtNum(teamPriceTier.monthly) + '\u00a0<sup class="u">\u20ac</sup>)';
            needsHtml += '<p style="font-size:var(--fs-small); color:var(--gris);">Co\u00fbt estim\u00e9 : ' + teamCostHtml + '</p>';
            needsHtml += '</div>';
            teamNeedsWrap.innerHTML = needsHtml;
            teamNeedsWrap.style.display = 'block';
          } else {
            teamNeedsWrap.style.display = 'none';
          }
        }

        // Audit boost : proposition augmentée conditionnelle
        var auditBoostWrap = document.getElementById('simAuditBoostWrap');
        if (auditBoostWrap) {
          // Seulement les 3 statuts avec échéance d'audit réelle (pas aspirant, stable, non_concerne)
          var hasQualiopi = state.qualiopi && ['initial', 'surveillance', 'renouvellement'].indexOf(state.qualiopi) > -1;
          var auditAlreadySelected = state.tasks && state.tasks.indexOf('audit') > -1;
          if (hasQualiopi) {
            var typeAudit = state.qualiopi === 'initial' ? 'audit initial' : state.qualiopi === 'surveillance' ? 'audit de surveillance' : 'renouvellement';
            var boostIcon = '<div class="sim-audit-boost-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg></div>';
            var boostHtml = '<div class="sim-audit-boost-header">' + boostIcon + '<strong>Bonus Qualiopi\u00a0: pr\u00e9paration ' + typeAudit + '</strong></div>';
            if (!auditAlreadySelected) {
              // Audit PAS dans les tâches : afficher les heures supplémentaires
              var auditTask = TASK_CONFIG.audit;
              var auditVol = state.taskVolumes.audit || auditTask.defaultVolume || 1;
              var auditMarketH = auditTask.marketHours * auditVol;
              var auditQaliaH = auditTask.qaliaHours * auditVol;
              var auditSaved = auditMarketH - auditQaliaH;
              boostHtml += '<div class="sim-audit-boost-savings">';
              boostHtml += '<span>' + auditMarketH + '\u00a0<span class="u">h</span> classique</span>';
              boostHtml += '<span class="sim-audit-arrow">\u2192</span>';
              boostHtml += '<span>' + auditQaliaH + '\u00a0<span class="u">h</span> avec Qalia</span>';
              boostHtml += '</div>';
              boostHtml += '<div class="sim-audit-boost-detail">';
              boostHtml += 'En plus de votre bilan, Qalia vous fait gagner <strong>' + auditSaved + '\u00a0<span class="u">heures</span></strong> sur la constitution du dossier ' + typeAudit + '\u00a0: preuves documentaires, indicateurs, contr\u00f4le de conformit\u00e9.';
              boostHtml += '</div>';
            } else {
              // Audit DÉJÀ dans les tâches : valoriser la couverture structurelle
              boostHtml += '<div class="sim-audit-boost-detail">';
              boostHtml += 'Vos heures de pr\u00e9paration audit sont d\u00e9j\u00e0 dans le bilan. Mais Qalia va plus loin\u00a0: chaque document g\u00e9n\u00e9r\u00e9 est align\u00e9 sur les <strong>Indicateurs applicables structurés documentairement par Qalia</strong> du RNQ V9.';
              boostHtml += ' R\u00e9sultat\u00a0: un dossier de preuves structur\u00e9, une matrice de couverture compl\u00e8te, et z\u00e9ro surprise le jour\u00a0J.';
              boostHtml += '</div>';
            }
            auditBoostWrap.innerHTML = '<div class="sim-audit-boost">' + boostHtml + '</div>';
            auditBoostWrap.style.display = 'block';
          } else {
            auditBoostWrap.style.display = 'none';
          }
        }

        // Conformity section
        var conformityWrap = document.getElementById('simConformityWrap');
        if (conformityWrap) {
          // Show conformity only when Qualiopi is relevant and user is not purely auditor/certificateur
          var isControlOnly = state.cibles && state.cibles.length > 0 && state.cibles.every(function(c) { return CONTROL_ONLY_ROLES.indexOf(c) > -1; });
          var qualiopiRelevant = state.qualiopi && state.qualiopi !== 'non_concerne' && state.qualiopi !== 'stable';
          var showConformity = !isControlOnly && (qualiopiRelevant || state.cible === 'qualite');
          if (showConformity) {
            // Build category-specific conformity using COVERAGE_DATA
            var confCibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
            var confCats = getActiveCats(confCibles);
            if (confCats.length === 0) confCats = [1];
            // Build category summary lines
            var catSummaryHtml = '';
            confCats.forEach(function(cat) {
              var cd = COVERAGE_DATA[cat];
              if (!cd) return;
              var guidedText = cd.guided > 0 ? ' + ' + cd.guided + ' guid\u00e9s' : '';
              catSummaryHtml += '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir); margin-bottom:var(--space-2xs);">'
                + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--succes)" stroke-width="2.5" style="flex-shrink:0; margin-top:2px;"><polyline points="20 6 9 17 4 12"/></svg>'
                + '<span><strong>' + cd.label + '</strong>\u00a0: \u00e9l\u00e9ments documentaires structur\u00e9s par Qalia pour ' + cd.covered + guidedText + ' indicateurs sur ' + cd.applicable + ' applicables. Ce que vous g\u00e9rez seul (\u00e0 documenter avec vos preuves existantes)\u00a0: ' + cd.terrainList + '.</span>'
                + '</div>';
            });
            conformityWrap.innerHTML = '<div class="sim-chart-card">'
              + '<p class="sim-chart-title">Conformit\u00e9 Qualiopi : votre couverture RNQ V9</p>'
              + catSummaryHtml
              + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-xs); margin-top:var(--space-sm);">'
              + '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Matrice de couverture documentaire \u00e0 chaque g\u00e9n\u00e9ration</span></div>'
              + '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Pr\u00e9paration \u00e0 l\u2019audit : points de vigilance <em>avant</em> le jour\u00a0J</span></div>'
              + '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Tra\u00e7abilit\u00e9 compl\u00e8te des \u00e9l\u00e9ments de preuve</span></div>'
              + '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Mises \u00e0 jour r\u00e9glementaires incluses (corpus RNQ V9 actualis\u00e9 \u00e0 chaque publication officielle France Comp\u00e9tences / COFRAC)</span></div>'
              + '<div style="display:flex; align-items:flex-start; gap:var(--space-xs); font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bleu-canard)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Transparence IA\u00a0: mentionnez l\u2019utilisation d\u2019un outil IA dans vos supports (bonne pratique de transparence, align\u00e9e AI Act 2024)</span></div>'
              + '</div>'
              + '<p style="font-size:var(--fs-caption); color:var(--gris); margin-top:var(--space-sm); line-height:1.5;">* Donn\u00e9es adapt\u00e9es \u00e0 votre cat\u00e9gorie L6313. <strong>Cartographie Qalia\u00a0: document de travail pr\u00e9paratoire, non opposable en audit.</strong> En audit RNQ V9, chaque indicateur est recoup\u00e9 par triangulation (document + entretien + observation terrain)\u00a0: Qalia pr\u00e9pare le pilier documentaire, les deux autres restent votre terrain. L\u2019IA propose, vous validez. La responsabilit\u00e9 de la conformit\u00e9 finale reste celle de l\u2019organisme. Align\u00e9 sur les principes du R\u00e8glement europ\u00e9en sur l\u2019IA (AI Act 2024)\u00a0: transparence d\u2019usage et supervision humaine syst\u00e9matique.</p>'
              + '</div>';
            conformityWrap.style.display = 'block';
          } else {
            conformityWrap.style.display = 'none';
          }
        }

        // Section activation : livrables par Cat. + badge "Généré avec l'assistance de Qalia"
        renderActivation();

        // === EMPREINTE UNIQUE (dynamique par Cat. L6313 + segment solo/gestionnaire) ===
        // Routage : PROFILE_CATS[cible][0] \u2192 cat\u00e9gorie primaire \u2192 EMPREINTE_DATA[cat]
        var empreinteWrap = document.getElementById('simEmpreinteWrap');
        if (empreinteWrap) {
          var empCat = (PROFILE_CATS[state.cible || 'formateur'] || [1])[0];
          var empSeg = PROFILE_SEGMENT[state.cible || 'formateur'] || 'solo';
          var empD = EMPREINTE_DATA[empCat] || EMPREINTE_DATA[1];
          var empPart = empSeg === 'gestionnaire' ? empD.partGest : empD.partSolo;
          var empPartIdx = empPart.indexOf('\u00a0:');
          if (empPartIdx === -1) empPartIdx = empPart.indexOf(':');
          var empPartHtml = empPartIdx > -1
            ? '<strong>' + empPart.substring(0, empPartIdx + 2) + '</strong>' + empPart.substring(empPartIdx + 2)
            : '<strong>' + empPart + '</strong>';
          empreinteWrap.innerHTML = '<div class="info-callout" style="margin-top:var(--space-sm); padding:var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) + 3px); background-color:rgba(27,126,148,0.06);">'
            + '<p style="font-size:var(--fs-small); color:var(--noir); margin:0 0 var(--space-xs) 0; line-height:1.6;"><strong style="color:var(--bleu-canard);">Empreinte m\u00e9tier : un dossier qui vous ressemble</strong></p>'
            + '<p style="font-size:var(--fs-small); color:var(--noir); margin:0 0 var(--space-sm) 0; line-height:1.6;">Un auditeur doit pouvoir deviner, en lisant votre dossier, de quel organisme il s\u2019agit. Qalia injecte \u00e0 chaque g\u00e9n\u00e9ration vos donn\u00e9es sp\u00e9cifiques pour \u00e9viter l\u2019effet gabarit\u00a0:</p>'
            + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); margin-bottom:var(--space-sm);">'
            + '<div style="padding:var(--space-xs) var(--space-sm); background:rgba(173,47,72,0.05); border-radius:6px; border:1px solid rgba(173,47,72,0.2);">'
            + '<p style="font-size:var(--fs-caption); font-weight:600; color:var(--bordeaux); margin:0 0 var(--space-2xs) 0; text-transform:uppercase; letter-spacing:0.03em;">Sortie g\u00e9n\u00e9rique (ChatGPT brut)</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--bordeaux); margin:0; line-height:1.5; font-style:italic;">' + empD.generic + '</p>'
            + '</div>'
            + '<div style="padding:var(--space-xs) var(--space-sm); background:rgba(27,126,148,0.08); border-radius:6px; border:1px solid rgba(27,126,148,0.25);">'
            + '<p style="font-size:var(--fs-caption); font-weight:600; color:var(--bleu-canard); margin:0 0 var(--space-2xs) 0; text-transform:uppercase; letter-spacing:0.03em;">' + empD.qaliaLabel + '</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--noir); margin:0; line-height:1.5; font-style:italic;">' + empD.qaliaEx + '</p>'
            + '</div>'
            + '</div>'
            + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); margin-bottom:var(--space-sm);">'
            + '<div style="padding:var(--space-xs) var(--space-sm); background:rgba(27,126,148,0.08); border-radius:6px; border:1px solid rgba(27,126,148,0.25);">'
            + '<p style="font-size:var(--fs-caption); font-weight:600; color:var(--bleu-canard); margin:0 0 var(--space-2xs) 0; text-transform:uppercase; letter-spacing:0.03em;">' + empD.var1Label + '</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--noir); margin:0; line-height:1.5; font-style:italic;">' + empD.var1Ex + '</p>'
            + '</div>'
            + '<div style="padding:var(--space-xs) var(--space-sm); background:rgba(27,126,148,0.08); border-radius:6px; border:1px solid rgba(27,126,148,0.25);">'
            + '<p style="font-size:var(--fs-caption); font-weight:600; color:var(--bleu-canard); margin:0 0 var(--space-2xs) 0; text-transform:uppercase; letter-spacing:0.03em;">' + empD.var2Label + '</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--noir); margin:0; line-height:1.5; font-style:italic;">' + empD.var2Ex + '</p>'
            + '</div>'
            + '</div>'
            + '<p style="font-size:var(--fs-caption); color:var(--gris); margin:0 0 var(--space-xs) 0; line-height:1.5;"><strong>5 marqueurs que VOUS nous fournissez en onboarding (lors de votre onboarding), r\u00e9inject\u00e9s \u00e0 chaque g\u00e9n\u00e9ration\u00a0:</strong> ' + empD.marqueurs + ' <em>Vous restez propri\u00e9taire des marqueurs inject\u00e9s\u2009; Qalia ne publie, ne mutualise, ni ne r\u00e9utilise vos donn\u00e9es entre clients.</em></p>'
            + '<p style="font-size:var(--fs-caption); color:var(--gris); margin:0 0 var(--space-xs) 0; line-height:1.5;"><strong>Temps de configuration initiale\u00a0:</strong> \u00e0 configurer lors de votre onboarding, puis r\u00e9injection nativement \u00e0 chaque g\u00e9n\u00e9ration. Pas de re-saisie.</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--gris); margin:0 0 var(--space-xs) 0; line-height:1.5;">' + empPartHtml + '</p>'
            + '<p style="font-size:var(--fs-caption); color:var(--gris); margin:0; line-height:1.5;"><strong>Tra\u00e7abilit\u00e9\u00a0:</strong> chaque g\u00e9n\u00e9ration est dat\u00e9e (jour de la session) et versionn\u00e9e c\u00f4t\u00e9 utilisateur via l\u2019export de donn\u00e9es (preuve de processus datable, utile en entretien d\u2019audit).</p>'
            + '</div>';
          empreinteWrap.style.display = 'block';
        }

        // === BLOC "ET SI \u00c7A NE MARCHE PAS ?" (Pelissier, phase Certitude) ===
        var worstCaseWrap = document.getElementById('simWorstCaseWrap');
        if (!worstCaseWrap) {
          worstCaseWrap = document.createElement('div');
          worstCaseWrap.id = 'simWorstCaseWrap';
          worstCaseWrap.style.cssText = 'margin-top:var(--space-md); border:1px solid rgba(27,126,148,0.12); border-radius:1rem; padding:var(--space-sm);';
          var shareParent = document.getElementById('simShare');
          if (shareParent && shareParent.parentNode) shareParent.parentNode.insertBefore(worstCaseWrap, shareParent);
        }
        var caEstime = Math.round(totalPrograms * effectiveTjm * 7 * 12);
        // Contenu dynamique selon profil, statut Qualiopi, Cat. L6313, échéance et rentabilité
        var wcCibles = state.cibles && state.cibles.length > 0 ? state.cibles : [state.cible || 'formateur'];
        var wcHasQualiopi = state.qualiopi && ['initial', 'surveillance', 'renouvellement'].indexOf(state.qualiopi) > -1;
        var wcIsAspirant = state.qualiopi === 'aspirant';
        var wcNonConcerne = !wcHasQualiopi && !wcIsAspirant;
        var wcCats = getActiveCats(wcCibles);
        var wcMois = state.echeanceMois || 24;

        // Paragraphe 1 : sortie sans risque (toujours identique)
        var wcP1 = state.billingAnnual
          ? '<p><strong>Si Qalia ne vous convient pas</strong>\u00a0: vous ne renouvelez pas \u00e0 l\u2019\u00e9ch\u00e9ance. Co\u00fbt maximum\u00a0: 2\u00a0970\u00a0\u20ac (12\u00a0mois, 2\u00a0mois offerts).</p>'
          : '<p><strong>Si Qalia ne vous convient pas</strong>\u00a0: r\u00e9siliation mensuelle, z\u00e9ro engagement. Co\u00fbt par mois souscrit\u00a0: 297\u00a0\u20ac.</p>';

        // Paragraphe 2 : risque d'inaction (adapté par situation)
        var wcP2 = '';
        if (wcHasQualiopi) {
          // Risques spécifiques par Cat. L6313
          var wcRisques = [];
          if (wcCats.indexOf(1) > -1) wcRisques.push('suspension de certification Qualiopi, perte d\u2019acc\u00e8s aux financements publics et mutualis\u00e9s (OPCO, CPF, France VAE, France Travail)');
          if (wcCats.indexOf(2) > -1) wcRisques.push('perte de la certification n\u00e9cessaire \u00e0 l\u2019exercice du bilan de comp\u00e9tences');
          if (wcCats.indexOf(3) > -1) wcRisques.push('exclusion du dispositif France VAE');
          if (wcCats.indexOf(4) > -1) wcRisques.push('perte de la certification n\u00e9cessaire au fonctionnement du CFA');
          if (wcRisques.length === 0) wcRisques.push('suspension de certification');
          var wcRisqueText = wcRisques.join('\u00a0; ');

          if (wcMois < 6) {
            wcP2 = '<p><strong>Si vous n\u2019agissez pas</strong>\u00a0: votre \u00e9ch\u00e9ance est dans ' + wcMois + '\u00a0mois. Une non-conformit\u00e9 majeure non r\u00e9solue dans les d\u00e9lais peut entra\u00eener\u00a0: ' + wcRisqueText + '.</p>';
          } else {
            wcP2 = '<p><strong>Si vous n\u2019agissez pas</strong>\u00a0: une non-conformit\u00e9 majeure en audit, non r\u00e9solue dans les d\u00e9lais accord\u00e9s, peut entra\u00eener\u00a0: ' + wcRisqueText + '.</p>';
          }
        } else if (wcIsAspirant) {
          wcP2 = '<p><strong>Si vous n\u2019agissez pas</strong>\u00a0: sans certification Qualiopi, vos formations ne sont pas \u00e9ligibles aux financements publics (OPCO, CPF, France Travail). Vos prospects certifi\u00e9s ont un avantage concurrentiel imm\u00e9diat.</p>';
        } else {
          // Non concerné par Qualiopi (académicien, etc.)
          wcP2 = '<p><strong>Si vous n\u2019agissez pas</strong>\u00a0: chaque programme con\u00e7u manuellement vous co\u00fbte du temps que vous ne facturez pas. ' + fmtNum(hRound) + fH(' par an de travail r\u00e9p\u00e9titif, soit ') + fmtNum(vRound) + '\u00a0\u20ac de valeur non capt\u00e9e.</p>';
        }

        // Paragraphe 3 : mise en perspective du coût (adapté par rentabilité et billing)
        var wcPrix = state.billingAnnual ? '247,50\u00a0\u20ac/mois' : '297\u00a0\u20ac/mois';
        var wcP3 = '';
        if (wcHasQualiopi) {
          wcP3 = '<p style="color:var(--gris);">' + wcPrix + ' vs le co\u00fbt d\u2019une suspension de certification (3 \u00e0 12\u00a0mois sans financement public).</p>';
        } else if (wcIsAspirant) {
          wcP3 = '<p style="color:var(--gris);">' + wcPrix + ' pour structurer votre dossier vs 1\u00a0190 \u00e0 6\u00a0000\u00a0\u20ac de consultant + le co\u00fbt d\u2019un audit non pr\u00e9par\u00e9.</p>';
        } else if (isProfitable) {
          wcP3 = '<p style="color:var(--gris);">' + wcPrix + ' pour un retour de \u00d7' + SIM_COMPUTED.roi.displayStr + ' en temps lib\u00e9r\u00e9 et en valeur r\u00e9cup\u00e9r\u00e9e.</p>';
        } else {
          wcP3 = state.billingAnnual
            ? '<p style="color:var(--gris);">247,50\u00a0\u20ac/mois (2\u00a0970\u00a0\u20ac/an, 2\u00a0mois offerts). Un an pour transformer votre quotidien.</p>'
            : '<p style="color:var(--gris);">297\u00a0\u20ac/mois. Un mois d\u2019essai suffit pour savoir si Qalia transforme votre quotidien.</p>';
        }

        worstCaseWrap.innerHTML = '<div style="font-size:var(--fs-small); font-weight:700; color:var(--gris); margin-bottom:var(--space-xs);">Et si \u00e7a ne marche pas\u00a0?</div>'
          + '<div style="font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir);">' + wcP1 + '</div>'
          + '<details style="margin-top:var(--space-xs);">'
          + '<summary style="font-size:var(--fs-caption); color:var(--gris); cursor:pointer;">En savoir plus sur les risques</summary>'
          + '<div style="font-size:var(--fs-small); line-height:var(--lh-body); color:var(--noir); margin-top:var(--space-xs);">'
          + wcP2 + wcP3
          + '</div></details>';

        // Afficher les boutons de partage
        var shareDiv = document.getElementById('simShare');
        shareDiv.style.display = 'block';
        setupShareButtons(hRound, vRound, netRound, totalPrograms, roiMultiple, annualCost, daysFreed, eisenhowerTag, dashData, SIM_COMPUTED.roi.displayStr);

        // === DASHBOARD DYNAMIQUE (D35, arbitrage 11 agents) ===
        applyDashboardLayout();
      }

      // === EMAIL HTML BRANDE ===
      function generateEmailHTML(hours, value, net, programs, roi, cost, days, eisTag, dd) {
        var sign = net >= 0 ? '+' : '';
        var cible = dd.cible || 'formateur';
        var profileCopy = PROFILE_COPY[cible] || PROFILE_COPY.formateur;
        var conclusionMsg = profileCopy.shareConclusion(dd);
        var cost3y = fmtNum(Math.round(dd.valueSaved * 3));
        var costManuel = fmtNum(Math.round(dd.totalOldHours * dd.tjm));
        var urgentText = (dd.echeanceMois && dd.echeanceMois < 12)
          ? dd.echeanceMois + ' <span class="u">mois</span> avant \u00e9ch\u00e9ance Qualiopi'
          : 'Pas d\u2019\u00e9ch\u00e9ance imm\u00e9diate : moment id\u00e9al pour industrialiser';

        return '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;">'
          + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:20px 0;">'
          + '<tr><td align="center">'
          + '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:1rem;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">'

          // Header with logo
          + '<tr><td style="background:#1B7E94;padding:28px 32px;text-align:center;">'
          + '<img src="https://www.qalia.ai/Qalia.png" alt="Qalia" width="140" height="auto" style="display:inline-block;max-width:140px;height:auto;margin-bottom:8px;" />'
          + '<p style="margin:6px 0 0;color:rgba(255,255,255,1);font-size:13px;">Assistant IA \u00b7 Ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9</p>'
          + '</td></tr>'

          // Intro
          + '<tr><td style="padding:28px 32px 12px;">'
          + '<p style="margin:0;font-size:15px;color:#333;line-height:var(--lh-body);">Bonjour,</p>'
          + '<p style="margin:12px 0 0;font-size:15px;color:#333;line-height:var(--lh-body);">Voici mon bilan ROI personnalis\u00e9 r\u00e9alis\u00e9 avec le simulateur Qalia sur <strong>' + fmtNum(programs) + ' programmes/an</strong>.</p>'
          + '</td></tr>'

          // KPIs grid
          + '<tr><td style="padding:12px 32px 20px;">'
          + '<table width="100%" cellpadding="0" cellspacing="0">'
          + '<tr>'
          + '<td width="33%" style="padding:8px;"><div style="background:#f0f7f7;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:#1B7E94;">' + fmtNum(hours) + fH('</div>')
          + '<div style="font-size:11px;color:#666;margin-top:4px;">Heures lib\u00e9r\u00e9es/an</div>'
          + '</div></td>'
          + '<td width="33%" style="padding:8px;"><div style="background:#f0f7f7;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:#1B7E94;">' + fmtNum(value) + '\u00a0<sup class="u">\u20ac</sup></div>'
          + '<div style="font-size:11px;color:#666;margin-top:4px;">Valeur r\u00e9cup\u00e9r\u00e9e</div>'
          + '</div></td>'
          + '<td width="33%" style="padding:8px;"><div style="background:#f0f7f7;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:#1B7E94;">\u00d7' + fmtNum(roi, 1) + '</div>'
          + '<div style="font-size:11px;color:#666;margin-top:4px;">ROI annuel (jusqu\u2019\u00e0)</div>'
          + '</div></td>'
          + '</tr>'
          + '<tr>'
          + '<td width="33%" style="padding:8px;"><div style="background:#faf6f0;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:#333;">' + fmtNum(days) + '</div>'
          + '<div style="font-size:11px;color:#666;margin-top:4px;">Jours lib\u00e9r\u00e9s</div>'
          + '</div></td>'
          + '<td width="33%" style="padding:8px;"><div style="background:#faf6f0;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:#333;">' + (dd.paybackLabel || ('M' + dd.paybackMonth)) + '</div>'
          + '<div style="font-size:11px;color:#666;margin-top:4px;">Payback</div>'
          + '</div></td>'
          + '<td width="33%" style="padding:8px;"><div style="background:#faf6f0;border-radius:10px;padding:16px 12px;text-align:center;">'
          + '<div style="font-size:24px;font-weight:700;color:' + (net >= 0 ? '#2D6E54' : '#C94040') + ';">' + sign + fmtNum(net) + '\u00a0<sup class="u">\u20ac</sup></div>'
          + '<div style="font-size:11px;color:#666;margin-top:4px;">R\u00e9sultat net</div>'
          + '</div></td>'
          + '</tr>'
          + '</table>'
          + '</td></tr>'

          // Decision analysis
          + '<tr><td style="padding:0 32px 20px;">'
          + '<div style="background-color:#f5f3ef;border-radius:10px;padding:20px 20px 20px 24px;background-image:linear-gradient(180deg, #1B7E94, #2A9DB6);background-size:4px 100%;background-repeat:no-repeat;background-position:left;">'
          + '<h3 style="margin:0 0 12px;font-size:14px;color:#1B7E94;text-transform:uppercase;letter-spacing:0.5px;">Analyse d\u00e9cisionnelle</h3>'
          + '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">'
          + '<tr><td style="padding:6px 0;"><strong>Indicateur de priorit\u00e9</strong></td><td style="padding:6px 0;text-align:right;">' + eisTag + '</td></tr>'
          + '<tr><td colspan="2" style="border-top:1px solid #ddd;"></td></tr>'
          + '<tr><td style="padding:6px 0;"><strong>Votre situation</strong></td><td style="padding:6px 0;text-align:right;font-size:12px;">' + fmtH(dd.totalOldHours) + fH('/an = ') + costManuel + '\u00a0<sup class="u">\u20ac</sup></td></tr>'
          + '<tr><td colspan="2" style="padding:2px 0;font-size:12px;color:#666;">'
          + '\u2022 Douloureux : ' + fmtH(dd.totalOldHours) + fH(' de travail r\u00e9p\u00e9titif<br>')
          + '\u2022 Urgent : ' + urgentText + '<br>'
          + '\u2022 Reconnu : 84 <span class="u">%</span> ont essay\u00e9 ChatGPT sans impact (Hardman, 2024)'
          + '</td></tr>'
          + '<tr><td colspan="2" style="border-top:1px solid #ddd;"></td></tr>'
          + '<tr><td style="padding:6px 0;"><strong>Co\u00fbt de l\u2019inaction (3 ans)</strong></td><td style="padding:6px 0;text-align:right;color:#C94040;font-weight:700;">' + cost3y + '\u00a0<sup class="u">\u20ac</sup></td></tr>'
          + '</table>'
          + '</div>'
          + '</td></tr>'

          // Conclusion
          + '<tr><td style="padding:0 32px 24px;">'
          + '<p style="margin:0;font-size:14px;color:#333;line-height:var(--lh-body);font-style:italic;">' + conclusionMsg + '</p>'
          + '</td></tr>'

          // CTA
          + '<tr><td style="padding:0 32px 28px;text-align:center;">'
          + '<a href="https://rdv.qalia.ai" target="_blank" rel="nofollow noopener" style="display:inline-block;background:#1B7E94;color:#fff;text-decoration:none;padding:14px 32px;border-radius:0.75rem;font-size:15px;font-weight:600;">R\u00e9servez ma d\u00e9mo offerte (30 <span class="u">min</span>)</a>'
          + '<br><a href="https://www.qalia.ai" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font-size:13px;color:#1B7E94;text-decoration:underline;">Simulez votre propre ROI</a>'
          + '</td></tr>'

          // Footer
          + '<tr><td style="background:#333;padding:24px 32px;color:#ccc;font-size:12px;line-height:var(--lh-body);">'
          + '<strong style="color:#fff;">Romuald DARIOT</strong> \u00b7 Fondateur Qalia<br>'
          + 'WhatsApp : <a href="https://wa.me/262693303970" target="_blank" rel="noopener" style="color:#4ECDC4;text-decoration:none;">+262 693 303 970</a> \u00b7 <a href="mailto:bonjour@qalia.ai" style="color:#4ECDC4;text-decoration:none;">bonjour@qalia.ai</a><br><br>'
          + '<strong style="color:#fff;">Mehdi IDRICI</strong> \u00b7 Commercial<br>'
          + '+262 692 82 78 78 \u00b7 commercial@qalia.ai<br><br>'
          + '<span style="color:#999;">231 rue Saint-Honor\u00e9, 75001 Paris</span>'
          + '</td></tr>'

          + '</table></td></tr></table></body></html>';
      }

      // === PARTAGE DES RESULTATS (HCP + Decision Book enrichi) ===
      function setupShareButtons(hours, value, net, programs, roi, cost, days, eisTag, dd) {
        var sign = net >= 0 ? '+' : '';
        var cible = dd.cible || 'formateur';
        var profileCopy = PROFILE_COPY[cible] || PROFILE_COPY.formateur;
        var shortMsg = profileCopy.shareShort(dd);
        var conclusionMsg = profileCopy.shareConclusion(dd);
        var cost3y = fmtNum(Math.round(dd.valueSaved * 3));
        var costManuel = fmtNum(Math.round(dd.totalOldHours * dd.tjm));

        var coordonnees = '\n\n---\nRomuald DARIOT | Fondateur Qalia\nWhatsApp : +262 693 303 970\nbonjour@qalia.ai\nhttps://www.qalia.ai';
        var coordonneesFull = '\n\n---\nRomuald DARIOT | Fondateur Qalia\nWhatsApp : +262 693 303 970\nbonjour@qalia.ai\n\nMehdi IDRICI | Commercial\n+262 692 82 78 78\ncommercial@qalia.ai\n\nhttps://www.qalia.ai\n231 rue Saint-Honor\u00e9, 75001 Paris';

        // === WhatsApp short (contexte Qalia inclus) ===
        var waShort = 'Salut !\n\n'
          + 'J\u2019ai d\u00e9couvert *Qalia*, un assistant IA sp\u00e9cialis\u00e9 en ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9.\n\n'
          + 'Ma simulation :\n'
          + '\u2022 ' + fmtNum(hours) + ' h lib\u00e9r\u00e9es par an\n'
          + '\u2022 ROI \u00d7' + fmtNum(roi, 1) + '\n\n'
          + '\u00c7a pourrait t\u2019int\u00e9resser si tu g\u00e8res des programmes de formation.\n\n'
          + 'Simule ton ROI (offert) :\nhttps://www.qalia.ai\n\n'
          + 'D\u00e9mo offerte 30 min, sans engagement :\nhttps://rdv.qalia.ai'
          + coordonnees;

        // === WhatsApp professional (contexte complet + analyse decisionnelle) ===
        var waPro = 'Bonjour,\n\n'
          + 'Je viens de simuler mon bilan ROI avec *Qalia*, l\u2019assistant IA sp\u00e9cialis\u00e9 en ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9.\n\n'
          + '*R\u00e9sultats sur 1 an* (' + fmtNum(programs) + ' programmes) :\n\n'
          + '_KPIs annuels :_\n'
          + '\u2022 ' + fmtNum(hours) + ' h lib\u00e9r\u00e9es (' + fmtNum(days) + ' jours)\n'
          + '\u2022 Valeur r\u00e9cup\u00e9r\u00e9e : ' + fmtNum(value) + ' \u20ac\n'
          + '\u2022 ROI \u00d7' + fmtNum(roi, 1) + ' | Payback ' + (dd.paybackLabel || 'Mois\u00a0' + dd.paybackMonth) + '\n'
          + '\u2022 Investissement : ' + fmtNum(cost) + ' \u20ac/an\n\n'
          + '_Analyse d\u00e9cisionnelle :_\n'
          + '\u2022 Priorit\u00e9 : ' + eisTag + '\n'
          + '\u2022 Situation : ' + fmtNum(dd.totalOldHours) + ' h/an = ' + costManuel + ' \u20ac\n'
          + '\u2022 Inaction 3 ans : ' + cost3y + ' \u20ac\n\n'
          + stripU(conclusionMsg) + '\n\n'
          + 'Simulez votre ROI :\nhttps://www.qalia.ai\n\n'
          + 'D\u00e9mo offerte 30 min :\nhttps://rdv.qalia.ai'
          + coordonnees;

        // === Email (texte structure complet) ===
        var emailSubject = 'Simulation Qalia : ' + (net > 0 ? 'ROI \u00d7' + fmtNum(roi, 1) + ' sur ' + fmtNum(programs) + ' programmes' : 'Bilan personnalis\u00e9 ' + fmtNum(programs) + ' programmes');
        var emailBody = 'Bonjour,\n\n'
          + 'J\u2019ai simul\u00e9 mon retour sur investissement avec Qalia, l\u2019assistant IA sp\u00e9cialis\u00e9 en ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9.\n\n'
          + 'Voici mon bilan personnalis\u00e9 sur 1 an (' + fmtNum(programs) + ' programmes) :\n\n'
          + '\u2500\u2500\u2500 KPIs annuels \u2500\u2500\u2500\n'
          + '\u2022 Heures lib\u00e9r\u00e9es : ' + fmtNum(hours) + ' h (' + fmtNum(days) + ' jours)\n'
          + '\u2022 Valeur r\u00e9cup\u00e9r\u00e9e : ' + fmtNum(value) + ' \u20ac\n'
          + '\u2022 Investissement Qalia : ' + fmtNum(cost) + ' \u20ac/an\n'
          + '\u2022 R\u00e9sultat net : ' + sign + fmtNum(net) + ' \u20ac\n'
          + '\u2022 ROI : \u00d7' + fmtNum(roi, 1) + '\n'
          + '\u2022 Payback : ' + (dd.paybackLabel || 'Mois ' + dd.paybackMonth) + '\n\n'
          + '\u2500\u2500\u2500 Analyse d\u00e9cisionnelle \u2500\u2500\u2500\n'
          + '\u2022 Indicateur de priorit\u00e9 :' + eisTag + '\n'
          + '\u2022 Votre situation :\n'
          + '  - Douloureux : ' + fmtNum(dd.totalOldHours) + ' h/an de travail manuel = ' + costManuel + ' \u20ac de co\u00fbt r\u00e9el\n'
          + '  - Urgent : ' + (dd.echeanceMois && dd.echeanceMois < 12 ? dd.echeanceMois + ' mois avant \u00e9ch\u00e9ance' : 'Pas d\u2019\u00e9ch\u00e9ance imm\u00e9diate : moment id\u00e9al pour industrialiser') + '\n'
          + '  - Reconnu : 84 % des concepteurs ont essay\u00e9 ChatGPT sans impact significatif (Hardman/Synthesia, 2024)\n'
          + '\u2022 Co\u00fbt d\u2019opportunit\u00e9 sur 3 ans (borne haute) : ' + cost3y + ' \u20ac non captur\u00e9s\n\n'
          + '\u2500\u2500\u2500 Conclusion \u2500\u2500\u2500\n'
          + stripU(conclusionMsg) + '\n\n'
          + '\u2500\u2500\u2500 En savoir plus \u2500\u2500\u2500\n'
          + 'Simulez votre propre ROI : https://www.qalia.ai\n'
          + 'R\u00e9server une d\u00e9mo offerte (30 min, sans engagement) : https://rdv.qalia.ai\n'
          + coordonneesFull + '\n\n'
          + 'Bien cordialement';

        // === LinkedIn (post professionnel complet) ===
        var linkedinText = 'J\u2019ai utilis\u00e9 le simulateur ROI de Qalia pour mesurer l\u2019impact concret d\u2019un assistant IA sp\u00e9cialis\u00e9 en ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9.\n\n'
          + 'R\u00e9sultat sur 1 an avec ' + fmtNum(programs) + ' programmes :\n\n'
          + 'KPIs :\n'
          + '\u2022 ' + fmtNum(hours) + ' h lib\u00e9r\u00e9es (' + fmtNum(days) + ' jours)\n'
          + '\u2022 Valeur r\u00e9cup\u00e9r\u00e9e : ' + fmtNum(value) + ' \u20ac\n'
          + '\u2022 ROI \u00d7' + fmtNum(roi, 1) + ' \u00b7 Payback ' + (dd.paybackLabel || 'Mois\u00a0' + dd.paybackMonth) + '\n\n'
          + 'Analyse d\u00e9cisionnelle :\n'
          + '\u2022 Indicateur de priorit\u00e9 :' + eisTag + '\n'
          + '\u2022 Votre situation : ' + fmtNum(dd.totalOldHours) + ' h/an de travail manuel = ' + costManuel + ' \u20ac\n'
          + '\u2022 Co\u00fbt de l\u2019inaction sur 3 ans : ' + cost3y + ' \u20ac de manque \u00e0 gagner\n\n'
          + stripU(conclusionMsg) + '\n\n'
          + 'Si vous g\u00e9rez des programmes de formation et que la conformit\u00e9 Qualiopi vous prend trop de temps :\n'
          + '\u2192 Simulez votre propre ROI : https://www.qalia.ai\n'
          + '\u2192 D\u00e9mo offerte 30 min : https://rdv.qalia.ai\n\n'
          + '#Qualiopi #Formation #IA #Ing\u00e9nierieP\u00e9dagogique #Qalia #ROI #Conformit\u00e9 #RNQ #FormationPro';

        // === Facebook (post contextualise) ===
        var fbText = 'J\u2019ai fait simuler mon ROI avec Qalia, l\u2019assistant IA sp\u00e9cialis\u00e9 en ing\u00e9nierie p\u00e9dagogique structur\u00e9e selon le RNQ V9.\n\n'
          + 'Mon bilan personnalis\u00e9 sur 1 an :\n'
          + '\u2192 ' + fmtNum(hours) + ' h lib\u00e9r\u00e9es (' + fmtNum(days) + ' jours r\u00e9cup\u00e9r\u00e9s)\n'
          + '\u2192 Valeur r\u00e9cup\u00e9r\u00e9e : ' + fmtNum(value) + ' \u20ac\n'
          + '\u2192 ROI \u00d7' + fmtNum(roi, 1) + ' \u00b7 Payback : ' + (dd.paybackLabel || 'Mois ' + dd.paybackMonth) + '\n'
          + '\u2192 indicateurs RNQ V9 applicables structur\u00e9s et v\u00e9rifi\u00e9s avec vous \u00e0 chaque g\u00e9n\u00e9ration\n\n'
          + stripU(conclusionMsg) + '\n\n'
          + 'Analysez vous-m\u00eame votre retour sur investissement : https://www.qalia.ai (sans engagement, r\u00e9sultats en 2 min)\n\n'
          + '#Qualiopi #Formation #IA #Qalia #ROI #Conformit\u00e9 #FormationProfessionnelle';

        // === X / Twitter (format court) ===
        var tweetText = fmtNum(hours) + ' h lib\u00e9r\u00e9es/an, ROI \u00d7' + fmtNum(roi, 1) + '. '
          + 'Qalia : IA conformit\u00e9 Qualiopi (indicateurs RNQ V9 applicables structurés documentairement par Qalia).\n'
          + 'Simulez votre ROI \u2192 https://www.qalia.ai #Qualiopi #Qalia #Formation';

        // Direct share buttons (primary)
        var waBtn = document.getElementById('simShareWhatsapp');
        if (waBtn) {
          waBtn.onclick = function() {
            window.open('https://wa.me/?text=' + encodeURIComponent(waShort), '_blank');
          };
        }
        var emailBtn = document.getElementById('simShareEmail');
        if (emailBtn) {
          emailBtn.onclick = function() {
            window.location.href = 'mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody);
          };
        }
        // LinkedIn
        var linkedinBtn = document.getElementById('simShareLinkedin');
        if (linkedinBtn) {
          linkedinBtn.onclick = function() {
            navigator.clipboard.writeText(linkedinText).then(function() {
              alert('Texte copi\u00e9 ! Collez-le dans votre post LinkedIn.');
            }).catch(function() {
              prompt('Copiez ce texte pour LinkedIn :', linkedinText);
            });
          };
        }
        // Facebook
        var fbBtn = document.getElementById('simShareFacebook');
        if (fbBtn) {
          fbBtn.onclick = function() {
            navigator.clipboard.writeText(fbText).then(function() {
              alert('Texte copi\u00e9 ! Partagez-le sur Facebook.');
            }).catch(function() {
              prompt('Copiez ce texte pour Facebook :', fbText);
            });
          };
        }
        // X
        var xBtn = document.getElementById('simShareX');
        if (xBtn) {
          xBtn.onclick = function() {
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText.substring(0, 280)), '_blank');
          };
        }
        // Print - robust canvas-to-image conversion + layout fixes
        var _printPageStyle = null; // dynamic @page style element
        var _printPrevTab = null;  // previous active tab before print
        function preparePrintLayout() {
          // 0. Force "Tous" view for time bars so printed report shows full overview
          _printPrevTab = _timeChartState.activeTab;
          if (_timeChartState.activeTab !== 'all') {
            _timeChartState.activeTab = 'all';
            renderTimeBars();
          }
          // 1. Redraw ROI chart at current size to ensure canvas is fresh
          try { if (typeof drawRoiChartStatic === 'function') drawRoiChartStatic(); } catch(e) {}
          // 2. Convert ALL canvases inside the dashboard to static PNG images
          document.querySelectorAll('#simStep9 canvas').forEach(function(canvas) {
            // Skip already-converted or zero-size canvases
            if (canvas.width === 0 || canvas.height === 0) return;
            if (canvas.nextElementSibling && canvas.nextElementSibling.classList.contains('print-canvas-img')) return;
            try {
              var img = document.createElement('img');
              img.src = canvas.toDataURL('image/png');
              img.style.cssText = 'width:100%;max-width:' + canvas.width + 'px;height:auto;display:block;';
              img.className = 'print-canvas-img';
              canvas.parentElement.insertBefore(img, canvas.nextSibling);
            } catch(e) { /* canvas tainted or empty - skip */ }
          });
          // 3. Freeze time bar widths as inline styles (override CSS animations)
          document.querySelectorAll('.sim-time-bar').forEach(function(bar) {
            var w = bar.getAttribute('data-width') || bar.style.width;
            if (w) {
              var pct = parseFloat(w);
              if (!isNaN(pct)) {
                bar.style.width = pct + '%';
                bar.style.transition = 'none';
              }
            }
          });
          // 4. Force opacity on all dashboard-full elements (belt & suspenders with CSS)
          document.querySelectorAll('.sim-dashboard-full, .sim-metric').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.animation = 'none';
          });
          // 5. Dynamic single-page: measure content height and inject @page size
          var activeStep = document.querySelector('.sim-step.active');
          if (activeStep) {
            var contentH = activeStep.scrollHeight;
            // Add margins (top 1.5cm + bottom 1cm = ~94px at 96dpi) + padding buffer
            var pageHeightMm = Math.ceil((contentH + 120) * 0.2646); // px to mm
            pageHeightMm = Math.max(pageHeightMm, 297); // minimum A4 height
            _printPageStyle = document.createElement('style');
            _printPageStyle.textContent = '@page { size: 210mm ' + pageHeightMm + 'mm; margin: 1.5cm 1.5cm 1cm; }';
            document.head.appendChild(_printPageStyle);
          }
        }
        function cleanupPrintLayout() {
          document.querySelectorAll('.print-canvas-img').forEach(function(img) {
            img.remove();
          });
          // Restore animation styles (let CSS handle it)
          document.querySelectorAll('.sim-dashboard-full, .sim-metric').forEach(function(el) {
            el.style.opacity = '';
            el.style.transform = '';
            el.style.animation = '';
          });
          // Remove dynamic @page style
          if (_printPageStyle) {
            _printPageStyle.remove();
            _printPageStyle = null;
          }
          // Restore previous time-bar tab if it was changed for print
          if (_printPrevTab !== null && _printPrevTab !== _timeChartState.activeTab) {
            _timeChartState.activeTab = _printPrevTab;
            renderTimeBars();
            // Restore active tab button visual state
            var tabsDiv = document.getElementById('simTimeTabs');
            if (tabsDiv) {
              tabsDiv.querySelectorAll('.sim-time-tab').forEach(function(t) {
                t.classList.toggle('active', t.getAttribute('data-filter') === _printPrevTab);
              });
            }
          }
          _printPrevTab = null;
        }
        window.addEventListener('beforeprint', preparePrintLayout);
        window.addEventListener('afterprint', cleanupPrintLayout);
        var printBtn = document.getElementById('simSharePrint');
        if (printBtn) {
          printBtn.onclick = function() {
            if (!window.QaliaPDF || !window.QaliaPDF.generate) {
              // Fallback vers l'impression navigateur si le module PDF n'est pas charge
              preparePrintLayout();
              window.print();
              return;
            }
            // Snapshot des donnees au clic : construction dynamique du contexte PDF
            var origLabel = printBtn.getAttribute('aria-label');
            printBtn.setAttribute('aria-busy', 'true');
            printBtn.style.opacity = '0.6';
            printBtn.style.pointerEvents = 'none';
            var origTitle = printBtn.title;
            printBtn.title = 'Génération du PDF en cours...';
            try {
              var pdfCtx = buildPdfContext(hours, value, net, programs, roi, cost, days, eisTag, dd);
              window.QaliaPDF.generate(pdfCtx).then(function(result) {
                printBtn.removeAttribute('aria-busy');
                printBtn.style.opacity = '';
                printBtn.style.pointerEvents = '';
                printBtn.title = origTitle;
              }).catch(function(err) {
                console.error('PDF generation failed:', err);
                printBtn.removeAttribute('aria-busy');
                printBtn.style.opacity = '';
                printBtn.style.pointerEvents = '';
                printBtn.title = origTitle;
                // Fallback vers impression navigateur
                preparePrintLayout();
                window.print();
              });
            } catch(err) {
              console.error('PDF context build failed:', err);
              printBtn.removeAttribute('aria-busy');
              printBtn.style.opacity = '';
              printBtn.style.pointerEvents = '';
              printBtn.title = origTitle;
              preparePrintLayout();
              window.print();
            }
          };
        }

        // Builder du contexte PDF : snapshot complet des donnees au moment du clic
        function buildPdfContext(hours, value, net, programs, roi, cost, days, eisTag, dd) {
          var ctx = {};
          // --- Profil ---
          var PROFILE_LBL = window.QaliaPDF.PROFILE_LABELS || {};
          var QLBL = window.QaliaPDF.QUALIOPI_LABELS || {};
          var cibles = (state.cibles && state.cibles.length > 0) ? state.cibles : [state.cible || 'formateur'];
          var metierLabels = cibles.map(function(c) { return PROFILE_LBL[c] || c; });
          ctx.metiersLabel = metierLabels.join(', ');
          ctx.metiersSlug = cibles.join('-');
          ctx.isGestionnaire = cibles.some(function(c) { return PROFILE_SEGMENT[c] === 'gestionnaire'; });
          ctx.billingAnnual = state.billingAnnual;
          ctx.contexteLabel = (state.pourQui === 'equipe' ? 'Équipe de ' + state.tailleEquipe + ' personnes'
                              : state.pourQui === 'tiers' ? 'Tiers/clients' : 'Solo');
          ctx.qualiopiLabel = QLBL[state.qualiopi] || (state.qualiopi || 'Non renseigné');
          if (state.echeanceMois && state.echeanceMois < 12) {
            ctx.qualiopiLabel += ' (échéance ' + state.echeanceMois + ' mois)';
          }
          // --- KPIs ---
          ctx.programs = programs;
          ctx.hours = hours;
          ctx.daysFreed = days;
          ctx.valueSaved = value;
          ctx.annualCost = cost;
          ctx.netResult = net;
          ctx.roi = roi;
          ctx.paybackMonth = dd.paybackMonth || 12;
          ctx.paybackDays = dd.paybackDays || 0;
          ctx.paybackLabel = dd.paybackLabel || ('Mois\u00a0' + (dd.paybackMonth || 12));
          ctx.totalOldHours = dd.totalOldHours || 0;
          ctx.tjm = dd.tjm || state.tjm || 70;
          // --- Comparaison 3 scenarios ---
          ctx.totalMarketHours = dd.totalOldHours || 0;
          ctx.totalChatGPTHours = dd.totalChatGPTHours || 0;
          ctx.totalQaliaHours = dd.totalQaliaHours || 0;
          ctx.hoursSavedVsChatGPT = dd.hoursSavedVsChatGPT || 0;
          // --- Pricing dynamique ---
          ctx.billingAnnual = dd.billingAnnual || false;
          ctx.pricingTierName = dd.pricingTierName || 'Solo';
          ctx.monthlyPrice = dd.monthlyPrice || 297;
          ctx.annualPrice = dd.annualPrice || 2970;
          ctx.chatgptPlanLabel = dd.chatgptPlanLabel || 'Plus';
          ctx.chatgptMonthlyCost = dd.chatgptMonthlyCost || 23;
          ctx.teamMultiplier = (dd.pourQui === 'equipe' && dd.tailleEquipe > 1) ? dd.tailleEquipe : 1;
          // --- Verdict + Eisenhower ---
          var isProfitable = net > 0;
          ctx.verdictText = isProfitable
            ? 'Avec ' + Q_f(programs) + ' programmes/an, vous récupérez ' + Q_f(hours) + ' h et ' + Q_f(value) + ' € de valeur. Le ROI de ×' + Q_f(roi, 1) + ' confirme un retour sur investissement net de ' + Q_f(net) + ' € dès la première année.'
            : 'À votre volume actuel (' + Q_f(programs) + ' programmes/an), Qalia couvre son coût tout en structurant votre conformité. Le ROI financier s\u2019amplifiera avec vos prochains programmes.';
          var eisDom = document.getElementById('simEisenhower');
          ctx.eisenhowerLabel = eisDom ? (eisDom.querySelector('.sim-eis-label') || {}).textContent || '' : '';
          ctx.eisenhowerText = eisDom ? (eisDom.querySelector('.sim-eis-desc') || {}).textContent || '' : '';
          // --- D.U.R. ---
          var durDom = document.getElementById('simDUR');
          function durPart(sel) { var el = durDom && durDom.querySelector(sel); return el ? el.textContent.trim().replace(/\s+/g, ' ') : ''; }
          ctx.durDouloureux = durPart('.sim-dur-d .sim-dur-body') || (Q_f(dd.totalOldHours) + ' h/an de travail manuel répétitif sur vos tâches Qualiopi.');
          ctx.durUrgent = durPart('.sim-dur-u .sim-dur-body') || (state.echeanceMois && state.echeanceMois < 12
            ? state.echeanceMois + ' mois avant échéance : le dossier de preuves se construit maintenant.'
            : 'Moment idéal pour industrialiser avant le prochain audit.');
          ctx.durReconnu = durPart('.sim-dur-r .sim-dur-body') || '84 % des concepteurs ont essayé ChatGPT sans impact significatif (Hardman/Synthesia, 2024).';
          // Coût de l'inaction = valeur brute perdue sur 3 ans (aligné avec le site, cf. ligne 14693)
          // Sémantique : si on ne fait rien, on perd la valeur brute. Le coût Qalia n'existe pas dans le scénario d'inaction.
          ctx.cost3y = Math.round(value * 3);
          // --- Tasks (from DOM sim-time-bars or reconstruction) ---
          ctx.tasks = collectTasksFromState();
          // --- Graph canvas ---
          var canvas = document.getElementById('simRoiCanvas');
          // Force-open ROI <details> avant capture pour s'assurer que le canvas est dessiné
          var _pdfRoiDet = canvas ? canvas.closest('details.sim-roi-details') : null;
          var _pdfRoiDetWasOpen = _pdfRoiDet ? _pdfRoiDet.open : false;
          if (_pdfRoiDet && !_pdfRoiDet.open) { _pdfRoiDet.open = true; }
          try { if (typeof drawRoiChartStatic === 'function') drawRoiChartStatic(); } catch(e) {}
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            try {
              ctx.chartDataUrl = canvas.toDataURL('image/png');
              ctx.chartW = canvas.width;
              ctx.chartH = canvas.height;
            } catch(e) { ctx.chartDataUrl = null; }
          }
          if (_pdfRoiDet && !_pdfRoiDetWasOpen) { _pdfRoiDet.open = false; }
          // --- Données mensuelles cumulées pour graphe PDF (prioritaire sur la capture PNG) ---
          try {
            var SEASON_RAW = dd.seasonArray || [1,1,1,1,1,1,1,0,1,1,1,1];
            var startMonth = new Date().getMonth();
            var SEASON_ROT = SEASON_RAW.slice(startMonth).concat(SEASON_RAW.slice(0, startMonth));
            var SEASON_SUM_PDF = SEASON_ROT.reduce(function(s, v) { return s + v; }, 0);
            if (SEASON_SUM_PDF <= 0) SEASON_SUM_PDF = 9.2;
            var monthlySavingPdf = value / SEASON_SUM_PDF;
            var monthlyCostPdf = ctx.annualCost / 12;
            var cumulArr = [];
            var cumulPdf = 0;
            for (var mi = 0; mi < 12; mi++) {
              cumulPdf += monthlySavingPdf * SEASON_ROT[mi] - monthlyCostPdf;
              cumulArr.push(Math.round(cumulPdf));
            }
            ctx.cumulMonthly = cumulArr;
          } catch(e) { ctx.cumulMonthly = null; }
          // --- Seasonality ---
          try {
            var seasonArr = (dd.seasonArray && dd.seasonArray.length === 12) ? dd.seasonArray.slice() : null;
            if (seasonArr) {
              ctx.seasonData = seasonArr;
              var peakIdx = 0, troughIdx = 0;
              for (var k = 0; k < 12; k++) {
                if (seasonArr[k] > seasonArr[peakIdx]) peakIdx = k;
                if (k !== 7 && seasonArr[k] < seasonArr[troughIdx]) troughIdx = k;
              }
              var moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
              ctx.seasonPeakLabel = moisNoms[peakIdx];
              ctx.seasonPeakPct = seasonArr[peakIdx];
              var ratio = seasonArr[peakIdx] / Math.max(seasonArr[troughIdx], 0.01);
              ctx.seasonRatio = ratio;
              ctx.seasonRatioLabel = ratio >= 3 ? 'Saisonnalité forte' : (ratio >= 2 ? 'Saisonnalité marquée' : 'Saisonnalité modérée');
              var overload = 0;
              seasonArr.forEach(function(v) { if (v > 1.05) overload++; });
              ctx.seasonOverloadMonths = overload;
              ctx.seasonOverloadLabel = overload >= 6 ? 'Tension forte' : (overload >= 4 ? 'Tension modérée' : 'Tension faible');
            }
          } catch(e) {}
          // --- Audit info ---
          if (state.echeanceMois && state.qualiopi) {
            var typeLabel = state.qualiopi === 'surveillance' ? 'de surveillance'
                          : state.qualiopi === 'renouvellement' ? 'de renouvellement'
                          : state.qualiopi === 'initial' ? 'initial' : '';
            if (typeLabel) {
              ctx.auditInfo = { typeLabel: typeLabel, monthsAway: state.echeanceMois };
            }
          }
          // --- Activation items ---
          ctx.activationItems = collectActivationItems();

          // === CAPTURE EXHAUSTIVE DU BILAN (DOM text) ===
          function txt(id) {
            var el = document.getElementById(id);
            if (!el || el.style.display === 'none' || (el.parentElement && el.parentElement.style.display === 'none')) return '';
            return (el.textContent || '').replace(/\s+/g, ' ').trim();
          }
          function txtInnerBlocks(id) {
            // Preserve paragraph separation for multi-block DOM
            var el = document.getElementById(id);
            if (!el) return '';
            if (el.style.display === 'none' || (el.parentElement && el.parentElement.style.display === 'none')) return '';
            var out = [];
            var walk = function(node) {
              if (node.nodeType === 3) { out.push(node.textContent); return; }
              if (node.nodeType !== 1) return;
              var tag = node.tagName;
              if (['SCRIPT','STYLE','SVG'].indexOf(tag) !== -1) return;
              if (['P','DIV','LI','H1','H2','H3','H4','H5','BR','SECTION'].indexOf(tag) !== -1) {
                var before = out.length;
                for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
                if (out.length > before) out.push('\n');
              } else {
                for (var j = 0; j < node.childNodes.length; j++) walk(node.childNodes[j]);
              }
            };
            walk(el);
            return out.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
          }
          ctx.iaBadge = txt('simIaBadge');
          ctx.contextRecap = txt('simContextRecap');
          ctx.verdictLabel = txt('simVerdictText');
          ctx.verdictFootnote = txt('simVerdictFootnote');
          // 6 KPIs sous forme labellisée
          ctx.kpis6 = [
            { label: 'Heures libérées / an', value: Q_f(hours) + ' h' },
            { label: 'Valeur récupérée', value: Q_f(value) + ' \u20AC' },
            { label: 'Investissement Qalia / an', value: Q_f(cost) + ' \u20AC' },
            { label: 'ROI multiplicateur', value: '\u00D7' + Q_f(roi, 1) },
            { label: 'Payback', value: ctx.paybackLabel || ('M' + ctx.paybackMonth) },
            { label: 'Jours libérés', value: Q_f(days) + ' j' }
          ];
          // Cartes "X jours liberes : qu'en faites-vous ?" (3 cartes structurees pour page 7)
          // Memes formules que simReinvestContent (L.15038-15056)
          ctx.reinvestCards = {
            daysFreed: days,
            sessions: Math.round(hours / 1.5),
            revenue: Math.round(hours * (ctx.tjm || 70)),
            weekends: Math.round(hours / 16)
          };
          // Palier Standardisation equipe (affiche si contexte equipe OU profil directeurOF/qualite)
          // Source : 02-Offre/N2-OFR-04-Prix-garanties.md sec. 2.1
          var showTeamTier = (state.pourQui === 'equipe')
            || (cibles.indexOf('directeurOF') !== -1)
            || (cibles.indexOf('qualite') !== -1);
          if (showTeamTier) {
            var teamSize = (state.pourQui === 'equipe' && state.tailleEquipe) ? Math.max(2, Math.min(4, parseInt(state.tailleEquipe, 10) || 2)) : 3;
            ctx.teamTier = {
              licences: teamSize,
              pricePerLicence: 297,
              saving: 0,
              bsmIncluded: false,
              services: ['Onboarding d\u00e9di\u00e9 1h', 'Standardisation documentaire 1h', 'Hub centralis\u00e9 1h']
            };
          }
          // Sections annexes (text brut)
          ctx.reinvest = txtInnerBlocks('simReinvestContent');
          ctx.qualiopiAlert = txtInnerBlocks('simQualiopiAlert');
          ctx.teamNeeds = txtInnerBlocks('simTeamNeeds');
          ctx.roiSummary = txt('simRoiSummary');
          ctx.seasonNote = txt('simRoiSeasonNote');
          ctx.auditNoteText = txt('simRoiAuditNote');
          ctx.auditBoost = txtInnerBlocks('simAuditBoost');
          ctx.consequences = txtInnerBlocks('simConsequences');
          ctx.painResponse = txtInnerBlocks('simPainResponse');
          ctx.insight = txt('simInsight');
          ctx.advice = txtInnerBlocks('simAdvice');
          // Conformité RNQ V9
          var confEl = document.getElementById('simConformityContent');
          ctx.conformity = confEl && confEl.style.display !== 'none' ? txtInnerBlocks('simConformityContent') : '';
          // Disclaimer
          var discEl = document.querySelector('.sim-disclaimer');
          ctx.disclaimer = discEl ? (discEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
          // Balance (rows)
          ctx.balanceValue = txt('simBalanceValue');
          ctx.balanceCost = txt('simBalanceCostValue');
          ctx.balanceCostLabel = txt('simBalanceCostLabel');
          ctx.balanceNet = txt('simBalanceNet');
          // Eisenhower (label+text deja captures plus haut, on ajoute le quadrant label)
          var eisQuadEl = document.querySelector('#simEisenhower .sim-eis-quadrant');
          ctx.eisenhowerQuadrant = eisQuadEl ? eisQuadEl.textContent.trim() : '';
          // Douleurs selectionnees (labels lisibles pour PDF)
          ctx.painLabels = (state.pains || []).map(function(key) {
            var cfg = (typeof PAIN_CONFIG !== 'undefined') ? PAIN_CONFIG[key] : null;
            return cfg ? cfg.label : key;
          }).filter(Boolean);
          // Nombre de taches actives (non suggerees)
          var activeTaskNames = (ctx.tasks || []).filter(function(t) { return !t.suggested; }).map(function(t) { return t.name; });
          ctx.activeTaskCount = activeTaskNames.length;
          ctx.activeTaskSummary = activeTaskNames.length <= 5
            ? activeTaskNames.join(', ')
            : activeTaskNames.slice(0, 4).join(', ') + ' (+' + (activeTaskNames.length - 4) + ')';
          return ctx;
        }

        // Helper : collecte les taches actives avec leurs volumes + heures
        function collectTasksFromState() {
          // Parite site "Proposition augmentee" (cf. renderTimeComparisonHTML L.14347-14389)
          // Inclut : taches selectionnees (active=true) + taches profil non-selectionnees (suggested=true)
          // + taches transversales pertinentes aux categories actives.
          var result = [];
          var seen = {};
          var activeTasks = state.tasks || [];

          // 1. Construire la liste augmentee : profils × (core+frequent) + transversales des cats actives
          var cibles = (state.cibles && state.cibles.length > 0) ? state.cibles : [state.cible || 'formateur'];
          var augmentedKeys = [];
          // A : taches deja selectionnees
          activeTasks.forEach(function(k) {
            if (augmentedKeys.indexOf(k) === -1) augmentedKeys.push(k);
          });
          // B : taches profil (core+frequent) non encore presentes
          cibles.forEach(function(c) {
            var p = (typeof PROFILE_DEFAULTS !== 'undefined' && PROFILE_DEFAULTS[c]) ? PROFILE_DEFAULTS[c] : null;
            if (!p) return;
            (p.core || []).concat(p.frequent || []).forEach(function(k) {
              if (augmentedKeys.indexOf(k) === -1) augmentedKeys.push(k);
            });
          });
          // C : taches transversales des categories actives (audit, veille, controle, evaluations)
          try {
            if (typeof getActiveCats === 'function' && typeof TASK_TO_CAT !== 'undefined' && typeof TASK_CONFIG !== 'undefined') {
              var activeCats = getActiveCats(cibles);
              Object.keys(TASK_CONFIG).forEach(function(k) {
                if (augmentedKeys.indexOf(k) !== -1) return;
                var taskCats = TASK_TO_CAT[k] || [1];
                var relevant = taskCats.some(function(c) { return activeCats.indexOf(c) !== -1; });
                if (relevant) augmentedKeys.push(k);
              });
            }
          } catch(e) { /* fallback : on garde la liste A+B */ }

          // 2. Produire les lignes avec calcul heures (meme formule que site)
          augmentedKeys.forEach(function(key) {
            var cfg = (typeof TASK_CONFIG !== 'undefined') ? TASK_CONFIG[key] : null;
            if (!cfg) return;
            var volume = (state.taskVolumes && state.taskVolumes[key] !== undefined) ? state.taskVolumes[key] : (cfg.defaultVolume || programs);
            var marketH = (state.taskMarketHours && state.taskMarketHours[key] !== undefined) ? state.taskMarketHours[key] : (cfg.marketHours || 0);
            var qaliaH = cfg.qaliaHours || 0;
            var effMarket = cfg.frequency === 'per_program' ? marketH * volume : marketH;
            var effQalia = cfg.frequency === 'per_program' ? qaliaH * volume : qaliaH;
            var gain = Math.max(0, effMarket - effQalia);
            result.push({
              name: cfg.label || key,
              volume: volume,
              marketH: effMarket,
              qaliaH: effQalia,
              gainH: gain,
              level: cfg.level || 'advanced',
              suggested: activeTasks.indexOf(key) === -1
            });
          });
          // 3. Tri : actives d'abord (core, frequent, advanced), puis suggerees
          var levelOrder = { core: 0, frequent: 1, advanced: 2 };
          result.sort(function(a, b) {
            if (a.suggested !== b.suggested) return a.suggested ? 1 : -1;
            return (levelOrder[a.level] || 9) - (levelOrder[b.level] || 9);
          });
          return result;
        }

        // Helper : collecte les livrables d'activation par categorie
        function collectActivationItems() {
          var result = [];
          var wrap = document.getElementById('simActivationContent');
          if (!wrap) return result;
          // Parse from DOM
          var sections = wrap.querySelectorAll('p[style*="uppercase"], p.sim-act-title');
          if (sections.length > 0) {
            // Structure multi-categorie
            var children = Array.from(wrap.children);
            var currentGroup = null;
            children.forEach(function(el) {
              if (el.tagName === 'P' && el.style.textTransform === 'uppercase') {
                if (currentGroup) result.push(currentGroup);
                currentGroup = { titre: el.textContent.trim(), items: [] };
              } else if (currentGroup && el.querySelectorAll) {
                el.querySelectorAll('.output-pill, .sim-act-pill').forEach(function(p) {
                  currentGroup.items.push(p.textContent.trim());
                });
              }
            });
            if (currentGroup) result.push(currentGroup);
          } else {
            // Structure mono-categorie
            var pills = wrap.querySelectorAll('.output-pill, .sim-act-pill');
            if (pills.length > 0) {
              var group = { titre: 'Vos livrables Qalia', items: [] };
              pills.forEach(function(p) { group.items.push(p.textContent.trim()); });
              result.push(group);
            }
          }
          return result;
        }

        // Helper local formatter
        function Q_f(n, dec) { return window.QaliaPDF ? window.QaliaPDF.fmtNum(n, dec) : String(n); }

        // === SHARE MODAL (advanced) ===
        var shareModalOverlay = document.getElementById('simShareModalOverlay');
        var customizeLink = document.getElementById('simShareCustomize');
        var selectedRecipient = 'formateur';
        if (customizeLink && shareModalOverlay) {
          customizeLink.onclick = function(e) {
            e.preventDefault();
            shareModalOverlay.classList.add('active');
          };
          var closeBtn = document.getElementById('simShareModalClose');
          if (closeBtn) {
            closeBtn.onclick = function() { shareModalOverlay.classList.remove('active'); };
          }
          shareModalOverlay.addEventListener('click', function(e) {
            if (e.target === shareModalOverlay) shareModalOverlay.classList.remove('active');
          });
        }

        // Recipient chips
        var chipContainer = document.getElementById('simShareRecipientChips');
        if (chipContainer) {
          var chips = chipContainer.querySelectorAll('.sim-share-recipient-chip');
          chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
              chips.forEach(function(c) { c.classList.remove('selected'); });
              chip.classList.add('selected');
              selectedRecipient = chip.getAttribute('data-value');
            });
          });
        }

        // Helper: adapt conclusion for recipient
        function getRecipientConclusion(recipient) {
          var rc = PROFILE_COPY[recipient] || PROFILE_COPY.formateur;
          return rc.shareConclusion(dd);
        }

        // Personalized hooks, pain points and value propositions per recipient
        var RECIPIENT_PERSUASION = {
          formateur: {
            hook: 'En tant que formateur ind\u00e9pendant, tu sais combien l\u2019administratif p\u00e8se.',
            hookPro: 'En tant que formateur ind\u00e9pendant, vous connaissez le poids de l\u2019ing\u00e9nierie p\u00e9dagogique et de la conformit\u00e9.',
            pain: 'Plus de week-ends sacrifi\u00e9s sur la paperasse Qualiopi.',
            value: fmtNum(hours) + fH(' lib\u00e9r\u00e9es pour animer, prospecter ou simplement vivre'),
            accent: 'temps lib\u00e9r\u00e9, s\u00e9r\u00e9nit\u00e9, week-ends r\u00e9cup\u00e9r\u00e9s'
          },
          coach: {
            hook: 'Multi-casquettes comme toi, j\u2019ai trouv\u00e9 un moyen de structurer mes programmes sans y passer des heures.',
            hookPro: 'En tant que coach, concilier accompagnement et conformit\u00e9 Qualiopi demande un outil adapt\u00e9.',
            pain: 'Chaque heure sur la paperasse est une session coaching en moins.',
            value: fmtNum(hours) + fH(' lib\u00e9r\u00e9es pour vos clients, structuration p\u00e9dagogique int\u00e9gr\u00e9e'),
            accent: 'structuration p\u00e9dagogique + coaching'
          },
          directeurOF: {
            hook: 'En tant que directeur d\u2019OF, la scalabilit\u00e9 et la gouvernance qualit\u00e9 sont vos enjeux.',
            hookPro: 'Pour piloter un organisme de formation, standardiser la qualit\u00e9 documentaire \u00e0 l\u2019\u00e9chelle est un d\u00e9fi strat\u00e9gique.',
            pain: 'Une NC majeure co\u00fbte la certification, l\u2019activit\u00e9, la cr\u00e9dibilit\u00e9.',
            value: 'Co\u00fbt/programme : ' + fmtNum(dd.costPerProg) + ' <span class="u">\u20ac</span>. Payback ' + (dd.paybackLabel || 'Mois\u00a0' + dd.paybackMonth) + '. Standardisation \u00e9quipe',
            accent: 'ROI, scalabilit\u00e9 et gouvernance'
          },
          qualite: {
            hook: 'Pour un responsable qualit\u00e9, la tra\u00e7abilit\u00e9 et la conformit\u00e9 documentaire, c\u2019est le quotidien.',
            hookPro: 'En tant que responsable qualit\u00e9, vous \u00eates garant de la conformit\u00e9 des indicateurs RNQ V9.',
            pain: '20 \u00e0 29 indicateurs applicables \u00e0 contr\u00f4ler documentairement + 2 \u00e0 3 indicateurs terrain = risque d\u2019erreur syst\u00e9mique.',
            value: 'Indicateurs applicables structur\u00e9s et v\u00e9rifi\u00e9s avec vous, tra\u00e7abilit\u00e9 compl\u00e8te, pr\u00e9paration \u00e0 l\u2019audit int\u00e9gr\u00e9e',
            accent: 'conformit\u00e9 indicateurs applicables, tra\u00e7abilit\u00e9 documentaire'
          },
          ingenieurPeda: {
            hook: 'En tant qu\u2019ing\u00e9nieur p\u00e9dagogique, l\u2019alignement constructif et la conformit\u00e9 sont tes sujets.',
            hookPro: 'Pour un ing\u00e9nieur p\u00e9dagogique, la qualit\u00e9 de conception et la conformit\u00e9 ne devraient pas \u00eatre antagonistes.',
            pain: 'L\u2019alignement constructif v\u00e9rifi\u00e9 manuellement prend un temps consid\u00e9rable.',
            value: 'Conception acc\u00e9l\u00e9r\u00e9e + couverture RNQ V9 structur\u00e9e. ' + fmtNum(hours) + fH(' pour innover'),
            accent: 'productivit\u00e9 conception, qualit\u00e9 ing\u00e9nierie'
          },
          enseignant: {
            hook: 'Passer de l\u2019enseignement \u00e0 la formation pro, c\u2019est un vrai parcours de conformit\u00e9.',
            hookPro: 'La transition vers la formation professionnelle requiert une ma\u00eetrise de Qualiopi qui n\u2019est pas dans les cursus acad\u00e9miques.',
            pain: 'Sans guide, naviguer les indicateurs Qualiopi est un mur.',
            value: 'Transition simplifi\u00e9e : programmes aux normes Qualiopi sans devenir expert conformit\u00e9',
            accent: 'transition vers la formation professionnelle'
          },
          auditeur: {
            hook: 'Pour pr\u00e9parer un audit, la v\u00e9rification structur\u00e9e des indicateurs RNQ change la donne.',
            hookPro: 'En tant qu\u2019auditeur, vous appr\u00e9cierez la v\u00e9rification syst\u00e9matique des indicateurs applicables structurés documentairement par Qalia.',
            pain: 'Le contr\u00f4le manuel de la conformit\u00e9 est chronophage et source d\u2019oublis.',
            value: 'Indicateurs applicables contr\u00f4l\u00e9s en continu, tra\u00e7abilit\u00e9 compl\u00e8te',
            accent: 'v\u00e9rification int\u00e9gr\u00e9e, pr\u00e9-audit'
          },
          certificateur: {
            hook: 'La couverture RNQ V9 est structur\u00e9e d\u00e8s la g\u00e9n\u00e9ration.',
            hookPro: 'En mati\u00e8re de certification, la couverture documentaire structur\u00e9e \u00e0 chaque g\u00e9n\u00e9ration est un atout d\u00e9cisif.',
            pain: 'Les NC sont souvent documentaires : un outil qui les pr\u00e9vient \u00e0 la source.',
            value: 'Indicateurs RNQ V9 applicables int\u00e9gr\u00e9s documentairement dans chaque g\u00e9n\u00e9ration',
            accent: 'couverture structur\u00e9e RNQ V9'
          }
        };

        // Helper: get checked include options
        function getShareIncludes() {
          return {
            kpis: document.getElementById('simShareIncKpis') && document.getElementById('simShareIncKpis').checked,
            swot: document.getElementById('simShareIncSwot') && document.getElementById('simShareIncSwot').checked,
            decision: document.getElementById('simShareIncDecision') && document.getElementById('simShareIncDecision').checked,
            bilan: document.getElementById('simShareIncBilan') && document.getElementById('simShareIncBilan').checked
          };
        }

        // Helper: build message sections based on checkboxes
        function buildKpisSection() {
          return '\u2022 ' + fmtNum(hours) + ' h lib\u00e9r\u00e9es (' + fmtNum(days) + ' jours)\n'
            + '\u2022 Valeur r\u00e9cup\u00e9r\u00e9e : ' + fmtNum(value) + ' \u20ac\n'
            + '\u2022 ROI \u00d7' + fmtNum(roi, 1) + ' | Payback ' + (dd.paybackLabel || 'Mois\u00a0' + dd.paybackMonth) + '\n'
            + '\u2022 Investissement : ' + fmtNum(cost) + ' \u20ac/an';
        }
        function buildDecisionSection() {
          return '\u2022 Indicateur de priorit\u00e9 :' + eisTag + '\n'
            + '\u2022 Co\u00fbt inaction 3 ans : ' + cost3y + ' \u20ac';
        }
        function buildBilanSection() {
          return '\u2022 R\u00e9sultat net : ' + sign + fmtNum(net) + ' \u20ac\n'
            + '\u2022 Votre situation : ' + fmtNum(dd.totalOldHours) + ' h/an = ' + costManuel + ' \u20ac de co\u00fbt r\u00e9el';
        }

        // Modal WhatsApp short (personalized per recipient)
        var modalWaShort = document.getElementById('simShareModalWhatsappShort');
        if (modalWaShort) {
          modalWaShort.onclick = function() {
            var rp = RECIPIENT_PERSUASION[selectedRecipient] || RECIPIENT_PERSUASION.formateur;
            var inc = getShareIncludes();
            var msg = 'Salut !\n\n' + rp.hook + '\n\n'
              + 'Ma simulation :\n'
              + '\u2022 ' + fmtNum(hours) + fH(' lib\u00e9r\u00e9es/an\n')
              + '\u2022 ROI x' + fmtNum(roi, 1) + '\n';
            if (rp.pain) msg += '\n\u2192 ' + rp.pain + '\n';
            msg += '\n\u2192 ' + stripU(rp.value) + '\n\n'
              + 'Simule ton ROI :\nhttps://www.qalia.ai\n\n'
              + 'D\u00e9mo offerte 30 min :\nhttps://rdv.qalia.ai'
              + coordonnees;
            window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
          };
        }
        // Modal WhatsApp pro (personalized per recipient + checkboxes)
        var modalWaPro = document.getElementById('simShareModalWhatsappPro');
        if (modalWaPro) {
          modalWaPro.onclick = function() {
            var rp = RECIPIENT_PERSUASION[selectedRecipient] || RECIPIENT_PERSUASION.formateur;
            var rConc = getRecipientConclusion(selectedRecipient);
            var inc = getShareIncludes();
            var msg = 'Bonjour,\n\n' + rp.hookPro + '\n\n'
              + '*R\u00e9sultats sur 1 an* (' + fmtNum(programs) + ' programmes) :\n\n';
            if (inc.kpis) msg += '_KPIs annuels :_\n' + buildKpisSection() + '\n\n';
            msg += '_Point cl\u00e9_ (' + rp.accent + ') :\n' + stripU(rp.value) + '\n\n';
            if (inc.decision) msg += '_Analyse d\u00e9cisionnelle :_\n' + buildDecisionSection() + '\n\n';
            if (inc.bilan) msg += '_Bilan financier :_\n' + buildBilanSection() + '\n\n';
            msg += stripU(rConc) + '\n\n'
              + 'Simulez votre ROI :\nhttps://www.qalia.ai\n\n'
              + 'D\u00e9mo offerte 30 min :\nhttps://rdv.qalia.ai'
              + coordonnees;
            window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
          };
        }
        // Modal Email - personalized per recipient + checkboxes + copy
        var modalEmail = document.getElementById('simShareModalEmail');
        if (modalEmail) {
          modalEmail.onclick = function() {
            var rp = RECIPIENT_PERSUASION[selectedRecipient] || RECIPIENT_PERSUASION.formateur;
            var rConc = getRecipientConclusion(selectedRecipient);
            var inc = getShareIncludes();
            var adaptedDd = Object.assign({}, dd, { cible: selectedRecipient });
            var htmlContent = generateEmailHTML(hours, value, net, programs, roi, cost, days, eisTag, adaptedDd);
            // Build personalized plain text email
            var body = 'Bonjour,\n\n' + rp.hookPro + '\n\n'
              + 'Voici mon bilan personnalis\u00e9 sur 1 an (' + fmtNum(programs) + ' programmes) :\n\n';
            if (inc.kpis) {
              body += '\u2500\u2500\u2500 KPIs annuels \u2500\u2500\u2500\n' + buildKpisSection() + '\n\n';
            }
            body += '\u2500\u2500\u2500 Point cl\u00e9 (' + rp.accent + ') \u2500\u2500\u2500\n' + stripU(rp.value) + '\n\n';
            if (inc.decision) {
              body += '\u2500\u2500\u2500 Analyse d\u00e9cisionnelle \u2500\u2500\u2500\n' + buildDecisionSection() + '\n\n';
            }
            if (inc.bilan) {
              body += '\u2500\u2500\u2500 Bilan financier \u2500\u2500\u2500\n' + buildBilanSection() + '\n\n';
            }
            if (inc.swot) {
              var swotData = (PROFILE_COPY[selectedRecipient] || PROFILE_COPY.formateur).swot(dd);
              body += '\u2500\u2500\u2500 Analyse SWOT \u2500\u2500\u2500\n'
                + 'Forces : ' + swotData.forces.join(', ') + '\n'
                + 'Faiblesses : ' + swotData.faiblesses.join(', ') + '\n'
                + 'Opportunit\u00e9s : ' + swotData.opportunites.join(', ') + '\n'
                + 'Menaces : ' + swotData.menaces.join(', ') + '\n\n';
            }
            body += '\u2500\u2500\u2500 Conclusion \u2500\u2500\u2500\n' + stripU(rConc) + '\n\n'
              + 'Simulez votre propre ROI : https://www.qalia.ai\n'
              + 'D\u00e9mo offerte (30 min) : https://rdv.qalia.ai\n'
              + coordonneesFull + '\n\nBien cordialement';
            var subj = 'Simulation Qalia : ' + (net > 0 ? 'ROI \u00d7' + fmtNum(roi, 1) + ' sur ' + fmtNum(programs) + ' programmes' : 'Bilan ' + fmtNum(programs) + ' programmes');
            var copyToggle = document.getElementById('simShareCopy');
            var bcc = (copyToggle && copyToggle.checked) ? '&bcc=commercial@qalia.ai' : '';
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
              var blob = new Blob([htmlContent], { type: 'text/html' });
              navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(function() {
                modalEmail.textContent = 'Copi\u00e9 !';
                setTimeout(function() {
                  modalEmail.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Email';
                }, 2000);
                window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + bcc;
              }).catch(function() {
                window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + bcc;
              });
            } else {
              window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + bcc;
            }
          };
        }
      }

      // === RESTART ===
      var restartBtn = document.getElementById('simRestart');
      if (restartBtn) restartBtn.addEventListener('click', function() {
        try {
          // 0. Sauvegarder les cibles AVANT reset (source de vérité = sim, pas profile cards)
          var savedCibles = state.cibles.slice();
          var savedBreakdown = {};
          savedCibles.forEach(function(c) { savedBreakdown[c] = state.teamBreakdown[c] || 1; });
          // 1. Reset state object
          state = {
            step: 1, programs: 3, cible: '', cibles: [],
            pourQui: 'self', tailleEquipe: 1, teamBreakdown: {},
            qualiopi: '', echeanceMois: 12,
            totalHoursPerProgram: 28, tasks: [], taskVolumes: {},
            taskMarketHours: {},
            tjm: 70, pains: [], billingAnnual: false
          };
          // 1b. Sync API reference so BRANCHE init writes to the new state
          if (window.__simAPI) window.__simAPI.state = state;
          // 2. Reset all choice buttons (safe iteration on NodeLists)
          if (choicesCible) choicesCible.forEach(function(b) { b.classList.remove('selected'); });
          document.querySelectorAll('#simChoicesQualiopi .sim-choice').forEach(function(b) { b.classList.remove('selected'); });
          document.querySelectorAll('#simChoicesPourQui .sim-choice').forEach(function(b) { b.classList.remove('selected'); });
          document.querySelectorAll('#simPainGrid .sim-pain-btn').forEach(function(b) { b.classList.remove('selected'); });
          // 3. Reset disabled buttons (null-safe)
          if (next2) next2.disabled = true;
          var n4 = document.getElementById('simNext4'); if (n4) n4.disabled = true;
          if (next8) next8.disabled = true;
          var n1 = document.getElementById('simNext1'); if (n1) n1.disabled = true;
          // 4. Reset sliders (null-safe)
          if (tjmSlider) { tjmSlider.value = 70; }
          if (tjmDisplay) { tjmDisplay.innerHTML = '70&nbsp;<span class="u" style="vertical-align:super;">&euro;</span><span class="u">/h</span>'; }
          var echSlider = document.getElementById('simEcheance');
          if (echSlider) { echSlider.value = 12; }
          var echDisplay = document.getElementById('simEcheanceDisplay');
          if (echDisplay) { echDisplay.innerHTML = '12 <span class="u">mois</span>'; }
          // 5. Reset billing switch + sim-box annual class
          if (billingSwitch) {
            billingSwitch.classList.remove('annual');
            if (billingMonthlyLabel) billingMonthlyLabel.classList.add('active');
            if (billingAnnualLabel) billingAnnualLabel.classList.remove('active');
          }
          var simBoxReset = document.getElementById('simBox');
          if (simBoxReset) simBoxReset.classList.remove('annual');
          // 6. Reset ETP section
          var etpSection = document.getElementById('simEtpSection');
          if (etpSection) etpSection.style.display = 'none';
          var etpInputs = document.getElementById('simEtpInputs');
          if (etpInputs) etpInputs.innerHTML = '';
          // 7. Hide share modal & share section
          var shareModalOverlay2 = document.getElementById('simShareModalOverlay');
          if (shareModalOverlay2) shareModalOverlay2.style.display = 'none';
          var shareSection = document.getElementById('simShare');
          if (shareSection) shareSection.style.display = 'none';
          // 8. Reset sim-box classes
          var simBox = document.getElementById('simBox');
          if (simBox) {
            simBox.classList.remove('sim-box-dashboard', 'sim-box-wide');
            simBox.classList.add('sim-box-wide');
          }
          // 9. Reset first-render flag for proper scroll behavior
          _simFirstRender = true;
          // 10. Re-initialize slider colors
          initSliderColors();
          // 11. Restaurer les cibles sauvegardées (sim = source de vérité)
          state.cibles = savedCibles;
          state.teamBreakdown = savedBreakdown;
          state.cible = savedCibles.length > 0 ? savedCibles[0] : '';
          // 11b. Restaurer visuellement les boutons sim
          if (choicesCible && savedCibles.length > 0) {
            choicesCible.forEach(function(b) {
              if (savedCibles.indexOf(b.getAttribute('data-value')) > -1) {
                b.classList.add('selected');
              }
            });
            next2.disabled = false;
            buildEtpSection();
          }
          // 11c. Synchroniser les profile cards depuis le sim (direction sim → profils)
          syncSimToProfiles();
          // 12. Restart : step 1 (choix profil)
          showStep(1);
          // 13. Instant scroll to stepper (leaving dashboard = layout collapse, smooth would glitch)
          var simStepper = document.getElementById('simProgress');
          if (simStepper) simStepper.scrollIntoView({ behavior: 'instant', block: 'start' });
        } catch (e) {
          // Fallback: force step 1 display even if reset partially fails
          console.error('Restart error:', e);
          showStep(1);
        }
      });

      // Expose API for page-specific pre-configuration (BRANCHE 01-01, etc.)
      window.__simAPI = { state: state, buildTaskStep: buildTaskStep, showStep: showStep, PROFILE_DEFAULTS: PROFILE_DEFAULTS, PROFILE_VOLUMES: PROFILE_VOLUMES, TASK_CONFIG: TASK_CONFIG, SCENARIO_DESCS: SCENARIO_DESCS, REINVEST_LABELS: REINVEST_LABELS };
      // Init slider colors on load
      initSliderColors();
    })();

    // ---- Testimonials carousels (generalized: animate if >3, center if <=3) ----
    // Gere tous les carrousels temoignages. Reinitialise au switch de tab.
    (function() {
      var T_AUTO_SPEED = 1.2;
      var T_CRUISE = 6;
      var T_ACCEL = 0.12;
      var T_FRICTION = 0.94;
      var gap = 24;
      var activeAnims = [];

      function initTestimonialCarousel(panel) {
        var carousel = panel.querySelector('.testimonials-carousel');
        var track = carousel ? carousel.querySelector('.testimonials-track') : null;
        if (!carousel || !track) return null;

        var origCards = Array.from(track.querySelectorAll('.testimonial-card:not([data-clone])'));

        // <= 3 cards: center, no animation
        if (origCards.length <= 3) {
          track.classList.add('testimonials-centered');
          carousel.classList.add('no-scroll');
          return null;
        }

        // > 3 cards: animate with physics
        track.classList.remove('testimonials-centered');
        carousel.classList.remove('no-scroll');

        // Shuffle
        for (var i = origCards.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          track.appendChild(origCards[j]);
          origCards.splice(j, 1, origCards[i]);
        }
        origCards = Array.from(track.querySelectorAll('.testimonial-card:not([data-clone])'));

        // Clone x3 for seamless infinite scroll
        origCards.forEach(function(card) {
          var c = card.cloneNode(true); c.setAttribute('data-clone', 'after'); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
        });
        origCards.forEach(function(card) {
          var c = card.cloneNode(true); c.setAttribute('data-clone', 'before'); c.setAttribute('aria-hidden', 'true'); track.insertBefore(c, track.firstChild);
        });

        var setW = 0;
        origCards.forEach(function(card) { setW += card.offsetWidth + gap; });
        var posX = -setW;
        track.style.transform = 'translateX(' + posX + 'px)';

        var velocity = -T_AUTO_SPEED;
        var autoDir = -1;
        var isHovering = false;
        var lastMouseX = 0;
        var mouseVx = 0;
        var mouseActive = false;
        var stopTimer = null;
        var rafId = null;

        function animate() {
          if (mouseActive && isHovering) {
            var dir = mouseVx > 0 ? 1 : -1;
            var targetV = dir * Math.min(Math.abs(mouseVx) * 1.8, T_CRUISE);
            velocity += (targetV - velocity) * T_ACCEL * 2.5;
          } else if (isHovering && !mouseActive) {
            velocity *= T_FRICTION;
            if (Math.abs(velocity) < 0.05) velocity = 0;
          } else {
            var target = autoDir * T_AUTO_SPEED;
            velocity += (target - velocity) * T_ACCEL;
          }
          posX += velocity;
          if (posX <= -(setW * 2)) posX += setW;
          else if (posX >= 0) posX -= setW;
          track.style.transform = 'translateX(' + posX + 'px)';
          rafId = requestAnimationFrame(animate);
        }
        rafId = requestAnimationFrame(animate);

        carousel.addEventListener('mouseenter', function(e) {
          isHovering = true; mouseActive = false;
          lastMouseX = e.clientX; mouseVx = 0;
        });
        carousel.addEventListener('mousemove', function(e) {
          if (!isHovering) return;
          var dx = e.clientX - lastMouseX;
          lastMouseX = e.clientX;
          mouseVx = mouseVx * 0.5 + dx * 0.5;
          if (Math.abs(dx) > 0.5) {
            mouseActive = true;
            if (Math.abs(mouseVx) > 1) autoDir = mouseVx > 0 ? 1 : -1;
            clearTimeout(stopTimer);
            stopTimer = setTimeout(function() { mouseActive = false; }, 200);
          }
        });
        carousel.addEventListener('mouseleave', function() {
          isHovering = false; mouseActive = false; clearTimeout(stopTimer);
        });

        var touchLastX = 0;
        carousel.addEventListener('touchstart', function(e) {
          isHovering = true; mouseActive = false;
          touchLastX = e.touches[0].clientX; velocity = 0;
        }, { passive: true });
        carousel.addEventListener('touchmove', function(e) {
          var tx = e.touches[0].clientX;
          var dx = tx - touchLastX; touchLastX = tx;
          mouseVx = dx * 0.8; mouseActive = true;
          if (Math.abs(mouseVx) > 1) autoDir = mouseVx > 0 ? 1 : -1;
          clearTimeout(stopTimer);
          stopTimer = setTimeout(function() { mouseActive = false; }, 200);
        }, { passive: true });
        carousel.addEventListener('touchend', function() {
          isHovering = false; mouseActive = false;
        }, { passive: true });

        return { destroy: function() { cancelAnimationFrame(rafId); clearTimeout(stopTimer); } };
      }

      function initAllTestimonialCarousels() {
        // Destroy previous animations
        activeAnims.forEach(function(a) { if (a && a.destroy) a.destroy(); });
        activeAnims = [];

        // Clean all clones and reset
        var section = document.getElementById('temoignages');
        if (!section) return;
        var allTracks = section.querySelectorAll('.testimonials-track');
        for (var t = 0; t < allTracks.length; t++) {
          var clones = allTracks[t].querySelectorAll('[data-clone]');
          for (var c = 0; c < clones.length; c++) clones[c].remove();
          allTracks[t].style.transform = '';
          allTracks[t].classList.remove('testimonials-centered');
        }
        var allCarousels = section.querySelectorAll('.testimonials-carousel');
        for (var ca = 0; ca < allCarousels.length; ca++) {
          allCarousels[ca].classList.remove('no-scroll');
        }

        // Init visible panels only
        var panels = section.querySelectorAll('.cat-panel');
        for (var p = 0; p < panels.length; p++) {
          if (panels[p].style.display === 'none') continue;
          var anim = initTestimonialCarousel(panels[p]);
          if (anim) activeAnims.push(anim);
        }
      }

      setTimeout(initAllTestimonialCarousels, 100);
      window.__reinitTestimonialCarousels = initAllTestimonialCarousels;
    })();

    // ---- Document carousels (momentum physics, same model as testimonials) ----
    // Gere plusieurs carrousels (1 par cat-panel visible). Reinitialise au switch de tab.
    (function() {
      var DOC_AUTO_SPEED = 0.8;
      var DOC_CRUISE = 5;
      var DOC_ACCEL = 0.10;
      var DOC_FRICTION = 0.93;
      var gap = 24;
      var activeAnimations = [];

      function initDocCarousel(wrap) {
        var carousel = wrap.querySelector('.doc-carousel');
        var track = wrap.querySelector('.doc-carousel-track');
        if (!carousel || !track) return null;

        // Ne pas animer si le track est centre (peu d'items)
        if (track.classList.contains('centered')) return null;

        // Cloner les cards pour boucle infinie (x3)
        var origCards = Array.from(track.querySelectorAll('.doc-card:not([data-clone])'));
        if (origCards.length < 2) return null;

        // Nettoyer les clones precedents
        var existingClones = track.querySelectorAll('[data-clone]');
        for (var c = 0; c < existingClones.length; c++) existingClones[c].remove();

        var setW = 0;
        origCards.forEach(function(card) { setW += card.offsetWidth + gap; });

        // Cloner en avant et en arriere
        origCards.forEach(function(card) {
          var cl = card.cloneNode(true);
          cl.setAttribute('data-clone', 'after');
          cl.setAttribute('aria-hidden', 'true');
          track.appendChild(cl);
        });
        origCards.forEach(function(card) {
          var cl = card.cloneNode(true);
          cl.setAttribute('data-clone', 'before');
          cl.setAttribute('aria-hidden', 'true');
          track.insertBefore(cl, track.firstChild);
        });

        var posX = -setW;
        track.style.transform = 'translateX(' + posX + 'px)';

        var velocity = -DOC_AUTO_SPEED;
        var autoDir = -1;
        var isHovering = false;
        var lastMouseX = 0;
        var mouseVx = 0;
        var mouseActive = false;
        var stopTimer = null;
        var rafId = null;

        function animate() {
          if (mouseActive && isHovering) {
            var dir = mouseVx > 0 ? 1 : -1;
            var targetV = dir * Math.min(Math.abs(mouseVx) * 1.8, DOC_CRUISE);
            velocity += (targetV - velocity) * DOC_ACCEL * 2.5;
          } else if (isHovering && !mouseActive) {
            velocity *= DOC_FRICTION;
            if (Math.abs(velocity) < 0.05) velocity = 0;
          } else {
            var target = autoDir * DOC_AUTO_SPEED;
            velocity += (target - velocity) * DOC_ACCEL;
          }
          posX += velocity;
          if (posX <= -(setW * 2)) posX += setW;
          else if (posX >= 0) posX -= setW;
          track.style.transform = 'translateX(' + posX + 'px)';
          rafId = requestAnimationFrame(animate);
        }
        rafId = requestAnimationFrame(animate);

        carousel.addEventListener('mouseenter', function(e) {
          isHovering = true; mouseActive = false;
          lastMouseX = e.clientX; mouseVx = 0;
        });
        carousel.addEventListener('mousemove', function(e) {
          if (!isHovering) return;
          var dx = e.clientX - lastMouseX;
          lastMouseX = e.clientX;
          mouseVx = mouseVx * 0.5 + dx * 0.5;
          if (Math.abs(dx) > 0.5) {
            mouseActive = true;
            if (Math.abs(mouseVx) > 1) autoDir = mouseVx > 0 ? 1 : -1;
            clearTimeout(stopTimer);
            stopTimer = setTimeout(function() { mouseActive = false; }, 200);
          }
        });
        carousel.addEventListener('mouseleave', function() {
          isHovering = false; mouseActive = false; clearTimeout(stopTimer);
        });

        var touchLastX = 0;
        carousel.addEventListener('touchstart', function(e) {
          isHovering = true; mouseActive = false;
          touchLastX = e.touches[0].clientX; velocity = 0;
        }, { passive: true });
        carousel.addEventListener('touchmove', function(e) {
          var tx = e.touches[0].clientX;
          var dx = tx - touchLastX; touchLastX = tx;
          mouseVx = dx * 0.8; mouseActive = true;
          if (Math.abs(mouseVx) > 1) autoDir = mouseVx > 0 ? 1 : -1;
          clearTimeout(stopTimer);
          stopTimer = setTimeout(function() { mouseActive = false; }, 200);
        }, { passive: true });
        carousel.addEventListener('touchend', function() {
          isHovering = false; mouseActive = false;
        }, { passive: true });

        return { destroy: function() { cancelAnimationFrame(rafId); clearTimeout(stopTimer); } };
      }

      function initAllVisibleDocCarousels() {
        // Detruire les animations precedentes
        activeAnimations.forEach(function(a) { if (a && a.destroy) a.destroy(); });
        activeAnimations = [];

        // Nettoyer les clones de TOUS les tracks (meme caches)
        var allTracks = document.querySelectorAll('.doc-carousel-track');
        for (var t = 0; t < allTracks.length; t++) {
          var clones = allTracks[t].querySelectorAll('[data-clone]');
          for (var c = 0; c < clones.length; c++) clones[c].remove();
          allTracks[t].style.transform = '';
        }

        // Initialiser les carrousels visibles
        var wraps = document.querySelectorAll('.doc-carousel-wrap');
        for (var w = 0; w < wraps.length; w++) {
          var panel = wraps[w].closest('.cat-panel');
          if (panel && panel.style.display === 'none') continue;
          var anim = initDocCarousel(wraps[w]);
          if (anim) activeAnimations.push(anim);
        }
      }

      // Initialisation + reinit au switch de tab
      setTimeout(initAllVisibleDocCarousels, 150);
      window.__reinitDocCarousels = initAllVisibleDocCarousels;
    })();

    // ---- Testimonial counter animation (increment by 3 up to 49) ----
    (function() {
      var countEl = document.getElementById('testimonialCount');
      if (!countEl) return;
      var target = 49;
      var animated = false;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            var current = 0;
            var step = 3;
            var interval = setInterval(function() {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              countEl.textContent = current;
            }, 60);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(countEl.closest('section') || countEl);
    })();

    // ---- Capabilities accordion toggle ----
    (function() {
      var btn = document.getElementById('capabilitiesToggle');
      var detail = document.getElementById('capabilitiesDetail');
      if (!btn || !detail) return;
      btn.addEventListener('click', function() {
        var isHidden = detail.style.display === 'none';
        if (isHidden) {
          detail.style.display = 'grid';
          btn.innerHTML = 'Masquer les capacit\u00e9s \u2191';
          btn.setAttribute('aria-expanded', 'true');
          btn.style.background = 'var(--bleu-canard)';
          btn.style.color = '#fff';
        } else {
          detail.style.display = 'none';
          btn.innerHTML = 'Ce que Qalia fait concr\u00e8tement (24 capacit\u00e9s) \u2192';
          btn.setAttribute('aria-expanded', 'false');
          btn.style.background = 'none';
          btn.style.color = 'var(--bleu-canard)';
        }
      });
    })();

    // ---- Capabilities toggle Cat. 2 ----
    (function() {
      var btn = document.getElementById('capabilitiesToggle2');
      var detail = document.getElementById('capabilitiesDetail2');
      if (!btn || !detail) return;
      btn.addEventListener('click', function() {
        var isHidden = detail.style.display === 'none';
        if (isHidden) {
          detail.style.display = 'grid';
          btn.innerHTML = 'Masquer les capacit\u00e9s \u2191';
          btn.setAttribute('aria-expanded', 'true');
          btn.style.background = 'var(--bleu-canard)';
          btn.style.color = '#fff';
        } else {
          detail.style.display = 'none';
          btn.innerHTML = 'Ce que Qalia fait concr\u00e8tement (16 capacit\u00e9s) \u2192';
          btn.setAttribute('aria-expanded', 'false');
          btn.style.background = 'none';
          btn.style.color = 'var(--bleu-canard)';
        }
      });
    })();

    // ---- Capabilities toggle Cat. 3 ----
    (function() {
      var btn = document.getElementById('capabilitiesToggle3');
      var detail = document.getElementById('capabilitiesDetail3');
      if (!btn || !detail) return;
      btn.addEventListener('click', function() {
        var isHidden = detail.style.display === 'none';
        if (isHidden) {
          detail.style.display = 'grid';
          btn.innerHTML = 'Masquer les capacit\u00e9s \u2191';
          btn.setAttribute('aria-expanded', 'true');
          btn.style.background = 'var(--bleu-canard)';
          btn.style.color = '#fff';
        } else {
          detail.style.display = 'none';
          btn.innerHTML = 'Ce que Qalia fait concr\u00e8tement (16 capacit\u00e9s) \u2192';
          btn.setAttribute('aria-expanded', 'false');
          btn.style.background = 'none';
          btn.style.color = 'var(--bleu-canard)';
        }
      });
    })();

    // ---- Capabilities toggle Cat. 4 ----
    (function() {
      var btn = document.getElementById('capabilitiesToggle4');
      var detail = document.getElementById('capabilitiesDetail4');
      if (!btn || !detail) return;
      btn.addEventListener('click', function() {
        var isHidden = detail.style.display === 'none';
        if (isHidden) {
          detail.style.display = 'grid';
          btn.innerHTML = 'Masquer les capacit\u00e9s \u2191';
          btn.setAttribute('aria-expanded', 'true');
          btn.style.background = 'var(--bleu-canard)';
          btn.style.color = '#fff';
        } else {
          detail.style.display = 'none';
          btn.innerHTML = 'Ce que Qalia fait concr\u00e8tement (16 capacit\u00e9s) \u2192';
          btn.setAttribute('aria-expanded', 'false');
          btn.style.background = 'none';
          btn.style.color = 'var(--bleu-canard)';
        }
      });
    })();

    // ---- Pipeline toggle Cat. 2 ----
    (function() {
      var pipelineBlock = document.getElementById('pipelineBlock2');
      var toggleSwitch = document.getElementById('pipelineToggleSwitch2');
      var labelOff = document.getElementById('pipelineToggleOff2');
      var labelOn = document.getElementById('pipelineToggleOn2');
      if (!pipelineBlock || !toggleSwitch) return;
      toggleSwitch.addEventListener('click', function() {
        var isOn = toggleSwitch.classList.toggle('on');
        toggleSwitch.setAttribute('aria-checked', isOn ? 'true' : 'false');
        pipelineBlock.classList.toggle('show-indicators', isOn);
        if (labelOff) labelOff.classList.toggle('active', !isOn);
        if (labelOn) labelOn.classList.toggle('active', isOn);
      });
      toggleSwitch.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.click(); }
      });
    })();

    // ---- Pipeline toggle Cat. 3 ----
    (function() {
      var pipelineBlock = document.getElementById('pipelineBlock3');
      var toggleSwitch = document.getElementById('pipelineToggleSwitch3');
      var labelOff = document.getElementById('pipelineToggleOff3');
      var labelOn = document.getElementById('pipelineToggleOn3');
      if (!pipelineBlock || !toggleSwitch) return;
      toggleSwitch.addEventListener('click', function() {
        var isOn = toggleSwitch.classList.toggle('on');
        toggleSwitch.setAttribute('aria-checked', isOn ? 'true' : 'false');
        pipelineBlock.classList.toggle('show-indicators', isOn);
        if (labelOff) labelOff.classList.toggle('active', !isOn);
        if (labelOn) labelOn.classList.toggle('active', isOn);
      });
      toggleSwitch.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.click(); }
      });
    })();

    // ---- Pipeline toggle Cat. 4 ----
    (function() {
      var pipelineBlock = document.getElementById('pipelineBlock4');
      var toggleSwitch = document.getElementById('pipelineToggleSwitch4');
      var labelOff = document.getElementById('pipelineToggleOff4');
      var labelOn = document.getElementById('pipelineToggleOn4');
      if (!pipelineBlock || !toggleSwitch) return;
      toggleSwitch.addEventListener('click', function() {
        var isOn = toggleSwitch.classList.toggle('on');
        toggleSwitch.setAttribute('aria-checked', isOn ? 'true' : 'false');
        pipelineBlock.classList.toggle('show-indicators', isOn);
        if (labelOff) labelOff.classList.toggle('active', !isOn);
        if (labelOn) labelOn.classList.toggle('active', isOn);
      });
      toggleSwitch.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.click(); }
      });
    })();


    // ---- Fix pipeline bar height : ajuste la barre ::before pour chaque pipeline visible ----
    (function() {
      function fixPipelineBars() {
        var isDesktop = window.matchMedia('(min-width: 768px)').matches;
        document.querySelectorAll('.pipeline-steps').forEach(function(ps) {
          // Ne traiter que les pipelines visibles (offsetParent !== null)
          if (!ps.offsetParent) return;
          var steps = ps.querySelectorAll('.pipeline-step');
          if (steps.length < 2) return;
          // Desktop : adapter le grid au nombre réel de steps
          if (isDesktop) {
            ps.style.gridTemplateColumns = 'repeat(' + steps.length + ', 1fr)';
          }
          var firstNum = steps[0].querySelector('.pipeline-num');
          var lastNum = steps[steps.length - 1].querySelector('.pipeline-num');
          if (!firstNum || !lastNum) return;
          var psRect = ps.getBoundingClientRect();
          if (psRect.height === 0 && psRect.width === 0) return;
          // Détecter orientation : horizontal (desktop grid) vs vertical (mobile)
          var isHorizontal = psRect.width > psRect.height;
          if (isHorizontal) {
            // Desktop : barre horizontale, calculer left/right
            var firstCenterX = firstNum.getBoundingClientRect().left + firstNum.offsetWidth / 2 - psRect.left;
            var lastCenterX = lastNum.getBoundingClientRect().left + lastNum.offsetWidth / 2 - psRect.left;
            ps.style.setProperty('--bar-left', firstCenterX + 'px');
            ps.style.setProperty('--bar-right', (ps.offsetWidth - lastCenterX) + 'px');
          } else {
            // Mobile : barre verticale, calculer top/bottom
            ps.style.gridTemplateColumns = '';
            var firstCenter = firstNum.getBoundingClientRect().top + firstNum.offsetHeight / 2 - psRect.top;
            var lastCenter = lastNum.getBoundingClientRect().top + lastNum.offsetHeight / 2 - psRect.top;
            ps.style.setProperty('--bar-top', firstCenter + 'px');
            ps.style.setProperty('--bar-bottom', (ps.offsetHeight - lastCenter) + 'px');
          }
        });
      }
      // Exécuter au chargement (Cat 1 visible)
      fixPipelineBars();
      // Réexécuter quand un onglet change (MutationObserver sur les panels)
      var panels = document.querySelectorAll('.cat-panel');
      var observer = new MutationObserver(function() {
        setTimeout(fixPipelineBars, 50);
      });
      panels.forEach(function(p) {
        observer.observe(p, { attributes: true, attributeFilter: ['style'] });
      });
      // Réexécuter aussi quand le toggle indicateurs est cliqué (change la hauteur)
      document.querySelectorAll('.indicator-switch').forEach(function(sw) {
        sw.addEventListener('click', function() { setTimeout(fixPipelineBars, 500); });
      });
      // Réexécuter au resize (passage mobile ↔ desktop)
      window.addEventListener('resize', function() { setTimeout(fixPipelineBars, 100); });
    })();

    // ---- Clone screenshot from Cat. 1 to Cat. 2-4 tuto sections ----
    (function() {
      var srcImg = document.querySelector('#pipelineBlock ~ .fade-in img[alt], .cat-panel[data-cat="1"] .fade-in img[src^="data:image"]');
      if (!srcImg) return;
      var clones = document.querySelectorAll('.qalia-screenshot-clone');
      clones.forEach(function(el) {
        var img = srcImg.cloneNode(true);
        el.appendChild(img);
      });
    })();

    // ---- Trust bar counter animation (increment on scroll) ----
    (function() {
      var trustBar = document.getElementById('trustBar');
      if (!trustBar) return;
      var counters = trustBar.querySelectorAll('[data-count-to]');
      var animated = false;

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            counters.forEach(function(el) {
              var target = parseInt(el.getAttribute('data-count-to'), 10);
              var suffix = el.getAttribute('data-count-suffix') || '';
              var prefix = el.getAttribute('data-count-prefix') || '';
              var duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1000;
              var startTime = null;
              function tick(ts) {
                if (!startTime) startTime = ts;
                var progress = Math.min((ts - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                var value = Math.round(eased * target);
                el.innerHTML = prefix + fmtNum(value) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
              }
              requestAnimationFrame(tick);
            });
          }
        });
      }, { threshold: 0.3 });
      observer.observe(trustBar);
    })();

    // ---- Pain spiral draw animation ----
    (function() {
      var svg = document.getElementById('painSpiralSvg');
      if (!svg) return;
      var animated = false;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            svg.classList.add('animated');
          }
        });
      }, { threshold: 0.3 });
      observer.observe(svg);
    })();

    // ---- ROI KPIs counter animation ----
    (function() {
      var roiSection = document.querySelector('.roi-kpis');
      if (!roiSection) return;
      var animated = false;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            // KPIs ROI peuplés dynamiquement par populatePersonalRoi()
            // Pas d'animation statique (évite l'écrasement des valeurs personnalisées)
          }
        });
      }, { threshold: 0.3 });
      observer.observe(roiSection);

      function animateKpi(el, target, prefix, suffix, duration) {
        var startTime = null;
        function tick(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(eased * target);
          el.innerHTML = prefix + fmtNum(value) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    })();

    // ---- Comparison bars fill animation ----
    (function() {
      var comparison = document.querySelector('.comparison');
      if (!comparison) return;
      var bars = comparison.querySelectorAll('.comparison-bar');
      var animated = false;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            bars.forEach(function(bar, i) {
              setTimeout(function() {
                bar.classList.add('bar-animated');
              }, i * 200);
            });
          }
        });
      }, { threshold: 0.2 });
      observer.observe(comparison);
    })();

    // Navigation mobile - Toggle menu hamburger
    (function() {
      var hamburger = document.querySelector('.nav-hamburger');
      var mobileMenu = document.querySelector('.nav-menu-mobile');
      var overlay = document.querySelector('.nav-overlay');
      var body = document.body;

      if (!hamburger || !mobileMenu || !overlay) return;

      function toggleMenu() {
        var isActive = mobileMenu.classList.contains('active');
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = isActive ? '' : 'hidden';
        hamburger.setAttribute('aria-expanded', !isActive);
      }

      function closeMenu() {
        if (mobileMenu.classList.contains('active')) {
          toggleMenu();
          hamburger.focus();
        }
      }

      hamburger.addEventListener('click', toggleMenu);
      overlay.addEventListener('click', closeMenu);

      // Fermeture par Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
          closeMenu();
        }
      });

      // Focus trap dans le menu mobile
      mobileMenu.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        var focusables = mobileMenu.querySelectorAll('a[href], button');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });

      mobileMenu.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', toggleMenu);
      });
    })();

    /* ============================================
       PAGE UNIQUE : PAS de pre-configuration
       L'utilisateur choisit son profil, son statut,
       ses taches. Toutes les etapes sont visibles.
       ============================================ */
    // Demarrage neutre : step 1 (choix du profil)
    if (window.__simAPI) {
      window.__simAPI.showStep(1);
    }

    /* ============================================
       V8 MECANISME 1 : PROFILE ROUTER
       Multi-selection, filtre page, pre-remplit simulateur.
       ============================================ */
    (function() {
      var grid = document.getElementById('profileRouterGrid');
      if (!grid) return;

      // Etat : profils selectionnes et categories actives
      var state = { profiles: [], cats: [] };

      // Mapping profil -> valeur simulateur (1-to-1, direction profil → sim)
      // Chaque carte hero pre-selectionne UN SEUL profil simulateur
      // pour eviter de gonfler artificiellement le nombre d'ETP (70%+ sont solos)
      var profileToSim = {
        formateur: ['formateur'],
        bilan: ['consultantBilan'],
        vae: ['accompagnateurVAE'],
        cfa: ['directeurCFA'],
        directeur: ['directeurOF'],
        qualite: ['qualite']
      };

      // Mapping inverse sim -> profil (many-to-one, direction sim → profil)
      var simToProfile = {
        formateur: 'formateur',
        coach: 'formateur',
        consultantBilan: 'bilan',
        accompagnateurVAE: 'vae',
        directeurCFA: 'cfa',
        maitreApprentissage: 'cfa',
        directeurOF: 'directeur',
        qualite: 'qualite',
        ingenieurPeda: 'qualite',
        enseignant: 'formateur'
      };

      // Helper : extrait la liste des categories (nettoyees) d'un element data-cat
      function parseCatAttr(el) {
        if (!el) return [];
        var raw = el.getAttribute('data-cat');
        if (!raw) return [];
        return raw.split(',').map(function(c){ return c.trim(); }).filter(Boolean);
      }

      // Helper : trouve le bouton (card ou pill) associe a un profil
      function findProfileBtn(profile) {
        return document.querySelector(
          '#profileRouterGrid .profile-card[data-profile="' + profile + '"],' +
          '#profileRouterSecondary .profile-pill[data-profile="' + profile + '"]'
        );
      }

      // Handler generique pour toggle profil (cards + pills)
      // ORDRE : la DERNIERE selection utilisateur pilote state.activeCat partout sur la page.
      function handleProfileToggle(btn) {
        // Ancrage scroll relatif au bouton clique (directive UX absolue : zero deplacement).
        var btnViewportTop = btn.getBoundingClientRect().top;

        var profile = btn.getAttribute('data-profile');
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        var btnCats = parseCatAttr(btn);

        if (pressed) {
          // DESELECTION
          btn.setAttribute('aria-pressed', 'false');
          state.profiles = state.profiles.filter(function(p) { return p !== profile; });

          // Si activeCat etait portee par ce profil, chercher si un profil restant la couvre
          if (state.activeCat && btnCats.indexOf(state.activeCat) !== -1) {
            var stillCovered = false;
            for (var i = 0; i < state.profiles.length; i++) {
              var remainingBtn = findProfileBtn(state.profiles[i]);
              var remainingCats = parseCatAttr(remainingBtn);
              if (remainingCats.indexOf(state.activeCat) !== -1) { stillCovered = true; break; }
            }
            if (!stillCovered && state.profiles.length > 0) {
              // Fallback : derniere selection restante (LIFO)
              var lastBtn = findProfileBtn(state.profiles[state.profiles.length - 1]);
              var lastCats = parseCatAttr(lastBtn);
              if (lastCats.length > 0) state.activeCat = lastCats[0];
            }
          }
        } else {
          // SELECTION : ce bouton devient le "dernier choisi" → pilote activeCat
          btn.setAttribute('aria-pressed', 'true');
          if (state.profiles.indexOf(profile) === -1) {
            state.profiles.push(profile);
          }
          if (btnCats.length === 1) {
            // Profil mono-categorie : sa cat devient LA cat active
            state.activeCat = btnCats[0];
          } else if (btnCats.length > 1) {
            // Profil transversal : garder activeCat si elle est dans ses cats, sinon prendre la 1re
            if (!state.activeCat || btnCats.indexOf(state.activeCat) === -1) {
              state.activeCat = btnCats[0];
            }
          }
        }
        try { sessionStorage.setItem('qalia_active_cat', state.activeCat || ''); } catch(e) {}

        // Afficher/masquer le sélecteur de catégorie pour profils transversaux
        showCatSelectorIfNeeded();

        updateCats();
        try { sessionStorage.setItem('qalia_profiles', JSON.stringify(state.profiles)); } catch(e) {}
        applyFilters();
        prefillSimulator();
        updateGatedVisibility();
        updateBookingLinks();

        // Correction scroll : ramener le bouton a sa position viewport initiale.
        // Correction immediate + correction differee apres reinit carousels (80ms)
        var delta = btn.getBoundingClientRect().top - btnViewportTop;
        if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
        setTimeout(function() {
          var delta2 = btn.getBoundingClientRect().top - btnViewportTop;
          if (Math.abs(delta2) > 1) window.scrollBy({ top: delta2, behavior: 'instant' });
        }, 80);
      }

      // === HYBRIDE A+B : SELECTEUR INTELLIGENT POUR PROFILS TRANSVERSAUX ===
      // Logique A : si des cartes sont deja cochees → heritage automatique (pas de cat-selector)
      // Logique B : si aucune carte → defaut 4 cats + bandeau "Modifier les categories"
      var TRANSVERSAL_PROFILES = ['directeur', 'qualite'];
      var catSelectorEl = document.getElementById('catSelector');
      var catBannerEl = document.getElementById('catDefaultBanner');
      var catBannerLink = document.getElementById('catDefaultBannerLink');

      // Retourne les categories des cartes (non-transversaux) actuellement actives
      function getActiveCardCats() {
        var cards = grid.querySelectorAll('.profile-card[aria-pressed="true"]');
        var cats = [];
        for (var i = 0; i < cards.length; i++) {
          var cat = cards[i].getAttribute('data-cat');
          if (cat && cats.indexOf(cat) === -1) cats.push(cat);
        }
        return cats;
      }

      function showCatSelectorIfNeeded() {
        if (!catSelectorEl || !catBannerEl) return;
        var hasTransversal = state.profiles.some(function(p) {
          return TRANSVERSAL_PROFILES.indexOf(p) !== -1;
        });

        if (!hasTransversal) {
          // Aucun pill transversal actif : tout masquer, reset
          catSelectorEl.style.display = 'none';
          catBannerEl.style.display = 'none';
          var checks = catSelectorEl.querySelectorAll('input[type="checkbox"]');
          for (var i = 0; i < checks.length; i++) {
            checks[i].checked = checks[i].parentElement.getAttribute('data-cat') === '1';
          }
          return;
        }

        // Pill transversal actif : logique A ou B ?
        var cardCats = getActiveCardCats();

        if (cardCats.length > 0) {
          // LOGIQUE A : des cartes sont deja cochees → heritage automatique
          // Pas de bandeau, pas de cat-selector
          catBannerEl.style.display = 'none';
          catSelectorEl.style.display = 'none';
          // Synchroniser le data-cat des pills transversaux avec les cartes actives
          var catStr = cardCats.join(',');
          var pills = document.querySelectorAll('#profileRouterSecondary .profile-pill[aria-pressed="true"]');
          for (var i = 0; i < pills.length; i++) {
            var p = pills[i].getAttribute('data-profile');
            if (TRANSVERSAL_PROFILES.indexOf(p) !== -1) {
              pills[i].setAttribute('data-cat', catStr);
            }
          }
          // Synchroniser les checkboxes du cat-selector (en miroir, pour coherence interne)
          var checks = catSelectorEl.querySelectorAll('input[type="checkbox"]');
          for (var i = 0; i < checks.length; i++) {
            var chipCat = checks[i].parentElement.getAttribute('data-cat');
            checks[i].checked = cardCats.indexOf(chipCat) !== -1;
          }
        } else {
          // LOGIQUE B : aucune carte cochee → defaut 4 categories + bandeau
          catBannerEl.style.display = '';
          catSelectorEl.style.display = 'none'; // Masque, visible si clic "Modifier"
          // Auto-selectionner les 4 cartes visuellement
          var allCards = grid.querySelectorAll('.profile-card');
          for (var i = 0; i < allCards.length; i++) {
            allCards[i].setAttribute('aria-pressed', 'true');
            var profile = allCards[i].getAttribute('data-profile');
            if (state.profiles.indexOf(profile) === -1) {
              state.profiles.push(profile);
            }
          }
          // Synchroniser pills transversaux et checkboxes sur 4 cats
          var pills = document.querySelectorAll('#profileRouterSecondary .profile-pill[aria-pressed="true"]');
          for (var i = 0; i < pills.length; i++) {
            var p = pills[i].getAttribute('data-profile');
            if (TRANSVERSAL_PROFILES.indexOf(p) !== -1) {
              pills[i].setAttribute('data-cat', '1,2,3,4');
            }
          }
          var checks = catSelectorEl.querySelectorAll('input[type="checkbox"]');
          for (var i = 0; i < checks.length; i++) {
            checks[i].checked = true;
          }
        }
      }

      // Lien "Modifier les categories" dans le bandeau → affiche le cat-selector
      if (catBannerLink) {
        catBannerLink.addEventListener('click', function(e) {
          e.preventDefault();
          catBannerEl.style.display = 'none';
          catSelectorEl.style.display = '';
        });
      }

      function getCatSelectorCats() {
        if (!catSelectorEl || catSelectorEl.style.display === 'none') return null;
        var cats = [];
        var checks = catSelectorEl.querySelectorAll('input[type="checkbox"]:checked');
        for (var i = 0; i < checks.length; i++) {
          var cat = checks[i].parentElement.getAttribute('data-cat');
          if (cat && cats.indexOf(cat) === -1) cats.push(cat);
        }
        return cats.length > 0 ? cats : null;
      }

      // Mettre a jour data-cat des pills + miroir cartes quand le selecteur change
      function updateTransversalDataCats() {
        var selectorCats = getCatSelectorCats();
        if (!selectorCats) return;
        var catStr = selectorCats.join(',');
        // Mettre a jour les pills transversaux actifs
        var pills = document.querySelectorAll('#profileRouterSecondary .profile-pill[aria-pressed="true"]');
        for (var i = 0; i < pills.length; i++) {
          var p = pills[i].getAttribute('data-profile');
          if (TRANSVERSAL_PROFILES.indexOf(p) !== -1) {
            pills[i].setAttribute('data-cat', catStr);
          }
        }
        // Miroir bidirectionnel : synchroniser les cartes avec le cat-selector
        var allCards = grid.querySelectorAll('.profile-card');
        for (var i = 0; i < allCards.length; i++) {
          var cardCat = allCards[i].getAttribute('data-cat');
          var shouldBeActive = selectorCats.indexOf(cardCat) !== -1;
          allCards[i].setAttribute('aria-pressed', shouldBeActive ? 'true' : 'false');
          var profile = allCards[i].getAttribute('data-profile');
          if (shouldBeActive && state.profiles.indexOf(profile) === -1) {
            state.profiles.push(profile);
          } else if (!shouldBeActive) {
            state.profiles = state.profiles.filter(function(p) { return p !== profile; });
          }
        }
        // Propager les categories
        updateCats();
        try {
          sessionStorage.setItem('qalia_cat_selector', JSON.stringify(selectorCats));
          sessionStorage.setItem('qalia_profiles', JSON.stringify(state.profiles));
        } catch(e) {}
        applyFilters();
        prefillSimulator();
        updateGatedVisibility();
        updateBookingLinks();
      }

      // Ecouter les changements dans le selecteur de categorie
      if (catSelectorEl) {
        catSelectorEl.addEventListener('change', function(e) {
          if (e.target.type !== 'checkbox') return;
          // Empecher de tout decocher (min 1 categorie)
          var checked = catSelectorEl.querySelectorAll('input[type="checkbox"]:checked');
          if (checked.length === 0) {
            e.target.checked = true;
            return;
          }
          // ORDRE : le dernier chip manipule pilote activeCat (LIFO)
          var chipCat = e.target.parentElement.getAttribute('data-cat');
          if (chipCat) {
            if (e.target.checked) {
              // Chip coche → cette cat devient active
              state.activeCat = chipCat;
            } else if (state.activeCat === chipCat) {
              // Chip decoche ET c'etait l'active → fallback sur le dernier coche restant
              var lastChecked = checked[checked.length - 1];
              var lastCat = lastChecked.parentElement.getAttribute('data-cat');
              if (lastCat) state.activeCat = lastCat;
            }
            try { sessionStorage.setItem('qalia_active_cat', state.activeCat || ''); } catch(ex) {}
          }
          updateTransversalDataCats();
        });
        // Restaurer depuis sessionStorage
        try {
          var savedCats = sessionStorage.getItem('qalia_cat_selector');
          if (savedCats) {
            var parsedCats = JSON.parse(savedCats);
            if (Array.isArray(parsedCats)) {
              var checks = catSelectorEl.querySelectorAll('input[type="checkbox"]');
              for (var i = 0; i < checks.length; i++) {
                var chipCat = checks[i].parentElement.getAttribute('data-cat');
                checks[i].checked = parsedCats.indexOf(chipCat) !== -1;
              }
            }
          }
        } catch(e) {}
      }

      // Gestionnaire de clic sur les cards (grille principale)
      grid.addEventListener('click', function(e) {
        var card = e.target.closest('.profile-card');
        if (!card) return;
        handleProfileToggle(card);
      });

      // Gestionnaire de clic sur les pills secondaires
      var secondary = document.getElementById('profileRouterSecondary');
      if (secondary) {
        secondary.addEventListener('click', function(e) {
          var pill = e.target.closest('.profile-pill');
          if (!pill) return;
          handleProfileToggle(pill);
        });
      }

      function applySelection() {
        // Re-appliquer visuellement (cards + pills)
        var cards = grid.querySelectorAll('.profile-card');
        for (var i = 0; i < cards.length; i++) {
          var profile = cards[i].getAttribute('data-profile');
          cards[i].setAttribute('aria-pressed', state.profiles.indexOf(profile) !== -1 ? 'true' : 'false');
        }
        if (secondary) {
          var pills = secondary.querySelectorAll('.profile-pill');
          for (var j = 0; j < pills.length; j++) {
            var p = pills[j].getAttribute('data-profile');
            pills[j].setAttribute('aria-pressed', state.profiles.indexOf(p) !== -1 ? 'true' : 'false');
          }
        }
        // Afficher catSelector si profil transversal actif (necessaire pour restauration session)
        showCatSelectorIfNeeded();
        updateCats();
        applyFilters();
        prefillSimulator();
        updateGatedVisibility();
        updateBookingLinks();
      }

      function updateCats() {
        state.cats = [];
        // Inclure cards ET pills
        var allBtns = document.querySelectorAll('#profileRouterGrid .profile-card[aria-pressed="true"], #profileRouterSecondary .profile-pill[aria-pressed="true"]');
        // Source de verite catSelector pour profils transversaux
        var selectorCats = getCatSelectorCats();
        for (var i = 0; i < allBtns.length; i++) {
          var profile = allBtns[i].getAttribute('data-profile');
          var catStr;
          // Profils transversaux : catSelector prime sur data-cat statique
          if (selectorCats && TRANSVERSAL_PROFILES.indexOf(profile) !== -1) {
            catStr = selectorCats.join(',');
            // Synchroniser data-cat du pill pour coherence DOM
            allBtns[i].setAttribute('data-cat', catStr);
          } else {
            catStr = allBtns[i].getAttribute('data-cat');
          }
          if (catStr) {
            var cats = catStr.split(',');
            for (var j = 0; j < cats.length; j++) {
              if (state.cats.indexOf(cats[j]) === -1) {
                state.cats.push(cats[j]);
              }
            }
          }
        }
      }

      /* ============================================
         V8 MECANISME 2 : TABS LIES PAR CAT. L6313
         Changement dans une section = changement partout.
         Solution 6 : masquage des onglets non pertinents.
         Solution 1 : dot indicator sur onglets non visites.
         ============================================ */

      // Tracker les onglets visites dans la session
      state.visitedCats = [];

      function applyFilters() {
        var tabSets = document.querySelectorAll('.cat-tabs');
        var hasCats = state.cats.length > 0;

        // Reset visited cats quand la selection change
        state.visitedCats = [];

        for (var i = 0; i < tabSets.length; i++) {
          var tabs = tabSets[i].querySelectorAll('.cat-tab');

          // Solution 6 refactored : onglets hors profil en style secondaire (plus de display:none)
          // Les onglets restent visibles et cliquables, mais visuellement attenues (dashed, gris)
          // Convergence NNG + Baymard + personas : masquer = perte de decouvrabilite + valeur percue
          for (var j = 0; j < tabs.length; j++) {
            var tabCat = tabs[j].getAttribute('data-cat');
            if (hasCats) {
              var tabCats = tabCat.split(',');
              var isRelevant = tabCats.some(function(tc) {
                return state.cats.indexOf(tc.trim()) !== -1;
              });
              tabs[j].classList.toggle('cat-tab--hidden', !isRelevant);
            } else {
              // Aucun profil selectionne : tout afficher en style normal
              tabs[j].classList.remove('cat-tab--hidden');
            }
          }

          // Activer la categorie active (ou la premiere pertinente)
          if (hasCats) {
            var catForTab = state.activeCat && state.cats.indexOf(state.activeCat) !== -1
              ? state.activeCat : state.cats[0];
            activateTab(tabSets[i], catForTab);
          }
        }

        // Synchroniser le choix global avec la selection de profil
        if (hasCats) {
          var catToActivate = state.activeCat && state.cats.indexOf(state.activeCat) !== -1
            ? state.activeCat : state.cats[0];
          state.activeCat = catToActivate;
          try { sessionStorage.setItem('qalia_active_cat', catToActivate); } catch(ex) {}
          state.visitedCats = [catToActivate];
          updateDotIndicators();
        }

        // Filtrer les target-cards (section "Vous vous reconnaissez ?")
        var targetCards = document.querySelectorAll('#targetGrid .target-card');
        for (var k = 0; k < targetCards.length; k++) {
          var cardCatStr = targetCards[k].getAttribute('data-cat');
          if (!cardCatStr) continue;
          if (hasCats) {
            var cardCats = cardCatStr.split(',');
            var cardVisible = false;
            for (var m = 0; m < cardCats.length; m++) {
              if (state.cats.indexOf(cardCats[m]) !== -1) { cardVisible = true; break; }
            }
            targetCards[k].style.display = cardVisible ? '' : 'none';
          } else {
            targetCards[k].style.display = '';
          }
        }

        // Adapter colonnes target-grid au nombre de cartes visibles
        adjustTargetGridCols();

        // Documents + Temoignages : filtrage via cat-tabs/cat-panels, reinit physique carrousels
        updateDocCarouselCentering();
        setTimeout(function() {
          if (window.__reinitDocCarousels) window.__reinitDocCarousels();
          if (window.__reinitTestimonialCarousels) window.__reinitTestimonialCarousels();
        }, 60);
      }

      /**
       * Ajuste --target-cols pour la meilleure repartition visuelle.
       * Logique : choisir le nombre de colonnes qui minimise le desequilibre
       * entre la derniere rangee et les precedentes.
       * Ex: 5 cartes → 3 cols (3+2) plutot que 4 cols (4+1)
       *     8 cartes → 4 cols (4+4)
       *     6 cartes → 3 cols (3+3)
       *     7 cartes → 4 cols (4+3)
       */
      function adjustTargetGridCols() {
        var grid = document.getElementById('targetGrid');
        if (!grid) return;
        // Ne s'applique que sur desktop (>=1024px)
        if (window.innerWidth < 1024) {
          grid.style.removeProperty('grid-template-columns');
          return;
        }
        var cards = grid.querySelectorAll('.target-card');
        var count = 0;
        for (var i = 0; i < cards.length; i++) {
          if (cards[i].style.display !== 'none') count++;
        }
        var cols;
        if (count <= 2) cols = count;
        else if (count === 3) cols = 3;
        else if (count === 4) cols = 4;
        else if (count === 5) cols = 3; // 3+2
        else if (count === 6) cols = 3; // 3+3
        else if (count === 7) cols = 4; // 4+3
        else cols = 4;                  // 4+4
        grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
      }

      // Recalculer au resize (passage tablette/desktop)
      window.addEventListener('resize', adjustTargetGridCols);
      // Calcul initial au chargement
      adjustTargetGridCols();

      function updateDocCarouselCentering() {
        var wraps = document.querySelectorAll('.doc-carousel-wrap');
        for (var w = 0; w < wraps.length; w++) {
          var panel = wraps[w].closest('.cat-panel');
          if (panel && panel.style.display === 'none') continue;
          var carousel = wraps[w].querySelector('.doc-carousel');
          var track = wraps[w].querySelector('.doc-carousel-track');
          if (!carousel || !track) continue;
          var cards = track.querySelectorAll('.doc-card');
          var totalW = 0;
          var gap = 24;
          for (var c = 0; c < cards.length; c++) {
            totalW += cards[c].offsetWidth + (c < cards.length - 1 ? gap : 0);
          }
          var containerW = carousel.offsetWidth;
          if (totalW <= containerW && containerW > 0) {
            track.classList.add('centered');
            wraps[w].classList.add('no-scroll');
          } else {
            track.classList.remove('centered');
            wraps[w].classList.remove('no-scroll');
          }
        }
      }

      function updateDotIndicators() {
        var allTabs = document.querySelectorAll('.cat-tab');
        for (var i = 0; i < allTabs.length; i++) {
          var tabCat = allTabs[i].getAttribute('data-cat');
          var tabCats = tabCat.split(',');
          var isRelevant = tabCats.some(function(tc) {
            return state.cats.indexOf(tc.trim()) !== -1;
          });
          var isVisited = state.visitedCats.indexOf(tabCat) !== -1;
          // Dot uniquement si : pertinent + non visite + plus d'un onglet pertinent
          allTabs[i].classList.toggle('cat-tab--unvisited', isRelevant && !isVisited && state.cats.length > 1);
        }
      }

      // exact=true : clic utilisateur sur un tab (correspondance stricte data-cat === cat)
      // exact=false : activation par profil (correspondance souple, split match)
      // silent=true : pas d'animation (sync globale sur sections hors viewport)
      function activateTab(tabSet, cat, exact, silent) {
        var tabs = tabSet.querySelectorAll('.cat-tab');
        var panels = tabSet.parentElement.querySelectorAll('.cat-panel');

        for (var i = 0; i < tabs.length; i++) {
          var tabCat = tabs[i].getAttribute('data-cat');
          var isActive;
          if (exact) {
            // Clic direct : correspondance stricte
            isActive = tabCat === cat;
          } else {
            // Profil : split match (data-cat="1,2,3,4" contient cat="1")
            var tabCats = tabCat.split(',');
            isActive = tabCats.some(function(tc) { return tc.trim() === cat; });
          }
          tabs[i].classList.toggle('active', isActive);
          tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
        }

        for (var i = 0; i < panels.length; i++) {
          var panelCat = panels[i].getAttribute('data-cat');
          var isVisible;
          if (exact) {
            // Clic direct : correspondance stricte (panel data-cat === cat)
            isVisible = panelCat === cat;
          } else {
            // Profil : split match (panel "1,2,3,4" contient cat "1")
            var panelParts = panelCat.split(',');
            isVisible = panelParts.some(function(pc) { return pc.trim() === cat; });
          }
          panels[i].style.display = isVisible ? '' : 'none';
          // Reset + replay animation on pipeline-steps when switching tabs (skip if silent)
          if (!silent) {
            var steps = panels[i].querySelectorAll('.pipeline-step');
            if (isVisible && steps.length > 0) {
              for (var j = 0; j < steps.length; j++) {
                steps[j].classList.remove('visible');
              }
              for (var j = 0; j < steps.length; j++) {
                (function(step, delay) {
                  setTimeout(function() { step.classList.add('visible'); }, delay + 50);
                })(steps[j], j * 120);
              }
            }
          }
        }
        // Reinitialiser physique + centrage des carrousels documents + temoignages apres switch de panel
        setTimeout(function() {
          updateDocCarouselCentering();
          if (window.__reinitDocCarousels) window.__reinitDocCarousels();
          if (window.__reinitTestimonialCarousels) window.__reinitTestimonialCarousels();
        }, 50);
      }

      // Deleguer les clics sur les tabs : sync GLOBALE inter-sections
      // Le choix de categorie persiste sur toute la page jusqu'au prochain changement.
      document.addEventListener('click', function(e) {
        var tab = e.target.closest('.cat-tab');
        if (!tab) return;

        // Ancrage scroll relatif a l'element clique (directive UX absolue : zero deplacement).
        // Methode : capturer la position viewport de l'onglet AVANT les mutations DOM,
        // puis corriger le scroll APRES pour que l'onglet reste au meme endroit a l'ecran.
        // Le scrollTo absolu ne suffit pas car le scroll-anchoring du navigateur l'ecrase.
        var tabViewportTop = tab.getBoundingClientRect().top;

        var cat = tab.getAttribute('data-cat');

        // Persister le choix global (valeur simple, ex. "2" meme si data-cat="1,2,3,4")
        var simpleCat = cat.split(',')[0].trim();
        state.activeCat = simpleCat;
        try { sessionStorage.setItem('qalia_active_cat', simpleCat); } catch(ex) {}

        // Solution 1 : marquer cet onglet comme visite (retirer le dot)
        if (state.visitedCats && state.visitedCats.indexOf(cat) === -1) {
          state.visitedCats.push(cat);
        }
        updateDotIndicators();

        // Sync globale : activer cette categorie sur TOUS les tab-sets.
        // Section locale : exact=true (correspondance stricte, clic utilisateur).
        // Sections distantes : exact=true d'abord, fallback exact=false si aucun
        // tab exact ne correspond (ex. FAQ avec data-cat="1,2,3,4" pour "General").
        // Animation uniquement sur la section cliquee (evite les scroll-jumps).
        var localTabSet = tab.closest('.cat-tabs');
        var allTabSets = document.querySelectorAll('.cat-tabs');
        // Extraire la premiere valeur simple pour la sync (ex. "2" depuis "2" ou "1,2,3,4")
        var syncCat = cat.split(',')[0].trim();
        for (var i = 0; i < allTabSets.length; i++) {
          var isSameSection = allTabSets[i] === localTabSet;
          if (isSameSection) {
            activateTab(allTabSets[i], cat, true, false);
          } else {
            // Tester si un tab exact existe, sinon fallback souple
            var hasExact = allTabSets[i].querySelector('.cat-tab[data-cat="' + syncCat + '"]');
            activateTab(allTabSets[i], syncCat, !!hasExact, true);
          }
        }

        // Correction scroll : ramener l'onglet clique a sa position viewport initiale.
        // Correction immediate (avant reinit carousel) + correction differee (apres reinit a 80ms).
        var delta = tab.getBoundingClientRect().top - tabViewportTop;
        if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
        // Correction finale apres reinit carousels (50-60ms) pour neutraliser leurs mutations DOM
        setTimeout(function() {
          var delta2 = tab.getBoundingClientRect().top - tabViewportTop;
          if (Math.abs(delta2) > 1) window.scrollBy({ top: delta2, behavior: 'instant' });
        }, 80);
      });

      /* ============================================
         V8 MECANISME 3 : SIMULATEUR PRE-REMPLI
         Pré-remplit le profil dans le simulateur selon la sélection.
         ============================================ */
      function prefillSimulator() {
        if (window._qaliaSyncing) return;
        window._qaliaSyncing = true;

        var simChoices = document.getElementById('simChoicesCible');
        if (!simChoices) { window._qaliaSyncing = false; return; }
        var buttons = simChoices.querySelectorAll('.sim-choice');

        // Collecter les valeurs sim attendues ET les valeurs qui ont un mapping
        // profileToSim est maintenant 1-to-many (arrays)
        var simValues = [];
        var mappedSimValues = [];
        for (var pk in profileToSim) {
          if (profileToSim.hasOwnProperty(pk)) {
            var vals = profileToSim[pk];
            for (var v = 0; v < vals.length; v++) {
              if (mappedSimValues.indexOf(vals[v]) === -1) mappedSimValues.push(vals[v]);
            }
          }
        }
        for (var i = 0; i < state.profiles.length; i++) {
          var svArr = profileToSim[state.profiles[i]];
          if (svArr) {
            for (var v2 = 0; v2 < svArr.length; v2++) {
              if (simValues.indexOf(svArr[v2]) === -1) simValues.push(svArr[v2]);
            }
          }
        }

        // Ne toucher QUE les boutons qui ont un mapping (certitudes)
        // Les choix libres (coach, enseignant, etc.) restent intacts
        for (var j = 0; j < buttons.length; j++) {
          var val = buttons[j].getAttribute('data-value');
          var isMapped = mappedSimValues.indexOf(val) !== -1;
          if (!isMapped) continue; // Ne pas toucher les choix libres
          var shouldBeSelected = simValues.indexOf(val) !== -1;
          var isSelected = buttons[j].classList.contains('selected');
          if (isSelected && !shouldBeSelected) {
            buttons[j].click(); // toggle OFF
          } else if (!isSelected && shouldBeSelected) {
            buttons[j].click(); // toggle ON
          }
        }

        window._qaliaSyncing = false;
      }

      /* ============================================
         V8 MECANISME 4 : MASQUAGE CONDITIONNEL
         Contenu masque tant qu'aucun profil n'est selectionne.
         SEO-safe : opacity + max-height (pas display:none).
         ============================================ */
      var profileToBooking = {
        formateur: 'formation',
        bilan: 'bilan',
        vae: 'vae',
        cfa: 'cfa',
        directeur: 'of',
        qualite: 'qualite'
      };

      function updateGatedVisibility() {
        // Mode awaiting-selection SUPPRIME (consensus 10/10 personas, L.1757).
        // La classe reste pour compatibilite mais AUCUN scroll ne doit se produire.
        if (state.profiles.length === 0) {
          document.body.classList.add('awaiting-selection');
        } else {
          document.body.classList.remove('awaiting-selection');
        }
      }

      function updateBookingLinks() {
        // URL par defaut (aucun ou multi-profils) : /demo (1h)
        // 1 profil unique : /slug specifique (45 min)
        var baseUrl = 'https://rdv.qalia.ai';
        var bookingUrl = baseUrl + '/demo';

        if (state.profiles.length === 1) {
          var slug = profileToBooking[state.profiles[0]];
          if (slug) bookingUrl = baseUrl + '/' + slug;
        }

        // Mettre a jour tous les liens vers rdv.qalia.ai (exact match)
        var bookingPattern = /^https:\/\/rdv\.qalia\.ai(\/(formation|bilan|vae|cfa|of|qualite|demo))?$/;
        var links = document.querySelectorAll('a[href^="https://rdv.qalia.ai"]');
        for (var i = 0; i < links.length; i++) {
          if (links[i].hasAttribute('data-fixed-booking')) continue;
          var current = links[i].getAttribute('href');
          if (current === 'https://rdv.qalia.ai' || bookingPattern.test(current)) {
            links[i].href = bookingUrl;
          }
        }
      }

      // Restaurer depuis sessionStorage si disponible
      // IMPORTANT : place apres toutes les declarations (secondary, TRANSVERSAL_PROFILES, catSelectorEl)
      // pour eviter les bugs de hoisting (var declarations non encore assignees)
      // Ordre : activeCat AVANT profiles, car applySelection() appelle applyFilters()
      // qui utilise state.activeCat pour choisir la categorie active.
      try {
        var savedCat = sessionStorage.getItem('qalia_active_cat');
        if (savedCat) { state.activeCat = savedCat; }
      } catch(e) {}
      try {
        var saved = sessionStorage.getItem('qalia_profiles');
        if (saved) {
          var parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            state.profiles = parsed;
            applySelection();
          }
        }
      } catch(e) {}
      // Appliquer activeCat sur les tab-sets (apres applySelection pour que les tabs soient prets)
      if (state.activeCat) {
        var allTabSets = document.querySelectorAll('.cat-tabs');
        for (var i = 0; i < allTabSets.length; i++) {
          var hasExact = allTabSets[i].querySelector('.cat-tab[data-cat="' + state.activeCat + '"]');
          activateTab(allTabSets[i], state.activeCat, !!hasExact, true);
        }
      }

      // Etat initial au chargement
      updateGatedVisibility();
      updateBookingLinks();
      setTimeout(function() {
        updateDocCarouselCentering();
        if (window.__reinitDocCarousels) window.__reinitDocCarousels();
        if (window.__reinitTestimonialCarousels) window.__reinitTestimonialCarousels();
      }, 150);

      // Exposer l'API pour usage externe
      window.__profileRouter = {
        getState: function() { return state; },
        getActiveCats: function() { return state.cats; },
        // Retourne les valeurs sim correspondant aux profils actifs
        getSimValues: function() {
          var simValues = [];
          for (var i = 0; i < state.profiles.length; i++) {
            var vals = profileToSim[state.profiles[i]];
            if (vals) {
              for (var v = 0; v < vals.length; v++) {
                if (simValues.indexOf(vals[v]) === -1) simValues.push(vals[v]);
              }
            }
          }
          return simValues;
        },
        // Re-pousser les profils actifs vers le simulateur (utile après restart sim)
        resyncToSim: function() { prefillSimulator(); },
        // API pour synchronisation sim -> profils
        setProfilesBySimValues: function(simValues) {
          // simValues = ['formateur', 'coach', 'accompagnateurVAE', ...]
          // Utiliser simToProfile (many-to-one) pour déterminer quels profils activer
          var targetProfiles = [];
          for (var s = 0; s < simValues.length; s++) {
            var prof = simToProfile[simValues[s]];
            if (prof && targetProfiles.indexOf(prof) === -1) {
              targetProfiles.push(prof);
            }
          }
          var grid2 = document.getElementById('profileRouterGrid');
          if (!grid2) return;
          var cards = grid2.querySelectorAll('.profile-card');
          for (var i = 0; i < cards.length; i++) {
            var p = cards[i].getAttribute('data-profile');
            if (!profileToSim[p]) continue; // Ne toucher que les certitudes
            var shouldBeActive = targetProfiles.indexOf(p) !== -1;
            var isActive = cards[i].getAttribute('aria-pressed') === 'true';
            if (shouldBeActive && !isActive) {
              cards[i].setAttribute('aria-pressed', 'true');
              if (state.profiles.indexOf(p) === -1) state.profiles.push(p);
            } else if (!shouldBeActive && isActive) {
              cards[i].setAttribute('aria-pressed', 'false');
              state.profiles = state.profiles.filter(function(x) { return x !== p; });
            }
          }
          updateCats();
          applyFilters();
          try { sessionStorage.setItem('qalia_profiles', JSON.stringify(state.profiles)); } catch(e) {}
          updateGatedVisibility();
          updateBookingLinks();
        }
      };

    })();

