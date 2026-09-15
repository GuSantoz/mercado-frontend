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
      const timer = setTimeout(() => setAnimado(true), 100);

      return () => clearTimeout(timer);
    }
  }, [carregando]);

  const buscarDados = async () => {
    setCarregando(true);
    setErro('');
    setAnimado(false);

    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const [resProdutos, resVendas] = await Promise.all([
        fetch(`${API_BASE}/product`, {
          method: 'GET',
          headers,
        }),

        fetch(`${API_BASE}/venda`, {
          method: 'GET',
          headers,
        }),
      ]);

      const dadosProdutos = await resProdutos.json();
      const dadosVendas = await resVendas.json();

      if (resProdutos.ok) {
        setProdutos(dadosProdutos.usuarios || []);
      } else {
        setErro(
          'Erro ao buscar produtos: ' +
            (dadosProdutos.erro || '')
        );
      }

      if (resVendas.ok) {
        setVendas(dadosVendas.vendas || []);
      } else {
        setErro(
          (prev) =>
            prev +
            ' | Erro ao buscar vendas: ' +
            (dadosVendas.erro || '')
        );
      }
    } catch (e) {
      console.error('Erro ao carregar Dashboard:', e);
      setErro('Não foi possível conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const totalItensEstoque = produtos.reduce(
    (acc, produto) => acc + (Number(produto.quantity) || 0),
    0
  );

  const totalProdutosCadastrados = produtos.length;

  /*
   * Cada registro de vendas agora representa um pedido completo.
   * Portanto, o total deve ser calculado diretamente pelo total_price
   * do cabeçalho da venda.
   */
  const vendasAtivas = vendas.filter(
    (venda) => venda.status === true || venda.status === 1
  );

  const totalVendasReais = vendasAtivas.reduce(
    (acc, venda) =>
      acc + (Number(venda.total_price) || 0),
    0
  );

  const totalPedidos = vendasAtivas.length;

  /*
   * Como o backend agora retorna:
   *
   * venda.items = [
   *   {
   *     product_name,
   *     quantity,
   *     unit_price,
   *     total_price
   *   }
   * ]
   *
   * precisamos percorrer os itens de cada pedido.
   */
  const vendasPorProduto = vendasAtivas.reduce(
    (acc, venda) => {
      const itens = venda.items || [];

      itens.forEach((item) => {
        const nomeProduto =
          item.product_name || 'Produto não informado';

        const quantidadeVendida =
          Number(item.quantity) || 0;

        acc[nomeProduto] =
          (acc[nomeProduto] || 0) + quantidadeVendida;
      });

      return acc;
    },
    {}
  );

  const maisVendido = Object.entries(vendasPorProduto)
    .sort((a, b) => b[1] - a[1])[0] || null;

  const produtoMaisEstoque =
    produtos.length > 0
      ? produtos.reduce((maior, produto) => {
          const quantidadeMaior =
            Number(maior.quantity) || 0;

          const quantidadeAtual =
            Number(produto.quantity) || 0;

          return quantidadeAtual > quantidadeMaior
            ? produto
            : maior;
        })
      : null;

  /*
   * Não é mais necessário agrupar por order_number,
   * pois cada venda já representa um pedido completo.
   */
  const pedidos = vendas;

  const ultimosPedidos = [...pedidos]
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .slice(0, 6);

  return (
    <>
      <div className="db-wrapper">
        <div className="db-header">
          <h2 className="db-title">
            📊 <span>Meu Dashboard</span>
          </h2>

          <button
            className="db-refresh-btn"
            onClick={buscarDados}
          >
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
              <div
                className={`db-card ${
                  animado ? 'visivel' : ''
                }`}
              >
                <div
                  className="db-card-accent"
                  style={{ background: '#007bff' }}
                />

                <div className="db-card-icon">📦</div>

                <div className="db-card-label">
                  Itens em Estoque
                </div>

                <div className="db-card-value azul">
                  {totalItensEstoque.toLocaleString('pt-BR')}
                </div>

                <div className="db-card-sub">
                  {totalProdutosCadastrados} produto
                  {totalProdutosCadastrados !== 1
                    ? 's'
                    : ''}{' '}
                  cadastrado
                  {totalProdutosCadastrados !== 1
                    ? 's'
                    : ''}
                </div>
              </div>

              <div
                className={`db-card ${
                  animado ? 'visivel' : ''
                }`}
              >
                <div
                  className="db-card-accent"
                  style={{ background: '#16a34a' }}
                />

                <div className="db-card-icon">💰</div>

                <div className="db-card-label">
                  Total em Vendas
                </div>

                <div className="db-card-value verde">
                  R${' '}
                  {totalVendasReais.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                <div className="db-card-sub">
                  {totalPedidos} pedido
                  {totalPedidos !== 1 ? 's' : ''}{' '}
                  realizado
                  {totalPedidos !== 1 ? 's' : ''}
                </div>
              </div>

              <div
                className={`db-card ${
                  animado ? 'visivel' : ''
                }`}
              >
                <div
                  className="db-card-accent"
                  style={{ background: '#f59e0b' }}
                />

                <div className="db-card-icon">🏆</div>

                <div className="db-card-label">
                  Maior Estoque
                </div>

                <div
                  className="db-card-value"
                  style={{
                    fontSize: '22px',
                    color: '#111',
                    marginTop: '4px',
                  }}
                >
                  {produtoMaisEstoque
                    ? produtoMaisEstoque.name
                    : '—'}
                </div>

                <div className="db-card-sub">
                  {produtoMaisEstoque
                    ? `${
                        Number(
                          produtoMaisEstoque.quantity
                        ) || 0
                      } unidades`
                    : 'Nenhum produto cadastrado'}
                </div>
              </div>

              <div
                className={`db-card ${
                  animado ? 'visivel' : ''
                }`}
              >
                <div
                  className="db-card-accent"
                  style={{ background: '#ec4899' }}
                />

                <div className="db-card-icon">🔥</div>

                <div className="db-card-label">
                  Mais Vendido
                </div>

                <div
                  className="db-card-value"
                  style={{
                    fontSize: '22px',
                    color: '#111',
                    marginTop: '4px',
                  }}
                >
                  {maisVendido ? maisVendido[0] : '—'}
                </div>

                <div className="db-card-sub">
                  {maisVendido
                    ? `${maisVendido[1]} unidades vendidas`
                    : 'Nenhuma venda ainda'}
                </div>
              </div>
            </div>

            {/* Destaque — produto mais vendido */}
            {maisVendido && (
              <div
                className={`db-destaque ${
                  animado ? 'visivel' : ''
                }`}
              >
                <div className="db-destaque-left">
                  <span className="db-destaque-label">
                    ⭐ Destaque da loja
                  </span>

                  <span className="db-destaque-nome">
                    {maisVendido[0]}
                  </span>

                  <span className="db-destaque-qtd">
                    {maisVendido[1]} unidades vendidas no
                    total
                  </span>
                </div>

                <div className="db-destaque-icon">
                  🛒
                </div>
              </div>
            )}

            {/* Listas detalhadas */}
            <div className="db-secao">
              {/* Estoque por produto */}
              <div
                className={`db-panel ${
                  animado ? 'visivel' : ''
                }`}
              >
                <p className="db-panel-title">
                  📦 Estoque por Produto
                </p>

                {produtos.length === 0 ? (
                  <p className="db-vazio">
                    Nenhum produto cadastrado.
                  </p>
                ) : (
                  [...produtos]
                    .sort(
                      (a, b) =>
                        (Number(b.quantity) || 0) -
                        (Number(a.quantity) || 0)
                    )
                    .map((produto) => (
                      <div
                        className="db-estoque-item"
                        key={produto.id}
                      >
                        <span
                          className="db-estoque-nome"
                          title={produto.name}
                        >
                          {produto.name}
                        </span>

                        <span className="db-estoque-qtd">
                          {Number(produto.quantity) || 0} un.
                        </span>
                      </div>
                    ))
                )}
              </div>

              {/* Últimas vendas */}
              <div
                className={`db-panel ${
                  animado ? 'visivel' : ''
                }`}
              >
                <p className="db-panel-title">
                  🧾 Últimas Vendas
                </p>

                {pedidos.length === 0 ? (
                  <p className="db-vazio">
                    Nenhuma venda realizada.
                  </p>
                ) : (
                  ultimosPedidos.map((pedido, index) => {
                    const itens = pedido.items || [];

                    const totalPedido =
                      Number(pedido.total_price) || 0;

                    const qtdItens = itens.length;

                    return (
                      <div
                        className="db-venda-item"
                        key={pedido.id || index}
                      >
                        <div className="db-venda-produto">
                          Pedido{' '}
                          {pedido.order_number || '---'}

                          <span
                            style={{
                              fontWeight: 400,
                              color: '#999',
                              marginLeft: '8px',
                              fontSize: '12px',
                            }}
                          >
                            {qtdItens}{' '}
                            {qtdItens === 1
                              ? 'item'
                              : 'itens'}
                          </span>
                        </div>

                        <div
                          style={{
                            color: '#666',
                            fontSize: '12px',
                            margin: '2px 0 4px',
                          }}
                        >
                          {itens.length > 0
                            ? itens
                                .map(
                                  (item) =>
                                    `${Number(
                                      item.quantity
                                    ) || 0}× ${
                                      item.product_name ||
                                      'Produto não informado'
                                    }`
                                )
                                .join(', ')
                            : 'Nenhum item informado'}
                        </div>

                        <div className="db-venda-meta">
                          <span>
                            {pedido.created_at
                              ? new Date(
                                  pedido.created_at
                                ).toLocaleString('pt-BR')
                              : 'Data não informada'}
                          </span>

                          <span className="db-venda-total">
                            R${' '}
                            {totalPedido.toLocaleString(
                              'pt-BR',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
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