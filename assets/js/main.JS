function loadHeader() {
    const headerTag = document.querySelector('header');
    if (!headerTag) return;

    // Détection de la profondeur actuelle
    const path = window.location.pathname;
    let pathPrefix = "";

    // Si on est dans un sous-dossier de /pages/ (ex: /pages/contact/contact.html)
    // On doit remonter deux fois : ../../
    if (path.includes('/pages/')) {
        pathPrefix = "../../";
    } 
    // Si on est dans le dossier admin (ex: /admin/index.html)
    else if (path.includes('/admin/')) {
        pathPrefix = "../";
    }

    fetch(pathPrefix + 'header/header.html')
        .then(response => {
            if (!response.ok) throw new Error("Fichier header introuvable");
            return response.text();
        })
        .then(data => {
            headerTag.innerHTML = data;

            // Correction automatique des liens du menu
            const links = headerTag.querySelectorAll('a');
            links.forEach(link => {
                const originalHref = link.getAttribute('href');
                if (originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('/')) {
                    // On nettoie le href original et on ajoute le bon préfixe
                    const cleanHref = originalHref.replace(/^\.\.\//, '').replace(/^\.\//, '');
                    link.href = pathPrefix + cleanHref;
                }
            });
            console.log("Header chargé avec succès depuis : " + pathPrefix);
        })
        .catch(error => console.error('Erreur:', error));
}

document.addEventListener("DOMContentLoaded", loadHeader);

// Gestionnaire de clic pour le menu mobile
document.addEventListener('click', function(e) {
    const hamburger = e.target.closest('#hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    }
});