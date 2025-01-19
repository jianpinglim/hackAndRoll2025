document.addEventListener('DOMContentLoaded', () => {
    const savedElementsContainer = document.getElementById('savedElements');
    const battleResult = document.querySelector('.battle-result');
    const playerElement = document.querySelector('.player-element');
    const opponentElement = document.querySelector('.opponent-element');
    let currentEnemy = { name: 'Stone', emoji: '🪨' };

    // Load saved elements
    function loadSavedElements() {
        const savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        savedElements.forEach(({ name, emoji }) => {
            const element = createElementDiv(name, emoji);
            element.addEventListener('click', () => selectElement(name, emoji));
            savedElementsContainer.appendChild(element);
        });
    }

    function createElementDiv(name, emoji) {
        const div = document.createElement('div');
        div.className = 'element';
        div.innerHTML = `${emoji} ${name}`;
        return div;
    }

    function selectElement(name, emoji) {
        playerElement.innerHTML = `<div class="element">${emoji} ${name}</div>`;
        startBattle({ name, emoji });
    }

    function updateEnemy(newEnemy) {
        currentEnemy = newEnemy;
        opponentElement.innerHTML = `<div class="element">${newEnemy.emoji} ${newEnemy.name}</div>`;
    }

    async function startBattle(playerChoice) {
        try {
            const response = await fetch('/api/battle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerElement: playerChoice.name,
                    opponentElement: currentEnemy.name
                })
            });
            
            const data = await response.json();
            showBattleResult(data.winner, data.reason);
            
            // Update enemy to be the previous player choice
            if (data.winner === currentEnemy.name) {
                // Keep current enemy if it wins
                console.log("Enemy retained:", currentEnemy);
            } else {
                // Update enemy to be the winning player's element
                updateEnemy(playerChoice);
                console.log("New enemy:", playerChoice);
            }
        } catch (error) {
            console.error('Battle Error:', error);
        }
    }

    function showBattleResult(winner, reason) {
        const vsText = document.querySelector('.vs');
        vsText.classList.add('hidden');
        
        battleResult.innerHTML = `
            <h2>${winner} Wins!</h2>
            <p>${reason}</p>
        `;
        
        // Reset previous winners
        playerElement.classList.remove('winner');
        opponentElement.classList.remove('winner');
        
        // Add winner glow
        if (winner === currentEnemy.name) {
            opponentElement.classList.add('winner');
        } else {
            playerElement.classList.add('winner');
        }
    }

    // Initialize
    loadSavedElements();
});