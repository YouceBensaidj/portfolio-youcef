// 1. INITIALISATION DES DONNÉES
let projetsExistant = JSON.parse(localStorage.getItem('monPortfolioData')) || [
    { id: 1, titre: "Contrôle Moteur DC", description: "Pilotage avec redresseur à thyristors.", skills: ["C++", "Thyristor"], image: "../../assets/images/moteur.jpg" },
    { id: 2, titre: "Nano Banana", description: "Station météo connectée ESP32.", skills: ["IoT", "ESP32"], image: "../../assets/images/banana.jpg" }
];

// 2. SAUVEGARDE
function sauvegarder() {
    localStorage.setItem('monPortfolioData', JSON.stringify(projetsExistant));
}

// 3. AFFICHAGE DE LA LISTE
function afficherListeProjetsAdmin() {
    const listContainer = document.getElementById('admin-projects-list');
    if (!listContainer) return; 
    listContainer.innerHTML = ''; 

    projetsExistant.forEach(projet => {
        listContainer.innerHTML += `
            <div class="admin-list-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white;">
                <div class="project-info" style="display:flex; align-items:center; gap:15px;">
                    <img src="${projet.image}" style="width:100px; height:70px; object-fit:cover; border-radius: 4px;">
                    <div>
                        <h3 style="margin:0">${projet.titre}</h3>
                        <p style="margin:5px 0; font-size: 0.9em; color: #666;">${projet.description}</p>
                    </div>
                </div>
                <div class="admin-actions" style="display: flex; gap: 10px;">
                    <button class="btn-details" onclick="allerAuFormulaireDetails('${projet.id}')" style="background: #4361ee; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">DÉTAILS</button>
                    <button class="btn-edit" onclick="preparerModification('${projet.id}')" style="background: #f72585; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">MODIFIER</button>
                    <button class="btn-delete" onclick="supprimerProjet('${projet.id}')" style="background: #e63946; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">SUPPRIMER</button>
                </div>
            </div>`;
    });
}

// 4. NAVIGATION VERS LE FORMULAIRE DE DÉTAILS
window.allerAuFormulaireDetails = function(id) {
    // On détecte si on est dans le sous-dossier "projects"
    // Si c'est le cas, on doit remonter d'un cran (../) pour atteindre "project-form"
    const currentPath = window.location.pathname;
    const isSubFolder = currentPath.includes('/projects/');
    
    const prefix = isSubFolder ? "../" : "";
    
    // Chemin final : remonte si besoin, puis entre dans project-form
    window.location.href = `${prefix}project-form/details_form.html?id=${id}`;
};

// 5. SUPPRESSION
window.supprimerProjet = function(id) {
    if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
        projetsExistant = projetsExistant.filter(p => p.id != id);
        sauvegarder();
        localStorage.removeItem(`details_projet_${id}`); 
        afficherListeProjetsAdmin();
    }
};

// 6. PRÉPARER LA MODIFICATION (CORRIGÉ POUR ÉCRASER)
window.preparerModification = function(id) {
    const projet = projetsExistant.find(p => p.id == id);
    if (projet) {
        if (!document.getElementById('add-project-form')) {
            localStorage.setItem('editProjectId', id);
            window.location.href = "../index.html";
            return;
        }
        
        // On remplit les champs avec les anciennes données
        document.getElementById('project-title').value = projet.titre;
        document.getElementById('project-desc').value = projet.description;
        document.getElementById('project-skills').value = projet.skills.join(', ');
        
        const submitBtn = document.querySelector('#add-project-form button[type="submit"]');
        submitBtn.textContent = "METTRE À JOUR LE PROJET";
        // On stocke l'ID dans le bouton pour savoir qu'on modifie et non qu'on crée
        submitBtn.dataset.editId = id; 
    }
};

// 7. GESTION DU FORMULAIRE (ÉCRASE L'ANCIEN PROJET)
const form = document.getElementById('add-project-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const editId = submitBtn.dataset.editId; // On récupère l'ID si on est en mode édition
        
        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-desc').value;
        const skillsField = document.getElementById('project-skills').value;
        const skills = skillsField ? skillsField.split(',').map(s => s.trim()) : [];
        const imageFile = document.getElementById('project-image').files[0];

        let imageData = "";

        // GESTION DE L'IMAGE : On récupère l'ancienne si pas de nouvelle
        if (imageFile) {
            const toBase64 = file => new Promise((res) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.readAsDataURL(file);
            });
            imageData = await toBase64(imageFile);
        } else if (editId) {
            // Mode modification : on cherche l'image déjà enregistrée
            const projetExistant = projetsExistant.find(p => p.id == editId);
            imageData = projetExistant ? projetExistant.image : "";
        }

        if (editId) {
            // --- MODE ÉDITION : ON ÉCRASE ---
            const index = projetsExistant.findIndex(p => p.id == editId);
            projetsExistant[index] = { 
                ...projetsExistant[index], 
                titre: title, 
                description: description, 
                skills: skills, 
                image: imageData 
            };
            alert("Projet mis à jour !");
        } else {
            // --- MODE CRÉATION : NOUVEAU PROJET ---
            if (!imageData) { alert("Veuillez mettre une image"); return; }
            const nouvelId = Date.now();
            projetsExistant.push({ id: nouvelId, titre: title, description, skills, image: imageData });
            
            // On crée l'objet de détails vide pour ne pas avoir d'erreur
            localStorage.setItem(`details_projet_${nouvelId}`, JSON.stringify({
                summary: "", materiel: "", steps: [], tech: null, codes: []
            }));
            alert("Projet ajouté !");
        }

        sauvegarder();
        window.location.href = "projects/liste_des_projets.html";
    });
}

// 8. INITIALISATION
window.addEventListener('DOMContentLoaded', () => {
    afficherListeProjetsAdmin();
    const editId = localStorage.getItem('editProjectId');
    if (editId && document.getElementById('add-project-form')) {
        preparerModification(editId);
        localStorage.removeItem('editProjectId'); 
    }
});