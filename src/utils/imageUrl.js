const API_BASE = 'http://localhost:5000';

export function getProductImageUrl(image) {
  if (!image) return 'https://via.placeholder.com/200';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${API_BASE}${image.startsWith('/') ? image : `/${image}`}`;
}

export async function uploadProductImage(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/product/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || 'Falha ao enviar a imagem.');
  }

  return data.image;
}
