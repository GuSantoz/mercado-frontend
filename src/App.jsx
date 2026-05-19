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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [dashboardTab, setDashboardTab] = useState('perfil');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nome = localStorage.getItem('nome_usuario');
    
    if (token && nome) {
      setIsLoggedIn(true);
      setNomeUsuario(nome);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome_usuario');
    setIsLoggedIn(false);
    setNomeUsuario('');
  };

  return (
    <div>
      <header className="app-header">
        <h1>📦 Gestão de Estoque - Mini Mercado</h1>
      </header>

      {isLoggedIn ? (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px', fontWeight: 'bold' }}>
              Olá, {nomeUsuario}
            </span>
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#DC3545', color: '#FFF', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Sair (Logout)
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
            <button 
              onClick={() => setDashboardTab('perfil')}
              style={{
                padding: '12px 20px',
                backgroundColor: dashboardTab === 'perfil' ? '#007bff' : '#f0f0f0',
                color: dashboardTab === 'perfil' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📝 Editar Perfil
            </button>
            <button 
              onClick={() => setDashboardTab('produto')}
              style={{
                padding: '12px 20px',
                backgroundColor: dashboardTab === 'produto' ? '#007bff' : '#f0f0f0',
                color: dashboardTab === 'produto' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📦 Cadastrar Produto
            </button>
            <button 
              onClick={() => setDashboardTab('listar')}
              style={{
                padding: '12px 20px',
                backgroundColor: dashboardTab === 'listar' ? '#007bff' : '#f0f0f0',
                color: dashboardTab === 'listar' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              👁️ Ver Produtos
            </button>
            <button 
              onClick={() => setDashboardTab('vendas')}
              style={{
                padding: '12px 20px',
                backgroundColor: dashboardTab === 'vendas' ? '#007bff' : '#f0f0f0',
                color: dashboardTab === 'vendas' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🛒 Vendas
            </button>
            <button 
              onClick={() => setDashboardTab('dashboard')}
              style={{
                padding: '12px 20px',
                backgroundColor: dashboardTab === 'dashboard' ? '#007bff' : '#f0f0f0',
                color: dashboardTab === 'dashboard' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📊 Visão Geral
            </button>
          </div>

          {dashboardTab === 'perfil' ? (
            <EditarPerfil onUpdateSuccess={(novoNome) => setNomeUsuario(novoNome)} />
          ) : dashboardTab === 'produto' ? (
            <CadastroProduto onCadastroSuccess={() => alert('Produto cadastrado com sucesso!')} />
          ) : dashboardTab === 'listar' ? (
            <ListarProdutos />
          ) : dashboardTab === 'vendas' ? (
            <Vendas />
          ) : dashboardTab === 'dashboard' ? (
            <Dashboard />
          ) : null}
        </div>
      ) : (
        <div className="auth-layout">
          <img 
            src="./assets/banner.jpg" 
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
              <Login onLoginSuccess={(nome) => {
                setNomeUsuario(nome);
                setIsLoggedIn(true);
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