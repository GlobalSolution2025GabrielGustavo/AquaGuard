const rawData = [
    1.1, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.4, 0.2, 0.7, 
    0.3, 0.0, 0.0, 0.2, 0.7, 0.0, 2.4, 0.6, 0.8, 5.2, 0.8, 0.0, 0.1, 0.6, 0.0, 
    0.0, 16.0, 0.7, 5.0, 3.3, 1.5, 0.3, 0.0, 0.0, 0.4, 1.1, 0.3, 0.0, 0.0, 0.0
];
const precipitationData = rawData.map((v, i) => ({ dia: i + 1, precipitacao: v }));
const ctx = document.getElementById('precipitationChart').getContext('2d');
let precipitationChart, currentCoefficients = [], currentMaxPoint = {}, currentRiskDays = [], currentThreshold = 10.0;
Chart.register(window['chartjs-plugin-annotation']);

function fitPolynomial(degree) {
    const x = precipitationData.map(d => d.dia), y = precipitationData.map(d => d.precipitacao);
    const X = x.map(xi => Array.from({length: degree + 1}, (_, p) => Math.pow(xi, degree - p)));
    const Xt = math.transpose(X), XtX = math.multiply(Xt, X), XtY = math.multiply(Xt, y);
    return math.multiply(math.inv(XtX), XtY).reverse();
}
function polynomialPredict(x, coefficients) {
    return coefficients.reduce((sum, coef, power) => sum + coef * Math.pow(x, power), 0);
}
function encontrarMaximoPolinomial(coeffs, ini, fim) {
    const der = coeffs.map((c, p) => c * p).slice(1);
    const crit = (math.polynomialRoot ? math.polynomialRoot(...der) : []).filter(r => math.isNumeric(r) && r >= ini && r <= fim).map(r => math.re(r));
    const candidates = [...crit, ini, fim];
    return candidates.reduce((max, day) => {
        const val = polynomialPredict(day, coeffs);
        return val > max.precipitacao ? { dia: day, precipitacao: val } : max;
    }, { dia: ini, precipitacao: polynomialPredict(ini, coeffs) });
}
function encontrarMaximoReal() {
    const idx = rawData.reduce((maxIdx, v, i, arr) => v > arr[maxIdx] ? i : maxIdx, 0);
    return { dia: idx + 1, precipitacao: rawData[idx], dataReal: calcularDataReal(idx + 1) };
}
function identificarDiasRisco(coeffs, ini, fim, limiar, real = false) {
    const arr = real ? rawData : Array.from({length: fim}, (_, i) => polynomialPredict(i + 1, coeffs));
    return arr.map((v, i) => v >= limiar ? {
        dia: i + 1,
        precipitacao: v,
        dataReal: calcularDataReal(i + 1),
        tipo: real ? 'real' : 'modelo'
    } : null).filter(Boolean);
}
function calcularDataReal(dia) {
    const data = new Date(2025, 4, 3);
    data.setDate(data.getDate() + dia - 1);
    return data.toLocaleDateString('pt-BR');
}
function updateChartWithHighlights(degree = 4, threshold = 2.0) {
    currentCoefficients = fitPolynomial(degree);
    currentMaxPoint = encontrarMaximoPolinomial(currentCoefficients, 1, 45);
    const realMaxPoint = encontrarMaximoReal();
    currentThreshold = threshold;
    currentRiskDays = identificarDiasRisco(currentCoefficients, 1, 45, currentThreshold);
    const realRiskDays = identificarDiasRisco(currentCoefficients, 1, 45, currentThreshold, true);
    const fitCurve = Array.from({length: 45}, (_, i) => ({ x: i + 1, y: polynomialPredict(i + 1, currentCoefficients) }));
    const makePointAnn = (risco, color, pos, label) => ({
        type: 'point',
        xValue: risco.dia,
        yValue: risco.precipitacao,
        backgroundColor: color[0],
        borderColor: color[1],
        borderWidth: 2,
        radius: 6,
        label: {
            content: `${label}: ${risco.precipitacao.toFixed(1)}mm`,
            enabled: true,
            position: pos,
            backgroundColor: color[0],
            color: 'white'
        }
    });
    const riskAnnotations = currentRiskDays.map(r => makePointAnn(r, ['rgba(155,89,182,0.7)', 'rgba(155,89,182,1)'], 'top', 'Modelo'));
    const realRiskAnnotations = realRiskDays.map(r => makePointAnn(r, ['rgba(52,152,219,0.7)', 'rgba(52,152,219,1)'], 'bottom', 'Real'));
    const chartData = {
        datasets: [
            {
                label: 'Dados Reais',
                data: precipitationData.map(d => ({ x: d.dia, y: d.precipitacao })),
                backgroundColor: 'rgba(52,152,219,0.7)',
                pointRadius: 5,
                showLine: false
            },
            {
                label: 'Ajuste Polinomial',
                data: fitCurve,
                borderColor: 'rgba(155,89,182,1)',
                backgroundColor: 'rgba(155,89,182,0.2)',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                showLine: true
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: 'Dia (1 = 03/05/2025)' }, min: 1, max: 45 },
            y: { title: { display: true, text: 'Precipitação (mm)' }, min: 0, suggestedMax: Math.max(...rawData) * 1.2 }
        },
        plugins: {
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} mm` } },
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        yMin: currentThreshold,
                        yMax: currentThreshold,
                        borderColor: 'rgb(230,126,34)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: `Limiar de Risco: ${currentThreshold}mm`,
                            enabled: true,
                            position: 'left',
                            backgroundColor: 'rgba(230,126,34,0.8)',
                            color: 'white'
                        }
                    },
                    makePointAnn(currentMaxPoint, ['rgba(142,68,173,0.8)', 'rgba(142,68,173,1)'], 'right', 'Máximo Modelo'),
                    makePointAnn(realMaxPoint, ['rgba(41,128,185,0.8)', 'rgba(41,128,185,1)'], 'left', 'Máximo Real'),
                    ...riskAnnotations,
                    ...realRiskAnnotations
                ]
            }
        }
    };
    if (precipitationChart) {
        precipitationChart.data = chartData;
        precipitationChart.options = chartOptions;
        precipitationChart.update();
    } else {
        precipitationChart = new Chart(ctx, { type: 'scatter', data: chartData, options: chartOptions });
    }
    updateTextResults(realMaxPoint, realRiskDays);
}
function updateTextResults(realMaxPoint, realRiskDays) {
    document.getElementById('maxPrecipitation').textContent = Math.max(...rawData).toFixed(1);
    document.getElementById('maxDayModel').textContent = `${currentMaxPoint.dia} (${calcularDataReal(currentMaxPoint.dia)})`;
    document.getElementById('maxValueModel').textContent = `${currentMaxPoint.precipitacao.toFixed(1)} mm`;
    document.getElementById('maxDayReal').textContent = `${realMaxPoint.dia} (${realMaxPoint.dataReal})`;
    document.getElementById('maxValueReal').textContent = `${realMaxPoint.precipitacao.toFixed(1)} mm`;
    document.getElementById('thresholdValue').textContent = currentThreshold.toFixed(1);
    const setList = (id, arr) => {
        const el = document.getElementById(id);
        el.innerHTML = arr.length === 0 ? '<li>Nenhum dia acima do limiar de risco</li>' :
            arr.map(day => `<li><strong>Dia ${day.dia}</strong> (${day.dataReal}): <span class="risk-day">${day.precipitacao.toFixed(1)} mm</span></li>`).join('');
    };
    setList('modelRiskDays', currentRiskDays);
    setList('realRiskDays', realRiskDays);
}
document.getElementById('updateAnalysis').addEventListener('click', () => {
    const degree = parseInt(document.getElementById('polyDegree').value);
    const threshold = parseFloat(document.getElementById('riskThreshold').value);
    updateChartWithHighlights(degree, threshold);
});
updateChartWithHighlights();
