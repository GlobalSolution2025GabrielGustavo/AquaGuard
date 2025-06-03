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

headerMenu.addEventListener('click', (event) => {
    // Verifica qual classe que recebe esse nome
    if (event.target.classList.contains('item-menu')) {
        toggleMenu();
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