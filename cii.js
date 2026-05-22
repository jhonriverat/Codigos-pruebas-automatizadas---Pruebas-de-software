//Test 1: Validación de rangos de scores
const response = pm.response.json();

response.ciiScores.forEach(score => {
    pm.test(`${score.region} - staticBaseline entre 0 y 100`, () => {
        pm.expect(score.staticBaseline).to.be.at.least(0);
        pm.expect(score.staticBaseline).to.be.at.most(100);});
    pm.test(`${score.region} - dynamicScore entre 0 y 100`, () => {
        pm.expect(score.dynamicScore).to.be.at.least(0);
        pm.expect(score.dynamicScore).to.be.at.most(100);
    });
    pm.test(`${score.region} - combinedScore entre 0 y 100`, () => {
        pm.expect(score.combinedScore).to.be.at.least(0);
        pm.expect(score.combinedScore).to.be.at.most(100);});
    pm.test(`${score.region} - eventMultiplier entre 0 y 10`, () => {
        pm.expect(score.eventMultiplier).to.be.at.least(0);
        pm.expect(score.eventMultiplier).to.be.at.most(10);});
});

//Test 2: Pisos mínimos para zonas de conflicto activo
const conflictZones = [{ country: 'UA', minScore: 55, name: 'Ukraine' },
                        { country: 'SY', minScore: 50, name: 'Syria' }, 
                        { country: 'YE', minScore: 50, name: 'Yemen' },
                        { country: 'MM', minScore: 45, name: 'Myanmar' },
                        { country: 'IL', minScore: 45, name: 'Israel' }];

conflictZones.forEach(zone => {
    const countryScore = response.ciiScores.find(s => s.region === zone.country);
    if (countryScore) {
        pm.test(`${zone.name} (${zone.country}) combinedScore >= ${zone.minScore}`, () => {
            pm.expect(countryScore.combinedScore).to.be.at.least(zone.minScore);
        });
    }
});

//Test 3: Verificar amortiguación logarítmica (US no debe puntuar más que UA en conflicto)
const usScore = response.ciiScores.find(s => s.region === 'US');
const uaScore = response.ciiScores.find(s => s.region === 'UA');

if (usScore && uaScore) {
    pm.test("Ukraine (conflicto activo) debe tener score > US", () => {
        pm.expect(uaScore.combinedScore).to.be.greaterThan(usScore.combinedScore);
    });
}


//Test 4: Performance - respuesta en menos de 1 segundo
pm.test("Response time < 1000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

