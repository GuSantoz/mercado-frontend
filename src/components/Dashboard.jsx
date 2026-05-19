import { useState, useEffect } from 'react';
import '../App.css';

const API_BASE = 'http://localhost:5000';

function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    buscarDados();
  }, []);

  useEffect(() => {
    if (!carregando) {
      setTimeout(() => setAnimado(true), 100);
    }
  }, [carregando]);

  const buscarDados = async () => {
    setCarregando(true);
    setErro('');
    setAnimado(false);
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const [resProdutos, resVendas] = await Promise.all([
        fetch(`${API_BASE}/product`, { headers }),
        fetch(`${API_BASE}/venda`, { headers })
      ]);

      const dadosProdutos = await resProdutos.json();
      const dadosVendas = await resVendas.json();

      if (resProdutos.ok) {
        setProdutos(dadosProdutos.usuarios || []);
      } else {
        setErro('Erro ao buscar produtos: ' + (dadosProdutos.erro || ''));
      }

      if (resVendas.ok) {
        setVendas(dadosVendas.vendas || []);
      } else {
        setErro(prev => prev + ' | Erro ao buscar vendas: ' + (dadosVendas.erro || ''));
      }
    } catch (e) {
      setErro('Não foi possível conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const totalItensEstoque = produtos.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const totalProdutosCadastrados = produtos.length;
  const totalVendasReais = vendas.reduce((acc, v) => acc + (parseFloat(v.total_price) || 0), 0);
  const totalPedidos = vendas.length;

  const produtoMaisEstoque = produtos.length > 0
    ? produtos.reduce((a, b) => (Number(a.quantity) > Number(b.quantity) ? a : b))
    : null;

  const vendasPorProduto = vendas.reduce((acc, v) => {
    acc[v.product_name] = (acc[v.product_name] || 0) + Number(v.quantity);
    return acc;
  }, {});
  const maisVendido = Object.entries(vendasPorProduto).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <div className="db-wrapper">
        <div className="db-header">
          <h2 className="db-title">📊 <span>Meu Dashboard</span></h2>
          <button className="db-refresh-btn" onClick={buscarDados}>
            🔄 Atualizar
          </button>
        </div>

        {erro && <div className="db-erro">⚠️ {erro}</div>}

        {carregando ? (
          <div className="db-loading">
            <div className="db-spinner" />
            <span>Carregando dados...</span>
          </div>
        ) : (
          <>
            {/* Cards de métricas */}
            <div className="db-cards">
              <div className={`db-card ${animado ? 'visivel' : ''}`}>
                <div className="db-card-accent" style={{ background: '#007bff' }} />
                <div className="db-card-icon">📦</div>
                <div className="db-card-label">Itens em Estoque</div>
                <div className="db-card-value azul">{totalItensEstoque.toLocaleString('pt-BR')}</div>
                <div className="db-card-sub">{totalProdutosCadastrados} produto{totalProdutosCadastrados !== 1 ? 's' : ''} cadastrado{totalProdutosCadastrados !== 1 ? 's' : ''}</div>
              </div>

              <div className={`db-card ${animado ? 'visivel' : ''}`}>
                <div className="db-card-accent" style={{ background: '#16a34a' }} />
                <div className="db-card-icon">💰</div>
                <div className="db-card-label">Total em Vendas</div>
                <div className="db-card-value verde">
                  R$ {totalVendasReais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="db-card-sub">{totalPedidos} pedido{totalPedidos !== 1 ? 's' : ''} realizado{totalPedidos !== 1 ? 's' : ''}</div>
              </div>

              <div className={`db-card ${animado ? 'visivel' : ''}`}>
                <div className="db-card-accent" style={{ background: '#f59e0b' }} />
                <div className="db-card-icon">🏆</div>
                <div className="db-card-label">Maior Estoque</div>
                <div className="db-card-value" style={{ fontSize: '22px', color: '#111', marginTop: '4px' }}>
                  {produtoMaisEstoque ? produtoMaisEstoque.name : '—'}
                </div>
                <div className="db-card-sub">
                  {produtoMaisEstoque ? `${produtoMaisEstoque.quantity} unidades` : 'Nenhum produto cadastrado'}
                </div>
              </div>

              <div className={`db-card ${animado ? 'visivel' : ''}`}>
                <div className="db-card-accent" style={{ background: '#ec4899' }} />
                <div className="db-card-icon">🔥</div>
                <div className="db-card-label">Mais Vendido</div>
                <div className="db-card-value" style={{ fontSize: '22px', color: '#111', marginTop: '4px' }}>
                  {maisVendido ? maisVendido[0] : '—'}
                </div>
                <div className="db-card-sub">
                  {maisVendido ? `${maisVendido[1]} unidades vendidas` : 'Nenhuma venda ainda'}
                </div>
              </div>
            </div>

            {/* Destaque — produto mais vendido */}
            {maisVendido && (
              <div className={`db-destaque ${animado ? 'visivel' : ''}`}>
                <div className="db-destaque-left">
                  <span className="db-destaque-label">⭐ Destaque da loja</span>
                  <span className="db-destaque-nome">{maisVendido[0]}</span>
                  <span className="db-destaque-qtd">{maisVendido[1]} unidades vendidas no total</span>
                </div>
                <div className="db-destaque-icon">🛒</div>
              </div>
            )}

            {/* Listas detalhadas */}
            <div className="db-secao">
              {/* Estoque por produto */}
              <div className={`db-panel ${animado ? 'visivel' : ''}`}>
                <p className="db-panel-title">📦 Estoque por Produto</p>
                {produtos.length === 0 ? (
                  <p className="db-vazio">Nenhum produto cadastrado.</p>
                ) : (
                  [...produtos]
                    .sort((a, b) => Number(b.quantity) - Number(a.quantity))
                    .map(p => (
                      <div className="db-estoque-item" key={p.id}>
                        <span className="db-estoque-nome" title={p.name}>{p.name}</span>
                        <span className="db-estoque-qtd">{p.quantity} un.</span>
                      </div>
                    ))
                )}
              </div>

              {/* Últimas vendas */}
              <div className={`db-panel ${animado ? 'visivel' : ''}`}>
                <p className="db-panel-title">🧾 Últimas Vendas</p>
                {vendas.length === 0 ? (
                  <p className="db-vazio">Nenhuma venda realizada.</p>
                ) : (
                  [...vendas]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 6)
                    .map((v, i) => (
                      <div className="db-venda-item" key={i}>
                        <div className="db-venda-produto">{v.product_name}</div>
                        <div className="db-venda-meta">
                          <span>{v.quantity} un. × R$ {parseFloat(v.price).toFixed(2)}</span>
                          <span className="db-venda-total">R$ {parseFloat(v.total_price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;