import { ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle } from 'discord.js';
import { EventBuilder } from '../../../Handler/build/base/components/EventBuilder.js';
import { createCanvas } from 'canvas';

const width = 600;
const height = 300;

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function isOverlapping(x: any, y: any, existingPositions: any, minDistance: any) {
    return existingPositions.some((pos: any) => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });
}

function generateCaptcha() {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#e8dcca";
    ctx.fillRect(0, 0, width, height);

    const delta = 25;
    const nbcaptcha = 5;
    const minDistance = 30; // Distance minimale entre deux positions
    const positions: any[] = [];

    // Génération des positions valides
    for (let i = 0; i < nbcaptcha; i++) {
        let x, y;
        do {
            x = delta + getRandomInt((width - 2 * delta) / nbcaptcha) + (i * ((width - 2 * delta) / nbcaptcha));
            y = delta + getRandomInt(height - 2 * delta);
        } while (isOverlapping(x, y, positions, minDistance));
        positions.push({ x, y });
    }

    // Génération des positions aléatoires
    for (let i = 0; i < 15 - nbcaptcha; i++) {
        let x, y;
        do {
            x = delta + getRandomInt(width - 2 * delta);
            y = delta + getRandomInt(height - 2 * delta);
        } while (isOverlapping(x, y, positions, minDistance));
        positions.push({ x, y });
    }

    const finalprint = positions.map(({ x, y }) => ({
        x,
        y,
        letter: String.fromCharCode(97 + getRandomInt(26)), // lettre aléatoire a-z
    }));

    let reponse = "";
    finalprint.forEach(({ x, y, letter }, index) => {
        ctx.font = `${getRandomInt(30) + 20}px sans-serif`;
        ctx.fillStyle = "#FF0000"; // Couleur rouge pour les lettres
        ctx.fillText(letter, x, y - 10); // Décaler légèrement en hauteur (par exemple -10 pixels)

        if (index > 0 && index < nbcaptcha) {
            ctx.beginPath();
            ctx.moveTo(finalprint[index - 1].x, finalprint[index - 1].y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.stroke();

            // Dessiner un cercle à la fin de la ligne
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#FF0000";
            ctx.fill();
            reponse += letter;
        }

        if (index === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#FF0000";
            ctx.fill();
            reponse += letter;
        }
    });

    return { captchaImage: canvas.toBuffer("image/png"), answer: reponse };
}

export default EventBuilder({
    name: 'interactionCreate',
    description: 'Handles interactions like button clicks and modals',
    category: 'Template'
}, async (interaction) => {
    if (interaction.isButton()) {
        const customId = interaction.customId;
        const [tempo, casInitial, ...rest] = customId.split('-'); // Découpe l'ID pour vérifier le type d'interaction

        switch (casInitial) {
            case 'captcha':
                const { captchaImage, answer } = generateCaptcha();
                const button = new ButtonBuilder()
                    .setCustomId(`captcha-bouton-${answer}`) // Nouveau customId pour le bouton de validation
                    .setLabel('Valider')
                    .setStyle(ButtonStyle.Primary);

                const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

                await interaction.reply({
                    content: 'Veuillez résoudre le CAPTCHA ci-dessous :',
                    files: [{
                        attachment: captchaImage,
                        name: 'captcha.png'
                    }],
                    components: [actionRow]
                });
                break;
            // Ajoutez d'autres cas ici pour d'autres types de vérifications
            case 'rolechoisi':
                // Gérer les vérifications pour le cas 'rolechoisi'
                break;

            default:
                // Cas par défaut si aucune condition spécifique n'est rencontrée
                break;
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.includes('captcha-modal')) {
            const userInput = interaction.fields.getTextInputValue('captcha-input').toLowerCase();
            const captchaSolution = interaction.customId.split('-')[2].toLowerCase();

            if (userInput === captchaSolution) {
                await interaction.reply({ content: 'CAPTCHA validé avec succès !', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Échec de la validation du CAPTCHA. Veuillez réessayer.', ephemeral: true });
            }
        }
    }

    // Validation du bouton CAPTCHA (Ouvrir le modal)
    if (interaction.isButton() && interaction.customId.includes('captcha-bouton')) {
        const answer = interaction.customId.split('-')[2]; // Récupère la réponse cachée dans le customId du bouton

        // Créer un modal pour demander la réponse
        const modal = new ModalBuilder()
            .setCustomId(`captcha-modal-${answer}`)
            .setTitle('Validation du CAPTCHA');

        const captchaInput = new TextInputBuilder()
            .setCustomId('captcha-input')
            .setLabel('Entrez le texte du CAPTCHA')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(captchaInput);

        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
});
