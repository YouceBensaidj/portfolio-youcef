function chargerMaNavigation() {
    const cible = document.querySelector('header');
    if (!cible) return;

    // 1. Déterminer le nom du repo (ex: portfolio-youcef)
    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1]; 
    const baseRoot = `/${repoName}`; // Résultat: /portfolio-youcef

    // 2. Chemins pour le fetch
    const cheminGitHub = `${baseRoot}/admin/navigate/navigate.html`;
    const cheminLocal = '/admin/navigate/navigate.html';

    fetch(cheminGitHub)
        .then(response => {
            if (!response.ok) return fetch(cheminLocal);
            return response;
        })
        .then(response => {
            if (!response.ok) throw new Error("Navigate.html introuvable");
            return response.text();
        })
        .then(html => {
            // 3. Injecter le HTML
            cible.innerHTML = html;

            // 4. CORRECTION AUTOMATIQUE DES LIENS (La clé du problème)
            const liens = cible.querySelectorAll('a');
            liens.forEach(lien => {
                const href = lien.getAttribute('href');
                
                // On ignore les liens vides, les ancres (#) ou les liens externes (http)
                if (href && href !== "#" && !href.startsWith('http')) {
                    // On nettoie le href pour éviter les doubles slashes
                    const cleanHref = href.startsWith('/') ? href : `/${href}`;
                    
                    // On force le lien à partir de la racine du projet admin
                    // Si le lien est "index.html", il devient "/portfolio-youcef/admin/index.html"
                    if (cleanHref.includes('admin/')) {
                         lien.href = `${baseRoot}${cleanHref}`;
                    } else {
                         lien.href = `${baseRoot}/admin${cleanHref}`;
                    }
                }
            });

            console.log("Navigation GitHub Pages chargée et liens corrigés !");
        })
        .catch(err => {
            console.error("Erreur critique de navigation :", err);
        });
}

document.addEventListener("DOMContentLoaded", chargerMaNavigation);