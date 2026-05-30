'use strict';

// ── SHARED PROCESS TEMPLATES ───────────────────────────────
const P_WEB = [
  { n:'01', title:'Konzultacija',        desc:'Upoznajemo se s vašim ciljevima, ciljnom publikom i vizijom. Definišemo opseg projekta, rokove i sve potrebne integracije.' },
  { n:'02', title:'Dizajn & prijedlog',  desc:'Kreiramo wireframe i vizualni prijedlog. Radite s nama dok dizajn ne bude tačno ono što ste zamislili — bez žurbe.' },
  { n:'03', title:'Razvoj & testiranje', desc:'Gradimo i testiramo na svim uređajima i browserima. Redovne preglede dijelimo s vama tokom cijelog procesa.' },
  { n:'04', title:'Isporuka & podrška', desc:'Postavljamo na hosting, obučavamo vas za upravljanje sadržajem i pružamo 30 dana besplatne podrške.' }
];

const P_APP = [
  { n:'01', title:'Analiza zahtjeva',    desc:'Detaljno dokumentujemo funkcionalnosti, korisničke role i tokove podataka kroz specifikacijski dokument.' },
  { n:'02', title:'Arhitektura & UI',    desc:'Dizajniramo bazu podataka, API strukturu i korisnički interfejs — sve usklađeno s vašim poslovnim procesom.' },
  { n:'03', title:'Razvoj u sprintovima',desc:'Agilni razvoj s redovnim demo sesijama svake dvije sedmice. Feedback u realnom vremenu, bez iznenađenja.' },
  { n:'04', title:'Deployment & obuka', desc:'Postavljamo na produkcijski server, obučavamo vaš tim i isporučujemo kompletnu tehničku dokumentaciju.' }
];

const P_SEO = [
  { n:'01', title:'SEO audit',          desc:'Skaniramo vašu stranicu, analiziramo backlink profil i identifikujemo sve tehničke, sadržajne i off-page probleme.' },
  { n:'02', title:'Keyword strategija', desc:'Istražujemo ključne riječi s najvećim potencijalom za vaš biznis i kreiramo detaljnu mapu sadržaja.' },
  { n:'03', title:'Implementacija',     desc:'Provođemo prioritizovane izmjene uz redovnu komunikaciju. Svaki korak je dokumentovan i objašnjen.' },
  { n:'04', title:'Praćenje & izvještaj',desc:'Sedmični rank tracker i Analytics/GSC izvještaj. Vidite svaki pomak i znate tačno šta je donijelo rezultat.' }
];

const P_MKT = [
  { n:'01', title:'Istraživanje publike',desc:'Definišemo ciljne segmente, kreiramo personae i analiziramo gdje je vaša publika najaktivnija i najdostupnija.' },
  { n:'02', title:'Kreativa & setup',    desc:'Kreiramo vizuale, kopirajt i postavljamo kampanje uz A/B testove od prvog dana lansiranja.' },
  { n:'03', title:'Lansiranje & optim.', desc:'Pratimo performanse u realnom vremenu i svakodnevno optimiziramo za bolji ROI bez dodatnih troškova.' },
  { n:'04', title:'Izvještaj & rast',    desc:'Sedmični izvještaji s jasnim KPI-jima plus preporuke za skaliranje onoga što dokazano funkcioniše.' }
];

const P_MAINT = [
  { n:'01', title:'Inicijalni setup',   desc:'Instaliramo backup sistem, sigurnosne plugine i monitoring alate jednom, bez ikakve vaše daljnje brige.' },
  { n:'02', title:'Sedmično održavanje',desc:'Backupi, core/plugin/tema ažuriranja i sigurnosni scans svake sedmice — automatski, bez vašeg angažmana.' },
  { n:'03', title:'24/7 monitoring',    desc:'Uptime provjera svakih 5 minuta. U slučaju problema, javljamo vam se za manje od 15 minuta.' },
  { n:'04', title:'Månadsni izvještaj', desc:'Svaki mjesec dobijate izvještaj stanja stranice, obavljenih radova i preporuka za naredni period.' }
];

// ── SERVICES DATA ──────────────────────────────────────────
const SERVICES = {

  'wordpress-stranice': {
    category:'Izrada Web Stranica', tag:'Najpopularnija usluga', icon:'🌐',
    title:'WordPress Stranice',
    subtitle:'Brza, pouzdana i laka za upravljanje',
    desc:'WordPress pokreće više od 40% svih web stranica na internetu i postoji dobar razlog za to. Brz razvoj, ogroman ekosistem plugina i intuitivno upravljanje sadržajem čine ga idealnim izborom za prezentacijske stranice, korporativne portale i blogove svih veličina.',
    desc2:'Radimo isključivo s premium temama i prilagođenim child temama — nikada s piratskim alatima ili prekopiranım rješenjima. Svaki projekat uključuje optimizaciju brzine, osnovu za SEO i 30 dana besplatne podrške nakon isporuke.',
    features:['Dizajn u potpunosti prilagođen vašem brendu','Mobilna optimizacija (responzivan dizajn za sve uređaje)','Osnovna SEO optimizacija uključena u cijenu','Obuka za samostalno upravljanje sadržajem','Sigurnosno postavljanje i savjeti za hosting'],
    time:'7–14 dana',
    stats:[{val:'98%',label:'Zadovoljnih klijenata'},{val:'12 dana',label:'Prosj. isporuka'},{val:'50+',label:'Projekata isporučeno'}],
    skills:[{name:'WordPress Development',pct:95},{name:'Responsive Dizajn',pct:92},{name:'On-Page SEO',pct:85},{name:'Brzina & Sigurnost',pct:90}],
    process:P_WEB
  },

  'custom-web-stranice': {
    category:'Izrada Web Stranica', tag:'Premium rješenje', icon:'⚡',
    title:'Custom Web Stranice',
    subtitle:'Next.js i custom development bez ograničenja',
    desc:'Kada WordPress nije dovoljan — pravimo web stranice od nule koristeći Next.js, React ili čisti HTML/CSS/JS. Rezultat je stranica bez nikakvih ograničenja gotovih tema: bleskovito brza, potpuno prilagođena vašem biznisu i dizajnirana za maksimalne konverzije.',
    desc2:'Custom razvoj je pravi izbor za biznise kojima je potrebna specifična arhitektura, integracija s ERP/CRM sistemima ili koji ne žele dijeliti kôd s hiljadama drugih sajtova. Svaki red koda je vaš, svaka odluka je namjerna.',
    features:['Blazing-fast performanse (PageSpeed 95+)','Potpuno prilagođen UI/UX dizajn od nule','SEO-friendly arhitektura i clean kôd','Integracija s bilo kojim eksternim servisom','Skalabilno za rast vašeg biznisa'],
    time:'3–6 sedmica',
    stats:[{val:'99+',label:'PageSpeed score'},{val:'4×',label:'Brže od prosjeka'},{val:'100%',label:'Custom rješenje'}],
    skills:[{name:'Next.js / React',pct:96},{name:'Custom UI/UX Design',pct:94},{name:'API Integracije',pct:88},{name:'Performance Optim.',pct:97}],
    process:P_WEB
  },

  'landing-stranice': {
    category:'Izrada Web Stranica', tag:'Visoke konverzije', icon:'🎯',
    title:'Landing Stranice',
    subtitle:'Dizajnirane isključivo da pretvore posjetioca u kupca',
    desc:'Landing stranica ima jedan jedini cilj: pretvoriti posjetioca u kupca, leada ili pretplatnika. Svaki element — od naslova do boje dugmeta — donosi se na osnovu podataka i testiranih principa konverzijskog dizajna, ne na osnovu estetskih preferencija.',
    desc2:'Naše landing stranice učitavaju se ispod 2 sekunde, prilagođene su za sve uređaje i isporučuju se s Google Analytics i Meta Pixel integracijom. Opcionalno nudimo i A/B testiranje da pronađemo verziju s najboljim rezultatima.',
    features:['Jasna i uvjerljiva poruka (copywriting podrška)','Optimizirani CTA elementi na ključnim mjestima','Brzo učitavanje ispod 2 sekunde','Integracija s email marketing alatima','A/B testiranje za maksimalne konverzije'],
    time:'3–7 dana',
    stats:[{val:'+32%',label:'Prosj. poboljšanje konverzija'},{val:'< 2s',label:'Garantovano učitavanje'},{val:'3–7 dana',label:'Isporuka'}],
    skills:[{name:'Conversion Rate Optim.',pct:96},{name:'Copywriting & UX',pct:88},{name:'A/B Testing',pct:84},{name:'Speed Optimization',pct:93}],
    process:P_WEB
  },

  'redizajn': {
    category:'Izrada Web Stranica', tag:'Modernizacija', icon:'🔄',
    title:'Redizajn Stranice',
    subtitle:'Novog izgleda bez gubitka onoga što radi',
    desc:'Vaša web stranica izgleda zastarjelo, ali imate SEO koji vrijedi sačuvati i sadržaj koji je već na Google-u? Redizajn je u takvim slučajevima pametniji izbor od izgradnje od nule. Analiziramo postojeće stanje i kreiramo moderan dizajn koji gradi na temeljima koje ste izgradili.',
    desc2:'Svaki redizajn počinje detaljnim auditom performansi, SEO rangova i korisničkog iskustva. Sve što radi — čuvamo. Sve što ne radi — mijenjamo. Migracija sadržaja je uključena u cijenu i radimo je bez downtime-a.',
    features:['Audit i analiza postojeće stranice','Očuvanje SEO vrijednosti i rangova','Moderni dizajn prilagođen 2025+ trendovima','Poboljšana navigacija i korisničko iskustvo','Migracija sadržaja bez gubitaka'],
    time:'1–3 sedmice',
    stats:[{val:'+40%',label:'Prosj. rast konverzija'},{val:'SEO',label:'Rangovi sačuvani'},{val:'0',label:'Downtime tokom migracije'}],
    skills:[{name:'UX Audit & Analysis',pct:90},{name:'Modern UI Design',pct:95},{name:'SEO Migration',pct:86},{name:'Content Migration',pct:88}],
    process:P_WEB
  },

  'visejezicne': {
    category:'Izrada Web Stranica', tag:'Internacionalni biznis', icon:'🌍',
    title:'Višejezične Stranice',
    subtitle:'Govorite jezikom svojih kupaca',
    desc:'Internacionalni klijenti kupuju 70% više kada ih se oslovi na maternjem jeziku. Pravimo višejezične web stranice s profesionalnim prevodom, prilagođenim formatima datuma, valuta i adresar, i SEO optimizacijom posebno za svaki jezik i tržište.',
    desc2:'Svaki jezik dobija vlastiti URL (npr. /de/, /en/), što je Google-ova preporučena praksa za internacionalni SEO. Koristimo WPML ili custom i18n implementacije u zavisnosti od kompleksnosti projekta.',
    features:['Podrška za neograničen broj jezika','Profesionalni prevod (ne Google Translate)','Hreflang SEO tagovi za svaki jezik','Prilagođeni URL-ovi i sitemap po jeziku','RTL podrška (arapski, hebrejski, perzijski)'],
    time:'2–4 sedmice',
    stats:[{val:'30+',label:'Podržanih jezika'},{val:'+65%',label:'Prosj. rast reach-a'},{val:'100%',label:'Google hreflang standard'}],
    skills:[{name:'i18n / l10n implementacija',pct:93},{name:'Multilingual SEO',pct:89},{name:'RTL Layout support',pct:85},{name:'Translation management',pct:82}],
    process:P_WEB
  },

  'woocommerce': {
    category:'Izrada Web Shopova', tag:'E-commerce #1', icon:'🛒',
    title:'WooCommerce Shop',
    subtitle:'Najpopularnija e-commerce platforma — bez skrivenih troškova',
    desc:'WooCommerce pokreće više od 30% svih online shopova na planeti. Postavljamo kompletna e-commerce rješenja — od dizajna produkt kartica i kategorija do integracije plaćanja, automatizacije narudžbi i upravljanja zalihama.',
    desc2:'Za razliku od Shopify-a ili Squarespace-a, WooCommerce ne uzima postotak od vaše prodaje niti vam naplaćuje mjesečnu pretplatu za osnovne funkcije. Vi ste vlasnik svog shopa — i svega što zaradite.',
    features:['Integracija s PayPal, Stripe i bankovnim transferom','Upravljanje zalihama i varijantama produkata','Automatske email notifikacije kupcima','Kupon kodovi, popusti i promotivne cijene','Izvještaji prodaje i analitika narudžbi'],
    time:'2–4 sedmice',
    stats:[{val:'+28%',label:'Prosj. rast prodaje'},{val:'0%',label:'Provizija na prodaju'},{val:'2–4 sed.',label:'Isporuka kompletnog shopa'}],
    skills:[{name:'WooCommerce Development',pct:95},{name:'Payment integracije',pct:90},{name:'Shop UX Design',pct:88},{name:'Inventory & Orders',pct:85}],
    process:P_WEB
  },

  'custom-ecommerce': {
    category:'Izrada Web Shopova', tag:'Headless Commerce', icon:'⚙️',
    title:'Custom E-commerce',
    subtitle:'Headless arhitektura za biznise bez kompromisa',
    desc:'Za biznise kojima WooCommerce ili Shopify nisu dovoljni — pravimo custom e-commerce platforme koristeći headless arhitekturu. Prednji dio (React/Next.js) odvojen od pozadinskog (API) znači maksimalne performanse, potpunu fleksibilnost i jedinstven korisnički doživljaj koji vaši konkurenti ne mogu kopirati.',
    desc2:'Headless commerce je pravi izbor za catalogue-ove s desetinama hiljada produkata, biznise koji prodaju na više kanala istovremeno (web, mobile app, kiosk), ili kompanije koje trebaju duboku integraciju s ERP ili PIM sistemima.',
    features:['Headless arhitektura (Next.js + Strapi / Sanity)','Blazing-fast performanse neovisno o katalogu','Custom checkout i integracija plaćanja','Skalabilno za milione produkata','Duboka ERP / CRM integracija'],
    time:'4–8 sedmica',
    stats:[{val:'99+',label:'PageSpeed score'},{val:'∞',label:'Skalabilnost kataloga'},{val:'4–8 sed.',label:'Isporuka'}],
    skills:[{name:'Headless Architecture',pct:94},{name:'Custom Checkout',pct:91},{name:'Performance Optim.',pct:97},{name:'ERP/API integracija',pct:85}],
    process:P_APP
  },

  'crm-sistemi': {
    category:'Web Aplikacije', tag:'Poslovni alati', icon:'👥',
    title:'CRM Sistemi',
    subtitle:'Sve o vašim klijentima na jednom mjestu',
    desc:'Gotovi CRM alati poput Salesforce-a ili HubSpot-a nude stotine funkcija od kojih koristite 10. Custom CRM je napravljen tačno za vaš poslovni proces — bez viška, bez manjka. Pratite kontakte, ponude, komunikaciju i rokove u jednoj aplikaciji koja radi onako kako vi radite.',
    desc2:'Naši CRM sistemi izgrađeni su na modernim tech stack-ovima koji se lako proširuju kako vaš tim raste. Uključuju role-based pristup (svaki djelatnik vidi samo ono što treba), API za integraciju s postojećim alatima i export podataka u Excel/CSV.',
    features:['Upravljanje kontaktima i kompanijama','Sales pipeline s drag & drop Kanban board-om','Automatske email sekvence i podsjetnici','Izvještaji prodaje i analytics dashboard','Integracija s Outlook / Gmail / Slack'],
    time:'4–10 sedmica',
    stats:[{val:'90%',label:'Efikasnost prodajnog procesa'},{val:'Role-based',label:'Pristup za timove'},{val:'API',label:'Integracija s postojećim alatima'}],
    skills:[{name:'CRM Arhitektura',pct:92},{name:'UI/UX Design',pct:88},{name:'API razvoj',pct:90},{name:'Database design',pct:94}],
    process:P_APP
  },

  'booking-sistemi': {
    category:'Web Aplikacije', tag:'Rezervacije online', icon:'📅',
    title:'Booking Sistemi',
    subtitle:'Rezervacije 24/7 bez telefonskog poziva',
    desc:'Vaši klijenti žele rezervirati termin u 23:00, a vi ne trebate biti dostupni da to omogućite. Pravimo custom booking sisteme za restorane, klinike, salone, hotele i sve biznise koji rade s terminima i rezervacijama — s automatskim potvrdama i podsjetnicima.',
    desc2:'Za razliku od generičkih booking alata koji uzimaju postotak ili nude generički izgled, naš custom sistem je potpuno integriran u vaš sajt, prihvata online plaćanje depozita i sinkronizira se s Google Kalendarom svakog zaposlenika.',
    features:['Real-time dostupnost i pametni kalendar','Automatske potvrde i podsjetnici (SMS + email)','Online plaćanje depozita pri rezervaciji','Upravljanje timom, resursima i radnim vremenom','Integracija s Google Kalendarom'],
    time:'3–6 sedmica',
    stats:[{val:'24/7',label:'Primanje rezervacija'},{val:'-40%',label:'Manje no-showova (podsjetnici)'},{val:'< 2 min',label:'Setup rezervacije za klijenta'}],
    skills:[{name:'Calendar & booking logic',pct:93},{name:'Real-time sync',pct:89},{name:'Payment integracija',pct:90},{name:'Mobile UX',pct:92}],
    process:P_APP
  },

  'interni-portali': {
    category:'Web Aplikacije', tag:'Interne operacije', icon:'🏢',
    title:'Interni Portali',
    subtitle:'Digitalizujte procese koji troše vaše vrijeme',
    desc:'Koliko sati sedmično vaš tim provede tražeći dokumente u emailovima, ispunjavajući tabele ili ručno prosljeđujući informacije? Interni portal stavlja sve to na jedno mjesto — upravljanje dokumentima, zadacima, HR procesima i komunikacijom u jednoj prilagođenoj aplikaciji.',
    desc2:'Portali koje gradimo su cloud-bazirani i rade na svim uređajima, što znači da su terenski radnici jednako dobro opremljeni kao i ured. Role-based pristup osigurava da svako vidi samo ono za šta ima autorizaciju.',
    features:['Role-based upravljanje korisnicima','Upload, organizacija i pretraživanje dokumenata','Praćenje zadataka i projekata s rokovima','Dashboard s KPI izvještajima za menadžment','Integracija s postojećim alatima (email, ERP…)'],
    time:'4–8 sedmica',
    stats:[{val:'-60%',label:'Manje internih emailova'},{val:'Cloud',label:'Dostupno s bilo kojeg uređaja'},{val:'Role-based',label:'Sigurnost pristupa'}],
    skills:[{name:'Portal arhitektura',pct:90},{name:'Auth & permisije',pct:94},{name:'Document management',pct:85},{name:'Dashboard & analytics',pct:88}],
    process:P_APP
  },

  'wordpress-plugini': {
    category:'Web Aplikacije', tag:'WordPress extensibility', icon:'🔌',
    title:'WordPress Plugini',
    subtitle:'Svaka funkcionalnost je moguća',
    desc:'Postoji 60,000+ plugina na WordPress.org, ali ponekad nijedan ne radi tačno ono što vam treba. Razvijamo custom WordPress plugine od jednostavnih widgeta do kompleksnih integracija s externim API-jima — sigurnih, optimiziranih i 100% prilagođenih vašem slučaju.',
    desc2:'Svaki plugin koji razvijemo slijedi WordPress coding standarde, provjerimo ga na sigurnost i kompatibilnost s popularnim temama i pluginima, i isporučujemo s dokumentacijom za vaš tim. Po potrebi, možemo ga i objaviti na WordPress.org repozitoriju.',
    features:['Razvoj po vašoj specifikaciji','Siguran kôd usklađen s WP standardima','Testiran na kompatibilnost s popularnim temama','Dokumentacija i tehnička podrška','Objava na WordPress.org opciona'],
    time:'1–4 sedmice',
    stats:[{val:'100%',label:'Po vašoj specifikaciji'},{val:'WP Standards',label:'Siguran i kompatibilan kôd'},{val:'GPL',label:'Vi ste vlasnik kôda'}],
    skills:[{name:'WordPress Plugin Dev',pct:95},{name:'PHP & JavaScript',pct:91},{name:'API integracije',pct:88},{name:'WP Security',pct:92}],
    process:P_APP
  },

  'seo-lokalni': {
    category:'SEO Optimizacija', tag:'Lokalni biznis', icon:'📍',
    title:'Lokalni SEO',
    subtitle:'Budite prvi kada vas traže u vašem gradu',
    desc:'Kada neko u Sarajevu, Banjoj Luci ili Mostaru traži frizer, zubara ili servis — želi rezultate u svom gradu. Lokalni SEO optimizira vašu prisutnost na Google Maps i lokalnim pretragama, što je direktno put do novih lokalnih klijenata bez plaćanja reklama.',
    desc2:'Lokalni SEO rezultati vidljivi su brže nego klasični organski SEO — obično unutar 4–8 sedmica za manje konkurentne kategorije. Ključ je u optimiziranom Google Business profilu, konzistentnim citacijama i aktivnom upravljanju recenzijama.',
    features:['Kompletna optimizacija Google Business profila','Izgradnja lokalnih citacija i directory listinga','Strategija za prikupljanje i upravljanje recenzijama','Lokalne ključne riječi i optimizacija sadržaja','Sedmično praćenje rangova u lokalnoj pretrazi'],
    time:'Ongoing (3+ mj)',
    stats:[{val:'+78%',label:'Prosj. rast lokalnih klikova'},{val:'Top 3',label:'Cilj na Google Maps'},{val:'4–8 sed.',label:'Prve vidljive promjene'}],
    skills:[{name:'Google Business optim.',pct:96},{name:'Local Citations',pct:90},{name:'Review management',pct:85},{name:'Local content SEO',pct:88}],
    process:P_SEO
  },

  'seo-onpage': {
    category:'SEO Optimizacija', tag:'Sadržaj & struktura', icon:'📝',
    title:'On-Page SEO',
    subtitle:'Svaka stranica vašeg sajta razgovara s Googleom',
    desc:'On-page SEO je proces koji osigurava da svaka stranica vašeg sajta jasno komunicira Google-u šta nudi, kome je namijenjena i zašto je relevantna. Od meta tagova i heading strukture do internog linkovanja i optimizacije slika — svaki detalj je bitan.',
    desc2:'Naš pristup kombinuje tehničku preciznost s kreativnim pisanjem sadržaja. Ne optimizujemo samo za robote — optimizujemo za ljude koji čitaju, a Google nagraduje sadržaj koji čitaoci cijene i dijele.',
    features:['Keyword research i content mapping','Optimizacija title tagova i meta opisa','Ispravna heading struktura (H1–H6)','Interno linkovanje i URL struktura','Schema markup za rich snippets u pretrazi'],
    time:'2–4 sedmice',
    stats:[{val:'+45%',label:'Prosj. rast organskog prometa'},{val:'Schema',label:'Rich snippets u rezultatima'},{val:'2–4 sed.',label:'Implementacija'}],
    skills:[{name:'Keyword Research',pct:93},{name:'Content Optimization',pct:90},{name:'Technical checks',pct:88},{name:'Schema Markup',pct:85}],
    process:P_SEO
  },

  'seo-tehnicki': {
    category:'SEO Optimizacija', tag:'Core Web Vitals', icon:'🔧',
    title:'Tehnički SEO',
    subtitle:'Temelji bez kojih ni sjajan sadržaj ne rangira',
    desc:'Tehnički SEO su temelji. Bez čiste tehničke osnove, Google ne može ispravno crawlati, razumjeti niti rangirati vaš sajt — bez obzira koliko dobar sadržaj imate. Rješavamo sve što Google vidi "ispod haube": brzinu, crawlabilnost, sigurnost, strukturu podataka.',
    desc2:'Core Web Vitals su od 2021. direktni ranking faktor. Naša optimizacija cilja LCP ispod 2.5s, FID/INP ispod 100ms i CLS ispod 0.1 — standardima koji zadovoljavaju Google-ove zahtjeve za "dobru" korisničku iskustvo.',
    features:['Core Web Vitals optimizacija (LCP, INP, CLS)','XML sitemap, robots.txt i crawl optimizacija','Canonical tagovi i rješavanje duplicate content-a','HTTPS, sigurnost i mixed content rješavanje','Mobile-first indexing optimizacija'],
    time:'2–3 sedmice',
    stats:[{val:'100',label:'PageSpeed cilj'},{val:'< 2.5s',label:'LCP cilj (Core Web Vitals)'},{val:'0',label:'Crawl errora post-implementacija'}],
    skills:[{name:'Core Web Vitals',pct:97},{name:'Crawlability & indexing',pct:92},{name:'HTTPS & sigurnost',pct:94},{name:'Structured data',pct:88}],
    process:P_SEO
  },

  'seo-audit': {
    category:'SEO Optimizacija', tag:'Analiza & plan', icon:'🔍',
    title:'SEO Audit',
    subtitle:'Tačna dijagnoza i prioritizovani plan akcija',
    desc:'Ne znate zašto vam stranica ne rangira ili zašto je promet pao? SEO audit je sveobuhvatna dijagnostika vašeg sajta — tehnička, sadržajna i off-page analiza koja otkriva sve probleme i, što je još važnije, daje jasan prioritizovani plan šta treba popraviti i kojim redoslijedom.',
    desc2:'Naš audit ne isporučujemo kao 50-straničnu PDF zbirku screenshotova iz Semrush-a. Dobijate strukturiran, razumljiv akcioni dokument s konkretnim koracima, procijenjenim uticajem i predloženim rokovima za svaki zadatak.',
    features:['Kompletan tehnički pregled (200+ tačaka)','Analiza sadržaja i keyword gap','Analiza backlink profila i toxic linkova','Competitor analysis (top 3 konkurenta)','Prioritizovani akcioni plan s rokovima'],
    time:'1 sedmica',
    stats:[{val:'200+',label:'Tačaka provjere'},{val:'3',label:'Konkurenta analiziramo'},{val:'1 sed.',label:'Isporuka kompletnog audita'}],
    skills:[{name:'Technical SEO audit',pct:95},{name:'Content gap analysis',pct:88},{name:'Backlink analysis',pct:90},{name:'Competitive research',pct:86}],
    process:P_SEO
  },

  'google-ads': {
    category:'Digitalni Marketing', tag:'Plaćeni promet', icon:'📢',
    title:'Google Ads',
    subtitle:'Vaš oglas tačno u trenutku kada klijent traži vas',
    desc:'Google Ads donosi ciljani promet odmah — za razliku od SEO-a koji gradi rezultate kroz vremena. Pravi Google Ads kampanje donose jasno mjerljiv ROI: znate tačno koliko vas košta jedan lead ili jedna prodaja i možete skalirati ono što funkcioniše.',
    desc2:'Upravljamo Search, Display, Shopping i Video kampanjama. Svaka kampanja prolazi kroz strukturirani setup s negativnim ključnim riječima, ad schedulingom i bid adjustment-ima po uređajima — da se vaš budžet troši što efikasnije.',
    features:['Keyword research i struktura kampanje','Kreiranje i A/B testiranje reklamnih tekstova','Negativne ključne riječi i audience exclusions','Bid optimizacija i smart bidding strategije','Sedmični izvještaj s jasnim ROI metrikama'],
    time:'Ongoing (min. 3 mj)',
    stats:[{val:'340%',label:'Prosječni ROI naših klijenata'},{val:'2.4×',label:'Viši CTR vs. industrijski prosjek'},{val:'Sedmično',label:'Izvještavanje s KPI-jima'}],
    skills:[{name:'Search kampanje',pct:94},{name:'Display & Video',pct:88},{name:'Shopping Ads',pct:86},{name:'Remarketing',pct:91}],
    process:P_MKT
  },

  'facebook-oglas': {
    category:'Digitalni Marketing', tag:'Meta platforma', icon:'👍',
    title:'Facebook Oglašavanje',
    subtitle:'Dosegnite pravu osobu s pravom porukom',
    desc:'Facebook Ads Manager nudi najprecizniji targeting u historiji oglašavanja — po demografiji, interesima, ponašanju, lookalike publici i životnim događajima. Koristimo te mogućnosti da kreiramo kampanje koje grade brend, generišu leade i direktno donose prodaju.',
    desc2:'Naš tim se bavi kompletnim setom: od strateškog planiranja i dizajna kreativa do postavljanja Pixela, upravljanja publikom i sedmičnog izvještavanja. Vi se fokusirate na posao, mi se brinemo o kampanjama.',
    features:['Definisanje i izgradnja ciljnih publike','Kreiranje visual kreativa i kopirajta','Meta Pixel i Conversions API postavljanje','Retargeting kampanje za napuštene kosarice','Analiza rezultata i tjedna optimizacija'],
    time:'Ongoing (min. 3 mj)',
    stats:[{val:'3.2×',label:'Prosječni ROAS naših klijenata'},{val:'Pixel',label:'Precizno praćenje konverzija'},{val:'-35%',label:'Niži CPL vs. neoptimizovane kampanje'}],
    skills:[{name:'Meta Ads Manager',pct:93},{name:'Creative Design',pct:88},{name:'Audience Targeting',pct:95},{name:'Pixel & Tracking',pct:90}],
    process:P_MKT
  },

  'instagram-oglas': {
    category:'Digitalni Marketing', tag:'Visual marketing', icon:'📸',
    title:'Instagram Oglašavanje',
    subtitle:'Zaustavi scroll, privuci pogled, napravi prodaju',
    desc:'Instagram je vizualna platforma gdje dizajn i kreativnost izravno određuju uspjeh kampanje. Kreiramo Stories, Reels i Feed oglase koji se organski uklapaju u feed vaše ciljne publike i pretvaraju pasivne scroll-ere u aktivne kupce.',
    desc2:'Posebno smo fokusirani na Reels format koji trenutno prima 30–40% veći organski reach od ostalih formata. Za biznise s fizičkim produktima, postavljamo Instagram Shopping tagove koji omogućavaju kupovinu direktno iz oglasa.',
    features:['Stories, Reels i Feed format oglasa','Produkcija vizualnog sadržaja za svaki format','Instagram Shopping tagging','Influencer suradnja (identifikacija + outreach)','Analitika dosega, engage i konverzija'],
    time:'Ongoing (min. 3 mj)',
    stats:[{val:'+120%',label:'Prosj. rast reach-a'},{val:'Reels',label:'Format s najvećim organskim reach-om'},{val:'Shopping',label:'Direktna kupovina iz oglasa'}],
    skills:[{name:'Visual Content Creation',pct:90},{name:'Stories & Reels',pct:88},{name:'Influencer strategy',pct:78},{name:'Instagram Shopping',pct:85}],
    process:P_MKT
  },

  'content-marketing': {
    category:'Digitalni Marketing', tag:'Dugoročni rast', icon:'✍️',
    title:'Content Marketing',
    subtitle:'Sadržaj koji educira, privlači i konvertira',
    desc:'Za razliku od plaćenih oglasa koji prestaju donositi promet čim prestanete plaćati, dobar sadržaj radi za vas godinama. Pravimo blog postove, vodiče i studije slučaja koji pozicioniraju vašu firmu kao autoritet u industriji i donose organski promet s Googlea.',
    desc2:'Content marketing daje najveće rezultate kada je kombiniran s SEO-om: identificiramo teme koje vaša ciljana publika traži, a konkurencija loše pokriva, i pravimo superioran sadržaj koji osvaja te pozicije.',
    features:['Keyword-driven content strategija','SEO-optimizirani blog postovi i vodiči','Case studies i success stories klijenata','Email newsletter sekvence za nurturing','Distribucija sadržaja kroz kanale'],
    time:'Ongoing (min. 3 mj)',
    stats:[{val:'+85%',label:'Prosj. rast organskog prometa (6 mj)'},{val:'3×',label:'Viši engagement vs. promocijski sadržaj'},{val:'Evergreen',label:'Sadržaj koji radi godinama'}],
    skills:[{name:'SEO Copywriting',pct:93},{name:'Content Strategija',pct:90},{name:'Distribucija & promotion',pct:85},{name:'Analytics & mjerenje',pct:88}],
    process:P_MKT
  },

  'sigurnosno-odrzavanje': {
    category:'Održavanje i Podrška', tag:'Sigurnost 24/7', icon:'🛡️',
    title:'Sigurnosno Održavanje',
    subtitle:'Vaša web stranica sigurna i ažurna — bez vaše brige',
    desc:'Hakeri napadaju WordPress sajtove automatizovanim botovima svakog sata. Zastarjeli plugin, stara PHP verzija ili slaba lozinka dovoljni su da preuzmu kontrolu nad vašim sajtom. Naš sigurnosni paket spriječava to — proaktivno, ne reaktivno.',
    desc2:'Uključujemo uptime monitoring svakih 5 minuta: ako vaš sajt padne, saznamo u roku od 5 minuta i odmah reagujemo. Svaki sedmični backup čuva se na odvojenoj cloud lokaciji, što znači da u najgorem scenariju gubite maksimalno 7 dana rada.',
    features:['Sedmični encrypted backup na cloud storage','Ažuriranje WordPress core, tema i plugina','Malware skeniranje i hitno uklanjanje','SSL certifikat i HTTPS nadzor','Uptime monitoring (obavijest za <15 min)'],
    time:'Månadsna pretplata',
    stats:[{val:'99.9%',label:'Garantovani uptime'},{val:'< 15 min',label:'Reakcija na incident'},{val:'Sedmično',label:'Backup i sigurnosni scan'}],
    skills:[{name:'WordPress Security',pct:95},{name:'Malware removal',pct:92},{name:'Performance monitoring',pct:88},{name:'Backup management',pct:94}],
    process:P_MAINT
  },

  'speed-optimizacija': {
    category:'Održavanje i Podrška', tag:'Performanse', icon:'🚀',
    title:'Speed Optimizacija',
    subtitle:'Svaka sekunda brzine donosi više konverzija',
    desc:'Istraživanja pokazuju da svaka sekunda kašnjenja smanjuje konverzije za 7% i bounce rate povećava za 11%. Google PageSpeed score direktno utiče na SEO rangiranje od 2021. Optimizujemo vašu stranicu da dosegne 90+ score i ispuni sve Core Web Vitals zahtjeve.',
    desc2:'Naša optimizacija ne zaustavlja se na jednoj primjeni — isporučujemo detaljni izvještaj prije i poslije, s objašnjenjem svake izmjene. Sve optimizacije su reverzibilne i dobro dokumentovane.',
    features:['Image optimizacija i konverzija u WebP/AVIF format','Server i browser caching konfiguracija','CDN integracija za globalni delivery','CSS/JS minifikacija i lazy loading','WordPress database čišćenje i optimizacija'],
    time:'3–7 dana',
    stats:[{val:'90+',label:'PageSpeed score cilj'},{val:'-60%',label:'Prosj. smanjenje load time-a'},{val:'3–7 dana',label:'Kompletna optimizacija'}],
    skills:[{name:'Image Optimization',pct:94},{name:'Caching strategies',pct:92},{name:'CDN setup',pct:88},{name:'Code minification',pct:90}],
    process:P_MAINT
  }
};

// ── INDUSTRIES DATA ────────────────────────────────────────
const P_IND = [
  { n:'01', title:'Analiza vašeg biznisa', desc:'Razgovaramo o vašim ciljevima, ciljnoj publici i specifičnostima industrije. Gledamo što radi konkurencija.' },
  { n:'02', title:'Strategija & prijedlog', desc:'Kreiramo prijedlog koji adresira specifične potrebe vaše industrije — ne generički template.' },
  { n:'03', title:'Dizajn & razvoj',        desc:'Gradimo rješenje koje odražava vaš brend i ispunjava industrijske standarde i očekivanja korisnika.' },
  { n:'04', title:'Lansiranje & rast',      desc:'Nakon lansiranja pratimo performanse i proaktivno predlažemo poboljšanja na osnovu podataka.' }
];

const INDUSTRIES = {

  'ecommerce': {
    tag:'Industrija', icon:'🛍️',
    title:'E-commerce',
    subtitle:'Online prodavnice koje ostvaruju prihod 24/7',
    desc:'Online prodaja u regiji raste svake godine, a granica između "dobar shop" i "loš shop" se jasno odražava u konverzijama. Pravimo e-commerce rješenja koja kombinuju atraktivan dizajn, brzo učitavanje i pametnu strukturu kategorija i produkt stranica.',
    desc2:'Iz iskustva s desecima e-commerce projekata znamo da je mobilni checkout najkritičnija tačka: 70% korisnika istražuje na mobitelu, ali 60% ih napusti checkout koji nije optimiziran za touch. Tome posvećujemo posebnu pažnju.',
    features:['Web shopovi dizajnirani da konvertiraju','Mobilni checkout optimiziran za touch (70% kupovina)','Integracija s lokalnim payment gatewayima','Product SEO za organski promet iz pretrage','Automatizacija narudžbi i upravljanje zalihama'],
    time:null,
    stats:[{val:'3×',label:'Viša konverzija vs. template shopovi'},{val:'70%',label:'Kupovina dolazi s mobitela'},{val:'24/7',label:'Prihodi bez vašeg angažmana'}],
    skills:[{name:'E-commerce UX/UI',pct:94},{name:'WooCommerce / Custom',pct:92},{name:'Product SEO',pct:88},{name:'Mobile Checkout optim.',pct:95}],
    process:P_IND
  },

  'ugostiteljstvo': {
    tag:'Industrija', icon:'🍽️',
    title:'Ugostiteljstvo',
    subtitle:'Restorani, kafići i hoteli koji pune rezervacije',
    desc:'Vaši gosti traže vas online prije nego što uđu kroz vrata — čitaju recenzije, gledaju fotografije hrane i ambijenta, provjeravaju radno vrijeme. Ako vaša web stranica ne ostavlja dobar utisak, otići će kod konkurencije. Pravimo sajtove koji pričaju priču vašeg mjesta.',
    desc2:'Specijalizirali smo se za online rezervacijske sisteme za restorane i hotele koji se sinkroniziraju s Google Kalendarom i šalju automatske podsjetnikedove gostima — što smanjuje no-showove i do 45%.',
    features:['Online meni s fotografijama i opisima jela','Rezervacijski sistem za stolove i događaje','Google Maps integracija i lokalni SEO','Mobilna optimizacija (gosti pretražuju na putu)','Integracija s delivery platformama (Wolt, Glovo)'],
    time:null,
    stats:[{val:'+45%',label:'Više online rezervacija'},{val:'30+',label:'Ugostiteljskih projekata'},{val:'-30%',label:'Manje no-showova (automatski podsjetnici)'}],
    skills:[{name:'Restaurant / Hotel UX',pct:92},{name:'Online Booking sistemi',pct:90},{name:'Food Photography integ.',pct:88},{name:'Local SEO',pct:94}],
    process:P_IND
  },

  'zdravstvo': {
    tag:'Industrija', icon:'🏥',
    title:'Zdravstvo',
    subtitle:'Klinike, ordinacije i wellness centri koji inspirišu povjerenje',
    desc:'Pacijenti biraju doktora ili kliniku na osnovu online prisutnosti — i povjerenje je sve. Vaša web stranica mora biti profesionalna, informativna i laka za navigaciju. Online booking termina smanjuje opterećenje recepcije i omogućava pacijentima da biraju termin u bilo koje doba dana.',
    desc2:'Sva naša zdravstvena rješenja su GDPR-usklađena — posebno važno za prikupljanje i obradu medicinskih podataka. Web prisupačnost (WCAG 2.1) je standard kojeg se pridržavamo, jer starija populacija čini velik udio pacijenata.',
    features:['Online booking termina (24/7 dostupno)','Prikaz tima doktora sa specijalnostima','GDPR-usklađeno prikupljanje podataka','Web pristupačnost (WCAG 2.1 standard)','Google My Business optimizacija za lokalnu pretragu'],
    time:null,
    stats:[{val:'+65%',label:'Više online bookinga'},{val:'GDPR',label:'Kompletna usklađenost'},{val:'WCAG',label:'Pristupačnost za sve korisnike'}],
    skills:[{name:'Medical/Health UX',pct:90},{name:'Online Booking sistemi',pct:92},{name:'GDPR Compliance',pct:95},{name:'Lokalni SEO',pct:88}],
    process:P_IND
  },

  'profesionalne-usluge': {
    tag:'Industrija', icon:'💼',
    title:'Profesionalne Usluge',
    subtitle:'Advokati, agencije i konsultanti koji osvajaju povjerenje',
    desc:'Klijenti angažuju advokate, konsultante i agencije na osnovu povjerenja i percipirane ekspertize. Vaša web stranica mora komunicirati i jedno i drugo — kroz čist, profesionalan dizajn, jasno prikazane rezultate i jednostavan kontakt koji ne plaši potencijalne klijente.',
    desc2:'B2B odluke o kupovini duže traju i uključuju više osoba. Stranice za profesionalne usluge trebaju jasan sadržaj koji educira decision-makere, case studies koji demonstriraju rezultate i pozicioniranje koje vas razlikuje od stotina sličnih firmi.',
    features:['Profesionalni dizajn koji gradi povjerenje odmah','Case studies i rezultati klijenata','Kontakt forma i Calendly integracija za booking','Blog za SEO pozicioniranje kao eksperta','B2B SEO strategija za LinkedIn i Google'],
    time:null,
    stats:[{val:'+80%',label:'Više inbound leada'},{val:'B2B',label:'Optimizirano za dugačke prodajne cikluse'},{val:'Trust',label:'Dizajn koji konvertira skeptike'}],
    skills:[{name:'B2B Branding & Design',pct:93},{name:'Case Study prezentacija',pct:85},{name:'Lead Generation UX',pct:90},{name:'B2B SEO',pct:88}],
    process:P_IND
  }
};

// ── RENDERER ──────────────────────────────────────────────
(function () {
  // ① Whitelist valid IDs — prevents prototype pollution via ?id=__proto__
  const VALID_SERVICE_IDS  = new Set(Object.keys(SERVICES));
  const VALID_INDUSTRY_IDS = new Set(Object.keys(INDUSTRIES));

  const params   = new URLSearchParams(window.location.search);
  const rawId    = params.get('id') || '';
  const pageType = document.body.dataset.type; // 'service' | 'industry'

  // ② Strict format check: only lowercase letters, digits, hyphens, 1–60 chars
  const id = /^[a-z0-9-]{1,60}$/.test(rawId) ? rawId : '';

  // ③ Explicit whitelist lookup — never touches Object prototype
  const validSet = pageType === 'service' ? VALID_SERVICE_IDS : VALID_INDUSTRY_IDS;
  if (!id || !validSet.has(id)) { window.location.replace('../index.html'); return; }

  const data = pageType === 'service' ? SERVICES[id] : INDUSTRIES[id];

  // ── Helpers — textContent only, no innerHTML ──────────────
  const el  = id => document.getElementById(id);
  const set = (id, val) => { const e = el(id); if (e) e.textContent = String(val ?? ''); };

  function mk(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = String(txt);
    return e;
  }

  // Title tag — set via textContent on a text node to avoid injection
  document.title = data.title + ' — MotionVibe';

  // Text fields
  set('pageTag',    data.tag || data.category || '');
  set('pageTitle',  data.title);
  set('titleCrumb', data.title);
  set('pageSub',    data.subtitle);
  set('pageDesc',   data.desc);
  set('pageCrumb',  pageType === 'service' ? 'Usluge' : 'Industrije');

  const d2 = el('desc2');
  if (d2) {
    if (data.desc2) { d2.textContent = data.desc2; d2.style.display = ''; }
    else              d2.style.display = 'none';
  }

  // Features
  const ul = el('pageFeatures');
  if (ul) data.features.forEach(f => ul.appendChild(mk('li', null, f)));

  // Time
  const timeEl = el('pageTime');
  if (timeEl) {
    if (data.time) { timeEl.textContent = '⏱  Trajanje: ' + data.time; timeEl.style.display = ''; }
    else             timeEl.style.display = 'none';
  }

  // Stats — pure DOM, no innerHTML
  const statsEl = el('pvStats');
  if (statsEl && data.stats) {
    data.stats.forEach((s, i) => {
      const div = mk('div', 'pv-stat');
      div.style.animationDelay = (0.35 + i * 0.15) + 's';
      div.appendChild(mk('div', 'pv-stat-val',   s.val));
      div.appendChild(mk('div', 'pv-stat-label', s.label));
      statsEl.appendChild(div);
    });
  }

  // Skill bars — pure DOM, no innerHTML
  const skillsEl = el('pvSkills');
  if (skillsEl && data.skills) {
    data.skills.forEach(skill => {
      const pct = Math.min(100, Math.max(0, Number(skill.pct) || 0));

      const row = mk('div', 'pv-skill-row');
      row.appendChild(mk('span', 'pv-skill-name', skill.name));
      row.appendChild(mk('span', 'pv-skill-pct',  pct + '%'));

      const fill = mk('div', 'pv-skill-fill');
      fill.dataset.pct = pct;

      const track = mk('div', 'pv-skill-track');
      track.appendChild(fill);

      const div = mk('div', 'pv-skill');
      div.appendChild(row);
      div.appendChild(track);
      skillsEl.appendChild(div);
    });

    setTimeout(() => {
      document.querySelectorAll('.pv-skill-fill').forEach(f => {
        f.style.width = f.dataset.pct + '%';
      });
    }, 350);
  }

  // Process steps — pure DOM, no innerHTML
  const procEl = el('processGrid');
  if (procEl && data.process) {
    data.process.forEach(step => {
      const div = mk('div', 'process-item');
      div.appendChild(mk('div', 'process-num',   step.n));
      div.appendChild(mk('div', 'process-title', step.title));
      div.appendChild(mk('div', 'process-desc',  step.desc));
      procEl.appendChild(div);
    });
  }
})();
