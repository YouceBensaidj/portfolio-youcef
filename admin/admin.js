// =================================================================
// 1. IMPORTATIONS FIREBASE (AUTH & FIRESTORE MODULAIRE)
// =================================================================
import { db, auth } from './project-form/firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection, 
    getDocs, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Récupération des éléments HTML du DOM
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');


// =================================================================
// 2. SÉCURITÉ : SURVEILLANCE DE L'ÉTAT DE CONNEXION (ATTEND LE MENU)
// =================================================================
document.addEventListener("navigationChargee", () => {

    onAuthStateChanged(auth, (user) => {
        const logoutBtn = document.getElementById('btn-logout');
        const header = document.querySelector('header'); // Recupère le header qui contient le navbar

        if (user) {
            // ➕ AFFICHER LA NAVBAR ENTIÈRE
            if (header) header.style.display = 'block'; 

            // Utilisateur connecté -> Masquer la boîte de connexion et révéler le panel
            if (loginSection) loginSection.classList.add('hidden');
            if (adminPanel) {
                adminPanel.classList.remove('hidden');
                adminPanel.style.display = ''; 
            }
            
            // Afficher le bouton de déconnexion dans la barre de navigation
            if (logoutBtn) {
                logoutBtn.classList.remove('hidden');
                logoutBtn.removeEventListener('click', gererDeconnexion);
                logoutBtn.addEventListener('click', gererDeconnexion);
            }
            
            afficherListeProjetsAdmin();
            initialiserFormulaireProjet();
        } else {
            // ➖ MASQUER LA NAVBAR ENTIÈRE SI DÉCONNECTÉ
            if (header) header.style.display = 'none';

            // Utilisateur déconnecté -> Verrouiller l'accès et afficher la connexion
            if (loginSection) loginSection.classList.remove('hidden'); 
            if (adminPanel) {
                adminPanel.classList.add('hidden');
            }
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    });

});

// Traitement du formulaire de connexion
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (loginError) loginError.textContent = ""; 

        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                if (loginError) loginError.textContent = "Accès refusé. Identifiants incorrects.";
                console.error("Erreur Auth:", error.message);
            });
    });
}

// Fonction globale pour gérer la déconnexion
function gererDeconnexion() {
    signOut(auth)
        .then(() => {
            alert("Vous avez été déconnecté !");
            window.location.search = ""; // Purge les paramètres d'URL (?edit=...)
        })
        .catch((err) => console.error("Erreur déconnexion:", err));
}

// =================================================================
// 3. FONCTIONS DE NAVIGATION GLOBALISÉES (POUR LES BOUTONS HTML)
// =================================================================
window.allerAuFormulaireDetails = function(id) {
    console.log("Redirection vers détails pour l'ID:", id);
    window.location.href = "../project-form/details_form.html?id=" + id;
};

window.supprimerProjet = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce projet de Firebase ?")) {
        try {
            await deleteDoc(doc(db, "details_projets", id));
            alert("Projet supprimé !");
            afficherListeProjetsAdmin(); // Rafraîchissement direct de la liste
        } catch (e) {
            console.error("Erreur suppression:", e);
            alert("Erreur lors de la suppression.");
        }
    }
};

// =================================================================
// 4. AFFICHAGE DE LA LISTE DES PROJETS (RUBRIQUE BLANCHE À DROITE)
// =================================================================
async function afficherListeProjetsAdmin() {
    const listContainer = document.getElementById('admin-projects-list');
    if (!listContainer) return; 
    
    listContainer.innerHTML = '<p style="text-align:center; color: #00bcd4;">Chargement des projets...</p>'; 

    try {
        const querySnapshot = await getDocs(collection(db, "details_projets"));
        listContainer.innerHTML = ''; 

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="text-align: center;">Aucun projet trouvé.</p>';
            return;
        }

        querySnapshot.forEach((projetDoc) => {
            const projet = projetDoc.data();
            const id = projetDoc.id;

            listContainer.innerHTML += `
                <div class="admin-list-item">
                    <div class="project-info" style="display:flex; align-items:center; gap:15px; max-width: 65%;">
                        <img src="${projet.coverImage || ''}" style="width:90px; height:65px; object-fit:cover; border-radius: 4px; border: 1px solid #ddd; flex-shrink: 0;" alt="Projet">
                        <div style="overflow: hidden; text-overflow: ellipsis;">
                            <h3 style="margin:0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${projet.title || "Sans titre"}</h3>
                            <p style="margin:5px 0; font-size: 0.85em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${projet.summary || "Pas de description"}</p>
                        </div>
                    </div>
                    <div class="admin-actions">
                        <button type="button" onclick="window.allerAuFormulaireDetails('${id}')">DÉTAILS</button>
                        <a href="index.html?edit=${id}">MODIFIER</a>
                        <button type="button" onclick="window.supprimerProjet('${id}')">SUPPRIMER</button>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error("Erreur Firebase liste:", e);
        listContainer.innerHTML = '<p style="color: red;">Erreur de chargement. Vérifiez la console.</p>';
    }
}

// =================================================================
// 5. GESTION DU FORMULAIRE (AJOUT / MODIFICATION)
// =================================================================
function initialiserFormulaireProjet() {
    const form = document.getElementById('add-project-form');
    if (!form || form.dataset.initialized === "true") return; 
    
    form.dataset.initialized = "true";
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Mode édition : Remplissage automatique des champs à gauche
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
                alert("Projet mis à jour avec succès !");
            } else {
                await addDoc(collection(db, "details_projets"), { ...data, createdAt: new Date() });
                alert("Projet ajouté avec succès !");
            }
            window.location.href = "index.html";
        } catch (err) {
            alert("Erreur lors de l'enregistrement !");
            console.error(err);
        } finally {
            submitBtn.disabled = false;
        }
    });
}