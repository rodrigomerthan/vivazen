// Gera as páginas por tema, o sitemap.xml e o llms.txt a partir de _fonte/paginas.js.
// Cabeçalho, rodapé e CSS vêm do index.html, então mudanças visuais na home valem aqui também.
// Uso: node _fonte/gerar-paginas.js
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const SITE = 'https://clinicavivazen.com.br';
const HOJE = new Date().toISOString().slice(0, 10);
const WHATS = 'https://wa.me/5561995901212';
const FOTO = '/img/dra-fatima-della-corte.jpg';
const PERFIL_GOOGLE = 'https://www.google.com/search?kgmid=/g/11ltxfcdwn';

const paginas = require('./paginas');
const home = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/\r\n/g, '\n');

const pega = (re) => { const m = home.match(re); if (!m) throw new Error('não achei ' + re); return m[0]; };
const css = pega(/<style>[\s\S]*?<\/style>/).replace(/^<style>|<\/style>$/g, '');
const fontes = pega(/<link rel="preconnect"[\s\S]*?rel="stylesheet">/);
const csp = pega(/<meta http-equiv="Content-Security-Policy"[^>]*>/);
// links da home viram links para a home (/#secao), sem o scroll via JS
const absoluto = (html) => html
  .replace(/href="#(\w+)" onclick="goTo\('\w+'\);return false;"/g, 'href="/#$1"')
  .replace(/<a href="#sobre"/g, '<a href="/#sobre"');
const cabecalho = absoluto(pega(/<header id="header">[\s\S]*?<\/header>/))
  .replace('<span class="logo-name serif">Viva Zen</span>', '<a href="/" class="logo-link"><span class="logo-name serif">Viva Zen</span></a>');
const rodape = absoluto(pega(/<footer>[\s\S]*?<\/footer>/));
const whatsFlutuante = pega(/<a href="https:\/\/wa\.me\/5561995901212" target="_blank" class="whatsapp-float"[\s\S]*?<\/a>/);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const semTags = (s) => s.replace(/<[^>]+>/g, '');

const MEDICA = {
  '@type': 'Physician',
  '@id': `${SITE}/#dra-fatima`,
  name: 'Dra. Maria de Fátima Della Côrte',
  url: `${SITE}/dra-fatima-della-corte/`,
  image: SITE + FOTO,
};
const CLINICA = { '@type': 'MedicalClinic', '@id': `${SITE}/#clinica`, name: 'Viva Zen Centro Médico Integrado', url: `${SITE}/` };

const CSS_TEMA = `
.logo-link { text-decoration: none; color: inherit; }
.tp { max-width: 820px; margin: 0 auto; padding: 128px 5% 96px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 56px; }
.tp section { padding: 0; }
.tp a:not(.btn-primary) { color: var(--sage); }
.tp .btn-primary { white-space: normal; text-align: center; justify-content: center; line-height: 1.5; }
.tp-crumbs { font-size: 0.75rem; color: var(--light); display: flex; flex-wrap: wrap; gap: 6px; }
.tp-crumbs a { color: var(--light); text-decoration: none; }
.tp-crumbs a:hover { color: var(--sage); }
.tp-hero { display: grid; gap: 20px; }
.tp-kicker { font-size: 0.68rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--sage); }
.tp-hero h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 300; }
.tp-hero h1 em { color: var(--sage); }
.tp-resposta { font-size: 1.05rem; line-height: 1.85; color: var(--charcoal); font-weight: 300; border-left: 2px solid var(--sage-pale); padding-left: 18px; }
.tp-resp { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: var(--mid); }
.tp-resp img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; object-position: center top; }
.tp-hero .btn-primary { justify-self: start; }
.tp-secao { display: grid; gap: 14px; }
.tp-secao h2, .tp-faq h2 { font-size: clamp(1.6rem, 3vw, 2.1rem); font-weight: 400; }
.tp-secao p, .tp-secao li { font-size: 0.97rem; line-height: 1.85; color: var(--mid); font-weight: 300; }
.tp-secao ul { padding-left: 20px; display: grid; gap: 2px; }
.tp-steps { list-style: none; display: grid; gap: 16px; counter-reset: passo; }
.tp-steps li { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 14px; counter-increment: passo; }
.tp-steps li::before { content: counter(passo); width: 30px; height: 30px; border: 1px solid var(--sage); border-radius: 50%; display: grid; place-items: center; font-family: 'Cormorant Garamond', Georgia, serif; color: var(--sage); font-size: 1rem; }
.tp-steps b { font-weight: 500; color: var(--charcoal); }
.tp-faq { display: grid; gap: 14px; }
.tp-faq details { border-bottom: 1px solid var(--border); padding: 16px 0; }
.tp-faq details:first-of-type { border-top: 1px solid var(--border); }
.tp-faq summary { cursor: pointer; font-size: 0.97rem; font-weight: 500; color: var(--charcoal); }
.tp-faq summary:focus-visible { outline: 2px solid var(--sage); outline-offset: 3px; }
.tp-faq details p { margin-top: 10px; font-size: 0.93rem; line-height: 1.8; color: var(--mid); font-weight: 300; }
.tp-autora { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 20px; background: var(--sage-pale); padding: 26px; align-items: start; }
.tp-autora img { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; object-position: center top; }
.tp-autora strong { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.35rem; font-weight: 500; display: block; margin-bottom: 6px; }
.tp-autora p { font-size: 0.87rem; line-height: 1.75; color: var(--mid); font-weight: 300; }
.tp-rel { display: flex; flex-wrap: wrap; gap: 10px; }
.tp-rel a { border: 1px solid var(--sage); padding: 9px 16px; font-size: 0.82rem; text-decoration: none; }
.tp-rel a:hover { background: var(--sage); color: white; }
.tp-foto { width: 100%; max-width: 360px; aspect-ratio: 2 / 3; object-fit: cover; object-position: center top; }
@media (max-width: 600px) { .tp { padding-top: 104px; } .tp-autora { grid-template-columns: 1fr; } }
`;

function cabeca(p, url, schema) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
${csp}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.title}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Viva Zen Centro Médico Integrado">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${SITE}${FOTO}">
<meta name="twitter:card" content="summary_large_image">
${fontes}
<style>${css}${CSS_TEMA}</style>
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>

${cabecalho}
`;
}

function corpoFinal() {
  return `
${rodape}

${whatsFlutuante}

<script>
var EMAIL = 'vivazenacupuntura' + '@' + 'gmail.com';
function fillEmails() {
  var spans = document.querySelectorAll('.js-email');
  for (var i = 0; i < spans.length; i++) {
    var a = document.createElement('a');
    a.href = 'mailto:' + EMAIL;
    a.textContent = EMAIL;
    spans[i].parentNode.replaceChild(a, spans[i]);
  }
}
function toggleNav() {
  var nav = document.getElementById('nav');
  nav.classList.contains('open') ? nav.classList.remove('open') : nav.classList.add('open');
}
window.onload = fillEmails;
</script>
</body>
</html>
`;
}

const porSlug = Object.fromEntries(paginas.map((p) => [p.slug, p]));
porSlug['dra-fatima-della-corte'] = { slug: 'dra-fatima-della-corte', nome: 'Dra. Maria de Fátima Della Côrte' };
const urlDe = (slug) => `${SITE}/${slug}/`;

function migalhas(p) {
  const itens = [['Início', '/']];
  if (p.pai) itens.push([porSlug[p.pai].nome, `/${p.pai}/`]);
  else if (p.slug !== 'dra-fatima-della-corte') itens.push(['Especialidades', '/#servicos']);
  itens.push([p.nome]);
  const html = itens.map(([n, h], i) => (h ? `<a href="${h}">${n}</a>` : `<span aria-current="page">${n}</span>`) + (i < itens.length - 1 ? ' <span aria-hidden="true">›</span>' : '')).join(' ');
  const schema = {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: h ? SITE + h.replace('/#servicos', '/') : urlDe(p.slug) })),
  };
  return { html: `<div class="tp-crumbs" role="navigation" aria-label="Você está em">${html}</div>`, schema };
}

function faqHtml(faq) {
  return `<section class="tp-faq">
    <h2>Perguntas frequentes</h2>
    ${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n    ')}
  </section>`;
}
const faqSchema = (faq) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: semTags(a) } })),
});

const AUTORA = `<aside class="tp-autora">
    <img src="${FOTO}" alt="Dra. Maria de Fátima Della Côrte" width="88" height="88" loading="lazy">
    <div>
      <strong>Dra. Maria de Fátima Della Côrte</strong>
      <p>Médica pela Universidade Federal de Goiás, com residência em Pediatria (RQE 2196) e pós-graduação em Acupuntura (RQE 20577) e Homeopatia (RQE 7565). Responsável Técnica Distrital de Homeopatia na Secretaria de Saúde do DF e integrante da Câmara Técnica de Homeopatia do CFM. CRM-DF 9170.</p>
      <p><a href="/dra-fatima-della-corte/">Conheça a doutora</a></p>
    </div>
  </aside>`;

function relacionadas(slugs) {
  return `<section class="tp-secao">
    <span class="tp-kicker">Veja também</span>
    <div class="tp-rel">${slugs.map((s) => `<a href="/${s}/">${porSlug[s].nome}</a>`).join('')}</div>
  </section>`;
}

function paginaTema(p) {
  const url = urlDe(p.slug);
  const m = migalhas(p);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': url,
        url,
        name: p.title,
        description: p.desc,
        inLanguage: 'pt-BR',
        about: { '@type': 'MedicalCondition', name: p.sobre },
        author: { '@id': MEDICA['@id'] },
        lastReviewed: HOJE,
        isPartOf: { '@type': 'WebSite', url: `${SITE}/`, name: 'Viva Zen Centro Médico Integrado' },
        publisher: { '@id': CLINICA['@id'] },
        breadcrumb: m.schema,
      },
      faqSchema(p.faq),
      MEDICA,
      CLINICA,
    ],
  };
  // especialidade não é condição: troca o tipo do "about"
  if (!p.pai) schema['@graph'][0].about = { '@type': 'MedicalSpecialty', name: p.sobre };

  return cabeca(p, url, schema) + `
<main class="tp">
  ${m.html}

  <section class="tp-hero">
    <span class="tp-kicker">${p.kicker}</span>
    <h1>${p.h1}</h1>
    <p class="tp-resposta">${p.resposta}</p>
    <div class="tp-resp"><img src="${FOTO}" alt="" width="36" height="36">Responsável técnica: Dra. Maria de Fátima Della Côrte · CRM-DF 9170</div>
    <a href="${WHATS}" target="_blank" class="btn-primary">Agendar avaliação pelo WhatsApp</a>
  </section>

  ${p.secoes.map(([h, html]) => `<section class="tp-secao">
    <h2>${h}</h2>
    ${html}
  </section>`).join('\n\n  ')}

  ${faqHtml(p.faq)}

  ${AUTORA}

  ${relacionadas(p.relacionadas)}
</main>
` + corpoFinal();
}

function paginaMedica() {
  const p = {
    slug: 'dra-fatima-della-corte',
    nome: 'Dra. Maria de Fátima Della Côrte',
    title: 'Dra. Maria de Fátima Della Côrte · Pediatra, homeopata e acupunturista em Brasília',
    desc: 'Dra. Maria de Fátima Della Côrte (CRM-DF 9170): pediatra, homeopata e acupunturista com mais de 35 anos de atuação. Atende na Viva Zen, Asa Sul, Brasília.',
  };
  const faq = [
    ['Onde a Dra. Fátima atende?', 'Na Viva Zen Centro Médico Integrado: SEP/SUL QD 714/914, Conjunto D, Sala 232, Asa Sul, Brasília/DF.'],
    ['Como agendar uma consulta?', 'Pelo WhatsApp (61) 99590-1212.'],
    ['A doutora atende por convênio?', 'Não. O atendimento é particular. Dependendo do plano, o paciente pode pedir reembolso ao convênio com a nota fiscal e o relatório médico.'],
  ];
  const url = urlDe(p.slug);
  const m = migalhas(p);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'ProfilePage', '@id': url, url, name: p.title, description: p.desc, inLanguage: 'pt-BR', mainEntity: { '@id': MEDICA['@id'] }, breadcrumb: m.schema },
      {
        ...MEDICA,
        description: 'Pediatra, homeopata e acupunturista com mais de 35 anos de atuação, em Brasília.',
        telephone: '+55-61-99590-1212',
        medicalSpecialty: ['Pediatric'],
        knowsAbout: ['Homeopatia', 'Acupuntura', 'Pediatria', 'Medicina Integrativa'],
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidade Federal de Goiás' },
        identifier: [
          { '@type': 'PropertyValue', propertyID: 'CRM-DF', value: '9170' },
          { '@type': 'PropertyValue', propertyID: 'RQE Pediatria', value: '2196' },
          { '@type': 'PropertyValue', propertyID: 'RQE Acupuntura', value: '20577' },
          { '@type': 'PropertyValue', propertyID: 'RQE Homeopatia', value: '7565' },
        ],
        memberOf: { '@type': 'Organization', name: 'Câmara Técnica de Homeopatia do Conselho Federal de Medicina' },
        worksFor: { '@id': CLINICA['@id'] },
      },
      faqSchema(faq),
      CLINICA,
    ],
  };
  return cabeca(p, url, schema) + `
<main class="tp">
  ${m.html}

  <section class="tp-hero">
    <span class="tp-kicker">Pediatria · Homeopatia · Acupuntura</span>
    <h1>Dra. Maria de Fátima <em>Della Côrte</em></h1>
    <p class="tp-resposta">Médica formada pela Universidade Federal de Goiás em 1990, pediatra, homeopata e acupunturista, com mais de 35 anos de atuação. Atende na Viva Zen Centro Médico Integrado, na Asa Sul, em Brasília. CRM-DF 9170.</p>
    <img class="tp-foto" src="${FOTO}" alt="Dra. Maria de Fátima Della Côrte" width="1024" height="1536">
    <a href="${WHATS}" target="_blank" class="btn-primary">Agendar consulta pelo WhatsApp</a>
  </section>

  <section class="tp-secao">
    <h2>Formação e registros</h2>
    <ul>
      <li>Medicina pela Universidade Federal de Goiás, 1990 · CRM-DF 9170</li>
      <li>Residência em Pediatria no Hospital Geral de Goiânia (HGG) · RQE 2196</li>
      <li>Pós-graduação em Acupuntura · RQE 20577</li>
      <li>Pós-graduação em Homeopatia · RQE 7565</li>
      <li>Pós-graduação em Medicina Integrativa</li>
    </ul>
  </section>

  <section class="tp-secao">
    <h2>Atuação</h2>
    <ul>
      <li>Responsável Técnica Distrital de Homeopatia na Secretaria de Saúde do DF</li>
      <li>Integrante da Câmara Técnica de Homeopatia do Conselho Federal de Medicina (CFM)</li>
    </ul>
  </section>

  <section class="tp-secao">
    <h2>Como ela atende</h2>
    <p>"Cada paciente é único em sua forma de adoecer e de se restabelecer. Tratar o indivíduo em sua totalidade faz toda a diferença num processo real e sustentável de promoção de saúde."</p>
    <p>A abordagem une precisão diagnóstica e escuta aprofundada. Cada paciente é compreendido em sua totalidade física, emocional e funcional, com atenção à sua história e à forma própria de adoecer. O cuidado é orientado pela tradição da medicina chinesa e pela Escola Hahnemanniana da homeopatia.</p>
  </section>

  ${faqHtml(faq)}

  ${relacionadas(['acupuntura-brasilia', 'homeopatia-brasilia', 'pediatra-homeopata-brasilia'])}
</main>
` + corpoFinal();
}

const gerar = (slug, html) => {
  const dir = path.join(RAIZ, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
};
for (const p of paginas) gerar(p.slug, paginaTema(p));
gerar('dra-fatima-della-corte', paginaMedica());

// sitemap
const urls = [`${SITE}/`, ...paginas.slice(0, 3).map((p) => urlDe(p.slug)), urlDe('dra-fatima-della-corte'), ...paginas.slice(3).map((p) => urlDe(p.slug))];
fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${HOJE}</lastmod>\n  </url>`).join('\n')}
</urlset>
`);

// llms.txt: resumo para assistentes de IA (formato llmstxt.org)
fs.writeFileSync(path.join(RAIZ, 'llms.txt'), `# Viva Zen Centro Médico Integrado

> Consultório da Dra. Maria de Fátima Della Côrte (CRM-DF 9170) na Asa Sul, Brasília/DF. Atendimento médico adulto e infantil em acupuntura médica (RQE 20577), homeopatia (RQE 7565) e pediatria (RQE 2196). Atendimento particular, sem convênio. Agendamento pelo WhatsApp (61) 99590-1212.

- Endereço: SEP/SUL QD 714/914, Conjunto D, Sala 232, Asa Sul, Brasília/DF, CEP 70390-145
- Médica: Dra. Maria de Fátima Della Côrte, formada pela Universidade Federal de Goiás (1990), residência em Pediatria no Hospital Geral de Goiânia, pós-graduação em Acupuntura, Homeopatia e Medicina Integrativa
- Responsável Técnica Distrital de Homeopatia na Secretaria de Saúde do DF e integrante da Câmara Técnica de Homeopatia do Conselho Federal de Medicina
- Perfil no Google: ${PERFIL_GOOGLE}

## Especialidades

- [Acupuntura médica](${urlDe('acupuntura-brasilia')}): adultos e crianças; dores, enxaqueca, ansiedade, insônia, pós-operatório, paralisia facial, neuralgia do trigêmeo
- [Homeopatia](${urlDe('homeopatia-brasilia')}): Escola Hahnemanniana; alergias, rinites, asma, doenças de pele, enxaqueca
- [Pediatria e pediatra homeopata](${urlDe('pediatra-homeopata-brasilia')}): bebês a adolescentes; cólicas, refluxo, alergias, infecções recorrentes, sono, TDAH, autismo (TEA)

## Temas

- [Acupuntura para enxaqueca](${urlDe('acupuntura-enxaqueca')})
- [Acupuntura para ansiedade e insônia](${urlDe('acupuntura-ansiedade-insonia')})
- [Homeopatia para rinite e alergia infantil](${urlDe('homeopatia-alergia-rinite-infantil')})

## Sobre

- [Dra. Maria de Fátima Della Côrte](${urlDe('dra-fatima-della-corte')})
- [Página inicial](${SITE}/)
`);

console.log('geradas', paginas.length + 1, 'páginas,', urls.length, 'URLs no sitemap');
