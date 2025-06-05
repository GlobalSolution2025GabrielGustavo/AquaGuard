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

const novoUsuario = document.getElementById('novoUsuario');

novoUsuario.addEventListener('click', function(){
    alert('Em desenvolvimento! Ainda não estamos adicionando novos usuários.'); // Alerta informando que a funcionalidade está em desenvolvimento
});

const esqueceuSenha = document.getElementById('esqueceuSenha');

esqueceuSenha.addEventListener('click', function(){
    alert('Usuário: admin \n senha:123456')
});