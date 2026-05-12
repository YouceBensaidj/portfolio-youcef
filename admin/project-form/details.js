import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * CONFIGURATION ET VARIABLES GLOBALES
 */
const urlParams = new URLSearchParams(window.location.search);
const projetId = urlParams.get('id');

const toolbarOptions = [
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean']
];

const quillSummary = new Quill('#editor-summary', {
    modules: { toolbar: toolbarOptions },
    theme: 'snow'
});

const quillStepsEditors = {};
let stepCount = 0;
let codeCount = 0;

/**
 * GESTION DE LA PHOTO DE COUVERTURE
 */
const dropZone = document.getElementById('cover-drop-zone');
const fileInput = document.getElementById('project-cover-file');
const previewImg = document.getElementById('cover-preview-img');
const placeholder = document.getElementById('cover-preview-placeholder');
const removeBtn = document.getElementById('remove-cover-btn');
const hiddenCoverInput = document.getElementById('project-cover-base64');

if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) handleCoverFile(this.files[0]);
    });
}

async function handleCoverFile(file) {
    if (file && file.type.startsWith('image/')) {
        const base64 = await toBase64(file);
        displayCoverPreview(base64);
    }
}

function displayCoverPreview(base64) {
    previewImg.src = base64;
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'block';
    hiddenCoverInput.value = base64;
}

/**
 * CHARGEMENT DEPUIS FIREBASE (Pour ordi ET téléphone)
 */
async function chargerDonneesFirebase() {
    if (!projetId) return;

    try {
        const docRef = doc(db, "details_projets", projetId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. Image et Résumé
            if (data.coverImage) displayCoverPreview(data.coverImage);
            if (data.summary) quillSummary.root.innerHTML = data.summary;
            if (data.materiel) document.getElementById('detail-materiel').value = data.materiel;

            // 2. Charger les étapes
            if (data.steps) {
                data.steps.forEach(step => ajouterEtape(step.title, step.desc, step.imgs || []));
            }

            // 3. Section Technique
            if (data.tech) afficherSectionTech(data.tech);

            // 4. Charger les codes
            if (data.codes) {
                data.codes.forEach(c => ajouterBlocCode(c.fileName, c.extension, c.content));
            }
        }
    } catch (error) {
        console.error("Erreur de chargement Firebase :", error);
    }
}

/**
 * FONCTIONS D'AJOUT DYNAMIQUE
 */
function ajouterEtape(title = "", desc = "", imgUrls = []) {
    stepCount++;
    const id = stepCount;
    
    const html = `
        <section class="admin-section dynamic-step" id="step-${id}" data-id="${id}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h2><i class="fas fa-layer-group"></i> Étape ${id}</h2>
                <button type="button" onclick="supprimerEtape(${id})" class="btn-admin" style="background:#ef4444; width:35px; height:35px; border-radius:50%; padding:0;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Titre :</label>
                <input type="text" class="step-title" value="${title}" placeholder="Ex: Montage">
            </div>
            <div class="form-group">
                <label>Description :</label>
                <div id="editor-step-${id}" style="height: 150px; background: white;"></div>
            </div>
            <div class="form-group">
                <label>Images :</label>
                <input type="file" class="step-img-file" accept="image/*" multiple> 
                <input type="hidden" class="step-img-existante" value='${JSON.stringify(imgUrls)}'>
                ${imgUrls.length > 0 ? `<p style="color:green; font-size:0.8em;"><i class="fas fa-check"></i> ${imgUrls.length} image(s) enregistrée(s)</p>` : ""}
            </div>
        </section>`;

    document.getElementById('steps-container').insertAdjacentHTML('beforeend', html);

    const quill = new Quill(`#editor-step-${id}`, { modules: { toolbar: toolbarOptions }, theme: 'snow' });
    if (desc) quill.root.innerHTML = desc;
    quillStepsEditors[id] = quill;
}

// Global functions for buttons
window.supprimerEtape = (id) => {
    if(confirm("Supprimer ?")) {
        document.getElementById(`step-${id}`).remove();
        delete quillStepsEditors[id];
    }
};

window.supprimerSection = (sid, wid) => {
    document.getElementById(sid).remove();
    document.getElementById(wid).style.display = 'block';
};

function ajouterBlocCode(fileName = "", extension = ".python", content = "") {
    codeCount++;
    const html = `
        <section class="admin-section dynamic-code-block">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h2><i class="fas fa-code"></i> Code #${codeCount}</h2>
                <button type="button" onclick="this.closest('section').remove()" class="btn-admin" style="background:#ef4444; padding:5px 10px;"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-group">
                <div style="display: flex; gap: 10px;">
                    <input type="text" class="code-title" placeholder="Nom" value="${fileName}" style="flex: 2;">
                    <select class="code-extension" style="flex: 1;">
                        <option value=".python" ${extension==='.python'?'selected':''}>.py</option>
                        <option value=".c" ${extension==='.c'?'selected':''}>.c</option>
                        <option value=".js" ${extension==='.js'?'selected':''}>.js</option>
                    </select>
                </div>
            </div>
            <textarea class="code-content" style="font-family:monospace; height:150px; width:100%;">${content}</textarea>
        </section>`;
    document.getElementById('code-section-container').insertAdjacentHTML('beforeend', html);
}

function afficherSectionTech(data = {title: "", formula: "", result: ""}) {
    const html = `
        <section class="admin-section" id="section-tech">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2><i class="fas fa-calculator"></i> Technique</h2>
                <button type="button" onclick="supprimerSection('section-tech', 'tech-btn-wrapper')" class="btn-admin" style="background:#ef4444; padding:5px 10px;"><i class="fas fa-trash"></i></button>
            </div>
            <input type="text" id="tech-title" value="${data.title}" placeholder="Titre">
            <input type="text" id="tech-formula" value="${data.formula}" placeholder="Formule">
            <input type="text" id="tech-result" value="${data.result}" placeholder="Résultat">
        </section>`;
    document.getElementById('tech-section-container').innerHTML = html;
    document.getElementById('tech-btn-wrapper').style.display = 'none';
}

/**
 * SAUVEGARDE SUR FIREBASE
 */
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = e => reject(e);
});

document.getElementById('details-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Envoi...";

    try {
        const stepsData = [];
        for (let step of document.querySelectorAll('.dynamic-step')) {
            const id = step.getAttribute('data-id');
            const fileIn = step.querySelector('.step-img-file');
            const existIn = step.querySelector('.step-img-existante').value;
            let imgs = existIn ? JSON.parse(existIn) : [];

            if (fileIn.files.length > 0) {
                imgs = []; 
                for (let f of fileIn.files) imgs.push(await toBase64(f));
            }
            stepsData.push({
                title: step.querySelector('.step-title').value,
                desc: quillStepsEditors[id].root.innerHTML,
                imgs: imgs
            });
        }

        const codesData = Array.from(document.querySelectorAll('.dynamic-code-block')).map(b => ({
            fileName: b.querySelector('.code-title').value,
            extension: b.querySelector('.code-extension').value,
            content: b.querySelector('.code-content').value
        }));

        const techEl = document.getElementById('section-tech');
        const finalDetails = {
            projetId: projetId,
            summary: quillSummary.root.innerHTML,
            coverImage: hiddenCoverInput.value,
            materiel: document.getElementById('detail-materiel').value,
            steps: stepsData,
            codes: codesData,
            tech: techEl ? {
                title: document.getElementById('tech-title').value,
                formula: document.getElementById('tech-formula').value,
                result: document.getElementById('tech-result').value
            } : null,
            lastUpdate: new Date().toISOString()
        };

        // Envoi Cloud
        await setDoc(doc(db, "details_projets", projetId), finalDetails);
        alert("🚀 Synchronisé sur le Cloud !");
        window.location.href = `../../pages/project-detail/display.html?id=${projetId}`;

    } catch (err) {
        console.error(err);
        alert("Erreur de synchro");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Valider les détails";
    }
});

// Init events
document.getElementById('add-step-btn').addEventListener('click', () => ajouterEtape());
document.getElementById('add-tech-btn').addEventListener('click', () => afficherSectionTech());
document.getElementById('add-code-btn').addEventListener('click', () => ajouterBlocCode());

window.addEventListener('load', chargerDonneesFirebase);