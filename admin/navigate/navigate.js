function chargerMaNavigation() {
    const cible = document.querySelector('header');
    if (!cible) return;

    // Récupère le nom du dossier racine (ex: /portfolio-youcef/)
    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1]; 

    // On construit le chemin absolu pour GitHub Pages
    // Cela permet d'accéder au fichier peu importe la profondeur du dossier actuel
    const cheminGitHub = `/${repoName}/admin/navigate/navigate.html`;
    const cheminLocal = '/admin/navigate/navigate.html';

    fetch(cheminGitHub)
        .then(response => {
            if (!response.ok) return fetch(cheminLocal); // Test local si GitHub échoue
            return response;
        })
        .then(response => {
            if (!response.ok) throw new Error("Navigate.html introuvable");
            return response.text();
        })
        .then(html => {
            cible.innerHTML = html;
            console.log("Navigation GitHub Pages chargée !");
        })
        .catch(err => {
            console.warn("Tentative avec chemin relatif suite à l'échec du chemin absolu...");
            // Dernier recours : chemin relatif basé sur image_8fc71c.png
            fetch('../navigate/navigate.html')
                .then(res => res.text())
                .then(html => { cible.innerHTML = html; });
        });
}

document.addEventListener("DOMContentLoaded", chargerMaNavigation);