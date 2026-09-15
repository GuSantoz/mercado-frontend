import { useState, useEffect } from 'react';

function Vendas() {
  const [filtroPedido, setFiltroPedido] = useState('');
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [itensVenda, setItensVenda] = useState([]);

  const [abaSelecionada, setAbaSelecionada] = useState('realizar');

  const produtoEstaAtivo = (produto) =>
    produto?.status === true ||
    produto?.status === 1 ||
    produto?.status === '1';

  const obterIdUsuarioDoToken = () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return null;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.user_id;
    } catch (erro) {
      console.error(
        'Não foi possível identificar o usuário logado:',
        erro
      );

      return null;
    }
  };

  const obterHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  useEffect(() => {
    buscarProdutos();
    buscarVendas();
  }, []);

  const buscarProdutos = async () => {
    try {
      const resposta = await fetch('http://localhost:5000/product', {
        method: 'GET',
        headers: obterHeaders(),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        const produtosEncontrados = dados.usuarios || [];

        setProdutos(produtosEncontrados);

        return produtosEncontrados;
      }

      setErro(dados.erro || 'Erro ao buscar produtos.');
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      setErro('Não foi possível conectar com o servidor.');
    }

    return [];
  };

  const buscarVendas = async () => {
    setCarregando(true);

    try {
      const resposta = await fetch('http://localhost:5000/venda', {
        method: 'GET',
        headers: obterHeaders(),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        const idUsuarioLogado = obterIdUsuarioDoToken();

        const vendasDoUsuario = (dados.vendas || []).filter(
          (venda) =>
            String(venda.user_id) === String(idUsuarioLogado)
        );

        setVendas(vendasDoUsuario);
      } else {
        setErro(dados.erro || 'Erro ao buscar vendas.');
      }
    } catch (erro) {
      console.error('Erro ao buscar vendas:', erro);
      setErro('Não foi possível carregar o histórico de vendas.');
    } finally {
      setCarregando(false);
    }
  };

  const alterarStatusPedido = async (pedido) => {
    const pedidoAtivo = Boolean(pedido.status);

    const novoStatus = !pedidoAtivo;

    const mensagem = novoStatus
      ? 'Deseja reativar este pedido?'
      : 'Deseja inativar este pedido? Todos os produtos serão devolvidos ao estoque.';

    const confirmado = window.confirm(mensagem);

    if (!confirmado) {
      return;
    }

    try {
      const resposta = await fetch(
        'http://localhost:5000/venda/status',
        {
          method: 'PUT',
          headers: obterHeaders(),
          body: JSON.stringify({
            id: pedido.id,
            status: novoStatus,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(
          'Erro: ' +
            (dados.erro || 'Não foi possível alterar o status do pedido.')
        );

        return;
      }

      alert(
        dados.message ||
          (novoStatus
            ? 'Pedido reativado com sucesso.'
            : 'Pedido inativado e produtos devolvidos ao estoque.')
      );

      await buscarProdutos();
      await buscarVendas();
    } catch (erro) {
      console.error('Erro ao atualizar status do pedido:', erro);
      alert('Erro ao conectar com o servidor.');
    }
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || !quantidade) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    const qtd = parseInt(quantidade, 10);

    if (Number.isNaN(qtd) || qtd <= 0) {
      alert('A quantidade deve ser maior que 0.');
      return;
    }

    const produto = produtos.find(
      (item) => item.id === parseInt(produtoSelecionado, 10)
    );

    if (!produto) {
      alert('Produto não encontrado.');
      return;
    }

    if (!produtoEstaAtivo(produto)) {
      alert('Este produto está inativo e não pode ser vendido.');

      setProdutoSelecionado('');
      return;
    }

    const jaAdicionado = itensVenda.some(
      (item) => item.product_id === produto.id
    );

    if (jaAdicionado) {
      alert(
        'Este produto já foi adicionado. Remova-o para alterar a quantidade.'
      );

      return;
    }

    if (qtd > produto.quantity) {
      alert(
        `Estoque insuficiente! Disponível: ${produto.quantity}`
      );

      return;
    }

    setItensVenda([
      ...itensVenda,
      {
        product_id: produto.id,
        name: produto.name,
        price: parseFloat(produto.price),
        quantity: qtd,
      },
    ]);

    setProdutoSelecionado('');
    setQuantidade('');
  };

  const removerItem = (productId) => {
    setItensVenda(
      itensVenda.filter((item) => item.product_id !== productId)
    );
  };

  const totalVenda = itensVenda.reduce(
    (soma, item) => soma + item.price * item.quantity,
    0
  );

  const pedidosFiltrados = vendas
    .filter((pedido) => {
      const matchPedido =
        filtroPedido === '' ||
        (pedido.order_number &&
          pedido.order_number
            .toLowerCase()
            .includes(filtroPedido.toLowerCase()));

      const matchProduto =
        filtroProduto === '' ||
        (pedido.items || []).some((item) =>
          (item.product_name || '')
            .toLowerCase()
            .includes(filtroProduto.toLowerCase())
        );

      const matchData =
        filtroData === '' ||
        (pedido.created_at &&
          pedido.created_at.startsWith(filtroData));

      return matchPedido && matchProduto && matchData;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

  const realizarVenda = async (e) => {
    e.preventDefault();

    if (itensVenda.length === 0) {
      alert('Adicione ao menos um item à venda.');
      return;
    }

    const produtosAtualizados = await buscarProdutos();

    const produtoInativo = itensVenda.some((item) => {
      const produto = produtosAtualizados.find(
        (produtoAtualizado) =>
          produtoAtualizado.id === item.product_id
      );

      return !produtoEstaAtivo(produto);
    });

    if (produtoInativo) {
      alert(
        'Um ou mais produtos selecionados estão inativos e não podem ser vendidos.'
      );

      setItensVenda([]);

      return;
    }

    try {
      const resposta = await fetch('http://localhost:5000/venda', {
        method: 'POST',
        headers: obterHeaders(),
        body: JSON.stringify({
          itens: itensVenda.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(
          dados.message || 'Venda realizada com sucesso.'
        );

        setItensVenda([]);
        setProdutoSelecionado('');
        setQuantidade('');

        await buscarProdutos();
        await buscarVendas();
      } else {
        alert(
          'Erro: ' +
            (dados.erro || 'Não foi possível realizar a venda.')
        );
      }
    } catch (erro) {
      console.error('Erro ao realizar venda:', erro);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #ddd',
        }}
      >
        <button
          onClick={() => setAbaSelecionada('realizar')}
          style={{
            padding: '12px 20px',
            backgroundColor:
              abaSelecionada === 'realizar'
                ? '#28a745'
                : '#f0f0f0',
            color:
              abaSelecionada === 'realizar'
                ? '#fff'
                : '#000',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ➕ Realizar Venda
        </button>

        <button
          onClick={() => setAbaSelecionada('historico')}
          style={{
            padding: '12px 20px',
            backgroundColor:
              abaSelecionada === 'historico'
                ? '#28a745'
                : '#f0f0f0',
            color:
              abaSelecionada === 'historico'
                ? '#fff'
                : '#000',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📊 Histórico de Vendas
        </button>
      </div>

      {abaSelecionada === 'realizar' ? (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '5px',
            color: '#333',
          }}
        >
          <h3
            style={{
              color: '#212529',
              marginTop: 0,
            }}
          >
            Realizar Venda
          </h3>

          {erro && (
            <div
              style={{
                color: 'red',
                marginBottom: '10px',
              }}
            >
              {erro}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="produto"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#212529',
              }}
            >
              Selecione o Produto:
            </label>

            <select
              id="produto"
              value={produtoSelecionado}
              onChange={(e) =>
                setProdutoSelecionado(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              <option value="">
                -- Escolha um produto --
              </option>

              {produtos
                .filter(produtoEstaAtivo)
                .map((produto) => (
                  <option
                    key={produto.id}
                    value={produto.id}
                  >
                    {produto.name} - R${' '}
                    {parseFloat(produto.price).toFixed(2)}{' '}
                    (Est: {produto.quantity})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="quantidade"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#212529',
              }}
            >
              Quantidade:
            </label>

            <input
              type="number"
              id="quantidade"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(e.target.value)
              }
              min="1"
              placeholder="Digite a quantidade"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="button"
            onClick={adicionarItem}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '20px',
            }}
          >
            ➕ Adicionar Item
          </button>

          <form onSubmit={realizarVenda}>
            <h4
              style={{
                color: '#212529',
                marginBottom: '10px',
              }}
            >
              Itens da Venda
            </h4>

            {itensVenda.length === 0 ? (
              <p
                style={{
                  color: '#999',
                  marginBottom: '20px',
                }}
              >
                Nenhum item adicionado.
              </p>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  marginBottom: '15px',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#28a745',
                        color: '#fff',
                      }}
                    >
                      <th
                        style={{
                          padding: '10px',
                          textAlign: 'left',
                        }}
                      >
                        Produto
                      </th>

                      <th
                        style={{
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        Qtd.
                      </th>

                      <th
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                        }}
                      >
                        Preço Unit.
                      </th>

                      <th
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                        }}
                      >
                        Subtotal
                      </th>

                      <th
                        style={{
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {itensVenda.map((item) => (
                      <tr
                        key={item.product_id}
                        style={{
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        <td
                          style={{
                            padding: '10px',
                            color: '#000',
                          }}
                        >
                          {item.name}
                        </td>

                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            color: '#000',
                          }}
                        >
                          {item.quantity}
                        </td>

                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'right',
                            color: '#000',
                          }}
                        >
                          R$ {item.price.toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#000',
                          }}
                        >
                          R${' '}
                          {(
                            item.price * item.quantity
                          ).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              removerItem(item.product_id)
                            }
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        Total:
                      </td>

                      <td
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        R$ {totalVenda.toFixed(2)}
                      </td>

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
                backgroundColor:
                  itensVenda.length === 0
                    ? '#94d3a2'
                    : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor:
                  itensVenda.length === 0
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              ✔️ Confirmar Venda
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h3>Histórico de Vendas</h3>

          <div
            style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '5px',
              border: '1px solid #ddd',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}
              >
                Nº do Pedido:
              </label>

              <input
                type="text"
                placeholder="Ex: P-3111"
                value={filtroPedido}
                onChange={(e) =>
                  setFiltroPedido(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}
              >
                Nome do Produto:
              </label>

              <input
                type="text"
                placeholder="Ex: Teclado"
                value={filtroProduto}
                onChange={(e) =>
                  setFiltroProduto(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}
              >
                Data da Venda:
              </label>

              <input
                type="date"
                value={filtroData}
                onChange={(e) =>
                  setFiltroData(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setFiltroPedido('');
                  setFiltroProduto('');
                  setFiltroData('');
                }}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  height: '35px',
                }}
              >
                Limpar
              </button>
            </div>
          </div>

          {carregando ? (
            <p>Carregando...</p>
          ) : vendas.length === 0 ? (
            <p style={{ color: '#999' }}>
              Nenhuma venda realizada ainda.
            </p>
          ) : pedidosFiltrados.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px',
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
            >
              <p
                style={{
                  color: '#666',
                  fontSize: '16px',
                  margin: 0,
                }}
              >
                Nenhum pedido encontrado com os filtros atuais.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              {pedidosFiltrados.map((pedido) => {
                const itens = pedido.items || [];

                const totalPedido = itens.reduce(
                  (soma, item) =>
                    soma + parseFloat(item.total_price || 0),
                  0
                );

                const pedidoAtivo = Boolean(pedido.status);

                const statusLabel = pedidoAtivo
                  ? 'Ativo'
                  : 'Inativo';

                const statusCor = pedidoAtivo
                  ? '#28a745'
                  : '#999';

                return (
                  <div
                    key={pedido.id}
                    style={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 15px',
                        backgroundColor: '#eef7f0',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      <div style={{ color: '#000' }}>
                        <strong>
                          Pedido {pedido.order_number || '---'}
                        </strong>

                        <span
                          style={{
                            marginLeft: '12px',
                            fontSize: '12px',
                            color: '#555',
                          }}
                        >
                          {pedido.created_at
                            ? new Date(
                                pedido.created_at
                              ).toLocaleString('pt-BR')
                            : 'Data não informada'}
                        </span>

                        <span
                          style={{
                            marginLeft: '12px',
                            fontSize: '12px',
                            color: '#555',
                          }}
                        >
                          {itens.length}{' '}
                          {itens.length === 1
                            ? 'item'
                            : 'itens'}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: statusCor,
                          }}
                        >
                          {statusLabel}
                        </span>

                        <button
                          onClick={() =>
                            alterarStatusPedido(pedido)
                          }
                          style={{
                            padding: '6px 12px',
                            backgroundColor: pedidoAtivo
                              ? '#dc3545'
                              : '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          {pedidoAtivo
                            ? 'Inativar pedido'
                            : 'Reativar pedido'}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        overflowX: 'auto',
                        padding: '10px 15px',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '14px',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                            }}
                          >
                            <th
                              style={{
                                padding: '8px 10px',
                                textAlign: 'left',
                              }}
                            >
                              Produto
                            </th>

                            <th
                              style={{
                                padding: '8px 10px',
                                textAlign: 'center',
                              }}
                            >
                              Quantidade
                            </th>

                            <th
                              style={{
                                padding: '8px 10px',
                                textAlign: 'right',
                              }}
                            >
                              Preço Unit.
                            </th>

                            <th
                              style={{
                                padding: '8px 10px',
                                textAlign: 'right',
                              }}
                            >
                              Subtotal
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {itens.map((item) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid #ddd',
                                backgroundColor: '#fff',
                              }}
                            >
                              <td
                                style={{
                                  padding: '8px 10px',
                                  color: '#000',
                                }}
                              >
                                {item.product_name ||
                                  'Produto não informado'}
                              </td>

                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'center',
                                  color: '#000',
                                }}
                              >
                                {item.quantity}
                              </td>

                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'right',
                                  color: '#000',
                                }}
                              >
                                R${' '}
                                {parseFloat(
                                  item.unit_price || 0
                                ).toFixed(2)}
                              </td>

                              <td
                                style={{
                                  padding: '8px 10px',
                                  textAlign: 'right',
                                  fontWeight: 'bold',
                                  color: '#000',
                                }}
                              >
                                R${' '}
                                {parseFloat(
                                  item.total_price || 0
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot>
                          <tr>
                            <td
                              colSpan="3"
                              style={{
                                padding: '8px 10px',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: '#000',
                              }}
                            >
                              Total do pedido:
                            </td>

                            <td
                              style={{
                                padding: '8px 10px',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: '#000',
                              }}
                            >
                              R${' '}
                              {parseFloat(
                                pedido.total_price || totalPedido
                              ).toFixed(2)}
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