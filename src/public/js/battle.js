document.addEventListener('DOMContentLoaded', () => {
    const savedElementsContainer = document.getElementById('savedElements');
    const battleResult = document.querySelector('.battle-result');
    const playerElement = document.querySelector('.player-element');

    // Load saved elements
    function loadSavedElements() {
        const savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        savedElements.forEach(({ name, emoji }) => {
            const element = createElementDiv(name, emoji);
            element.addEventListener('click', () => selectElement(name, emoji));
            savedElementsContainer.appendChild(element);
        });
    }

    function selectElement(name, emoji) {
        playerElement.innerHTML = `<div class="element">${emoji} ${name}</div>`;
        startBattle(name);
    }

    async function startBattle(playerChoice) {
        try {
            const response = await fetch('/api/battle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerElement: playerChoice,
                    opponentElement: 'Stone'
                })
            });
            
            const result = await response.json();
            battleResult.innerHTML = `
                <h2>${result.winner} Wins!</h2>
                <p>${result.reason}</p>
            `;
        } catch (error) {
            console.error('Battle Error:', error);
        }
    }

    function createElementDiv(name, emoji) {
        const div = document.createElement('div');
        div.className = 'element';
        div.innerHTML = `${emoji} ${name}`;
        return div;
    }

    loadSavedElements();
});