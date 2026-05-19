import { useState, useEffect } from 'react';

function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState('realizar');

  useEffect(() => {
    buscarProdutos();
    buscarVendas();
  }, []);

  const buscarProdutos = async () => {
    try {
      const resposta = await fetch('http://localhost:5000/product', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const dados = await resposta.json();
      if (resposta.ok) {
        setProdutos(dados.usuarios || []);
      } else {
        setErro(dados.erro || 'Erro ao buscar produtos');
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      setErro('Não foi possível conectar com o servidor.');
    }
  };

  const buscarVendas = async () => {
    try {
      const resposta = await fetch('http://localhost:5000/venda', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const dados = await resposta.json();
      if (resposta.ok) {
        setVendas(dados.vendas || []);
      }
    } catch (erro) {
      console.error('Erro ao buscar vendas:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const realizarVenda = async (e) => {
    e.preventDefault();

    if (!produtoSelecionado || !quantidade) {
      alert('Por favor, selecione um produto e quantidade!');
      return;
    }

    if (quantidade <= 0) {
      alert('A quantidade deve ser maior que 0!');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:5000/venda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: parseInt(produtoSelecionado),
          quantity: parseInt(quantidade)
        })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.message);
        setProdutoSelecionado('');
        setQuantidade('');
        buscarProdutos();
        buscarVendas();
      } else {
        alert('Erro: ' + dados.erro);
      }
    } catch (erro) {
      console.error('Erro ao realizar venda:', erro);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => setAbaSelecionada('realizar')}
          style={{
            padding: '12px 20px',
            backgroundColor: abaSelecionada === 'realizar' ? '#28a745' : '#f0f0f0',
            color: abaSelecionada === 'realizar' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Realizar Venda
        </button>
        <button 
          onClick={() => setAbaSelecionada('historico')}
          style={{
            padding: '12px 20px',
            backgroundColor: abaSelecionada === 'historico' ? '#28a745' : '#f0f0f0',
            color: abaSelecionada === 'historico' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📊 Histórico de Vendas
        </button>
      </div>

      {abaSelecionada === 'realizar' ? (
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', color: '#333' }}>
          <h3 style={{ color: '#212529', marginTop: 0 }}>Realizar Venda</h3>
          {erro && <div style={{ color: 'red', marginBottom: '10px' }}>{erro}</div>}
          
          <form onSubmit={realizarVenda}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="produto" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#212529' }}>
                Selecione o Produto:
              </label>
              <select 
                id="produto"
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Escolha um produto --</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.name} - R$ {parseFloat(produto.price).toFixed(2)} (Est: {produto.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="quantidade" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#212529' }}>
                Quantidade:
              </label>
              <input 
                type="number"
                id="quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                min="1"
                placeholder="Digite a quantidade"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ✔️ Confirmar Venda
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h3>Histórico de Vendas</h3>
          {carregando ? (
            <p>Carregando...</p>
          ) : vendas.length === 0 ? (
            <p style={{ color: '#999' }}>Nenhuma venda realizada ainda.</p>
          ) : (
            <div style={{
              overflowX: 'auto',
              backgroundColor: '#f9f9f9',
              padding: '10px',
              borderRadius: '5px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#28a745', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Cód. Pedido</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Produto</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Quantidade</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Preço Unit.</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.order_number} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                      <td style={{ padding: '10px', color: '#000', fontWeight: 'bold' }}>{venda.order_number || '---'}</td>
                      <td style={{ padding: '10px', color: '#000' }}>{venda.product_name}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#000' }}>{venda.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#000' }}>R$ {parseFloat(venda.price).toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                        R$ {parseFloat(venda.total_price).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#000' }}>
                        {new Date(venda.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Vendas;
