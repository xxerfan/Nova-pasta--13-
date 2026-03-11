import { auth } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 1. GUARDIÃO DE AUTENTICAÇÃO
onAuthStateChanged(auth, (user) => { 
    if (user) { 
        const emailEl = document.getElementById('admin-email');
        if(emailEl) emailEl.innerText = user.email;
        
        const guardEl = document.getElementById('auth-guard');
        if(guardEl) {
            guardEl.style.opacity = '0';
            setTimeout(() => guardEl.style.display = 'none', 500);
        }
        
        // Dispara um evento global avisando que logou (útil para o dashboard.js)
        window.dispatchEvent(new CustomEvent('adminLoggedIn', { detail: { user } }));
    } else { 
        window.location.href = 'login.html'; 
    } 
});

// 2. FUNÇÃO DE LOGOUT GLOBAL
window.fazerLogout = () => {
    signOut(auth).then(() => { 
        window.location.href = 'login.html'; 
    });
};