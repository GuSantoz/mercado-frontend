import { useState } from 'react';
import { uploadProductImage } from '../utils/imageUrl';

function CadastroProduto({ onCadastroSuccess }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

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

    if (!imageFile) {
      setMensagem('Selecione uma imagem do produto.');
      return;
    }

    setEnviando(true);
    setMensagem('');

    try {
      const imagePath = await uploadProductImage(imageFile);

      const dadosProduto = {
        name: name,
        price: price,
        quantity: quantity,
        image: imagePath
      };

      const resposta = await fetch('http://localhost:5000/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dadosProduto),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem('Produto cadastrado com sucesso!');
        if (onCadastroSuccess) onCadastroSuccess();

        setName('');
        setPrice('');
        setQuantity('');
        setImageFile(null);
        setImagePreview('');
      } else {
        setMensagem(dados.erro || 'Falha ao cadastrar o produto.');
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      setMensagem(erro.message || 'Não foi possível conectar com o servidor. Verifique se o backend está rodando e se o CORS está configurado.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-card" style={{ margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Cadastro de Produto</h2>
      <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
        Preencha os dados do produto para adicionar ao estoque.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome do Produto:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            required
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Quantidade:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Imagem do Produto:</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleImageChange}
            required
            className="dark-input"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Pré-visualização"
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

        <button type="submit" className="btn-success" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar Produto'}
        </button>
      </form>

      {mensagem && (
        <p style={{ marginTop: '15px', textAlign: 'center', color: mensagem.includes('sucesso') ? '#28a745' : '#dc3545' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default CadastroProduto;