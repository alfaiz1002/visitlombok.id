// Kategori page specific JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Load data
    const data = await loadWisataData();
    
    // Setup category buttons
    setupCategoryButtons(data);
});

function setupCategoryButtons(data) {
    const categoryButtons = document.querySelectorAll('.view-category');
    const categoryResults = document.getElementById('categoryResults');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDestinations = document.getElementById('categoryDestinations');
    const backButton = document.getElementById('backToCategories');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            showCategoryDestinations(data, category);
        });
    });
    
    backButton.addEventListener('click', function() {
        categoryResults.classList.add('hidden');
        document.querySelector('.grid').classList.remove('hidden');
    });
}

function showCategoryDestinations(data, category) {
    const categoryResults = document.getElementById('categoryResults');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDestinations = document.getElementById('categoryDestinations');
    
    // Filter data by category
    const filteredData = data.filter(wisata => wisata.kategori === category);
    
    // Update UI
    const categoryNames = {
        'alam': 'Wisata Alam',
        'budaya': 'Wisata Budaya',
        'kuliner': 'Wisata Kuliner',
        'religi': 'Wisata Religi',
        'buatan': 'Wisata Buatan'
    };
    
    categoryTitle.textContent = categoryNames[category];
    categoryDestinations.innerHTML = filteredData.map(wisata => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden destination-card">
            <img src="${wisata.gambar}" alt="${wisata.nama}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${wisata.nama}</h3>
                <p class="text-gray-600 text-sm mb-3">${wisata.deskripsi ? wisata.deskripsi.substring(0, 100) + '...' : 'Destinasi wisata menarik di Lombok'}</p>
                <div class="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span><i class="fas fa-map-marker-alt"></i> ${wisata.wilayah}</span>
                    <span><i class="fas fa-clock"></i> ${wisata.jam}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-green-600 font-semibold">${wisata.tiket}</span>
                    <button onclick="viewDetail('${wisata.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Detail
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Show results, hide category grid
    categoryResults.classList.remove('hidden');
    document.querySelector('.grid').classList.add('hidden');
}