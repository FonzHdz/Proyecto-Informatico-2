export const getMediaType = (url: string): 'image' | 'video' | 'gif' => {
    if (!url) return 'image';
    
    const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
    
    // Eliminar parámetros de URL y convertir a minúsculas
    const cleanUrl = url.split('?')[0].toLowerCase();
    
    // Extraer la extensión
    const extension = cleanUrl.split('.').pop() || '';
    
    if (extension === 'gif') return 'gif';
    if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
    if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
    
    // Por defecto asumir que es imagen si la extensión no es reconocida
    return 'image';
};