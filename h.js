document.addEventListener('DOMContentLoaded', () => {
    // Éléments Formulaire
    const inputPrix = document.getElementById('input-prix');
    const inputNotaire = document.getElementById('input-notaire');
    const inputTravaux = document.getElementById('input-travaux');
    const inputSurface = document.getElementById('input-surface');
    const tabs = document.querySelectorAll('.tab');

    // Éléments d'affichage Formulaire
    const valPrix = document.getElementById('val-prix');
    const valTravaux = document.getElementById('val-travaux');
    const valSurface = document.getElementById('val-surface');
    
    // Fills des sliders
    const fillPrix = document.getElementById('fill-prix');
    const fillTravaux = document.getElementById('fill-travaux');
    const fillSurface = document.getElementById('fill-surface');

    // Variables d'état
    let duree = 9;

    // Constantes Fiscales
    const PLAFOND_ASSIETTE = 300000;
    const PLAFOND_M2 = 5500;

    // Utilitaire de formatage (175 000 €)
    const formatEur = (num) => new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' €';

    // Met à jour la jauge rouge derrière le bouton du slider
    function updateSliderFill(input, fill) {
        const min = input.min || 0;
        const max = input.max || 100;
        const val = input.value;
        const percentage = ((val - min) / (max - min)) * 100;
        fill.style.width = `${percentage}%`;
    }

    // Fonction Principale de Calcul
    function calculer() {
        const prix = parseFloat(inputPrix.value);
        const travaux = parseFloat(inputTravaux.value);
        const surface = parseFloat(inputSurface.value);
        
        // Calcul auto frais de notaire si on bouge le prix (8%)
        // Commenté pour te laisser la main libre, mais on récupère la valeur de l'input
        const notaire = parseFloat(inputNotaire.value) || 0;

        // Maj Textes Formulaire
        valPrix.textContent = formatEur(prix);
        valTravaux.textContent = formatEur(travaux);
        valSurface.textContent = surface + ' m²';

        // Maj Jauges rouges
        updateSliderFill(inputPrix, fillPrix);
        updateSliderFill(inputTravaux, fillTravaux);
        updateSliderFill(inputSurface, fillSurface);

        // --- MATHÉMATIQUES EXACTES ---
        const coutTotal = prix + notaire + travaux;
        const ratioTravaux = (travaux / coutTotal) * 100;
        const isEligible = ratioTravaux >= 25;

        // Éligibilité UI
        const cardElig = document.getElementById('card-eligibilite');
        const iconElig = document.getElementById('icon-eligibilite');
        const titreElig = document.getElementById('titre-eligibilite');
        const texteElig = document.getElementById('texte-eligibilite');

        if(isEligible) {
            cardElig.style.borderColor = '#22c55e';
            cardElig.style.backgroundColor = '#f0fdf4';
            iconElig.style.color = '#16a34a';
            iconElig.setAttribute('data-lucide', 'check-circle-2');
            titreElig.textContent = 'Projet éligible au dispositif Denormandie';
            titreElig.style.color = '#166534';
            texteElig.innerHTML = `Les travaux représentent <strong style="color:#15803d;">${ratioTravaux.toFixed(1)}%</strong> du coût total de l'opération.`;
            texteElig.style.color = '#15803d';
        } else {
            cardElig.style.borderColor = '#ef4444';
            cardElig.style.backgroundColor = '#fef2f2';
            iconElig.style.color = '#dc2626';
            iconElig.setAttribute('data-lucide', 'alert-triangle');
            titreElig.textContent = 'Projet non éligible - Travaux insuffisants';
            titreElig.style.color = '#991b1b';
            
            const travauxManquants = Math.ceil(((prix + notaire) / 0.75) * 0.25);
            texteElig.innerHTML = `Les travaux représentent <strong style="color:#b91c1c;">${ratioTravaux.toFixed(1)}%</strong> du coût total de l'opération. Le minimum requis est de 25%.<br><br>Montant minimum de travaux nécessaire : <strong>${formatEur(travauxManquants)}</strong>`;
            texteElig.style.color = '#b91c1c';
        }
        lucide.createIcons(); // Rafraichir l'icone

        // Assiette (Plafonds)
        const plafondSurf = PLAFOND_M2 * surface;
        const assiette = Math.min(coutTotal, PLAFOND_ASSIETTE, plafondSurf);

        // Taux
        const taux = duree === 6 ? 0.12 : (duree === 9 ? 0.18 : 0.21);
        const reducTotale = isEligible ? assiette * taux : 0;
        const reducAnnuelle = isEligible ? reducTotale / duree : 0;

        // Mise à jour UI droite
        document.getElementById('res-cout-total').textContent = formatEur(coutTotal);
        
        const cardReduc = document.getElementById('res-reduction-totale').parentElement.parentElement;
        if(isEligible) {
            cardReduc.style.backgroundColor = 'var(--primary)';
            document.getElementById('res-reduction-totale').textContent = formatEur(reducTotale);
            document.getElementById('res-reduction-annuelle').textContent = `Soit ${formatEur(reducAnnuelle)}/an sur ${duree} ans`;
        } else {
            cardReduc.style.backgroundColor = '#6B7280'; // Gris si non éligible
            document.getElementById('res-reduction-totale').textContent = '-';
            document.getElementById('res-reduction-annuelle').textContent = `Non éligible`;
        }

        document.getElementById('res-assiette').textContent = formatEur(assiette);
        document.getElementById('res-taux').textContent = (taux * 100) + '%';
        document.getElementById('res-taux-texte').textContent = `Pour ${duree} ans d'engagement`;

        // Grille Economie (Générée)
        const gridEco = document.getElementById('grid-economie');
        gridEco.innerHTML = [6, 9, 12].map(ans => {
            const r = ans === 6 ? 0.12 : (ans === 9 ? 0.18 : 0.21);
            const val = isEligible ? assiette * r : 0;
            const isActif = ans === duree;
            return `
                <div style="padding: 1rem; border-radius: var(--radius); ${isActif ? 'background: rgba(227,6,19,0.1); border: 2px solid var(--primary);' : 'background: var(--bg-light);'}">
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${ans} ans</div>
                    <div style="font-size: 1.125rem; font-weight: 700; color: ${isActif ? 'var(--primary)' : 'var(--secondary)'}; margin: 0.25rem 0;">${isEligible ? formatEur(val) : '-'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${r * 100}%</div>
                </div>
            `;
        }).join('');
    }

    // Events Listeners
    [inputPrix, inputNotaire, inputTravaux, inputSurface].forEach(input => {
        input.addEventListener('input', calculer);
    });

    // Gestion des onglets Durée
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            duree = parseInt(e.target.getAttribute('data-annees'));
            calculer();
        });
    });

    // Initialisation
    calculer();
});    const assiette = Math.min(coutTotal, 300000, plafondM2);

    // Calcul des réductions (12%, 18%, 21%)
    const reduc6ans = assiette * 0.12;
    const reduc9ans = assiette * 0.18;
    const reduc12ans = assiette * 0.21;

    // Calcul Plafond Loyer Zone B2 (9.83€/m²) avec coefficient multiplicateur
    let coefLoyer = 0.7 + (19 / surface);
    if (coefLoyer > 1.2) coefLoyer = 1.2;
    const loyerMax = surface * 9.83 * coefLoyer;

    // Affichage 100% fidèle au design demandé
    resultDiv.innerHTML = `
        <div class="alert alert-success" style="margin-bottom: 20px;">
            <strong>✅ Projet Éligible Denormandie !</strong><br>
            Ratio travaux : ${ratioTravaux.toFixed(1)}% (Minimum 25% respecté).
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem;">
            <span>Coût total opération :</span>
            <strong>${coutTotal.toLocaleString('fr-FR')} €</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.95rem;">
            <span>Assiette de défiscalisation :</span>
            <strong>${assiette.toLocaleString('fr-FR')} €</strong>
        </div>

        <h3 style="font-size: 1rem; color: var(--secondary); border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 12px;">Réduction d'impôt potentielle</h3>
        
        <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span>Engagement 6 ans (12%)</span>
                <strong>+ ${reduc6ans.toLocaleString('fr-FR')} €</strong>
            </div>
        </div>
        <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span>Engagement 9 ans (18%)</span>
                <strong>+ ${reduc9ans.toLocaleString('fr-FR')} €</strong>
            </div>
        </div>
        <div style="background: white; border: 1px solid var(--primary); border-radius: var(--radius); padding: 12px; margin-bottom: 20px; box-shadow: 0 0 0 1px var(--primary);">
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--primary);">
                <strong>Engagement 12 ans (21%)</strong>
                <strong>+ ${reduc12ans.toLocaleString('fr-FR')} €</strong>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>Plafond de loyer (Zone B2) :</strong><br>
            Loyer mensuel max : <strong>${loyerMax.toFixed(2)} € hors charges</strong>.<br><br>
            <em>⚠️ Conditions obligatoires : Amélioration énergétique de 30% minimum requise et location nue à titre de résidence principale.</em>
        </div>
    `;
}

// Lancer le calcul automatiquement au chargement
document.addEventListener('DOMContentLoaded', calculerDenormandie);
