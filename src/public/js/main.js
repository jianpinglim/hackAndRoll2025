document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = document.querySelectorAll('.element');
    const dropZones = document.querySelectorAll('.drop-zone');
    const resultZone = document.querySelector('.result-zone');
    const discoveredList = document.getElementById('discoveredElements');
    const countdownEl = document.getElementById('countdown');


    // Basic elements
    const basicElements = [
        { name: 'Water', emoji: '💧' },
        { name: 'Fire', emoji: '🔥' },
        { name: 'Earth', emoji: '🌍' },
        { name: 'Air', emoji: '💨' }
    ];

    // Initialize discoveries Map
    const discoveries = new Map(
        basicElements.map(el => [el.name, el.emoji])
    );

    function initializeStorage() {
        let savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        if (savedElements.length === 0) {
            savedElements = basicElements;
            localStorage.setItem('craftedElements', JSON.stringify(savedElements));
        }
        return savedElements;
    }

    function saveToLocalStorage(element, emoji) {
        let savedElements = JSON.parse(localStorage.getItem('craftedElements')) || [];
        if (!savedElements.some(el => el.name === element)) {
            savedElements.push({ name: element, emoji });
            localStorage.setItem('craftedElements', JSON.stringify(savedElements));
        }
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

    function clearCraftingArea() {
        const zone1 = document.querySelector('#dropZone1');
        const zone2 = document.querySelector('#dropZone2');
        
        zone1.innerHTML = 'Drag Element Here';
        zone2.innerHTML = 'Drag Element Here';
    }

    function checkCombination() {
        const zone1Element = document.querySelector('#dropZone1 .element');
        const zone2Element = document.querySelector('#dropZone2 .element');

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
                displayResult(`${element1}${element2}`, '❓');
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

    // Initialize everything
    discoveredList.innerHTML = ''; // Clear existing
    const savedElements = initializeStorage();
    savedElements.forEach(({name, emoji}) => {
        discoveries.set(name, emoji);
        updateDiscoveries(name, emoji);
    });
});