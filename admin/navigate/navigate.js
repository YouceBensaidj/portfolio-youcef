function chargerMaNavigation() {
    const cible = document.querySelector('header');
    if (!cible) return;

    // Selon l'arborescence image_8fc71c.png :
    const cheminsPossibles = [
        '../navigate/navigate.html', // Chemin depuis 'projects/liste_des_projets.html'
        './navigate/navigate.html',  // Chemin depuis 'admin/index.html'
        'navigate/navigate.html'     // Chemin de secours
    ];

    const tenterFetch = (index) => {
        if (index >= cheminsPossibles.length) return;

        fetch(cheminsPossibles[index])
            .then(response => {
                if (!response.ok) throw new Error();
                return response.text();
            })
            .then(html => {
                cible.innerHTML = html;
                console.log("Navigation chargée via : " + cheminsPossibles[index]);
            })
            .catch(() => tenterFetch(index + 1));
    };

    tenterFetch(0);
}

document.addEventListener("DOMContentLoaded", chargerMaNavigation);