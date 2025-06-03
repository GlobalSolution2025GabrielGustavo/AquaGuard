// button do login levar para page home
const loginBtn = document.getElementById('buttonLogin');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        window.location.href = './src/pages/home.html';
    });
}

// Declaração de variáveis com DOM
const headerMenu = document.querySelector(".nav");
const sanduiche = document.querySelector(".sanduiche"); // Seleciona a primeira instância da classe sanduiche no html e retorna o objeto

// Criando function
function toggleMenu() {
    // Ele adiciona a classe 'active' caso o elemento exista, se não ele remove.
    sanduiche.classList.toggle('active');
    headerMenu.classList.toggle('active');
}

// Criar evento, que ao clicar executa a function
sanduiche.addEventListener('click', toggleMenu);

// Fecha o menu hambúrguer ao clicar em qualquer <a> dentro do nav
headerMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        // Se o menu estiver aberto, fecha
        if (sanduiche.classList.contains('active') && headerMenu.classList.contains('active')) {
            toggleMenu();
        }
    }
});




//Carrossel de imagem
// Declarando um Array de imagens
const banners = [
    '../assets/Carrossel_1.png',
    '../assets/Carrossel_2.png',
    '../assets/Carrossel_3.png',
];

// Declarando as variáveis
let i = 0; // Índice
const tempo = 3000; // Tempo entre troca das imagens
const carrossel = document.querySelector(".infoPrincipal");

// Criando a função do slideshow

function slideshow() {
    if (carrossel) {
        // Use um gradiente padrão se a variável CSS não estiver definida, ou garanta que ela esteja definida no seu CSS
        const gradient = getComputedStyle(document.documentElement).getPropertyValue('--gradient') || 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))';
        carrossel.style.backgroundImage = `${gradient}, url(${banners[i]})`;
        carrossel.style.backgroundSize = 'cover';
        carrossel.style.backgroundPosition = 'center';
    }

    i++;
    if (i == banners.length) {
        i = 0;
    }
    setTimeout(slideshow, tempo);
}
slideshow();


//trocar a cor
function trocar(cor){
    document.body.style.background=cor;
}



//API
// ...existing code...

// Inicializa o mapa Leaflet
let map
function initMap() {
    const defaultLatLng = [-23.55052, -46.633308]; // São Paulo como padrão
    map = L.map('map').setView(defaultLatLng, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Aguarda o carregamento do DOM e da biblioteca Leaflet
document.addEventListener('DOMContentLoaded', function () {
    if (typeof L !== 'undefined' && document.getElementById('map')) {
        initMap();
    }
});

let marker; // Para guardar o marcador atual

function consultaCEP() {
    let cep = document.getElementById("cep").value;
    let url = 'https://viacep.com.br/ws/' + cep + '/json/';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('logradouro').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('localidade').value = data.localidade || '';

            const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade}, Brasil`;

            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`)
                .then(res => res.json())
                .then(locData => {
                    if (locData && locData.length > 0) {
                        const lat = parseFloat(locData[0].lat);
                        const lon = parseFloat(locData[0].lon);

                        map.setView([lat, lon], 16);
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        marker = L.marker([lat, lon]).addTo(map)
                            .bindPopup(endereco)
                            .openPopup();

                        // Consulta a OpenWeatherMap com sua chave
                        const apiKey = '4deef3e3d137a477682f5b07d9ba19d0';
                        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
                        console.log("Consultando clima em:", lat, lon);
                        console.log("URL:", weatherUrl);
                        fetch(weatherUrl)
                            .then(res => res.json())
                            .then(weather => {
                                document.getElementById('temperatura').value = weather.main.temp + ' °C';
                                document.getElementById('umidade').value = weather.main.humidity + ' %';
                            })
                            .catch(err => {
                                console.error('Erro ao buscar dados meteorológicos:', err);
                                alert('Não foi possível obter os dados climáticos.');
                            });
                    } else {
                        alert('Localização não encontrada no mapa.');
                    }
                });
        })
        .catch(error => {
            console.log(error);
            alert('Erro ao buscar o CEP.');
        });
}

//quiz
// Adiciona um evento de submit ao formulário do quiz
document.querySelector('.quiz__form').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede envio imediato

    const inputs = this.querySelectorAll('input');
    let formularioValido = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        formularioValido = false;
        input.style.border = '2px solid red'; // Destaca campos vazios
      } else {
        input.style.border = ''; // Limpa o estilo se preenchido
      }
    });

    if (formularioValido) {
      alert('Obrigado por responder! Suas respostas ajudam a construir um futuro mais seguro contra enchentes.');
      this.reset(); // Limpa o formulário
    } else {
        alert('Por favor, preencha todas as perguntas antes de enviar.');
    }
});


