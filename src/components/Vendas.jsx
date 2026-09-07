import { useState, useEffect } from 'react';

function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [itensVenda, setItensVenda] = useState([]);
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
        // A API agora devolve as vendas já estruturadas com os "items" aninhados
        setVendas(dados.vendas || []);
      }
    } catch (erro) {
      console.error('Erro ao buscar vendas:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const alterarStatusPedido = async (pedido) => {
    const novoStatus = !pedido.status;
    const confirmado = window.confirm(
      novoStatus ? 'Reativar este pedido?' : 'Inativar este pedido?'
    );
    if (!confirmado) return;

    try {
      // Agora o status fica no cabeçalho do pedido, apenas 1 chamada é necessária
      const resposta = await fetch('http://localhost:5000/venda/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: pedido.id,
          status: novoStatus
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert('Erro: ' + dados.erro);
        return;
      }

      buscarProdutos();
      buscarVendas();
    } catch (erro) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || !quantidade) {
      alert('Por favor, selecione um produto e quantidade!');
      return;
    }

    const qtd = parseInt(quantidade);
    if (qtd <= 0) {
      alert('A quantidade deve ser maior que 0!');
      return;
    }

    const produto = produtos.find((p) => p.id === parseInt(produtoSelecionado));
    if (!produto) {
      alert('Produto não encontrado!');
      return;
    }

    const jaAdicionado = itensVenda.some((item) => item.product_id === produto.id);
    if (jaAdicionado) {
      alert('Este produto já foi adicionado. Remova-o para alterar a quantidade.');
      return;
    }

    if (qtd > produto.quantity) {
      alert(`Estoque insuficiente! Disponível: ${produto.quantity}`);
      return;
    }

    setItensVenda([
      ...itensVenda,
      {
        product_id: produto.id,
        name: produto.name,
        price: parseFloat(produto.price),
        quantity: qtd
      }
    ]);
    setProdutoSelecionado('');
    setQuantidade('');
  };

  const removerItem = (productId) => {
    setItensVenda(itensVenda.filter((item) => item.product_id !== productId));
  };

  const totalVenda = itensVenda.reduce(
    (soma, item) => soma + item.price * item.quantity,
    0
  );

  const realizarVenda = async (e) => {
    e.preventDefault();

    if (itensVenda.length === 0) {
      alert('Adicione ao menos um item à venda!');
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
          itens: itensVenda.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.message);
        setItensVenda([]);
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

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="produto" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#212529' }}>
              Selecione o Produto:
            </label>
            <select
              id="produto"
              value={produtoSelecionado}
              onChange={(e) => setProdutoSelecionado(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px' }}
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
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="button"
            onClick={adicionarItem}
            style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}
          >
            ➕ Adicionar Item
          </button>

          <form onSubmit={realizarVenda}>
            <h4 style={{ color: '#212529', marginBottom: '10px' }}>Itens da Venda</h4>
            {itensVenda.length === 0 ? (
              <p style={{ color: '#999', marginBottom: '20px' }}>Nenhum item adicionado.</p>
            ) : (
              <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: '#fff' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#28a745', color: '#fff' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Produto</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Qtd.</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Preço Unit.</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensVenda.map((item) => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px', color: '#000' }}>{item.name}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#000' }}>{item.quantity}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#000' }}>R$ {item.price.toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removerItem(item.product_id)}
                            style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>Total:</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>R$ {totalVenda.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <button
              type="submit"
              disabled={itensVenda.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: itensVenda.length === 0 ? '#94d3a2' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: itensVenda.length === 0 ? 'not-allowed' : 'pointer',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* O loop agora é direto em "vendas" */}
              {vendas.map((pedido) => {
                const statusLabel = pedido.status ? 'Ativo' : 'Inativo';
                const statusCor = pedido.status ? '#28a745' : '#999';

                return (
                  <div key={pedido.id} style={{ backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 15px', backgroundColor: '#eef7f0', borderBottom: '1px solid #ddd' }}>
                      <div style={{ color: '#000' }}>
                        <strong>Pedido {pedido.order_number}</strong>
                        <span style={{ marginLeft: '12px', fontSize: '12px', color: '#555' }}>
                          {new Date(pedido.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#fff', backgroundColor: statusCor }}>
                          {statusLabel}
                        </span>
                        <button
                          onClick={() => alterarStatusPedido(pedido)}
                          style={{ padding: '6px 12px', backgroundColor: pedido.status ? '#dc3545' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          {pedido.status ? 'Inativar pedido' : 'Reativar pedido'}
                        </button>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '10px 15px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#28a745', color: '#fff' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left' }}>Produto</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center' }}>Quantidade</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Preço Unit.</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Varrendo os itens que já vêm aninhados da API */}
                          {pedido.items && pedido.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                              <td style={{ padding: '8px 10px', color: '#000' }}>{item.product_name}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'center', color: '#000' }}>{item.quantity}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#000' }}>R$ {parseFloat(item.price).toFixed(2)}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                R$ {parseFloat(item.total_price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>Total do pedido:</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                              R$ {parseFloat(pedido.total_order || 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Vendas;