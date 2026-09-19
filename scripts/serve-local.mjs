/**
 * Arranca `next start` desde la raíz de MeDa 2.0 aunque lo lance otra carpeta
 * (la vista previa del escritorio vive en ../MeDa). Las imágenes leen las fuentes
 * con process.cwd(), así que el directorio importa. Uso: node scripts/serve-local.mjs [puerto]
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const child = spawn(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "start", "-p", process.argv[2] ?? "3006"], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
