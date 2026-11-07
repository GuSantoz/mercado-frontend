import { useState, useEffect } from 'react';
import '../App.css';

const API_BASE = 'http://localhost:5000';

function Cupons() {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [cupomEmEdicaoId, setCupomEmEdicaoId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_value: '',
    max_discount_value: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    status: true
  });

  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    buscarCupons();
  }, []);

  const obterHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const buscarCupons = async () => {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch(`${API_BASE}/coupon`, {
        method: 'GET',
        headers: obterHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setCupons(data.cupons || []);
      } else {
        setErro(data.erro || 'Erro ao carregar lista de cupons.');
      }
    } catch (e) {
      console.error('Erro ao buscar cupons:', e);
      setErro('Não foi possível conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setModoEdicao(false);
    setCupomEmEdicaoId(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_value: '',
      max_discount_value: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      status: true
    });
    setModalAberto(true);
  };

  const abrirModalEdicao = (cupom) => {
    setModoEdicao(true);
    setCupomEmEdicaoId(cupom.id);
    setFormData({
      code: cupom.code,
      description: cupom.description || '',
      discount_type: cupom.discount_type,
      discount_value: cupom.discount_value,
      min_purchase_value: cupom.min_purchase_value || '',
      max_discount_value: cupom.max_discount_value || '',
      usage_limit: cupom.usage_limit || '',
      valid_from: cupom.valid_from ? cupom.valid_from.substring(0, 16) : '',
      valid_until: cupom.valid_until ? cupom.valid_until.substring(0, 16) : '',
      status: cupom.status
    });
    setModalAberto(true);
  };

  const gerarCodigoAleatorio = () => {
    const prefixos = ['PROMO', 'DESCONTO', 'OFERTA', 'MERCADO', 'ESPECIAL', 'SUPER'];
    const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    setFormData((prev) => ({ ...prev, code: `${prefixo}${num}` }));
  };

  const handleSalvarCupom = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!formData.code.trim()) {
      setErro('Informe o código do cupom.');
      return;
    }

    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      setErro('Informe um valor de desconto válido e maior que zero.');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_purchase_value: formData.min_purchase_value ? Number(formData.min_purchase_value) : 0,
      max_discount_value: formData.max_discount_value ? Number(formData.max_discount_value) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      status: formData.status
    };

    try {
      const url = modoEdicao ? `${API_BASE}/coupon/${cupomEmEdicaoId}` : `${API_BASE}/coupon`;
      const method = modoEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: obterHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setMensagemSucesso(data.mensagem || (modoEdicao ? 'Cupom atualizado!' : 'Cupom criado com sucesso!'));
        setModalAberto(false);
        buscarCupons();
        setTimeout(() => setMensagemSucesso(''), 4000);
      } else {
        setErro(data.erro || 'Erro ao salvar cupom.');
      }
    } catch (e) {
      console.error('Erro ao salvar:', e);
      setErro('Erro de conexão ao salvar cupom.');
    }
  };

  const handleAlternarStatus = async (cupomId) => {
    try {
      const res = await fetch(`${API_BASE}/coupon/${cupomId}/status`, {
        method: 'PUT',
        headers: obterHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        buscarCupons();
      } else {
        alert(data.erro || 'Erro ao alterar status do cupom');
      }
    } catch (e) {
      alert('Erro de conexão ao alterar status.');
    }
  };

  const handleExcluirCupom = async (cupom) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cupom "${cupom.code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/coupon/${cupom.id}`, {
        method: 'DELETE',
        headers: obterHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setMensagemSucesso(data.mensagem);
        buscarCupons();
        setTimeout(() => setMensagemSucesso(''), 4000);
      } else {
        alert(data.erro || 'Erro ao excluir cupom.');
      }
    } catch (e) {
      alert('Erro de conexão ao excluir cupom.');
    }
  };

  const copiarParaTransferencia = (cupom) => {
    navigator.clipboard.writeText(cupom.code);
    setCopiadoId(cupom.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // KPIs
  const totalCupons = cupons.length;
  const cuponsAtivos = cupons.filter((c) => c.computed_status === 'Ativo').length;
  const totalUsos = cupons.reduce((acc, c) => acc + (c.usage_count || 0), 0);

  // Filtragem
  const cuponsFiltrados = cupons.filter((cupom) => {
    const atendeBusca =
      cupom.code.toLowerCase().includes(busca.toLowerCase()) ||
      (cupom.description && cupom.description.toLowerCase().includes(busca.toLowerCase()));

    if (!atendeBusca) return false;

    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'ativos') return cupom.computed_status === 'Ativo';
    if (filtroStatus === 'inativos') return cupom.computed_status === 'Inativo';
    if (filtroStatus === 'expirados') return cupom.computed_status === 'Expirado';
    if (filtroStatus === 'esgotados') return cupom.computed_status === 'Esgotado';

    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Ativo':
        return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
      case 'Expirado':
        return { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' };
      case 'Esgotado':
        return { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' };
      case 'Agendado':
        return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
      case 'Inativo':
      default:
        return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🏷️</span> Cupons de Desconto & Promoções
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: '14px' }}>
            Crie campanhas de incentivo, descontos percentuais ou fixos e aumente as vendas do mercado.
          </p>
        </div>

        <button
          onClick={abrirModalNovo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span> Novo Cupom
        </button>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '14px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3e6cb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✅</span>
          <strong>{mensagemSucesso}</strong>
        </div>
      )}

      {erro && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '14px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span>
          <strong>{erro}</strong>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <div style={{ color: '#888', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Total de Cupons</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a' }}>{totalCupons}</div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Cadastrados na sua loja</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <div style={{ color: '#2e7d32', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Cupons Ativos</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#2e7d32' }}>{cuponsAtivos}</div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Prontos para resgate no PDV</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <div style={{ color: '#0288d1', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Vezes Resgatados</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#0288d1' }}>{totalUsos}</div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Total de compras com desconto</div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ flex: '1', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por código ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'expirados', label: 'Expirados' },
            { id: 'esgotados', label: 'Esgotados' },
            { id: 'inativos', label: 'Inativos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroStatus(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroStatus === tab.id ? '#007bff' : '#ddd',
                backgroundColor: filtroStatus === tab.id ? '#007bff' : '#f8f9fa',
                color: filtroStatus === tab.id ? '#fff' : '#495057',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem de Cupons */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
          Carregando cupons...
        </div>
      ) : cuponsFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #ddd' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎟️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Nenhum cupom encontrado</h3>
          <p style={{ color: '#777', margin: '0 0 20px 0', fontSize: '14px' }}>
            {busca || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros ou a busca acima.'
              : 'Você ainda não cadastrou nenhum cupom de desconto. Clique no botão abaixo para criar o primeiro!'}
          </p>
          <button
            onClick={abrirModalNovo}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Criar Primeiro Cupom
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {cuponsFiltrados.map((cupom) => {
            const statusStyle = getStatusBadgeStyle(cupom.computed_status);
            const isAtivo = cupom.computed_status === 'Ativo';
            const percentUso = cupom.usage_limit ? Math.min(100, Math.round((cupom.usage_count / cupom.usage_limit) * 100)) : null;

            return (
              <div
                key={cupom.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.07)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Linha superior decorativa de destaque */}
                <div style={{ height: '5px', backgroundColor: isAtivo ? '#10b981' : '#9ca3af' }} />

                <div style={{ padding: '20px', flex: '1' }}>
                  {/* Topo do Card: Badge do Valor e Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{
                      backgroundColor: cupom.discount_type === 'percentage' ? '#eff6ff' : '#f0fdf4',
                      color: cupom.discount_type === 'percentage' ? '#1d4ed8' : '#15803d',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: '800',
                      fontSize: '15px'
                    }}>
                      {cupom.discount_type === 'percentage'
                        ? `${cupom.discount_value}% OFF`
                        : `R$ ${cupom.discount_value.toFixed(2)} OFF`}
                    </div>

                    <div style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {cupom.computed_status}
                    </div>
                  </div>

                  {/* Código do Cupom em destaque com botão de copiar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '1px' }}>
                      {cupom.code}
                    </span>
                    <button
                      onClick={() => copiarParaTransferencia(cupom)}
                      title="Copiar código para a área de transferência"
                      style={{
                        backgroundColor: copiadoId === cupom.id ? '#10b981' : '#e2e8f0',
                        color: copiadoId === cupom.id ? '#fff' : '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {copiadoId === cupom.id ? '✓ Copiado!' : '📋 Copiar'}
                    </button>
                  </div>

                  {/* Descrição */}
                  {cupom.description && (
                    <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                      {cupom.description}
                    </p>
                  )}

                  {/* Regras e Condições */}
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Compra Mínima:</span>
                      <strong>{cupom.min_purchase_value > 0 ? `R$ ${cupom.min_purchase_value.toFixed(2)}` : 'Sem valor mínimo'}</strong>
                    </div>

                    {cupom.discount_type === 'percentage' && cupom.max_discount_value && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Desconto Máximo:</span>
                        <strong>R$ {cupom.max_discount_value.toFixed(2)}</strong>
                      </div>
                    )}

                    {cupom.valid_until && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Válido até:</span>
                        <strong>{new Date(cupom.valid_until).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                      </div>
                    )}
                  </div>

                  {/* Barra de Progresso de Usos */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      <span>Usos realizados:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {cupom.usage_count} {cupom.usage_limit ? `/ ${cupom.usage_limit}` : 'usos (ilimitado)'}
                      </strong>
                    </div>
                    {cupom.usage_limit && (
                      <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percentUso}%`,
                            backgroundColor: percentUso >= 100 ? '#ef4444' : percentUso >= 80 ? '#f59e0b' : '#3b82f6',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações do Card */}
                <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', padding: '10px 14px', backgroundColor: '#fcfcfd', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleAlternarStatus(cupom.id)}
                    style={{
                      backgroundColor: cupom.status ? '#fef3c7' : '#dcfce7',
                      color: cupom.status ? '#92400e' : '#166534',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {cupom.status ? '⏸️ Pausar' : '▶️ Ativar'}
                  </button>

                  <button
                    onClick={() => abrirModalEdicao(cupom)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => handleExcluirCupom(cupom)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalAberto && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              width: '90%',
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: 'bold' }}>
                {modoEdicao ? '✏️ Editar Cupom' : '✨ Criar Novo Cupom'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSalvarCupom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Código */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                  Código do Cupom *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PROMO15"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                  {!modoEdicao && (
                    <button
                      type="button"
                      onClick={gerarCodigoAleatorio}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🎲 Gerar
                    </button>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                  Descrição / Campanha
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desconto de boas-vindas para novos clientes"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Tipo e Valor de Desconto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Tipo de Desconto *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    required
                    placeholder={formData.discount_type === 'percentage' ? 'Ex: 10 (%)' : 'Ex: 15.00 (R$)'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Compra Mínima e Desconto Máximo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Compra Mínima (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 (opcional)"
                    value={formData.min_purchase_value}
                    onChange={(e) => setFormData({ ...formData, min_purchase_value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Desconto Máximo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sem limite (opcional)"
                    disabled={formData.discount_type !== 'percentage'}
                    value={formData.max_discount_value}
                    onChange={(e) => setFormData({ ...formData, max_discount_value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: formData.discount_type !== 'percentage' ? '#f3f4f6' : '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Limite de Usos */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                  Limite Total de Usos (Ex: 100 primeiras compras)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ilimitado se deixar em branco"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Datas de Início e Término */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Válido a partir de
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Válido até (Expiração)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Status Inicial */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="cupomStatusCheck"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="cupomStatusCheck" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                  Cupom Ativo imediatamente
                </label>
              </div>

              {/* Botões do Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 123, 255, 0.3)'
                  }}
                >
                  {modoEdicao ? 'Salvar Alterações' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cupons;
