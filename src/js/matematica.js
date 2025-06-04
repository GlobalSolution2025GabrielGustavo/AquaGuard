// //Carrossel de imagem
// // Declarando um Array de imagens
// const bannersMatematica = [
//     '../assets/Carrossel_1.png',
//     '../assets/Carrossel_2.png',
//     '../assets/Carrossel_3.png',
// ];

// // Declarando as variáveis
// let j = 0; // Índice
// const tempoMatematica = 5000; // Tempo entre troca das imagens
// const carrosselMatematica = document.querySelector("");

// // Criando a função do slideshow

// function slideshowMatematica() {
//     if (carrosselMatematica) {
//         // Use um gradiente padrão se a variável CSS não estiver definida, ou garanta que ela esteja definida no seu CSS
//         const gradient = getComputedStyle(document.documentElement).getPropertyValue('--gradient') || 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))';
//         carrosselMatematica.style.backgroundImage = ` url(${bannersMatematica[j]})`;
//         carrosselMatematica.style.backgroundSize = 'cover';
//         carrosselMatematica.style.backgroundPosition = 'center';
//     }

//     j++;
//     if (j == banners.length) {
//         j = 0;
//     }
//     setTimeout(slideshowMatematica, tempoMatematica);
// }
// slideshowMatematica();


//função para previão de chuva e geração de grafico com base nisso
// Dados reais da tabela (03/05 a 16/06 - 45 dias)
const rawData = [
    1.1, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.4, 0.2, 0.7, 
    0.3, 0.0, 0.0, 0.2, 0.7, 0.0, 2.4, 0.6, 0.8, 5.2, 0.8, 0.0, 0.1, 0.6, 0.0, 
    0.0, 16.0, 0.7, 5.0, 3.3, 1.5, 0.3, 0.0, 0.0, 0.4, 1.1, 0.3, 0.0, 0.0, 0.0
];

// Preparar dados no formato {dia, precipitacao}
const precipitationData = rawData.map((value, index) => ({
    dia: index + 1,
    precipitacao: value
}));

// Elementos do DOM
const ctx = document.getElementById('precipitationChart').getContext('2d');
let precipitationChart;
let currentCoefficients = [];
let currentMaxPoint = {};
let currentRiskDays = [];
let currentThreshold = 10.0;

// Registrar plugin de anotações
Chart.register(window['chartjs-plugin-annotation']);

// Função para ajustar o polinômio aos dados
function fitPolynomial(degree) {
    const x = precipitationData.map(d => d.dia);
    const y = precipitationData.map(d => d.precipitacao);
            
    // Criar matriz de design
    const X = x.map(xi => {
        const row = [];
        for (let p = degree; p >= 0; p--) {
            row.push(Math.pow(xi, p));
        }
        return row;
    });
            
    // Calcular coeficientes usando mínimos quadrados: (X'X)^-1 X'y
    const Xt = math.transpose(X);
    const XtX = math.multiply(Xt, X);
    const XtY = math.multiply(Xt, y);
    const coefficients = math.multiply(math.inv(XtX), XtY);
            
    return coefficients.reverse(); // Ordem decrescente para o polinômio
}

// Função para calcular o valor do polinômio
function polynomialPredict(x, coefficients) {
    return coefficients.reduce((sum, coef, power) => {
        return sum + coef * Math.pow(x, power);
    }, 0);
}

// Função para encontrar o máximo da função polinomial
function encontrarMaximoPolinomial(coefficients, dominioInicio, dominioFim) {
    // Derivada do polinômio (para encontrar pontos críticos)
    const derivativeCoeffs = coefficients.map((coef, power) => coef * power).slice(1);

    // Encontrar raízes da derivada (pontos críticos)
    const criticalPoints = math.polynomialRoot(...derivativeCoeffs);

    // Filtrar raízes reais dentro do domínio
    const realCriticalPoints = criticalPoints.filter(root =>
        math.isNumeric(root) &&
        root >= dominioInicio &&
        root <= dominioFim
    ).map(root => math.re(root));

    // Incluir extremos do domínio
    const candidates = [...realCriticalPoints, dominioInicio, dominioFim];

    // Encontrar o ponto com maior valor de função
    let maxPoint = { dia: dominioInicio, precipitacao: polynomialPredict(dominioInicio, coefficients) };

    candidates.forEach(day => {
        const currentValue = polynomialPredict(day, coefficients);
        if (currentValue > maxPoint.precipitacao) {
            maxPoint = { dia: day, precipitacao: currentValue };
        }
    });

    return maxPoint;
}

// Função para encontrar o máximo nos dados reais
function encontrarMaximoReal() {
    let max = { dia: 1, precipitacao: rawData[0] };
    rawData.forEach((value, index) => {
        if (value > max.precipitacao) {
            max = { dia: index + 1, precipitacao: value };
        }
    });
    return max;
}

// Função para identificar dias de risco no modelo
function identificarDiasRisco(coefficients, dominioInicio, dominioFim, limiar) {
    const diasRisco = [];

    // Verificar cada dia inteiro no domínio
    for (let day = dominioInicio; day <= dominioFim; day++) {
        const precipitacao = polynomialPredict(day, coefficients);
        if (precipitacao >= limiar) {
            diasRisco.push({
                dia: day,
                precipitacao: precipitacao,
                dataReal: calcularDataReal(day),
                tipo: 'modelo'
            });
        }
    }

    return diasRisco;
}

// Função para identificar dias de risco nos dados reais
function identificarDiasRiscoReais(limiar) {
    const diasRisco = [];
    rawData.forEach((value, index) => {
        if (value >= limiar) {
            diasRisco.push({
                dia: index + 1,
                precipitacao: value,
                dataReal: calcularDataReal(index + 1),
                tipo: 'real'
            });
        }
    });
    return diasRisco;
}

// Converter dia numérico para data real
function calcularDataReal(dia) {
    const dataInicio = new Date(2025, 4, 3); // 03/05/2025
    dataInicio.setDate(dataInicio.getDate() + dia - 1);
    return dataInicio.toLocaleDateString('pt-BR');
}

// Atualizar o gráfico com destaques
function updateChartWithHighlights(degree = 4, threshold = 2.0) {
    // Calcular coeficientes
    currentCoefficients = fitPolynomial(degree);

    // Encontrar pontos máximos
    currentMaxPoint = encontrarMaximoPolinomial(currentCoefficients, 1, 45);
    const realMaxPoint = encontrarMaximoReal();

    // Identificar dias de risco
    currentThreshold = threshold;
    currentRiskDays = identificarDiasRisco(currentCoefficients, 1, 45, currentThreshold);
    const realRiskDays = identificarDiasRiscoReais(currentThreshold);

    // Gerar pontos para a curva de ajuste
    const fitCurve = [];
    for (let day = 1; day <= 45; day++) {
        fitCurve.push({
            x: day,
            y: polynomialPredict(day, currentCoefficients)
        });
    }

    // Configurações das anotações
    const riskAnnotations = currentRiskDays.map((risco) => ({
        type: 'point',
        xValue: risco.dia,
        yValue: risco.precipitacao,
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 2,
        radius: 6,
        label: {
            content: `Modelo: ${risco.precipitacao.toFixed(1)}mm`,
            enabled: true,
            position: 'top',
            backgroundColor: 'rgba(155, 89, 182, 0.8)',
            color: 'white'
        }
    }));

    const realRiskAnnotations = realRiskDays.map((risco) => ({
        type: 'point',
        xValue: risco.dia,
        yValue: risco.precipitacao,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        radius: 6,
        label: {
            content: `Real: ${risco.precipitacao.toFixed(1)}mm`,
            enabled: true,
            position: 'bottom',
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            color: 'white'
        }
    }));

    // Criar ou atualizar o gráfico
    const chartData = {
        datasets: [
            {
                label: 'Dados Reais',
                data: precipitationData.map(d => ({ x: d.dia, y: d.precipitacao })),
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                pointRadius: 5,
                showLine: false
            },
            {
                label: 'Ajuste Polinomial',
                data: fitCurve,
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
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
            x: {
                title: {
                    display: true,
                    text: 'Dia (1 = 03/05/2025)'
                },
                min: 1,
                max: 45
            },
            y: {
                title: {
                    display: true,
                    text: 'Precipitação (mm)'
                },
                min: 0,
                suggestedMax: Math.max(...rawData) * 1.2
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} mm`;
                    }
                }
            },
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        yMin: currentThreshold,
                        yMax: currentThreshold,
                        borderColor: 'rgb(230, 126, 34)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: `Limiar de Risco: ${currentThreshold}mm`,
                            enabled: true,
                            position: 'left',
                            backgroundColor: 'rgba(230, 126, 34, 0.8)',
                            color: 'white'
                        }
                    },
                    {
                        type: 'point',
                        xValue: currentMaxPoint.dia,
                        yValue: currentMaxPoint.precipitacao,
                        backgroundColor: 'rgba(142, 68, 173, 0.8)',
                        borderColor: 'rgba(142, 68, 173, 1)',
                        borderWidth: 2,
                        radius: 8,
                        label: {
                            content: `Máximo Modelo: ${currentMaxPoint.precipitacao.toFixed(1)}mm`,
                            enabled: true,
                            position: 'right',
                            backgroundColor: 'rgba(142, 68, 173, 0.8)',
                            color: 'white'
                        }
                    },
                    {
                        type: 'point',
                        xValue: realMaxPoint.dia,
                        yValue: realMaxPoint.precipitacao,
                        backgroundColor: 'rgba(41, 128, 185, 0.8)',
                        borderColor: 'rgba(41, 128, 185, 1)',
                        borderWidth: 2,
                        radius: 8,
                        label: {
                            content: `Máximo Real: ${realMaxPoint.precipitacao.toFixed(1)}mm`,
                            enabled: true,
                            position: 'left',
                            backgroundColor: 'rgba(41, 128, 185, 0.8)',
                            color: 'white'
                        }
                    },
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
        precipitationChart = new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: chartOptions
        });
    }

    // Atualizar resultados textuais
    updateTextResults(realMaxPoint, realRiskDays);
}

// Atualizar os resultados textuais
function updateTextResults(realMaxPoint, realRiskDays) {
    // Atualizar máximo observado
    document.getElementById('maxPrecipitation').textContent =
        Math.max(...rawData).toFixed(1);

    // Atualizar ponto máximo do modelo
    document.getElementById('maxDayModel').textContent =
        `${currentMaxPoint.dia} (${calcularDataReal(currentMaxPoint.dia)})`;
    document.getElementById('maxValueModel').textContent =
        `${currentMaxPoint.precipitacao.toFixed(1)} mm`;

    // Atualizar ponto máximo real
    document.getElementById('maxDayReal').textContent =
        `${realMaxPoint.dia} (${realMaxPoint.dataReal})`;
    document.getElementById('maxValueReal').textContent =
        `${realMaxPoint.precipitacao.toFixed(1)} mm`;

    // Atualizar limiar
    document.getElementById('thresholdValue').textContent =
        currentThreshold.toFixed(1);

    // Atualizar lista de dias de risco do modelo
    const modelRiskDaysList = document.getElementById('modelRiskDays');
    modelRiskDaysList.innerHTML = '';

    if (currentRiskDays.length === 0) {
        modelRiskDaysList.innerHTML = '<li>Nenhum dia acima do limiar de risco</li>';
    } else {
        currentRiskDays.forEach(day => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Dia ${day.dia}</strong> (${day.dataReal}): <span class="risk-day">${day.precipitacao.toFixed(1)} mm</span>`;
            modelRiskDaysList.appendChild(li);
        });
    }

    // Atualizar lista de dias de risco reais
    const realRiskDaysList = document.getElementById('realRiskDays');
    realRiskDaysList.innerHTML = '';

    if (realRiskDays.length === 0) {
        realRiskDaysList.innerHTML = '<li>Nenhum dia acima do limiar de risco</li>';
    } else {
        realRiskDays.forEach(day => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Dia ${day.dia}</strong> (${day.dataReal}): <span class="risk-day">${day.precipitacao.toFixed(1)} mm</span>`;
            realRiskDaysList.appendChild(li);
        });
    }
}

// Event Listeners
document.getElementById('updateAnalysis').addEventListener('click', () => {
    const degree = parseInt(document.getElementById('polyDegree').value);
    const threshold = parseFloat(document.getElementById('riskThreshold').value);
    updateChartWithHighlights(degree, threshold);
});

// Inicializar a análise
updateChartWithHighlights();
