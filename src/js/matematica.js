//Carrossel de imagem
// Declarando um Array de imagens
const bannersMatematica = [
    '../assets/Carrossel_1.png',
    '../assets/Carrossel_2.png',
    '../assets/Carrossel_3.png',
];

// Declarando as variáveis
let j = 0; // Índice
const tempoMatematica = 5000; // Tempo entre troca das imagens
const carrosselMatematica = document.querySelector("");

// Criando a função do slideshow

function slideshowMatematica() {
    if (carrosselMatematica) {
        // Use um gradiente padrão se a variável CSS não estiver definida, ou garanta que ela esteja definida no seu CSS
        const gradient = getComputedStyle(document.documentElement).getPropertyValue('--gradient') || 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))';
        carrosselMatematica.style.backgroundImage = ` url(${bannersMatematica[j]})`;
        carrosselMatematica.style.backgroundSize = 'cover';
        carrosselMatematica.style.backgroundPosition = 'center';
    }

    j++;
    if (j == banners.length) {
        j = 0;
    }
    setTimeout(slideshowMatematica, tempoMatematica);
}
slideshowMatematica();