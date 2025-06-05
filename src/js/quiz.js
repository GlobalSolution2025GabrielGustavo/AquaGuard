//quiz
// Adiciona um evento de submit ao formulário do quiz
document.querySelector('.quiz__form').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede envio imediato

    const inputs = this.querySelectorAll('input');
    let formularioValido = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        formularioValido = false;
        input.style.border = '2px solid red '; // Destaca campos vazios
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