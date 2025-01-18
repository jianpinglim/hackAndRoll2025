document.addEventListener('DOMContentLoaded', () => {

    let timeLeft = 30;
    const countdownEl = document.getElementById('countdown');

    // Timer function
    function startTimer() {
        const timer = setInterval(() => {
            timeLeft--;
            countdownEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                window.location.href = 'battle.html';
            }
        }, 1000);
    }

    function initializeStorage() {
        let savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        
        // Add basic elements if not present
        basicElements.forEach(({name, emoji}) => {
            if (!savedElements.some(el => el.name === name)) {
                savedElements.push({ name, emoji });
            }
        });
        
        localStorage.setItem('craftedElements', JSON.stringify(savedElements));
        return savedElements;
    }

    function saveToLocalStorage(element, emoji) {
        let savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        // Check for duplicates
        if (!savedElements.some(el => el.name === element)) {
            savedElements.push({ name: element, emoji: emoji });
            localStorage.setItem('craftedElements', JSON.stringify(savedElements));
        }
    }

    

    // Start timer immediately
    startTimer();
    // DOM Elements
    const elements = document.querySelectorAll('.element');
    const dropZones = document.querySelectorAll('.drop-zone');
    const resultZone = document.querySelector('.result-zone');
    const discoveredList = document.getElementById('discoveredElements');

    // Validate required elements
    if (!discoveredList) {
        console.error('Could not find discoveredElements container');
        return;
    }


    const basicElements = [
        { name: 'Water', emoji: '💧' },
        { name: 'Fire', emoji: '🔥' },
        { name: 'Earth', emoji: '🌍' },
        { name: 'Air', emoji: '💨' }
    ];


    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.element);
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const zone = e.currentTarget;
        zone.classList.remove('drag-over');
        
        const elementName = e.dataTransfer.getData('text/plain');
        const elementEmoji = discoveries.get(elementName) || '❓';
        const newElement = createElementDiv(elementName, elementEmoji);
        
        zone.innerHTML = '';
        zone.appendChild(newElement);
        
        checkCombination();
    }

    function createElementDiv(name, emoji = '❓') {
        const div = document.createElement('div');
        div.className = 'element';
        div.innerHTML = `<span class="emoji">${emoji}</span> <span class="name">${name}</span>`;
        div.dataset.element = name;
        div.dataset.emoji = emoji;
        div.draggable = true;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        return div;
    }

    function clearCraftingArea() {
        const zone1 = document.querySelector('#dropZone1');
        const zone2 = document.querySelector('#dropZone2');
        
        zone1.innerHTML = 'Drag Element Here';
        zone2.innerHTML = 'Drag Element Here';
    }

    function checkCombination() {
        const zone1Element = document.querySelector('#dropZone1 .element');
        const zone2Element = document.querySelector('#dropZone2 .element');

        console.log("I am at main combination")
        console.log(zone1Element)
        console.log(zone2Element)
    
        if (zone1Element && zone2Element) {
            const element1 = zone1Element.dataset.element;
            const element2 = zone2Element.dataset.element;
            console.log('Combining:', element1, element2);
    
            fetch('/api/combinations/combine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ element1, element2 })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.warn('Using fallback combination:', data.error);
                }
                displayResult(data.result, data.emoji);
                clearCraftingArea();
            })
            .catch(error => {
                console.error('API Error:', error);
                const fallback = `${element1}${element2}`;
                console.warn('Using simple combination:', fallback);
                displayResult(fallback, '❓');
                clearCraftingArea();
            });
        }
    }

    function displayResult(result, emoji) {
        resultZone.innerHTML = '';
        const resultElement = createElementDiv(result, emoji);
        resultZone.appendChild(resultElement);
        
        if (!discoveries.has(result)) {
            discoveries.set(result, emoji);
            updateDiscoveries(result, emoji);
            saveToLocalStorage(result, emoji);
        }
    }

    const savedElements = initializeStorage();
    savedElements.forEach(({name, emoji}) => {
        discoveries.set(name, emoji);
        updateDiscoveries(name, emoji);
    });


    function saveToLocalStorage(element, emoji) {
        let savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        savedElements.push({ name: element, emoji: emoji });
        localStorage.setItem('craftedElements', JSON.stringify(savedElements));
    }

    function updateDiscoveries(newElement, emoji) {
        const discoveryDiv = createElementDiv(newElement, emoji);
        discoveryDiv.classList.add('new-discovery');
        discoveredList.appendChild(discoveryDiv);
    }

    // Add drag and drop listeners
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // Initialize discovered elements
    discoveries.forEach((emoji, element) => {
        updateDiscoveries(element, emoji);
    });
});


