#!/usr/bin/env node
/*
 * Filtre d'entrée Doxygen pour les fichiers JavaScript / JSX.
 * -----------------------------------------------------------
 * Doxygen ne sait pas analyser le JavaScript : il ignore les fonctions/composants
 * et n'attache donc pas les blocs de documentation. Ce filtre lit un fichier .js/.jsx
 * et le réécrit sous une forme « pseudo-C++ » que Doxygen sait analyser :
 *
 *   - les blocs de commentaires JSDoc/Doxygen (slash-étoile-étoile … étoile-slash) sont conservés tels quels ;
 *   - la balise « @module X » est convertie en « @file » pour documenter le fichier ;
 *   - chaque déclaration de premier niveau (function / const / export …) est remplacée
 *     par un prototype factice « void nom(); » auquel Doxygen rattache le commentaire qui précède ;
 *   - tout le reste du code (imports, corps, JSX) est supprimé.
 *
 * Utilisation (configurée dans le Doxyfile via FILTER_PATTERNS) :
 *     node tools/doxygen-js-filter.js <chemin-fichier>
 * Le résultat filtré est écrit sur la sortie standard.
 */

"use strict";

const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  process.exit(0);
}

let source = "";
try {
  source = fs.readFileSync(filePath, "utf8");
} catch {
  process.exit(0);
}

const lines = source.split(/\r?\n/);
const out = [];

let inComment = false;

/**
 * Détecte une déclaration de premier niveau (sans indentation, ou préfixée par export)
 * et en extrait le nom. Retourne null si la ligne n'est pas une déclaration documentable.
 */
function declName(line) {
  // function / async function / export (default) function NAME(
  let m = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)/);
  if (m) return m[1];
  // export (default) const NAME =   |   const NAME =   (premier niveau uniquement)
  m = line.match(/^(?:export\s+)?(?:default\s+)?const\s+([A-Za-z0-9_$]+)\s*=/);
  if (m) return m[1];
  // export (default) class NAME
  m = line.match(/^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_$]+)/);
  if (m) return `class ${m[1]}`;
  return null;
}

for (const raw of lines) {
  const line = raw;

  // Conservation des blocs de commentaires /** ... */
  const startsBlock = /\/\*\*/.test(line);
  if (inComment || startsBlock) {
    let doc = line;
    // Convertit @module en @file pour documenter le fichier courant.
    doc = doc.replace(/@module\s+\S+/g, "@file");
    // Neutralise les liens {@link cible label} → conserve uniquement le texte
    // lisible (Doxygen ne sait pas résoudre les cibles « module:… »).
    doc = doc.replace(/\{@link\s+([^}]+)\}/g, (_, inner) => {
      const parts = inner.trim().split(/\s+/);
      const target = parts.shift().replace(/^module:/, "");
      const label = parts.join(" ");
      return label || target.split("/").pop();
    });
    out.push(doc);
    if (startsBlock && !/\*\//.test(line)) inComment = true;
    if (inComment && /\*\//.test(line)) inComment = false;
    continue;
  }

  // Ligne de commentaire simple // ... → conservée (utile pour les notes)
  if (/^\s*\/\//.test(line)) {
    out.push(line);
    continue;
  }

  // Déclaration de premier niveau → prototype factice rattachable par Doxygen.
  const name = declName(line);
  if (name) {
    if (name.startsWith("class ")) {
      out.push(`${name} {};`);
    } else {
      // Type de retour factice non-void : évite l'avertissement Doxygen
      // « documented return type … does not return anything ».
      out.push(`JSValue ${name}();`);
    }
  }
  // Toutes les autres lignes de code sont ignorées.
}

process.stdout.write(out.join("\n") + "\n");
