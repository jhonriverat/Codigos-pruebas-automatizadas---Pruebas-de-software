const { test, expect } = require('@playwright/test');

const URL =
'https://www.worldmonitor.app/?lat=48.5030&lon=66.9016&zoom=3.13&view=global&timeRange=7d&layers=conflicts%2Cbases%2Chotspots%2Cnuclear%2Csanctions%2Cweather%2Ceconomic%2Cwaterways%2Coutages%2Cmilitary%2Cnatural%2CiranAttacks&country=KZ';

// =====================================================
// Helper reutilizable
// =====================================================

async function loadDashboard(page) {

  await page.goto(URL, {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });

  // Esperar canvas principal
  await expect(
    page.locator('canvas').first()
  ).toBeVisible({
    timeout: 30000
  });

  // Espera corta para datos iniciales
  await page.waitForTimeout(3000);

  return await page.locator('body').textContent();
}

// =====================================================
// CP-02
// =====================================================
test('CP-02 - Clasificación de eventos', async ({ page }) => {
  console.log('\n=== INICIO CP-02 ===');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  const body = await loadDashboard(page);
  const labels =
    ['CRITICAL', 'ELEVATED', 'WATCH']
      .filter(label => body.includes(label));

  console.log('\nEtiquetas encontradas:');
  labels.forEach(label => {
    console.log(`✓ ${label}`);
  });

  expect(labels.length).toBeGreaterThan(0);

  // Validar estabilidad DOM
  const nodes =
    await page.locator('*').count();

  expect(nodes).toBeGreaterThan(50);

  // Validar frontend
  expect(errors.length).toBe(0);

  console.log(`\n✓ DOM estable (${nodes} nodos)`);
  console.log('✓ Frontend estable');

  console.log('\nCP-02 EXITOSO\n');
});

// =====================================================
// CP-04
// =====================================================

test('CP-04 - Impacto evento crítico', async ({ page }) => {
  console.log('\n=== INICIO CP-04 ===');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  const body = await loadDashboard(page);
  expect(
    body.includes('CRITICAL')
  ).toBeTruthy();
  console.log('✓ Evento CRITICAL detectado');
  expect(
    body.toLowerCase().includes('conflict')
  ).toBeTruthy();
  console.log('✓ Capas geopolíticas activas');
  const canvas =
    page.locator('canvas').first();
  await canvas.click({
    position: {
      x: 700,
      y: 400
    }
  });
  console.log('✓ Interacción con mapa ejecutada');
  await page.waitForTimeout(2000);
  const nodes =
    await page.locator('*').count();

  expect(nodes).toBeGreaterThan(50);

  expect(errors.length).toBe(0);
  console.log(`✓ DOM estable (${nodes} nodos)`);
  console.log('✓ Frontend estable');
  console.log('\nCP-04 EXITOSO\n');
});

