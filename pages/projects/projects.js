// 1. IMPORTATION DES OUTILS FIREBASE
// Vérifie que le chemin remonte bien jusqu'à ton fichier de config
import { db } from '../../admin/project-form/firebase-config.js'; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

async function afficherProjetsPublics() {
    const container = document.getElementById('projects-container'); 
    
    // Message de chargement pour l'utilisateur
    if (container) {
        container.innerHTML = "<p style='color:white; text-align:center;'>Connexion au Cloud Firebase...</p>";
    }

    try {
        // 2. RÉCUPÉRATION DEPUIS LE CLOUD
        const querySnapshot = await getDocs(collection(db, "details_projets"));
        
        if (querySnapshot.empty) {
            container.innerHTML = "<p style='color:white; text-align:center;'>Aucun projet trouvé sur le Cloud.</p>";
            return;
        }

        let htmlContent = "";

        querySnapshot.forEach((docSnap) => {
            const projet = docSnap.data();
            const id = docSnap.id; // L'ID du document (ex: "projet_test")

            // 3. LOGIQUE DE LIEN DYNAMIQUE
            // On envoie vers display.html avec l'ID récupéré sur Firebase
            const lienDestination = `../project-detail/display.html?id=${id}`;

            // Gestion des badges (matériel)
            const skillsHtml = projet.materiel 
                ? projet.materiel.split(',').map(s => `<span class="tag">${s.trim()}</span>`).join('') 
                : "";

            // Nettoyage du texte riche (Quill) pour l'aperçu de la description
            const descriptionCourte = projet.summary 
                ? projet.summary.replace(/<[^>]*>/g, '').substring(0, 120) + '...' 
                : "Découvrez les détails de ce projet.";

            // 4. CONSTRUCTION DU HTML DE LA CARTE
            htmlContent += `
                <article class="project-card">
                    <div class="project-image">
                        <img src="${projet.coverImage || '../../assets/default-cover.jpg'}" alt="${projet.title}">
                    </div>
                    <div class="project-content">
                        <h3>${(projet.title || "PROJET SANS TITRE").toUpperCase()}</h3>
                        <p>${descriptionCourte}</p>
                        <div class="skills-tags">
                            ${skillsHtml}
                        </div>
                        <a href="${lienDestination}" class="btn-view">VOIR LE PROJET</a>
                    </div>
                </article>
            `;
        });

        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("Erreur critique Firebase :", error);
        container.innerHTML = `
            <div style="color: #ff4444; text-align: center; padding: 20px;">
                <p>⚠️ Erreur de synchronisation Cloud.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// 5. LANCEMENT AU CHARGEMENT DE LA PAGE
document.addEventListener('DOMContentLoaded', afficherProjetsPublics);