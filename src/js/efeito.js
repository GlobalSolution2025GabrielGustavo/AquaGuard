// DOM
const sections = document.querySelectorAll('.content-section');
const efeito = {
    root: null, // O viewport como elemento raiz
    rootMargin: '0px',
    threshold: 0.5 // Quando 50% da seção está visível
};

const sessaoEfeito = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            sections.forEach(sec => sec.classList.remove('ativo'));
            entry.target.classList.add('ativo');
        } else {

        }
    });
}, efeito);


// Observa cada seção
sections.forEach(section => {
    sessaoEfeito.observe(section);
});

document.addEventListener('DOMContentLoaded', () => {

    const primeiraSessao = sections[0];
    if (primeiraSessao) {
        // Verifica se a primeira seção está no viewport no carregamento
        const rect = primeiraSessao.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            primeiraSessao.classList.add('ativo');
        } else {
             // Se não, adiciona a classe active à primeira seção, assumindo que ela é a "inicial"
             primeiraSessao.classList.add('ativo');
        }
    }
});