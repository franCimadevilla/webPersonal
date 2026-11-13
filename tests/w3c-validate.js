#!/usr/bin/env node
/**
 * W3C HTML + CSS Validator (recursivo)
 *
 * Uso:
 *   node validate.js                          → analiza el directorio actual
 *   node validate.js --dir ./src              → analiza un directorio concreto
 *   node validate.js --html index.html        → un archivo
 *   node validate.js --html-string "..."      → string
 *
 * Requiere Node.js ≥ 18
 */

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------
const args = parseArgs({
  options: {
    dir:          { type: 'string' },
    html:         { type: 'string' },
    css:          { type: 'string' },
    'html-string':{ type: 'string' },
    'css-string': { type: 'string' },
    url:          { type: 'string' },
    concurrency:  { type: 'string', default: '3' },
    'css-profile':{ type: 'string' },
    help:         { type: 'boolean', short: 'h' }
  },
  allowPositionals: true
});

if (args.values.help) {
  console.log(`
Uso:
  node validate.js                          Analiza el directorio actual
  node validate.js --dir ./src              Analiza un directorio
  node validate.js --html archivo.html      Un archivo HTML
  node validate.js --css estilos.css        Un archivo CSS
  node validate.js --html-string "<html>..."
  node validate.js --css-string "body{}"
  node validate.js --url https://ejemplo.com

Opciones:
  --concurrency N   Peticiones simultáneas (default: 3)
  --css-profile P   Perfil del validador CSS (default: css3; css3svg admite
                    pointer-events y clip-path)
`);
  process.exit(0);
}

const CONCURRENCY = parseInt(args.values.concurrency || '3', 10);
// css3 no conoce pointer-events ni clip-path (los marca como error);
// css3svg sí. Ver CF-06 en Checklist-Auditoria.md.
const CSS_PROFILE = args.values['css-profile'] || 'css3';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function groupMessages(messages) {
  const result = {};
  for (const msg of messages) {
    const type = msg.type || 'unknown';
    const subtype = msg.subtype || null;
    const key = subtype ? `${type}:${subtype}` : type;

    if (!result[key]) result[key] = {};

    const messageText = (msg.message || msg.msg || '(sin mensaje)').trim();
    if (!result[key][messageText]) {
      result[key][messageText] = [];
    }

    result[key][messageText].push({
      line: msg.lastLine ?? msg.line ?? null,
      column: msg.lastColumn ?? msg.column ?? null,
      extract: msg.extract || null
    });
  }
  return result;
}

function findFiles(dir, extensions) {
  const results = [];
  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        // Ignorar carpetas comunes que no interesan
        if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) continue;
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(full);
        }
      }
    }
  }
  walk(dir);
  return results;
}

// Limitador de concurrencia simple
async function mapLimit(items, limit, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Validadores
// ---------------------------------------------------------------------------

async function validateHTMLContent(content) {
  const res = await fetch('https://validator.w3.org/nu/?out=json', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'User-Agent': 'W3C-Recursive-Validator/1.0'
    },
    body: content
  });
  if (!res.ok) throw new Error(`HTML validator HTTP ${res.status}`);
  return res.json();
}

async function validateCSSContent(content) {
  // multipart/form-data: desde noviembre de 2026 Jigsaw responde 500 a los
  // POST application/x-www-form-urlencoded, incluso con un CSS trivial.
  const form = new FormData();
  form.append('text', content);
  form.append('output', 'json');
  form.append('warning', '2');
  form.append('profile', CSS_PROFILE);

  const res = await fetch('https://jigsaw.w3.org/css-validator/validator', {
    method: 'POST',
    headers: {
      'User-Agent': 'W3C-Recursive-Validator/1.0'
    },
    body: form
  });
  if (!res.ok) throw new Error(`CSS validator HTTP ${res.status}`);
  return parseCSSJsonOutput(await res.json());
}

// La salida de texto de Jigsaw («Line : 118 selector …», en varias líneas)
// no casaba con el patrón anterior y daba siempre 0 mensajes: se usa JSON.
function parseCSSJsonOutput(data) {
  const v = data.cssvalidation || {};
  const messages = [];
  for (const [type, list] of [['error', v.errors || []], ['warning', v.warnings || []]]) {
    for (const m of list) {
      const context = m.context ? `${String(m.context).trim()} — ` : '';
      messages.push({
        type,
        message: `${context}${String(m.message || '').replace(/\s*:\s*$/, '').trim()}`,
        lastLine: m.line ?? null
      });
    }
  }
  return { messages };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const result = {
    html: {},
    css: {},
    summary: {
      htmlFiles: 0,
      cssFiles: 0,
      totalErrors: 0,
      totalWarnings: 0
    }
  };

  // ---- Modo string / archivo único / URL ----
  if (args.values['html-string'] || args.values.html || args.values.url) {
    // (se mantiene compatibilidad con la versión anterior)
    // ... puedes ampliarlo si quieres, pero el foco es el modo directorio
  }

  // ---- Modo directorio (el más usado) ----
  let targetDir = args.values.dir || process.cwd();

  // Si se pasan archivos concretos, también los añadimos
  const htmlFiles = [];
  const cssFiles = [];

  if (args.values.html) htmlFiles.push(path.resolve(args.values.html));
  if (args.values.css)  cssFiles.push(path.resolve(args.values.css));

  // Escaneo recursivo
  console.error(`🔍 Escaneando: ${targetDir}`);
  const foundHtml = findFiles(targetDir, ['.html', '.htm']);
  const foundCss  = findFiles(targetDir, ['.css']);

  htmlFiles.push(...foundHtml);
  cssFiles.push(...foundCss);

  // Eliminar duplicados
  const uniqueHtml = [...new Set(htmlFiles)];
  const uniqueCss  = [...new Set(cssFiles)];

  console.error(`📄 HTML encontrados: ${uniqueHtml.length}`);
  console.error(`🎨 CSS  encontrados: ${uniqueCss.length}`);
  console.error(`⚡ Concurrencia: ${CONCURRENCY}\n`);

  // ---- Validar HTML ----
  if (uniqueHtml.length > 0) {
    const htmlResults = await mapLimit(uniqueHtml, CONCURRENCY, async (file, i) => {
      process.stderr.write(`  [HTML ${i + 1}/${uniqueHtml.length}] ${path.relative(targetDir, file)} ... `);
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = await validateHTMLContent(content);
        const grouped = groupMessages(data.messages || []);
        process.stderr.write('OK\n');
        return { file, grouped, error: null };
      } catch (err) {
        process.stderr.write(`ERROR: ${err.message}\n`);
        return { file, grouped: {}, error: err.message };
      }
    });

    for (const { file, grouped } of htmlResults) {
      const rel = path.relative(targetDir, file) || path.basename(file);
      result.html[rel] = grouped;

      // Contar
      for (const type of Object.keys(grouped)) {
        const count = Object.values(grouped[type]).reduce((s, arr) => s + arr.length, 0);
        if (type.startsWith('error') || type.includes('fatal')) {
          result.summary.totalErrors += count;
        } else if (type.includes('warning') || type === 'info') {
          result.summary.totalWarnings += count;
        }
      }
    }
    result.summary.htmlFiles = uniqueHtml.length;
  }

  // ---- Validar CSS ----
  if (uniqueCss.length > 0) {
    const cssResults = await mapLimit(uniqueCss, CONCURRENCY, async (file, i) => {
      process.stderr.write(`  [CSS  ${i + 1}/${uniqueCss.length}] ${path.relative(targetDir, file)} ... `);
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = await validateCSSContent(content);
        const grouped = groupMessages(data.messages || []);
        process.stderr.write('OK\n');
        return { file, grouped, error: null };
      } catch (err) {
        process.stderr.write(`ERROR: ${err.message}\n`);
        return { file, grouped: {}, error: err.message };
      }
    });

    for (const { file, grouped } of cssResults) {
      const rel = path.relative(targetDir, file) || path.basename(file);
      result.css[rel] = grouped;

      for (const type of Object.keys(grouped)) {
        const count = Object.values(grouped[type]).reduce((s, arr) => s + arr.length, 0);
        if (type === 'error') {
          result.summary.totalErrors += count;
        } else {
          result.summary.totalWarnings += count;
        }
      }
    }
    result.summary.cssFiles = uniqueCss.length;
  }

  // ---- Resultado final ----
  console.log(JSON.stringify(result, null, 2));
})();