const API_URL = "http://localhost:8090/api/emotions";

// Registros de prueba
let initialEmotions = [
    { userId: 1, emocion: "felicidad", descripcion: "Hoy me siento muy feliz.", fecha: new Date().toISOString(), media: "" },
    { userId: 2, emocion: "tristeza", descripcion: "Me siento un poco triste hoy.", fecha: new Date(Date.now() - 1000 * 60 * 10).toISOString(), media: "" }, // 10 minutos atrás
    { userId: 3, emocion: "enojo", descripcion: "Estoy enojado por algo que pasó.", fecha: new Date(Date.now() - 1000 * 60 * 20).toISOString(), media: "" } // 20 minutos atrás
];

// Función para mostrar u ocultar el campo de emoción personalizada
function toggleCustomEmotionField() {
    const emotionSelect = document.getElementById('emocion');
    const customEmotionField = document.getElementById('customEmotionField');
    if (emotionSelect.value === 'personalizada') {
        customEmotionField.style.display = 'block';
    } else {
        customEmotionField.style.display = 'none';
        document.getElementById('customEmotion').value = ''; // Limpiar el campo
    }
}

// Función para guardar o editar una emoción
document.getElementById('emotionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const emotionId = document.getElementById('emotionId').value;

    const emotion = {
        userId: document.getElementById('userId').value,
        emocion: document.getElementById('emocion').value === 'personalizada' ? document.getElementById('customEmotion').value : document.getElementById('emocion').value,
        descripcion: document.getElementById('descripcion').value,
        fecha: new Date().toISOString(),
        media: document.getElementById('media').files[0] ? document.getElementById('media').files[0].name : "" // Guardar el nombre del archivo
    };

    if (emotionId) {
        // Editar emoción
        initialEmotions[emotionId] = emotion; // Reemplazar con la emoción editada
        showFeedback("Emoción editada correctamente", false);
    } else {
        // Guardar nueva emoción
        initialEmotions.push(emotion);
        showFeedback("Emoción guardada", false);
    }

    clearForm();
    loadEmotions();
});

// Función para cargar todas las emociones
// Función para cargar todas las emociones
function loadEmotions() {
    const emotionList = document.getElementById('emotionList');
    emotionList.innerHTML = "";
    initialEmotions.forEach((emotion, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.textContent = emotion.emocion;
        content.appendChild(title);

        const description = document.createElement('p');
        description.textContent = emotion.descripcion;
        content.appendChild(description);

        const date = document.createElement('p');
        date.textContent = new Date(emotion.fecha).toLocaleString();
        content.appendChild(date);

        // Mostrar multimedia si existe
        if (emotion.media) {
            const mediaElement = document.createElement('img');
            mediaElement.src = `path/to/media/${emotion.media}`; // Reemplaza con la ruta real
            mediaElement.alt = "Multimedia asociada";
            content.appendChild(mediaElement);
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex'; // Usar flex para alinear botones
        buttonContainer.style.gap = '10px'; // Espacio entre botones

        const editButton = document.createElement('button');
        editButton.textContent = "Editar";
        editButton.onclick = () => editEmotion(index);
        buttonContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = () => confirmDelete(index);
        buttonContainer.appendChild(deleteButton);

        content.appendChild(buttonContainer);
        card.appendChild(content);
        emotionList.appendChild(card);
    });
}

// Función para editar una emoción
function editEmotion(index) {
    const emotion = initialEmotions[index];
    document.getElementById('userId').value = emotion.userId;
    document.getElementById('emocion').value = emotion.emocion;
    document.getElementById('descripcion').value = emotion.descripcion;
    document.getElementById('media').value = ""; // Limpiar campo de archivo
    document.getElementById('emotionId').value = index; // Guardar el índice para editar
    toggleCustomEmotionField(); // Mostrar u ocultar el campo personalizado
    if (emotion.emocion === 'personalizada') {
        document.getElementById('customEmotion').value = emotion.emocion; // Mostrar emoción personalizada
        document.getElementById('customEmotionField').style.display = 'block';
    } else {
        document.getElementById('customEmotionField').style.display = 'none';
    }
}

// Función para confirmar eliminación
function confirmDelete(index) {
    if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
        deleteEmotion(index);
    }
}

// Función para eliminar una emoción
function deleteEmotion(index) {
    initialEmotions.splice(index, 1); // Eliminar de la lista
    showFeedback("Emoción eliminada correctamente", false);
    loadEmotions();
}

// Función para mostrar feedback
function showFeedback(message, isError) {
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.textContent = message;
    feedbackMessage.className = isError ? 'feedback error' : 'feedback';
}

// Limpiar formulario
function clearForm() {
    document.getElementById('emotionForm').reset();
    document.getElementById('emotionId').value = ""; // Limpiar el ID de emoción
    toggleCustomEmotionField(); // Ocultar campo personalizado
}

// Contador de caracteres
document.getElementById('descripcion').addEventListener('input', function() {
    const maxLength = 500;
    const currentLength = this.value.length;
    document.getElementById('charCount').textContent = `${maxLength - currentLength} caracteres restantes`;
});