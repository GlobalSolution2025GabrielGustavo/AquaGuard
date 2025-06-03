const formLogin = document.getElementById('login');

     // Adiciona um "listener" para o evento de 'submit' do formulário
    formLogin.addEventListener('submit', (e)=> {
        // Previne o comportamento padrão de envio do formulário 
        e.preventDefault();

        // DOM: Pega os valores do usuário e da senha
            const username = document.getElementById('usuario').value;
            const password = document.getElementById('senha').value;

        // veifica se o usuario e senha estão valido e direciona para a pagina teste
        if (username === 'admin' && password === '123456') {
            alert('Login bem-sucedido!');
            window.location.href = 'home.html'; // Redireciona se o usuario e senha estiverem corretos
        } else {
            alert('Usuário ou senha inválidos. Tente novamente.'); //em caso de erro apresenta mensagem

        }

});




// const loginBtn = document.getElementById('buttonLogin');
// const usuario = document.getElementById('usuario').value.trim();
// const senha = document.getElementById('senha').value.trim();

// loginBtn.addEventListener('click', function(e) {
//     if (usuario == '' || senha == '') {
//         if (usuario === '') {
//             document.getElementById('usuario').style.border = '2px solid red';
//             document.getElementById('usuario').placeholder = 'Campo obrigatório!';
//         }
//         if (senha === '') {
//             document.getElementById('senha').style.border = '2px solid red';
//             document.getElementById('senha').placeholder = 'Campo obrigatório!';
//         }
//         alert('Por favor, preencha usuário e senha.');
//     } else {
//         // Redireciona corretamente para a página home.html
//         window.location.assign('src/pages/home.html');
//         alert('Login realizado com sucesso!');
//     }
// });

// // Adiciona validação em tempo real nos campos
// const usuarioInput = document.getElementById('usuario');
// const senhaInput = document.getElementById('senha');
// if (usuarioInput) {
//     usuarioInput.addEventListener('input', function() {
//         if (this.value.trim() !== '') {
//             this.style.border = '';
//             this.placeholder = 'Usuário';
//         }
//     });
// }
// if (senhaInput) {
//     senhaInput.addEventListener('input', function() {
//         if (this.value.trim() !== '') {
//             this.style.border = '';
//             this.placeholder = 'Senha';
//     }
//     });
// }