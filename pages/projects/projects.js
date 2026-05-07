function afficherProjetsPublics() {
    const container = document.getElementById('projects-container'); 
    const projets = JSON.parse(localStorage.getItem('monPortfolioData')) || [];

    if (projets.length === 0) {
        container.innerHTML = "<p>Aucun projet à afficher pour le moment.</p>";
        return;
    }

    container.innerHTML = projets.map(projet => {
        // 1. Normalisation pour les anciens projets spécifiques (si tu veux garder tes pages statiques)
        const titreNormalise = projet.titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // 2. LOGIQUE DE LIEN DYNAMIQUE (CORRECTION)
        let lienDestination = "";

        if (titreNormalise.includes("moteur")) {
            // Garde ton ancienne page si elle existe
           lienDestination = "../project-detail/projet_detail.html";
        } else {
            // POUR TOUS LES AUTRES (ESP32, Nano Banana, nouveaux projets...)
            // On envoie vers display.html avec l'ID unique
           lienDestination = `../project-detail/display.html?id=${projet.id}`;
        }

        return `
            <article class="project-card">
                <div class="project-image">
                    <img src="${projet.image}" alt="${projet.titre}">
                </div>
                <div class="project-content">
                    <h3>${projet.titre.toUpperCase()}</h3>
                    <p>${projet.description}</p>
                    <div class="skills-tags">
                        ${projet.skills.map(s => `<span class="tag">${s}</span>`).join('')}
                    </div>

                    <a href="${lienDestination}" class="btn-view">VOIR LE PROJET</a>
                </div>
            </article>
        `;
    }).join('');
}

window.onload = afficherProjetsPublics;