"""Génère les 5 pages juridiques Qalia (Mentions, Politique, Cookies, Contact, Affiliation)."""
import os
import re

# Charger le style depuis cgv-page.html
with open("cgv-page.html", "r", encoding="utf-8") as f:
    cgv_content = f.read()
style_match = re.search(r"<style>(.*?)</style>", cgv_content, re.DOTALL)
style_block = style_match.group(0) if style_match else ""

def make_page(title, subtitle, articles_html):
    return style_block + (
        '\n<div class="page-header">'
        '\n  <p style="margin-bottom:0.5rem;"><a href="/" style="color:#fff;text-decoration:none;">&larr; Retour &agrave; Qalia<sup style="font-size:0.5em;">TM</sup></a></p>'
        f'\n  <h1>{title}</h1>'
        f'\n  <p style="opacity:0.9;">{subtitle}</p>'
        '\n</div>'
        '\n<main style="max-width:800px;margin:0 auto;padding:2rem 1.5rem;">'
        '\n<p style="text-align:center;font-style:italic;font-size:0.9rem;color:#5A6A70;margin-bottom:2rem;">Derni&egrave;re mise &agrave; jour : avril 2026</p>'
        f'\n{articles_html}'
        '\n<hr style="margin:3rem 0;border:none;border-top:1px solid #E8EEF0;">'
        '\n<p style="text-align:center;font-size:0.9rem;color:#5A6A70;">&copy; 2026 SAS DARIOT Romuald (Rungo). Tous droits r&eacute;serv&eacute;s.<br>'
        '<a href="/cgv" style="color:#1B7E94;">CGV</a> &middot; <a href="/mentions-legales" style="color:#1B7E94;">Mentions l&eacute;gales</a> &middot; <a href="/politique-confidentialite" style="color:#1B7E94;">Confidentialit&eacute;</a> &middot; <a href="/cookies" style="color:#1B7E94;">Cookies</a> &middot; <a href="/contact" style="color:#1B7E94;">Contact</a></p>'
        '\n</main>'
    )

# Mentions légales
mentions_articles = """
<h2>Article 1 | &Eacute;diteur du site</h2>
<p><strong>Raison sociale :</strong> SAS DARIOT Romuald (nom commercial : Rungo)</p>
<p><strong>Forme juridique :</strong> Soci&eacute;t&eacute; par Actions Simplifi&eacute;e (SAS) &agrave; associ&eacute; unique</p>
<p><strong>Capital social :</strong> 1 000 EUR</p>
<p><strong>Si&egrave;ge social :</strong> 231 rue Saint-Honor&eacute;, 75001 Paris, France</p>
<p><strong>SIRET :</strong> 849 107 826 00018</p>
<p><strong>RCS :</strong> Paris</p>
<p><strong>TVA intracommunautaire :</strong> FR88849107826</p>
<p><strong>Directeur de la publication :</strong> Romuald DARIOT, en qualit&eacute; de Pr&eacute;sident</p>
<p><strong>Contact :</strong> <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></p>

<h2>Article 2 | H&eacute;bergement</h2>
<p><strong>H&eacute;bergeur du site :</strong> Systeme.io SAS</p>
<p><strong>Adresse :</strong> 39 rue Marbeuf, 75008 Paris, France</p>
<p><strong>Site web :</strong> systeme.io</p>

<h2>Article 3 | Propri&eacute;t&eacute; intellectuelle</h2>
<p>L ensemble du contenu du site (textes, images, logos, charte graphique, marque Qalia) est la propri&eacute;t&eacute; exclusive de SAS DARIOT Romuald, sauf mention contraire. Toute reproduction, repr&eacute;sentation, modification ou exploitation, totale ou partielle, sans l autorisation expresse de l &eacute;diteur est interdite et constitue une contrefa&ccedil;on (articles L335-2 et suivants du Code de la propri&eacute;t&eacute; intellectuelle).</p>
<p>La marque <strong>Qalia<sup>TM</sup></strong> est en cours de protection par d&eacute;p&ocirc;t &agrave; l INPI.</p>

<h2>Article 4 | Donn&eacute;es personnelles</h2>
<p>Conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD - UE 2016/679) et &agrave; la Loi Informatique et Libert&eacute;s, vous disposez d un droit d acc&egrave;s, de rectification, d effacement, de limitation, d opposition et de portabilit&eacute; de vos donn&eacute;es personnelles.</p>
<p>Pour exercer ces droits : <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></p>
<p>D&eacute;tails complets : <a href="/politique-confidentialite">Politique de confidentialit&eacute;</a></p>

<h2>Article 5 | Cookies</h2>
<p>Le site utilise des cookies pour assurer son bon fonctionnement, mesurer l audience et am&eacute;liorer l exp&eacute;rience utilisateur. Pour plus d informations : <a href="/cookies">Politique cookies</a></p>

<h2>Article 6 | Litiges</h2>
<p>Les pr&eacute;sentes mentions l&eacute;gales sont r&eacute;gies par le droit fran&ccedil;ais. Tout litige rel&egrave;ve de la comp&eacute;tence exclusive des tribunaux de Paris.</p>
"""

# Politique
politique_articles = """
<h2>Article 1 | Responsable du traitement</h2>
<p>Le responsable du traitement est <strong>SAS DARIOT Romuald</strong> (Rungo), 231 rue Saint-Honor&eacute;, 75001 Paris, repr&eacute;sent&eacute;e par Romuald DARIOT.</p>
<p>Contact : <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></p>

<h2>Article 2 | Donn&eacute;es collect&eacute;es</h2>
<p>Cat&eacute;gories de donn&eacute;es collect&eacute;es :</p>
<ul>
<li><strong>Identification :</strong> nom, pr&eacute;nom, email professionnel, t&eacute;l&eacute;phone, fonction</li>
<li><strong>Facturation :</strong> raison sociale, adresse, SIRET, TVA</li>
<li><strong>Connexion :</strong> adresse IP, logs (anonymis&eacute;s au-del&agrave; de 13 mois)</li>
<li><strong>Navigation :</strong> via cookies analytiques avec consentement</li>
</ul>
<p><strong>Aucune donn&eacute;e sensible</strong> (sant&eacute;, opinions politiques, religieuses, syndicales) n est collect&eacute;e.</p>

<h2>Article 3 | Finalit&eacute;s</h2>
<ul>
<li>Ex&eacute;cution du contrat (gestion de l Abonnement Qalia)</li>
<li>Facturation et comptabilit&eacute; (obligation l&eacute;gale)</li>
<li>Support client</li>
<li>Communication sur les &eacute;volutions du Service (opt-out possible)</li>
<li>Statistiques anonymis&eacute;es</li>
</ul>

<h2>Article 4 | Base l&eacute;gale</h2>
<ul>
<li><strong>Ex&eacute;cution du contrat</strong> (article 6.1.b RGPD) pour l Abonnement</li>
<li><strong>Obligation l&eacute;gale</strong> (article 6.1.c) pour la facturation</li>
<li><strong>Consentement</strong> (article 6.1.a) pour les cookies analytiques et la newsletter</li>
<li><strong>Int&eacute;r&ecirc;t l&eacute;gitime</strong> (article 6.1.f) pour la s&eacute;curit&eacute;</li>
</ul>

<h2>Article 5 | Dur&eacute;e de conservation</h2>
<ul>
<li>Compte client : dur&eacute;e Abonnement + 3 ans</li>
<li>Facturation : 10 ans (obligation comptable)</li>
<li>Logs : 13 mois maximum</li>
<li>Cookies : 13 mois maximum</li>
<li>Prospects : 3 ans apr&egrave;s dernier contact</li>
</ul>

<h2>Article 6 | Destinataires</h2>
<p>Sous-traitants strictement n&eacute;cessaires :</p>
<ul>
<li><strong>Stripe</strong> (paiement, USA - SCC)</li>
<li><strong>Systeme.io</strong> (h&eacute;bergement, France)</li>
<li><strong>OpenAI</strong> (moteur ChatGPT requis pour Qalia, USA - SCC). Les conversations restent dans VOTRE compte ChatGPT.</li>
</ul>
<p>Aucune cession ni vente de donn&eacute;es &agrave; des tiers commerciaux.</p>

<h2>Article 7 | Vos droits RGPD</h2>
<ul>
<li><strong>Acc&egrave;s</strong> : copie des donn&eacute;es trait&eacute;es</li>
<li><strong>Rectification</strong> : corriger des donn&eacute;es inexactes</li>
<li><strong>Effacement</strong> (droit &agrave; l oubli)</li>
<li><strong>Limitation</strong> du traitement</li>
<li><strong>Portabilit&eacute;</strong> : r&eacute;cup&eacute;rer vos donn&eacute;es</li>
<li><strong>Opposition</strong> au traitement</li>
<li><strong>Retrait du consentement</strong> &agrave; tout moment</li>
</ul>
<p>Pour exercer ces droits : <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a> (r&eacute;ponse sous 30 jours).</p>
<p>R&eacute;clamation possible aupr&egrave;s de la CNIL : <a href="https://www.cnil.fr">www.cnil.fr</a></p>

<h2>Article 8 | S&eacute;curit&eacute;</h2>
<p>Mesures techniques et organisationnelles : chiffrement TLS 1.2+ en transit, AES-256 au repos, authentification forte, audits r&eacute;guliers.</p>

<h2>Article 9 | Cookies</h2>
<p>D&eacute;tails et gestion : <a href="/cookies">Politique cookies</a>.</p>
"""

# Cookies
cookies_articles = """
<h2>Article 1 | Qu est-ce qu un cookie ?</h2>
<p>Un cookie est un petit fichier texte d&eacute;pos&eacute; sur votre terminal lors de la consultation d un site. Il permet au site de reconna&icirc;tre votre navigateur et d enregistrer certaines informations.</p>

<h2>Article 2 | Types de cookies utilis&eacute;s</h2>

<h3>Cookies strictement n&eacute;cessaires (sans consentement)</h3>
<p>Indispensables au fonctionnement. Ne peuvent pas &ecirc;tre d&eacute;sactiv&eacute;s.</p>
<ul>
<li>Cookie de session</li>
<li>Cookie de pr&eacute;f&eacute;rence linguistique</li>
<li>Cookie de protection CSRF</li>
</ul>

<h3>Cookies de mesure d audience (avec consentement)</h3>
<p>Outil anonymis&eacute; pour mesurer l audience sans identifier les visiteurs.</p>
<ul>
<li>Dur&eacute;e : 13 mois maximum</li>
<li>Donn&eacute;es : pages visit&eacute;es, dur&eacute;e, terminal, navigateur (anonymis&eacute;s)</li>
<li>Pas de partage avec tiers commerciaux</li>
</ul>

<h3>Cookies tiers (avec consentement)</h3>
<ul>
<li><strong>Cookiebot</strong> (gestion du consentement RGPD)</li>
<li><strong>Stripe</strong> (paiement s&eacute;curis&eacute;, lors de la souscription)</li>
</ul>

<h2>Article 3 | G&eacute;rer vos pr&eacute;f&eacute;rences</h2>
<ul>
<li>Le bandeau de consentement &agrave; la premi&egrave;re visite</li>
<li>L ic&ocirc;ne Cookiebot en bas de page</li>
<li>Les param&egrave;tres de votre navigateur (Chrome, Firefox, Safari, Edge)</li>
</ul>

<h2>Article 4 | Cons&eacute;quences du refus</h2>
<p>Le refus des cookies analytiques n emp&ecirc;che pas l usage du site. Le refus des cookies strictement n&eacute;cessaires peut emp&ecirc;cher certaines fonctionnalit&eacute;s.</p>

<h2>Article 5 | Dur&eacute;e</h2>
<p>Conserv&eacute;s 13 mois maximum (recommandations CNIL). Au-del&agrave;, votre consentement vous est &agrave; nouveau demand&eacute;.</p>

<h2>Article 6 | Vos droits</h2>
<p>Conform&eacute;ment au RGPD, vous pouvez exercer vos droits d acc&egrave;s, de rectification, d opposition et d effacement &agrave; tout moment : <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></p>
<p>R&eacute;clamation aupr&egrave;s de la CNIL : <a href="https://www.cnil.fr">www.cnil.fr</a></p>
"""

# Contact
contact_articles = """
<h2>D&eacute;mo offerte (recommand&eacute;)</h2>
<p>La voie la plus rapide pour d&eacute;couvrir Qalia sur votre vrai cas m&eacute;tier :</p>
<p style="text-align:center;margin:2rem 0;">
<a href="https://rdv.qalia.ai" style="display:inline-block;background:linear-gradient(135deg,#1B7E94,#2A9DB6);color:#fff;padding:1rem 2rem;border-radius:0.75rem;text-decoration:none;font-weight:600;box-shadow:0 4px 14px rgba(27,126,148,0.35);">R&eacute;server ma d&eacute;mo offerte (45 min)</a>
</p>
<p style="text-align:center;font-size:0.9rem;color:#5A6A70;">30 min de d&eacute;mo + 15 min de questions &middot; Votre vrai sujet</p>

<h2>Email</h2>
<p>Pour toute question commerciale, support, partenariat ou presse :<br>
<strong><a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></strong></p>
<p style="font-size:0.9rem;color:#5A6A70;">R&eacute;ponse sous 72 heures ouvr&eacute;es. Escalade acc&eacute;l&eacute;r&eacute;e si audit Qualiopi &agrave; moins de 30 jours.</p>

<h2>Adresse postale</h2>
<p>SAS DARIOT Romuald (Rungo)<br>
231 rue Saint-Honor&eacute;<br>
75001 Paris, France</p>

<h2>Audit Qualiopi imminent ?</h2>
<p>Si votre audit (initial, surveillance ou renouvellement) est &agrave; moins de 30 jours, mentionnez-le dans l objet de votre email pour b&eacute;n&eacute;ficier d une r&eacute;ponse prioritaire.</p>

<h2>Auditeurs et certificateurs Qualiopi</h2>
<p>Vous &ecirc;tes auditeur ou certificateur Qualiopi ? Contactez-nous pour explorer une convention de partenariat d&eacute;di&eacute;e.</p>

<h2>F&eacute;d&eacute;rations et institutionnels</h2>
<p>Conventions sur mesure (clubs, f&eacute;d&eacute;rations, OPCO, institutionnels) avec co-branding et webinaires trimestriels co-produits. D&eacute;tails : <a href="/affiliation">Programme partenariat</a>.</p>
"""

# Affiliation
affiliation_articles = """
<h2>Conventions de partenariat</h2>
<p>Qalia propose des conventions sur mesure pour les structures qui regroupent plusieurs organismes de formation :</p>

<h3>Club / Association (10-30 OF)</h3>
<ul>
<li>Tarif licence : <strong>267 EUR/mois</strong> par licence (-10%)</li>
<li>Annuel : 2 670 EUR/an par licence (2 mois offerts)</li>
<li>Convention 1 an, r&eacute;siliable avec 30 jours de pr&eacute;avis</li>
</ul>

<h3>F&eacute;d&eacute;ration (30+ OF)</h3>
<ul>
<li>Tarif licence : <strong>252 EUR/mois</strong> par licence (-15%)</li>
<li>Annuel : 2 520 EUR/an par licence (2 mois offerts)</li>
<li>1 webinaire co-produit par trimestre pour vos adh&eacute;rents</li>
<li>Donn&eacute;es benchmark anonymis&eacute;es annuelles</li>
<li>Co-branding Recommand&eacute; par [Partenaire]</li>
</ul>

<h3>Institutionnel (75+ licences)</h3>
<ul>
<li>Tarif licence : <strong>252 EUR/mois</strong> + co-branding</li>
<li>Annuel : 2 520 EUR/an par licence + co-branding</li>
<li>Cadre contractuel sur-mesure</li>
<li>Comit&eacute; de pilotage semestriel</li>
<li>Webinaire trimestriel pour votre &eacute;quipe ou vos adh&eacute;rents</li>
</ul>

<h2>Programme apporteur d affaires</h2>
<p>Un programme apporteur d affaires est en cours de structuration pour les consultants Qualiopi ind&eacute;pendants, formateurs et coachs partenaires.</p>
<p>Les modalit&eacute;s (commission r&eacute;currente, dur&eacute;e de versement, conditions de qualification) seront publi&eacute;es prochainement.</p>
<p>Pour &ecirc;tre inform&eacute; du lancement : <a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></p>

<h2>Auditeurs et certificateurs Qualiopi</h2>
<p>Vous &ecirc;tes <strong>auditeur ou certificateur Qualiopi</strong> ? Contactez-nous pour explorer une convention de partenariat d&eacute;di&eacute;e.</p>

<h2>Membre des &eacute;cosyst&egrave;mes</h2>
<ul>
<li>French Tech</li>
<li>Digital R&eacute;union</li>
<li>Association de l IA</li>
<li>Club Export R&eacute;union</li>
<li>Marque de la R&eacute;union</li>
</ul>

<h2>Contact partenariat</h2>
<p>Pour toute demande de partenariat, convention ou co-branding :<br>
<strong><a href="mailto:bonjour@qalia.ai">bonjour@qalia.ai</a></strong></p>
"""

pages = [
    ("mentions-legales-page.html", "Mentions L&eacute;gales", "&Eacute;diteur &middot; H&eacute;bergement &middot; Propri&eacute;t&eacute; intellectuelle", mentions_articles),
    ("politique-confidentialite-page.html", "Politique de Confidentialit&eacute;", "Conformit&eacute; RGPD &middot; Vos donn&eacute;es restent les v&ocirc;tres", politique_articles),
    ("cookies-page.html", "Politique Cookies", "Conforme RGPD et recommandations CNIL", cookies_articles),
    ("contact-page.html", "Contact", "D&eacute;mo offerte &middot; Email &middot; Audit prioritaire", contact_articles),
    ("affiliation-page.html", "Programme Partenariat", "Clubs &middot; F&eacute;d&eacute;rations &middot; Institutionnels &middot; Apporteurs", affiliation_articles),
]

for filename, title, subtitle, articles in pages:
    content = make_page(title, subtitle, articles)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"{filename}: {os.path.getsize(filename)} bytes")
