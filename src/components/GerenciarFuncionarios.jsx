import React, { useState, useEffect } from 'react';

const GerenciarFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('OPERADOR');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setFuncionarios(data.funcionarios || []);
      } else {
        console.error(data.erro);
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Cadastrando...', tipo: 'info' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, cpf, senha, role })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ texto: 'Funcionário cadastrado com sucesso!', tipo: 'sucesso' });
        setNome('');
        setCpf('');
        setSenha('');
        setRole('OPERADOR');
        carregarFuncionarios();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao cadastrar funcionário.', tipo: 'erro' });
      }
    } catch (error) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
      console.error("Erro detalhado:", error);
    }
  };

  // Estilos padronizados para inputs
  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#fff', color: '#000' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* LADO ESQUERDO: Formulário de Cadastro */}
      <div style={{ flex: '1 1 300px', backgroundColor: '#2a2a2a', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0 }}>Adicionar Novo Funcionário</h3>
        
        {mensagem.texto && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '4px',
            backgroundColor: mensagem.tipo === 'sucesso' ? '#1e4620' : mensagem.tipo === 'erro' ? '#5c161b' : '#333',
            color: '#fff',
            border: `1px solid ${mensagem.tipo === 'sucesso' ? '#28a745' : mensagem.tipo === 'erro' ? '#dc3545' : '#555'}`
          }}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Nome Completo:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label>CPF (Apenas números):</label>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} required maxLength="11" style={inputStyle} />
          </div>

          <div>
            <label>Senha de Acesso:</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label>Cargo / Permissão:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="OPERADOR">Operador de Caixa (Vendas e Listagem)</option>
              <option value="COMPRADOR">Comprador (Cadastra e Visualiza Produtos)</option>
              <option value="GERENTE">Gerente (Acesso quase total)</option>
            </select>
          </div>

          <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Cadastrar Funcionário
          </button>
        </form>
      </div>

      {/* LADO DIREITO: Lista de Funcionários */}
      <div style={{ flex: '2 1 400px', backgroundColor: '#2a2a2a', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0 }}>Equipe Registrada</h3>
        
        {funcionarios.length === 0 ? (
          <p style={{ color: '#ccc' }}>Nenhum funcionário cadastrado ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#444', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #555' }}>Nome</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #555' }}>CPF</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #555' }}>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((func) => (
                <tr key={func.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px' }}>{func.nome}</td>
                  <td style={{ padding: '12px' }}>{func.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      backgroundColor: func.role === 'GERENTE' ? '#17a2b8' : func.role === 'COMPRADOR' ? '#ffc107' : '#6c757d', 
                      color: func.role === 'COMPRADOR' ? '#000' : '#fff', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {func.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GerenciarFuncionarios;