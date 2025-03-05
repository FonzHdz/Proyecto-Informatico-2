const API_URL = "http://localhost:8090/api/emotions";

// Función para guardar una emoción
document.getElementById('emotionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const emotion = {
        userId: document.getElementById('userId').value,
        emocion: document.getElementById('emocion').value,
        descripcion: document.getElementById('descripcion').value,
        tipo: document.getElementById('tipo').value,
        fecha: new Date().toISOString()
    };

    axios.post(`${API_URL}/create`, emotion)
        .then(() => {
            alert("Emoción guardada");
            loadEmotions();
        })
        .catch(error => console.error("Error al guardar la emoción:", error));
});

// Función para cargar todas las emociones
function loadEmotions() {
    axios.get(`${API_URL}/all`)
        .then(response => {
            const emotions = response.data;
            const emotionList = document.getElementById('emotionList');
            emotionList.innerHTML = "";
            emotions.forEach(emotion => {
                const li = document.createElement('li');
                li.textContent = `${emotion.emocion} - ${emotion.descripcion} (${emotion.tipo})`;
                emotionList.appendChild(li);
            });
        })
        .catch(error => console.error("Error al cargar emociones:", error));
}

// Función para buscar emoción por tipo
function searchEmotion() {
    const tipo = document.getElementById('searchTipo').value;
    axios.get(`${API_URL}/search/${tipo}`)
        .then(response => {
            const emotion = response.data;
            document.getElementById('searchResult').textContent = `Emoción encontrada: ${emotion.emocion} - ${emotion.descripcion}`;
        })
        .catch(error => {
            document.getElementById('searchResult').textContent = "No se encontró la emoción";
            console.error("Error al buscar emoción:", error);
        });
}