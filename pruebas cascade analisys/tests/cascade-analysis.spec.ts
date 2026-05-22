import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Cascade Analysis Full Flow', () => {
  // Sin límite global de tiempo
  test.setTimeout(0);
  test(
    'TC-CASCADE-005 - validar cálculo y clasificación de impacto',
    async ({ page }) => {

      /*
      ==================================================
      RESULTADOS GENERALES
      ==================================================
      */
      const results: any[] = [];

      /*
      ==================================================
      ABRIR APLICACIÓN
      ==================================================
      */
      await page.goto('/');

      // Esperar carga SPA
      await page.waitForTimeout(4000);

      /*
      ==================================================
      PANEL CASCADE
      ==================================================
      */
      const cascadePanel = page.locator('#panelsGrid [data-panel="cascade"]');
      /*
      ==================================================
      TABS
      ==================================================
      */
      const tabs = cascadePanel.locator('.panel-tab');
      const tabsCount = await tabs.count();
      console.log(`Tabs encontrados: ${tabsCount}`);

      /*
      ==================================================
      RECORRER TODOS LOS TABS
      ==================================================
      */
      for (let i = 0; i < tabsCount; i++) {const tab = tabs.nth(i);
        const tabText = await tab.innerText();
        console.log(`\n==============================`);
        console.log(`TAB: ${tabText}`);
        console.log(`==============================`);
        /*
        ==================================================
        CLICK TAB
        ==================================================
        */
        await tab.click();

        // Esperar recarga
        await page.waitForTimeout(2000);
        /*
        ==================================================
        SELECT Y BOTÓN
        ==================================================
        */
        const select = cascadePanel.locator(
          '.cascade-select'
        );

        const analyzeBtn = cascadePanel.locator(
          '.cascade-analyze-btn'
        );

        /*
        ==================================================
        OBTENER TODAS LAS OPCIONES
        ==================================================
        */
        const options = await select.locator(
          'option'
        ).all();

        console.log(
          `Opciones encontradas: ${options.length}`
        );
        /*
        ==================================================
        RECORRER TODAS LAS OPCIONES
        ==================================================
        */
        for (const option of options) {

          const value = await option.getAttribute(
            'value'
          );

          const optionText = await option.innerText();

          // Ignorar opción vacía
          if (!value) continue;

          console.log(`\n--------------------------------`);
          console.log(`Opción: ${optionText}`);
          console.log(`Value: ${value}`);
          console.log(`--------------------------------`);
          try {
            /*
            ==================================================
            SELECCIONAR OPCIÓN
            ==================================================
            */
            await select.selectOption(value);
            await page.waitForTimeout(1000);

            /*
            ==================================================
            VALIDAR BOTÓN
            ==================================================
            */
            await expect(analyzeBtn).toBeVisible();
            await expect(analyzeBtn).toBeEnabled();

            /*
            ==================================================
            TEXTO ANTES DEL ANALYZE
            ==================================================
            */
            const beforeText = await cascadePanel.innerText();
            /*
            ==================================================
            CLICK ANALYZE
            ==================================================
            */
            await analyzeBtn.click();
            console.log(`Analyze ejecutado`);

            /*
            ==================================================
            ESPERAR CAMBIO REAL
            MÁXIMO 10 SEGUNDOS
            ==================================================
            */
            await expect(async () => {

              const afterText = await cascadePanel.innerText();

              expect(afterText).not.toBe(beforeText);

            }).toPass({

              timeout: 10000

            });

            /*
            ==================================================
            DATOS ACTUALIZADOS
            ==================================================
            */
            const updatedData = await cascadePanel.innerText();

            /*
            ==================================================
            VALIDAR CLASIFICACIONES
            ==================================================
            */

            // Clasificaciones válidas
            const validImpacts = [
              'LOW',
              'MEDIUM',
              'HIGH',
              'CRITICAL'
            ];
            /*
            ==================================================
            PAÍSES AFECTADOS
            ==================================================
            */
            const countries = cascadePanel.locator(
              '.cascade-country'
            );

            const countriesCount = await countries.count();

            console.log(
              `Países afectados: ${countriesCount}`
            );

            /*
            ==================================================
            ARRAY EVIDENCIAS PAÍSES
            ==================================================
            */
            const countriesData: any[] = [];

            /*
            ==================================================
            RECORRER PAÍSES
            ==================================================
            */
            for (let k = 0; k < countriesCount; k++) {

              const country = countries.nth(k);
              /*
              ==================================================
              NOMBRE PAÍS
              ==================================================
              */
              const countryName = await country.locator(
                '.cascade-country-name'
              ).innerText();

              /*
              ==================================================
              IMPACTO
              ==================================================
              */
              const impact = await country.locator(
                '.cascade-impact'
              ).innerText();
              /*
              ==================================================
              CAPACIDAD
              ==================================================
              */
              const capacity = await country.locator('.cascade-capacity').innerText();

              console.log(`${countryName} -> ${impact} -> ${capacity}`);

              /*
              ==================================================
              VALIDAR IMPACTO
              ==================================================
              */
              expect(validImpacts).toContain(impact.trim().toUpperCase());

              /*
              ==================================================
              GUARDAR EVIDENCIA DEL PAÍS
              ==================================================
              */
              countriesData.push({
                country: countryName.trim(),
                impact: impact.trim().toUpperCase(),
                capacity: capacity.trim()
              });
            }
            /*
            ==================================================
            GUARDAR RESULTADO EXITOSO
            ==================================================
            */
            results.push({
              status: 'SUCCESS',
              timestamp: new Date().toISOString(),
              tab: tabText.trim(),
              selectedOption: optionText.trim(),
              value: value,
              countriesAffected: countriesData,
              updatedData: updatedData.trim()
            });
            console.log(
              `SUCCESS: ${optionText}`
            );
          } catch (error) {

            /*
            ==================================================
            GUARDAR ERROR
            ==================================================
            */
            results.push({
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              tab: tabText.trim(),
              selectedOption: optionText.trim(),
              value: value,
              error: String(error)
            });
            console.error(
              `FAILED: ${optionText}`
            );
            /*
            ==================================================
            EXPORTAR JSON INMEDIATAMENTE
            ==================================================
            */
            fs.writeFileSync(

              'cascade-results.json',

              JSON.stringify(results, null, 2)

            );
            /*
            ==================================================
            DETENER EJECUCIÓN
            ==================================================
            */
            throw new Error(
              `\nERROR DETECTADO\n` +
              `Tab: ${tabText}\n` +
              `Option: ${optionText}\n` +
              `Reason: Timeout o clasificación inválida`
            );
          }

        }

      }
      /*
      ==================================================
      EXPORTAR RESULTADOS FINALES
      ==================================================
      */
      fs.writeFileSync(
        'cascade-results.json',
        JSON.stringify(results, null, 2)

      );

      console.log(
        '\nResultados exportados correctamente'
      );

    }

  );

});