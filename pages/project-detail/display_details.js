
// --- [A] BARRE DE PROGRESSION LECTURE ---
// Ajouter AVANT le DOMContentLoaded existant (niveau module)

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
                observer.unobserve(entry.target); // One-shot
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(el => observer.observe(el));
}


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projetIdRaw = urlParams.get('id');

    const details = JSON.parse(localStorage.getItem(`details_projet_${projetIdRaw}`));
    const projetsBase = JSON.parse(localStorage.getItem('monPortfolioData')) || [];
    const infoBase = projetsBase.find(p => p.id == projetIdRaw);

      
    if (!details) {
        console.warn("Aucune donnée trouvée pour l'ID :", projetIdRaw);
        return;
    }

    // 1. TITRE ET BADGES
    document.getElementById('view-title').textContent = infoBase ? infoBase.titre : "Détails du Projet";
    
    const badgesContainer = document.getElementById('view-badges');
    if (badgesContainer && details.materiel) {
        badgesContainer.innerHTML = details.materiel.split(',')
            .map(m => `<span class="badge">${m.trim()}</span>`).join('');
    }

    // --- MISE À JOUR : IMAGE DE COUVERTURE ---
    const coverContainer = document.getElementById('project-cover-container');
    const coverImg = document.getElementById('view-cover-img');
    if (details.coverImage && coverContainer && coverImg) {
        coverImg.src = details.coverImage;
        coverImg.classList.add('zoom-target'); // Pour la lightbox
        coverContainer.style.display = 'block';
    }
    
    // RÉSUMÉ (Texte riche de Quill)
    const summaryView = document.getElementById('view-summary');
    if (summaryView) {
        summaryView.innerHTML = details.summary || "";
    }

    // 2. GESTION DES ÉTAPES
    const stepsContainer = document.getElementById('view-steps-container');
    if (stepsContainer && details.steps) {
        stepsContainer.innerHTML = ''; 
        details.steps.forEach((step, index) => {
            const imgCount = step.imgs ? step.imgs.length : 0;
            
            let layoutClass = "project-step";
            if (imgCount === 0) layoutClass += " no-image-step";
            else if (imgCount === 1) layoutClass += " single-photo";
            else layoutClass += " multi-photos";

            let imagesHtml = '';
            if (imgCount > 0) {
                imagesHtml = `<div class="step-images-container"><div class="step-gallery">`;
                step.imgs.forEach(imgSrc => {
                    // AJOUT : classe zoom-target pour la lightbox
                   imagesHtml += `<img src="${imgSrc}" alt="${step.title}" class="zoom-target" loading="lazy">`;
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

    // 4. GESTION DU CODE SOURCE
    const codeSection = document.getElementById('view-code-section');
    const codeSource = document.getElementById('view-code-source');

    if (codeSection && codeSource) {
        if (details.codes && details.codes.length > 0) {
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

        } else if (details.code) { 
            codeSection.style.display = 'block';
            codeSource.innerHTML = `<pre><code>${escapeHtml(details.code)}</code></pre>`;
        }
    }


});

/**
 * Utilitaires
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- GESTION DE LA LIGHTBOX ---
// Note : J'utilise les classes de ton HTML (lightbox-overlay / active)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(imgSrc) {
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex'; // Ton HTML utilise display:none par défaut
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', (event) => {
    // Si on clique sur une image "zoomable" ou "zoom-target"
    if (event.target.classList.contains('zoom-target') || event.target.classList.contains('zoomable')) {
        openLightbox(event.target.src);
    }
    // Fermeture
    if (event.target === lightbox || event.target.closest('#lightbox') && event.target.tagName === 'SPAN') {
        closeLightbox();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
});