document.addEventListener('DOMContentLoaded', () => {
    const savedElementsContainer = document.getElementById('savedElements');
    const battleResult = document.querySelector('.battle-result');
    const playerElement = document.querySelector('.player-element');
    let selectedMode = null;

    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedMode = btn.dataset.mode;
            modeButtons.forEach(b => {
                b.disabled = true;
                b.classList.remove('active');
            });
            btn.disabled = false;
            btn.classList.add('active');
            savedElementsContainer.style.display = 'block';
        });
    });

    // Load saved elements
    function loadSavedElements() {
        const savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        savedElements.forEach(({ name, emoji }) => {
            const element = createElementDiv(name, emoji);
            element.addEventListener('click', () => {selectElement(name, emoji);
                updateOpponent(name, emoji);
             }
        );
            savedElementsContainer.appendChild(element);
        });
    }

    function selectElement(name, emoji) {
        // if (!selectedMode) {
        //     alert('Please select a battle mode first!');
        //     return; // Early return if no mode selected
        // }
        playerElement.innerHTML = `<div class="element">${emoji} ${name}</div>`;
        startBattle(name);
    }

    function showBattleResult(winner, reason) {
        const vsText = document.querySelector('.vs');
        const battleResult = document.querySelector('.battle-result');
        const playerElement = document.querySelector('.player-element');
        const opponentElement = document.querySelector('.opponent-element');
        
        // Hide VS text
        vsText.classList.add('hidden');
        
        // Update battle result with formatted HTML
        battleResult.innerHTML = `
            <h2>${winner} Wins!</h2>
            <p>${reason}</p>
        `;
        
        // Reset and add winner classes
        playerElement.classList.remove('winner');
        opponentElement.classList.remove('winner');
        
        if (winner === playerElement.textContent.split(' ')[1]) {
            playerElement.classList.add('winner');
        } else {
            opponentElement.classList.add('winner');
        }
        setTimeout(() => {
            resetModeButtons();
        }, 2000);
    }
    
    function updateOpponent(element, emoji) {
        try {
            const opponentEmoji = document.getElementById('opponent-emoji   ');
            const opponentResult = document.getElementById('opponent-result');
            
            if (opponentEmoji && opponentResult) {
                opponentEmoji.textContent = emoji;
                opponentResult.textContent = element;
            } else {
                console.error('Opponent elements not found in DOM');
            }
        } catch (error) {
            console.error('Error updating opponent:', error);
        }
    }

// Start polling for opponent updates
const pollInterval = setInterval(updateOpponent, 2000); // Updates every 2 seconds

// Initial update
updateOpponent();

// Clean up when page is closed/changed
window.addEventListener('beforeunload', () => {
    clearInterval(pollInterval);
});


// Clean up when page is closed/changed
window.addEventListener('beforeunload', () => {
    clearInterval(pollInterval);
});


function startBattle(name, emoji) {
    const playerElement = document.querySelector('.player-element');
    
    if (!name) return;
    
    playerElement.innerHTML = `<div class="element">${emoji} ${name}</div>`;
    
    fetch('/api/battle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            playerElement: { name, emoji },
            mode: selectedMode,
        })
    })
    .then(response => response.json())
    .then(data => {
        showBattleResult(data.playerElement.name, data.reason);
        updateOpponent(data.playerElement.name, data.playerElement.emoji);
    })
    .catch(error => {
        console.error('Battle Error:', error);
        showBattleResult('Error', 'Battle failed to complete');
    });
}

    function resetModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('active');
        });
        selectedMode = null;
        // Reset player element selection
        playerElement.innerHTML = '<div class="element-placeholder">Select your element</div>';
    }
    

    function createElementDiv(name, emoji) {
        const div = document.createElement('div');
        div.className = 'element';
        div.innerHTML = `${emoji} ${name}`;
        return div;
    }

    loadSavedElements();
});

// Optional: Stop polling when leaving the page
window.addEventListener('beforeunload', () => {
    clearInterval(pollInterval);
})