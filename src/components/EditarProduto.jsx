import { useState, useEffect } from 'react';
import '../App.css';
import { uploadProductImage, getProductImageUrl } from '../utils/imageUrl';

const EditarProduto = ({ produto, onCancel, onUpdateSuccess }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (produto) {
      setName(produto.name || '');
      setPrice(produto.price != null ? produto.price : '');
      setQuantity(produto.quantity != null ? produto.quantity : '');
      setCurrentImage(produto.image || '');
      setImageFile(null);
      setImagePreview('');
      setStatus(!!produto.status);
      setMensagem('');
    }
  }, [produto]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa estar logado para editar o produto.');
      return;
    }

    if (!produto || !produto.id) {
      setMensagem('Produto inválido.');
      return;
    }

    setEnviando(true);
    setMensagem('');

    try {
      let image = currentImage;

      if (imageFile) {
        image = await uploadProductImage(imageFile);
      }

      const data = {
        id: produto.id,
        name,
        price,
        quantity,
        image,
        status,
      };

      const response = await fetch('http://localhost:5000/product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMensagem('Produto atualizado com sucesso!');
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        setMensagem(result.erro || result.message || 'Erro ao atualizar o produto.');
      }
    } catch (error) {
      setMensagem(error.message || 'Erro de conexão com o servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const previewSrc = imagePreview || getProductImageUrl(currentImage);

  return (
    <div className="modal-edit-form">
      <h2 style={{ marginTop: 0, textAlign: 'center', paddingRight: '28px' }}>Editar Produto</h2>
      <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
        Atualize os dados do produto abaixo. O ID não pode ser alterado.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID do Produto:</label>
          <input
            type="text"
            value={produto?.id || ''}
            readOnly
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Nome do Produto:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Preço:</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Quantidade:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Imagem do Produto:</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleImageChange}
            className="dark-input"
          />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
            Deixe em branco para manter a imagem atual.
          </p>
          {previewSrc && (
            <img
              src={previewSrc}
              alt="Imagem do produto"
              style={{
                marginTop: '12px',
                width: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}
        </div>

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <label>Status:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            <span style={{ color: '#aaa' }}>{status ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>

        <button type="submit" className="btn-success" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>

      <button type="button" className="btn-cancel" onClick={onCancel}>
        Cancelar
      </button>

      {mensagem && (
        <p style={{ marginTop: '15px', textAlign: 'center', color: mensagem.includes('sucesso') ? '#28a745' : '#dc3545' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
};

export default EditarProduto;
