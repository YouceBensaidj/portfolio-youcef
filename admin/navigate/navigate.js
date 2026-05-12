function chargerMaNavigation() {
    const cible = document.querySelector('header');
    if (!cible) return;

    const pathArray = window.location.pathname.split('/');
    const repoName = pathArray[1]; 
    const baseRoot = `/${repoName}`; // /portfolio-youcef

    const cheminGitHub = `${baseRoot}/admin/navigate/navigate.html`;

    fetch(cheminGitHub)
        .then(response => {
            if (!response.ok) throw new Error("Navigate.html introuvable");
            return response.text();
        })
        .then(html => {
            cible.innerHTML = html;

            const liens = cible.querySelectorAll('a');
            liens.forEach(lien => {
                let href = lien.getAttribute('href');
                
                if (href && href !== "#" && !href.startsWith('http')) {
                    
                    if (href.startsWith('ROOT:')) {
                        // CAS 1 : Lien vers le site public (ex: ROOT:index.html)
                        // On enlève "ROOT:" et on pointe vers la racine du repo
                        const cleanHref = href.replace('ROOT:', '');
                        lien.href = `${baseRoot}/${cleanHref}`;
                    } else {
                        // CAS 2 : Lien interne à l'administration
                        // On pointe vers /portfolio-youcef/admin/le-lien
                        lien.href = `${baseRoot}/admin/${href}`;
                    }
                }
            });
            console.log("Navigation et liens (Public/Admin) corrigés !");
        })
        .catch(err => console.error("Erreur :", err));
}

document.addEventListener("DOMContentLoaded", chargerMaNavigation);