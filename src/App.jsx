import React, { useState, useEffect } from 'react';
import './App.css';
import CadastroUsuario from './components/CadastroUsuario';
import ValidacaoCodigo from './components/ValidacaoCodigo';
import Login from './components/Login';
import EditarPerfil from './components/EditarPerfil';
import CadastroProduto from './components/CadastroProduto';
import ListarProdutos from './components/ListarProdutos';
import Vendas from './components/Vendas';
import Dashboard from './components/Dashboard';
import Cupons from './components/Cupons';
import bannerImg from './assets/banner.jpg';
import GerenciarFuncionarios from './components/GerenciarFuncionarios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userRole, setUserRole] = useState(''); // NOVO: Estado para armazenar o papel
  const [dashboardTab, setDashboardTab] = useState('vendas');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nome = localStorage.getItem('nome_usuario');
    const role = localStorage.getItem('role'); // NOVO: Puxa o papel do localStorage
    
    if (token && nome) {
      setIsLoggedIn(true);
      setNomeUsuario(nome);
      setUserRole(role || 'DONO'); // Se não tiver role (usuários antigos), assume DONO
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome_usuario');
    localStorage.removeItem('role'); // NOVO: Limpa o papel no logout
    setIsLoggedIn(false);
    setNomeUsuario('');
    setUserRole('');
  };

  // NOVO: Função que define quem pode ver qual aba
  const verificarPermissao = (aba) => {
    switch (aba) {
      case 'perfil':
      case 'cupons':
      case 'funcionarios': // Já deixei preparado para a próxima tela
        return userRole === 'DONO';
      case 'dashboard':
        return userRole === 'DONO' || userRole === 'GERENTE';
      case 'produto': // Cadastrar produto
        return userRole === 'DONO' || userRole === 'GERENTE' || userRole === 'COMPRADOR';
      case 'vendas':
        return userRole === 'DONO' || userRole === 'GERENTE' || userRole === 'OPERADOR';
      case 'listar': // Ver produtos (estoque)
        return true; // Todos podem ver o estoque
      default:
        return false;
    }
  };

  // NOVO: Função para limpar o CSS repetido dos botões
  const getButtonStyle = (aba) => ({
    padding: '12px 20px',
    backgroundColor: dashboardTab === aba ? '#007bff' : '#f0f0f0',
    color: dashboardTab === aba ? '#fff' : '#000',
    border: 'none',
    borderRadius: '5px 5px 0 0',
    cursor: 'pointer',
    fontWeight: 'bold'
  });

  return (
    <div>
      <header className="app-header">
        <h1>📦 Gestão de Estoque - Mini Mercado</h1>
      </header>

      {isLoggedIn ? (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px', fontWeight: 'bold' }}>
              Olá, {nomeUsuario}
            </span>
            {userRole !== 'DONO' && (
              <span style={{ backgroundColor: '#28a745', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>
                {userRole}
              </span>
            )}
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#DC3545', color: '#FFF', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Sair (Logout)
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', flexWrap: 'wrap' }}>
            
            {/* Renderização Condicional baseada na função verificarPermissao */}
            
            {verificarPermissao('perfil') && (
              <button onClick={() => setDashboardTab('perfil')} style={getButtonStyle('perfil')}>
                📝 Editar Perfil
              </button>
            )}

            {verificarPermissao('produto') && (
              <button onClick={() => setDashboardTab('produto')} style={getButtonStyle('produto')}>
                📦 Cadastrar Produto
              </button>
            )}

            {verificarPermissao('listar') && (
              <button onClick={() => setDashboardTab('listar')} style={getButtonStyle('listar')}>
                👁️ Ver Produtos
              </button>
            )}

            {verificarPermissao('vendas') && (
              <button onClick={() => setDashboardTab('vendas')} style={getButtonStyle('vendas')}>
                🛒 Vendas
              </button>
            )}

            {verificarPermissao('cupons') && (
              <button onClick={() => setDashboardTab('cupons')} style={getButtonStyle('cupons')}>
                🏷️ Cupons
              </button>
            )}

            {verificarPermissao('dashboard') && (
              <button onClick={() => setDashboardTab('dashboard')} style={getButtonStyle('dashboard')}>
                📊 Visão Geral
              </button>
            )}

            {/* Já deixei o botão de funcionários pronto e invisível para quem não for DONO */}
            {verificarPermissao('funcionarios') && (
              <button onClick={() => setDashboardTab('funcionarios')} style={getButtonStyle('funcionarios')}>
                👥 Funcionários
              </button>
            )}

          </div>

          {/* Área de conteúdo das abas */}
          {dashboardTab === 'perfil' ? (
            <EditarPerfil onUpdateSuccess={(novoNome) => setNomeUsuario(novoNome)} />
          ) : dashboardTab === 'produto' ? (
            <CadastroProduto onCadastroSuccess={() => alert('Produto cadastrado com sucesso!')} />
          ) : dashboardTab === 'listar' ? (
            <ListarProdutos />
          ) : dashboardTab === 'vendas' ? (
            <Vendas />
          ) : dashboardTab === 'cupons' ? (
            <Cupons />
          ) : dashboardTab === 'dashboard' ? (
            <Dashboard />
          ) : dashboardTab === 'funcionarios' ? (
            <GerenciarFuncionarios />
          ) : null}
        </div>
      ) : (
        <div className="auth-layout">
          <img 
            src={bannerImg}
            alt="Interior de um Mini Mercado" 
            className="auth-image"
          />

          <div className="auth-card">
            <div className="toggle-container">
              <button className={`toggle-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>
                Entrar
              </button>
              <button className={`toggle-btn ${authTab === 'cadastro' ? 'active' : ''}`} onClick={() => setAuthTab('cadastro')}>
                Cadastrar
              </button>
            </div>

            {authTab === 'login' ? (
              <Login onLoginSuccess={(nome, role) => {
                setNomeUsuario(nome);
                setUserRole(role);
                setIsLoggedIn(true);
                localStorage.setItem('nome_usuario', nome); // Garante que o nome fique salvo para o refresh
                
                // Define a tela inicial com base no papel
                if (role === 'COMPRADOR') {
                  setDashboardTab('listar');
                } else {
                  setDashboardTab('vendas');
                }
              }} />
            ) : (
              <CadastroUsuario onCadastroSuccess={() => setIsModalOpen(true)} />
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✖</button>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>Validar Código</h3>
            <ValidacaoCodigo onValidationSuccess={() => {
              setIsModalOpen(false);
              setAuthTab('login');
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;