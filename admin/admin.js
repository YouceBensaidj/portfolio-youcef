import { db } from './project-form/firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    addDoc, 
    updateDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. AFFICHAGE DE LA LISTE (FIREBASE) ---
async function afficherListeProjetsAdmin() {
    const listContainer = document.getElementById('admin-projects-list');
    if (!listContainer) return; 
    
    listContainer.innerHTML = '<p style="text-align:center;">Chargement des projets...</p>'; 

    try {
        const querySnapshot = await getDocs(collection(db, "details_projets"));
        listContainer.innerHTML = ''; 

        querySnapshot.forEach((projetDoc) => {
            const projet = projetDoc.data();
            const id = projetDoc.id; // L'ID unique généré par Firebase

            listContainer.innerHTML += `
                <div class="admin-list-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white;">
                    <div class="project-info" style="display:flex; align-items:center; gap:15px;">
                        <img src="${projet.coverImage || projet.image}" style="width:100px; height:70px; object-fit:cover; border-radius: 4px;">
                        <div>
                            <h3 style="margin:0">${projet.title || projet.titre}</h3>
                            <p style="margin:5px 0; font-size: 0.9em; color: #666;">${projet.summary || projet.description}</p>
                        </div>
                    </div>
                    <div class="admin-actions" style="display: flex; gap: 10px;">
                        <button class="btn-details" onclick="allerAuFormulaireDetails('${id}')" style="background: #4361ee; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">DÉTAILS</button>
                        <a href="project-form/index.html?edit=${id}" class="btn-edit" style="background: #f72585; color: white; text-decoration:none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 13px;">MODIFIER</a>
                        <button class="btn-delete" onclick="supprimerProjet('${id}')" style="background: #e63946; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">SUPPRIMER</button>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error("Erreur chargement projets:", e);
    }
}

// --- 2. NAVIGATION DÉTAILS ---
window.allerAuFormulaireDetails = function(id) {
    const currentPath = window.location.pathname;
    const prefix = currentPath.includes('/projects/') ? "../" : "";
    window.location.href = `${prefix}project-form/details_form.html?id=${id}`;
};

// --- 3. SUPPRESSION (FIREBASE) ---
window.supprimerProjet = async function(id) {
    if (confirm("Voulez-vous vraiment supprimer ce projet sur Firebase ?")) {
        try {
            await deleteDoc(doc(db, "details_projets", id));
            alert("Projet supprimé !");
            afficherListeProjetsAdmin();
        } catch (e) {
            alert("Erreur lors de la suppression.");
        }
    }
};

// --- 4. GESTION DU FORMULAIRE (AJOUT & MODIFICATION) ---
const form = document.getElementById('add-project-form');
if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Si on est en mode édition, on pré-remplit
    if (editId) {
        submitBtn.textContent = "METTRE À JOUR LE PROJET";
        const docSnap = await getDoc(doc(db, "details_projets", editId));
        if (docSnap.exists()) {
            const p = docSnap.data();
            document.getElementById('project-title').value = p.title || p.titre;
            document.getElementById('project-desc').value = p.summary || p.description;
            document.getElementById('project-skills').value = (p.skills || []).join(', ');
            form.dataset.oldImage = p.coverImage || p.image;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;

        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-desc').value;
        const skills = document.getElementById('project-skills').value.split(',').map(s => s.trim());
        const imageFile = document.getElementById('project-image').files[0];

        let imageData = form.dataset.oldImage || "";

        if (imageFile) {
            const toBase64 = file => new Promise(res => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.readAsDataURL(file);
            });
            imageData = await toBase64(imageFile);
        }

        const data = {
            title: title,
            summary: description,
            skills: skills,
            coverImage: imageData,
            updatedAt: new Date()
        };

        try {
            if (editId) {
                await updateDoc(doc(db, "details_projets", editId), data);
                alert("Projet mis à jour !");
            } else {
                await addDoc(collection(db, "details_projets"), { ...data, createdAt: new Date() });
                alert("Projet ajouté !");
            }
            window.location.href = "../index.html"; 
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement");
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// 5. INITIALISATION
window.addEventListener('DOMContentLoaded', afficherListeProjetsAdmin);