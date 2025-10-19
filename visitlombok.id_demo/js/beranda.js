// Beranda page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load data
    const data = await loadWisataData();
    
    // Update statistics
    updateStatistics(data);
    
    // Load featured destinations
    loadFeaturedDestinations(data);
    
    // Initialize map preview
    initializeMapPreview(data);
});

function updateStatistics(data) {
    const totalWisata = data.length;
    const totalKategori = new Set(data.map(w => w.kategori)).size;
    const totalEvent = data.filter(w => w.event).length;
    const totalWilayah = new Set(data.map(w => w.wilayah)).size;
    
    document.getElementById('totalWisata').textContent = totalWisata;
    document.getElementById('totalKategori').textContent = totalKategori;
    document.getElementById('totalEvent').textContent = totalEvent;
    document.getElementById('totalWilayah').textContent = totalWilayah;
}

function loadFeaturedDestinations(data) {
    const featuredContainer = document.getElementById('featuredDestinations');
    const featured = data.slice(0, 3); // Show first 3 as featured
    
    featuredContainer.innerHTML = featured.map(wisata => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden destination-card">
            <img src="${wisata.gambar}" alt="${wisata.nama}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${wisata.nama}</h3>
                <p class="text-gray-600 mb-3">${wisata.deskripsi ? wisata.deskripsi.substring(0, 100) + '...' : 'Destinasi wisata menarik di Lombok'}</p>
                <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span><i class="fas fa-map-marker-alt"></i> ${wisata.wilayah}</span>
                    <span><i class="fas fa-tag"></i> ${wisata.kategori}</span>
                </div>
                <button onclick="viewDetail('${wisata.id}')" class="w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition duration-300">
                    Lihat Detail
                </button>
            </div>
        </div>
    `).join('');
}

function initializeMapPreview(data) {
    const map = L.map('mapPreview').setView([-8.6500, 116.3167], 9);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add sample markers (first 5 locations)
    data.slice(0, 5).forEach(wisata => {
        L.marker([wisata.lat, wisata.lng], {
            icon: createMarkerIcon(wisata.kategori)
        })
        .bindPopup(`<strong>${wisata.nama}</strong><br>${wisata.wilayah}`)
        .addTo(map);
    });
}