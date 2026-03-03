// Fonction pour gérer les onglets (Tabs)
function switchTab(tabId) {
    // Retirer l'état actif de tous les triggers et contenus
    document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activer l'onglet cliqué
    event.currentTarget.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// Fonction de calcul exacte Denormandie
function calculerDenormandie() {
    const prix = parseFloat(document.getElementById('prix').value) || 0;
    const notaire = parseFloat(document.getElementById('notaire').value) || 0;
    const travaux = parseFloat(document.getElementById('travaux').value) || 0;
    const surface = parseFloat(document.getElementById('surface').value) || 0;
    const resultDiv = document.getElementById('result-container');

    const coutTotal = prix + notaire + travaux;
    const ratioTravaux = (travaux / coutTotal) * 100;

    // Validation 1 : Ratio Travaux > 25%
    if (ratioTravaux < 25) {
        resultDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>❌ Éligibilité refusée</strong><br>
                Les travaux représentent ${ratioTravaux.toFixed(1)}% du coût total. La loi Denormandie exige un minimum de 25%.
            </div>
            <p style="font-size: 0.9rem;"><strong>Coût total de l'opération :</strong> ${coutTotal.toLocaleString('fr-FR')} €</p>
        `;
        return;
    }

    // Calcul de l'assiette plafonnée (300 000€ max et 5 500€ / m²)
    const plafondM2 = surface * 5500;
    const assiette = Math.min(coutTotal, 300000, plafondM2);

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
