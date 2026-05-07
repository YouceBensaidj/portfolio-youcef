function chargerMaNavigation() {
    // On cherche la balise <header> que tu as ajoutée dans admin.html
    const cible = document.querySelector('header');

    if (cible) {
        /* TRÈS IMPORTANT : 
           Puisque admin.html et navigate.html sont dans le MÊME dossier (admin_HTML),
           on appelle juste 'navigate.html'.
        */
        fetch('navigate/navigate.html')
            .then(response => {
                if (!response.ok) throw new Error("Erreur : Impossible de trouver navigate.html");
                return response.text();
            })
            .then(html => {
                // On injecte le contenu
                cible.innerHTML = html;
                console.log("Navigation chargée avec succès !");
            })
            .catch(err => {
                console.error("Erreur de chargement :", err);
            });
    } else {
        console.error("Erreur : La balise <header> est absente de ton fichier HTML.");
    }
}

// Lancement automatique
document.addEventListener("DOMContentLoaded", chargerMaNavigation);