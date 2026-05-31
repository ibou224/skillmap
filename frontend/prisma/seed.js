import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ordre d'exécution important pour respecter les clés étrangères
const scripts = [
  'seedUsers.js',
  'seedDepartement.js',
  'seedProgramme.js',
  'seed-professeurs.js',
  'seedCours1.js',
  'seedCourPI.js',
  'seed-cours-IAI.js',
  'seed-cours-TTS.js'
];

console.log('🚀 Démarrage du seed global...\n');

for (const script of scripts) {
  console.log(`\n=========================================`);
  console.log(`⏳ Exécution de ${script}...`);
  console.log(`=========================================\n`);
  
  try {
    // Utilisation de tsx (qui est déjà utilisé dans le package.json pour seed)
    execSync(`npx tsx ${join(__dirname, script)}`, { stdio: 'inherit' });
    console.log(`\n✅ ${script} terminé avec succès.`);
  } catch (error) {
    console.error(`\n❌ Erreur lors de l'exécution de ${script}. Arrêt du processus.`);
    process.exit(1);
  }
}

console.log('\n🎉 Seed global terminé avec succès ! Toutes les données ont été insérées.');
