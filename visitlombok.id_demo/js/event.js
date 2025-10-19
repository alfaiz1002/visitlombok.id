// Event page specific JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Load data
    const data = await loadWisataData();
    
    // Load events and recommendations
    loadEvents(data);
    loadRecommendations(data);
});

function loadEvents(data) {
    const eventsList = document.getElementById('eventsList');
    
    // Sample events data (in real app, this would come from an API)
    const events = [
        {
            title: "Festival Bau Nyale 2024",
            date: "15-17 Februari 2024",
            location: "Pantai Seger, Kuta Lombok",
            description: "Festival budaya tahunan menangkap cacing nyale dengan berbagai atraksi budaya Sasak.",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80"
        },
        {
            title: "MotoGP Mandalika 2024",
            date: "20-22 Oktober 2024",
            location: "Sirkuit Mandalika",
            description: "Event balap motor dunia yang menampilkan pembalap terbaik di sirkuit internasional Mandalika.",
            image: "https://images.unsplash.com/photo-1593941707882-5a5bba5331f5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        },
        {
            title: "Lombok International Marathon",
            date: "28 Juli 2024",
            location: "Kota Mataram - Pantai Senggigi",
            description: "Event lari marathon internasional dengan rute menawan sepanjang pesisir Lombok.",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        }
    ];
    
    eventsList.innerHTML = events.map(event => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${event.title}</h3>
                <p class="text-gray-600 mb-3">${event.description}</p>
                <div class="flex justify-between items-center text-sm text-gray-500">
                    <span><i class="fas fa-calendar"></i> ${event.date}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadRecommendations(data) {
    const recommendationsList = document.getElementById('recommendationsList');
    
    // Get top rated destinations
    const recommendations = data
        .filter(wisata => wisata.rating >= 4.5)
        .slice(0, 3);
    
    recommendationsList.innerHTML = recommendations.map(wisata => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="${wisata.gambar}" alt="${wisata.nama}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${wisata.nama}</h3>
                <p class="text-gray-600 mb-3">${wisata.deskripsi ? wisata.deskripsi.substring(0, 100) + '...' : 'Destinasi wisata menarik di Lombok'}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">
                            <i class="fas fa-star"></i>
                        </span>
                        <span>${wisata.rating}</span>
                    </div>
                    <button onclick="viewDetail('${wisata.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Jelajahi
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}