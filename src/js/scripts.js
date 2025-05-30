// document.addEventListener('DOMContentLoaded', function() {
// });
const loginBtn = document.getElementById('buttonLogin');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        window.location.href = './src/pages/home.html';
    });
}