import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.worldmonitor.app/?lat=20.0000&lon=0.0000&zoom=1.00&view=global&timeRange=7d&layers=conflicts%2Cbases%2Chotspots%2Cnuclear%2Csanctions%2Cweather%2Ceconomic%2Cwaterways%2Coutages%2Cmilitary%2Cnatural%2CiranAttacks';
test('titulo correcto', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/World Monitor/i);
});

test('canvas del mapa visible', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });
});

test('lat y lon en URL', async ({ page }) => {
  await page.goto(BASE_URL);
  expect(page.url()).toContain('lat=20.0000');
  expect(page.url()).toContain('lon=0.0000');
});

// Agrupa los tests bajo el nombre "THREAT CLASSIFICATION - Caso 1"
test.describe('THREAT CLASSIFICATION - Caso 1', () => {

  // Define el test con su nombre descriptivo
  // { page } es el navegador Chrome que Playwright controla automáticamente
  test('todas las noticias tienen etiqueta de clasificación visible', async ({ page }) => {

    // Abre Chrome y navega a WorldMonitor con todas las capas activadas
    await page.goto('https://www.worldmonitor.app/?lat=20.0000&lon=0.0000&zoom=1.00&view=global&timeRange=7d&layers=conflicts%2Cbases%2Chotspots%2Cnuclear%2Csanctions%2Cweather%2Ceconomic%2Cwaterways%2Coutages%2Cmilitary%2Cnatural%2CiranAttacks');

    // Espera que el HTML básico esté construido en el DOM
    await page.waitForLoadState('domcontentloaded');

    // Pausa 6 segundos para que JavaScript cargue los datos del feed en tiempo real
    await page.waitForTimeout(6000);

    // ── CONTEO DE NOTICIAS ────────────────────────────────────────
    // Busca en el DOM todos los elementos cuya clase contenga alguna de estas palabras
    // [class*="item-source"] significa "cualquier clase que contenga item-source"
    // La coma entre selectores funciona como OR — busca cualquiera de los cuatro
    // .count() devuelve cuántos elementos encontró en total
    const todasNoticias = await page.locator('[class*="item-source"], [class*="data-item"], [class*="news-item"], [class*="feed-item"]').count();

    // Busca todos los elementos con clase exacta .variant-label y los cuenta
    // Estos son los badges de categoría: WORLD, TECH, FINANCE, etc.
    const todosLosVariantLabel = await page.locator('.variant-label').count();

    // Imprime en terminal cuántas noticias detectó en total
    console.log(`\n📰 Total noticias detectadas: ${todasNoticias}`);

    // Imprime cuántos badges de clasificación encontró
    console.log(`🏷️  Total badges variant-label: ${todosLosVariantLabel}`);

    // ── ETIQUETAS ÚNICAS ──────────────────────────────────────────
    // Extrae el texto de todos los elementos .variant-label como array
    // Ejemplo resultado: ["WORLD", "TECH", "WORLD", "FINANCE", "TECH"]
    const allBadges = await page.locator('.variant-label').allInnerTexts();

    // new Set() elimina los duplicados del array
    // El spread [...] lo convierte de Set a array normal
    // Ejemplo resultado: ["WORLD", "TECH", "FINANCE"]
    const unicas = [...new Set(allBadges)];

    // Imprime cuántas categorías únicas hay
    console.log(`\n🔖 Etiquetas únicas encontradas (${unicas.length}):`);

    // Imprime cada categoría única en una línea separada
    unicas.forEach(e => console.log(`   - ${e}`));

    // ── VERIFICACIÓN POR CATEGORÍA ────────────────────────────────
    // Lista de categorías que el sistema DEBERÍA tener según la documentación
    const etiquetasEsperadas = ['WORLD', 'TECH', 'FINANCE', 'COMMODITY', 'ENERGY'];

    // Contador de cuántas categorías esperadas se encontraron
    let encontradas = 0;

    console.log('\n✅ Verificación por categoría:');

    // Recorre cada categoría esperada una por una
    for (const etiqueta of etiquetasEsperadas) {

      // Busca dentro de los elementos .variant-label el texto exacto de la etiqueta
      // exact: true significa que debe coincidir exactamente, no parcialmente
      // Ejemplo: busca "TECH" exacto, no "TECH NEWS"
      const count = await page.locator('.variant-label').getByText(etiqueta, { exact: true }).count();

      // Si encontró al menos uno, suma al contador y reporta éxito
      if (count > 0) {
        console.log(`   ✅ ${etiqueta}: ${count} noticias`);
        encontradas++;
      } else {
        // Si no encontró ninguno, reporta que falta esa categoría
        console.log(`   ❌ ${etiqueta}: no encontrada`);
      }
    }

    // ── CÁLCULO DE NOTICIAS SIN BADGE ────────────────────────────
    // Resta: noticias totales menos badges totales
    // Si el resultado es > 0, hay noticias sin clasificación
    // Ejemplo: 267 noticias - 6 badges = 261 sin clasificación
    const noTienenBadge = todasNoticias - todosLosVariantLabel;

    // ── RESUMEN FINAL ─────────────────────────────────────────────
    console.log(`\n📊 Resumen:`);
    console.log(`   Noticias totales:     ${todasNoticias}`);
    console.log(`   Badges totales:       ${todosLosVariantLabel}`);
    console.log(`   Categorías válidas:   ${encontradas}/${etiquetasEsperadas.length}`);
    console.log(`   Sin clasificación:    ${noTienenBadge}`);

    // Mensaje final según si hay noticias sin badge o no
    if (noTienenBadge > 0) {
      console.log(`\n❌ CASO 1 FALLA: ${noTienenBadge} noticias no tienen clasificación`);
    } else {
      console.log(`\n✅ CASO 1 PASA: todas las noticias tienen clasificación`);
    }

    // ── VALIDACIÓN FINAL ──────────────────────────────────────────
    // Afirma que la cantidad de badges debe ser >= a la cantidad de noticias
    // Es decir: cada noticia debe tener al menos un badge
    // Como tenemos 6 badges y 267 noticias → 6 >= 267 es FALSO → test FALLA
    // Esto es correcto: el test detectó un bug real en el sistema
    expect(todosLosVariantLabel).toBeGreaterThanOrEqual(todasNoticias);
  });

});
// comando de ejecucion npx playwright test --project=chromium --reporter=list
// npx playwright show-report


// Agrupa los tests bajo el nombre "THREAT CLASSIFICATION - Caso 3"
test.describe('THREAT CLASSIFICATION - Caso 3', () => {

  // Define el test con su nombre descriptivo
  // { page } es el navegador que Playwright controla automáticamente
  test('la clasificación se mantiene consistente sin recargar la página', async ({ page }) => {
    
    // Abre Chrome y navega a WorldMonitor con todas las capas activadas
    await page.goto('https://www.worldmonitor.app/?lat=20.0000&lon=0.0000&zoom=1.00&view=global&timeRange=7d&layers=conflicts%2Cbases%2Chotspots%2Cnuclear%2Csanctions%2Cweather%2Ceconomic%2Cwaterways%2Coutages%2Cmilitary%2Cnatural%2CiranAttacks');

    // Espera que el HTML básico esté listo (no espera que cargue todo el JS)
    await page.waitForLoadState('domcontentloaded');
    
    // Pausa 6 segundos para que el feed de inteligencia cargue sus datos en tiempo real
    await page.waitForTimeout(6000);

    // ── PRIMERA FOTO ──────────────────────────────────────────────
    // Busca todos los elementos con clase .variant-label y extrae su texto
    // Estos son los badges de categoría: WORLD, TECH, FINANCE, etc.
    const badgesAntes = await page.locator('.variant-label').allInnerTexts();
    
    // Imprime cuántos badges encontró en esta primera lectura
    console.log(`\n📸 Lectura inicial: ${badgesAntes.length} badges`);
    
    // new Set() elimina duplicados para mostrar solo valores únicos
    console.log(`   Valores: ${[...new Set(badgesAntes)].join(', ')}`);

    // Espera 5 segundos sin hacer nada — simula página abierta sin recargar
    await page.waitForTimeout(5000);

    // ── SEGUNDA FOTO ──────────────────────────────────────────────
    // Vuelve a buscar los badges después de 5 segundos
    // Si los datos cambiaron solos, aquí se detectaría
    const badgesDespues = await page.locator('.variant-label').allInnerTexts();
    
    // Imprime el resultado de la segunda lectura
    console.log(`\n📸 Lectura después de 5s: ${badgesDespues.length} badges`);
    console.log(`   Valores: ${[...new Set(badgesDespues)].join(', ')}`);

    // Avisa que va a interactuar con la página
    console.log(`\n🖱️  Interactuando con la página (scroll + espera)...`);
    
    // Simula scroll hacia abajo 300px — interacción real del usuario
    await page.mouse.wheel(0, 300);
    
    // Espera 2 segundos después del scroll para que la página reaccione
    await page.waitForTimeout(2000);
    
    // Simula scroll hacia arriba para volver a la posición original
    await page.mouse.wheel(0, -300);
    
    // Espera 2 segundos más para estabilizar la página
    await page.waitForTimeout(2000);

    // ── TERCERA FOTO ──────────────────────────────────────────────
    // Vuelve a buscar los badges después de la interacción con scroll
    const badgesTrasInteraccion = await page.locator('.variant-label').allInnerTexts();
    
    // Imprime el resultado de la tercera lectura
    console.log(`\n📸 Lectura tras interacción: ${badgesTrasInteraccion.length} badges`);
    console.log(`   Valores: ${[...new Set(badgesTrasInteraccion)].join(', ')}`);

    // ── COMPARACIONES ─────────────────────────────────────────────
    // Verifica si la cantidad de badges es igual entre primera y segunda lectura
    const mismasCantidad = badgesAntes.length === badgesDespues.length;
    
    // .sort() ordena ambos arrays para que el orden no afecte la comparación
    // JSON.stringify convierte el array a texto para poder comparar con ===
    const mismosValores = JSON.stringify(badgesAntes.sort()) === JSON.stringify(badgesDespues.sort());
    
    // Compara la primera lectura con la tercera (después de interacción)
    const estableTraInteraccion = JSON.stringify(badgesAntes.sort()) === JSON.stringify(badgesTrasInteraccion.sort());

    // ── RESUMEN EN CONSOLA ────────────────────────────────────────
    console.log(`\n📊 Resumen:`);
    
    // Muestra si la cantidad fue igual entre lectura 1 y lectura 2
    console.log(`   Misma cantidad (inicial vs 5s):       ${mismasCantidad ? '✅' : '❌'}`);
    
    // Muestra si los valores fueron iguales entre lectura 1 y lectura 2
    console.log(`   Mismos valores (inicial vs 5s):       ${mismosValores ? '✅' : '❌'}`);
    
    // Muestra si los badges se mantuvieron estables después del scroll
    console.log(`   Estable tras interacción:             ${estableTraInteraccion ? '✅' : '❌'}`);

    // Mensaje final según resultado general
    if (mismasCantidad && mismosValores && estableTraInteraccion) {
      console.log(`\n✅ CASO 3 PASA: clasificación estable sin recargar ni interacción`);
    } else {
      console.log(`\n❌ CASO 3 FALLA: clasificación cambió sin recargar`);
    }

    // ── VALIDACIONES FINALES ──────────────────────────────────────
    // Si cualquiera es false, Playwright marca el test como FAILED
    
    // La cantidad de badges debe ser la misma antes y después de 5s
    expect(mismasCantidad).toBe(true);
    
    // Los valores de los badges deben ser idénticos antes y después de 5s
    expect(mismosValores).toBe(true);
    
    // Los badges deben mantenerse iguales incluso después de interactuar con scroll
    expect(estableTraInteraccion).toBe(true);
  });

});

