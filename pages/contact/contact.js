// Votre formulaire a l'ID 'contact-form'
const form = document.getElementById('contact-form');
const submitBtn = form.querySelector('.btn-submit'); // Adapté à votre classe CSS

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche la page de se recharger

    const formData = new FormData(form);
    
    // 1. Votre clé Web3Forms officielle
    formData.append("access_key", "5925b82c-a8d5-482c-8ca4-e09d3c8ae18d");

    // 2. INDICE 1 : Ajoute "[Portfolio]" au début du sujet du mail
    const sujetOriginal = form.subject.value;
    formData.set("subject", "[Portfolio] " + sujetOriginal);

    // 3. INDICE 2 : Ajoute une mention personnalisée à l'intérieur du corps du message
    const messageOriginal = form.message.value;
    const messagePersonnalise = `${messageOriginal}\n\n---------------------------------------\n📌 Cet e-mail provient du formulaire de contact de mon Portfolio.`;
    formData.set("message", messagePersonnalise);

    const originalText = submitBtn.textContent;

    // Effet visuel sympa pendant l'envoi
    submitBtn.textContent = "Envoi en cours...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Succès ! Votre message a bien été envoyé.");
            form.reset(); // Vide les champs
        } else {
            alert("Erreur : " + data.message);
        }

    } catch (error) {
        alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
        // Remet le bouton à son état initial après l'envoi
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});