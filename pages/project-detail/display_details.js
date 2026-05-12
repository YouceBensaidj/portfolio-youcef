// 1. IMPORTATION DE FIREBASE
// Vérifie bien que le chemin vers firebase-config.js est correct selon ton dossier
import { db } from '../../admin/project-form/firebase-config.js'; 
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// --- [A] BARRE DE PROGRESSION LECTURE ---
function initReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(progress, 100)}%`;
    }, { passive: true });
}

// --- [B] ANIMATIONS AU SCROLL ---
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.project-step, .tech-card, .view-section, .project-header'
    );
    
    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(el => observer.observe(el));
}

// --- [C] CHARGEMENT DES DONNÉES DEPUIS FIREBASE ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initialisation des visuels
    initReadingProgress();
    initScrollReveal();

    const urlParams = new URLSearchParams(window.location.search);
    const projetIdRaw = urlParams.get('id');

    if (!projetIdRaw) {
        console.error("Aucun ID trouvé dans l'URL. Utilisez ?id=votre_id");
        return;
    }

    try {
        // Récupération du document dans la collection "details_projets"
        const docRef = doc(db, "details_projets", projetIdRaw);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const details = docSnap.data();
            renderProjectDetails(details);
        } else {
            console.warn("Projet introuvable dans Firestore pour l'ID :", projetIdRaw);
        }
    } catch (error) {
        console.error("Erreur Firebase :", error);
    }
});

// --- [D] FONCTION D'AFFICHAGE DES DONNÉES ---
function renderProjectDetails(details) {
    // 1. TITRE ET BADGES
    document.getElementById('view-title').textContent = details.title || "Détails du Projet";
    
    const badgesContainer = document.getElementById('view-badges');
    if (badgesContainer && details.materiel) {
        badgesContainer.innerHTML = details.materiel.split(',')
            .map(m => `<span class="badge">${m.trim()}</span>`).join('');
    }

    // IMAGE DE COUVERTURE
    const coverContainer = document.getElementById('project-cover-container');
    const coverImg = document.getElementById('view-cover-img');
    if (details.coverImage && coverContainer && coverImg) {
        coverImg.src = details.coverImage;
        coverImg.classList.add('zoom-target'); 
        coverContainer.style.display = 'block';
    }
    
    // RÉSUMÉ (Quill HTML)
    const summaryView = document.getElementById('view-summary');
    if (summaryView) {
        summaryView.innerHTML = details.summary || "";
    }

    // 2. ÉTAPES DU PROJET
    const stepsContainer = document.getElementById('view-steps-container');
    if (stepsContainer && details.steps) {
        stepsContainer.innerHTML = ''; 
        details.steps.forEach((step, index) => {
            const imgCount = step.imgs ? step.imgs.length : 0;
            
            let layoutClass = "project-step" + (imgCount === 0 ? " no-image-step" : imgCount === 1 ? " single-photo" : " multi-photos");

            let imagesHtml = '';
            if (imgCount > 0) {
                imagesHtml = `<div class="step-images-container"><div class="step-gallery">`;
                step.imgs.forEach(imgSrc => {
                   imagesHtml += `<img src="${imgSrc}" class="zoom-target" loading="lazy">`;
                });
                imagesHtml += `</div></div>`;
            }

            stepsContainer.insertAdjacentHTML('beforeend', `
                <section class="${layoutClass}">
                    <div class="step-text">
                     <h2>
                         <span class="step-number">${index + 1}</span>
                         <span class="step-title-text">${step.title}</span>
                     </h2>
                        <div class="description-content">${step.desc}</div>
                    </div>
                    ${imagesHtml}
                </section>
            `);
        });
    }

    // 3. SECTION TECHNIQUE
    const techSection = document.getElementById('view-tech-section');
    if (details.tech && techSection) {
        techSection.style.display = 'block';
        document.getElementById('view-tech-formula').textContent = details.tech.formula;
        document.getElementById('view-tech-result').innerHTML = `Résultat : <strong>${details.tech.result}</strong>`;
    }

    // 4. CODES SOURCE
    const codeSection = document.getElementById('view-code-section');
    const codeSource = document.getElementById('view-code-source');

    if (codeSection && codeSource && details.codes) {
        codeSection.style.display = 'block';
        codeSource.innerHTML = details.codes.map(c => {
            const langClass = c.extension ? c.extension.replace('.', '') : 'clike';
            return `
            <div class="code-block-wrapper" style="margin-bottom: 25px; border-radius: 8px; overflow: hidden; border: 1px solid #444;">
                <div class="code-header" style="background: #2d2d2d; color: #aaa; padding: 8px 15px; font-family: monospace; font-size: 0.9em; border-bottom: 1px solid #444;">
                    <i class="fas fa-file-code"></i> ${c.fileName}${c.extension}
                </div>
                <pre style="margin:0; border-radius:0;"><code class="language-${langClass}">${escapeHtml(c.content)}</code></pre>
            </div>
            `;
        }).join('');
        
        if (window.Prism) Prism.highlightAll();
    }
}

// --- [E] UTILITAIRES & LIGHTBOX ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(imgSrc) {
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if(!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('zoom-target')) {
        openLightbox(event.target.src);
    }
    if (event.target === lightbox || (event.target.closest('#lightbox') && event.target.tagName === 'SPAN')) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });