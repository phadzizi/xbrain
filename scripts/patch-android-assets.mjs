/**
 * Post-generation patch applied after `npx @capacitor/assets generate`.
 *
 * Fixes two issues the tool leaves behind:
 *   1. values/ic_launcher_background.xml is templated with #FFFFFF — corrects
 *      it to the app's background token (#0f172a) so adaptive icons render
 *      on the dark background on Android 8.0+ devices.
 *   2. drawable/ic_launcher_background.xml contains the stock Android Studio
 *      teal grid vector (#26A69A). It is not referenced by the adaptive icon
 *      manifest (which uses @color/, not @drawable/) but is misleading.
 */

import { writeFileSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RES = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// 1. Correct the adaptive icon background colour.
const colorXml = join(RES, 'values', 'ic_launcher_background.xml');
if (existsSync(colorXml)) {
  writeFileSync(
    colorXml,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0f172a</color>
</resources>
`
  );
  console.log('  patched values/ic_launcher_background.xml → #0f172a');
} else {
  console.warn('  warning: values/ic_launcher_background.xml not found — skipping');
}

// 2. Remove the stock teal vector (not used; only creates confusion).
const tealVector = join(RES, 'drawable', 'ic_launcher_background.xml');
if (existsSync(tealVector)) {
  rmSync(tealVector);
  console.log('  removed drawable/ic_launcher_background.xml (stock teal vector)');
}
