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

// Initialisation de l'éditeur du résumé principal
const quillSummary = new Quill('#editor-summary', {
    modules: { toolbar: toolbarOptions },
    theme: 'snow'
});

// Stockage des instances Quill pour les étapes
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
    // Ouvrir l'explorateur au clic sur la zone
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) handleCoverFile(this.files[0]);
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#2563eb";
        dropZone.style.background = "rgba(37, 99, 235, 0.05)";
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = "#cbd5e1";
        dropZone.style.background = "#f8fafc";
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#cbd5e1";
        const file = e.dataTransfer.files[0];
        handleCoverFile(file);
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

if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Évite de relancer l'explorateur
        hiddenCoverInput.value = "";
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
        removeBtn.style.display = 'none';
        fileInput.value = "";
    });
}

/**
 * CHARGEMENT DES DONNÉES
 */
const projets = JSON.parse(localStorage.getItem('monPortfolioData')) || [];
const projetActuel = projets.find(p => p.id == projetId);

if (projetActuel) {
    document.getElementById('project-summary').innerHTML = `
        <p>Configuration des détails pour : <strong>${projetActuel.titre}</strong></p>
    `;
}

function chargerDonneesExistantes() {
    const data = JSON.parse(localStorage.getItem(`details_projet_${projetId}`));
    
    if (data) {
        // Image de couverture
        if (data.coverImage) displayCoverPreview(data.coverImage);

        // Résumé et Matériel
        if (data.summary) quillSummary.root.innerHTML = data.summary;
        if (data.materiel) document.getElementById('detail-materiel').value = data.materiel;

        // Étapes
        if (data.steps) {
            data.steps.forEach(step => ajouterEtape(step.title, step.desc, step.imgs || []));
        }

        // Section Technique
        if (data.tech) afficherSectionTech(data.tech);

        // Codes
        if (data.codes) {
            data.codes.forEach(c => ajouterBlocCode(c.fileName, c.extension, c.content));
        }
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
                ${imgUrls.length > 0 ? `<p style="color:green; font-size:0.8em;"><i class="fas fa-check"></i> ${imgUrls.length} image(s) sauvegardée(s)</p>` : ""}
            </div>
        </section>`;

    document.getElementById('steps-container').insertAdjacentHTML('beforeend', html);

    const quill = new Quill(`#editor-step-${id}`, { modules: { toolbar: toolbarOptions }, theme: 'snow' });
    if (desc) quill.root.innerHTML = desc;
    quillStepsEditors[id] = quill;
}

window.supprimerEtape = function(id) {
    if(confirm("Supprimer cette étape ?")) {
        document.getElementById(`step-${id}`).remove();
        delete quillStepsEditors[id];
    }
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

window.supprimerSection = function(sid, wid) {
    document.getElementById(sid).remove();
    document.getElementById(wid).style.display = 'block';
};

/**
 * SAUVEGARDE
 */
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = e => reject(e);
});

document.getElementById('details-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
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
            lastUpdate: new Date().toLocaleDateString()
        };

        localStorage.setItem(`details_projet_${projetId}`, JSON.stringify(finalDetails));
        alert("Enregistré !");
    window.location.href = `../../pages/project-detail/display.html?id=${projetId}`;
    } catch (err) {
        console.error(err);
        alert("Erreur");
    }
});

// Events init
document.getElementById('add-step-btn').addEventListener('click', () => ajouterEtape());
document.getElementById('add-tech-btn').addEventListener('click', () => afficherSectionTech());
document.getElementById('add-code-btn').addEventListener('click', () => ajouterBlocCode());

window.addEventListener('load', chargerDonneesExistantes);