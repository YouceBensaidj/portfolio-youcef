// 1. IMPORTATIONS FIREBASE
import { db } from './project-form/firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 2. FONCTIONS DE NAVIGATION (Définies AVANT l'affichage) ---

window.allerAuFormulaireDetails = function(id) {
    console.log("Redirection vers détails pour l'ID:", id);
    // On sort de 'projects' pour aller dans 'project-form'
    window.location.href = "../project-form/details_form.html?id=" + id;
};

window.supprimerProjet = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce projet de Firebase ?")) {
        try {
            await deleteDoc(doc(db, "details_projets", id));
            alert("Projet supprimé !");
            afficherListeProjetsAdmin(); // Rafraîchir la liste
        } catch (e) {
            console.error("Erreur suppression:", e);
            alert("Erreur lors de la suppression.");
        }
    }
};

// --- 3. AFFICHAGE DE LA LISTE ---
async function afficherListeProjetsAdmin() {
    const listContainer = document.getElementById('admin-projects-list');
    if (!listContainer) return; 
    
    listContainer.innerHTML = '<p style="text-align:center;">Chargement des projets...</p>'; 

    try {
        const querySnapshot = await getDocs(collection(db, "details_projets"));
        listContainer.innerHTML = ''; 

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p>Aucun projet trouvé.</p>';
            return;
        }

        querySnapshot.forEach((projetDoc) => {
            const projet = projetDoc.data();
            const id = projetDoc.id;

            listContainer.innerHTML += `
                <div class="admin-list-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white;">
                    <div class="project-info" style="display:flex; align-items:center; gap:15px;">
                        <img src="${projet.coverImage || ''}" style="width:100px; height:70px; object-fit:cover; border-radius: 4px;" alt="Projet">
                        <div>
                            <h3 style="margin:0">${projet.title || "Sans titre"}</h3>
                            <p style="margin:5px 0; font-size: 0.9em; color: #666;">${projet.summary || "Pas de description"}</p>
                        </div>
                    </div>
                    <div class="admin-actions" style="display: flex; gap: 10px;">
                        <!-- Bouton Détails : Envoie vers l'ajout de détails techniques -->
                        <button type="button" class="btn-details" onclick="window.allerAuFormulaireDetails('${id}')" style="background: #4361ee; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">DÉTAILS</button>
                        
                        <!-- Lien Modifier : Retourne à l'index (formulaire principal) -->
                        <a href="../index.html?edit=${id}" class="btn-modifier" style="background: #f72585; color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-size: 13px;">MODIFIER</a>
                        
                        <button type="button" onclick="window.supprimerProjet('${id}')" style="background: #e63946; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">SUPPRIMER</button>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error("Erreur Firebase liste:", e);
        listContainer.innerHTML = '<p>Erreur de chargement. Vérifiez la console.</p>';
    }
}

// --- 4. GESTION DU FORMULAIRE (AJOUT / MODIF) ---
const form = document.getElementById('add-project-form');
if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (editId) {
        submitBtn.textContent = "METTRE À JOUR LE PROJET";
        const docRef = doc(db, "details_projets", editId);
        getDoc(docRef).then(snap => {
            if (snap.exists()) {
                const d = snap.data();
                document.getElementById('project-title').value = d.title || "";
                document.getElementById('project-desc').value = d.summary || "";
                document.getElementById('project-skills').value = (d.skills || []).join(', ');
                form.dataset.oldImg = d.coverImage || "";
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;

        const title = document.getElementById('project-title').value;
        const summary = document.getElementById('project-desc').value;
        const skills = document.getElementById('project-skills').value.split(',').map(s => s.trim());
        const imageFile = document.getElementById('project-image').files[0];

        let finalImg = form.dataset.oldImg || "";
        if (imageFile) {
            finalImg = await new Promise(res => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(imageFile);
            });
        }

        const data = { title, summary, skills, coverImage: finalImg, updatedAt: new Date() };

        try {
            if (editId) {
                await updateDoc(doc(db, "details_projets", editId), data);
                alert("Projet mis à jour !");
            } else {
                await addDoc(collection(db, "details_projets"), { ...data, createdAt: new Date() });
                alert("Projet ajouté !");
            }
            // Redirection vers la liste
            window.location.href = "projects/liste_des_projets.html";
        } catch (err) {
            alert("Erreur lors de l'enregistrement !");
            console.error(err);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', afficherListeProjetsAdmin);