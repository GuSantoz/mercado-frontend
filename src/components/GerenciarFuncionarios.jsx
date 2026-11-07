import React, { useState, useEffect } from 'react';

const GerenciarFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('OPERADOR');
  const [statusAtivo, setStatusAtivo] = useState(true); // Novo estado para o PUT
  
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [editandoId, setEditandoId] = useState(null); // Guarda o ID de quem está sendo editado

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const token = localStorage.getItem('token');
      // Verifique se a sua rota de listagem é /employees ou /employee no backend e ajuste se necessário
      const response = await fetch('http://localhost:5000/employee', {
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

  // Função única que lida com Cadastro e Edição
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: editandoId ? 'Atualizando...' : 'Cadastrando...', tipo: 'info' });

    try {
      const token = localStorage.getItem('token');
      const url = editandoId 
        ? `http://localhost:5000/employee/${editandoId}` // Rota PUT
        : 'http://localhost:5000/employee';              // Rota POST
        
      const method = editandoId ? 'PUT' : 'POST';

      // Monta o payload dependendo se é criação ou edição (usando as chaves exatas do seu backend)
      const bodyData = editandoId
        ? { name: nome, cargo: role, status: statusAtivo } // Dados para o PUT
        : { nome, cpf, senha, role };                      // Dados para o POST

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ 
          texto: editandoId ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!', 
          tipo: 'sucesso' 
        });
        cancelarEdicao(); // Limpa os campos
        carregarFuncionarios(); // Recarrega a lista
      } else {
        setMensagem({ texto: data.erro || 'Erro ao salvar funcionário.', tipo: 'erro' });
      }
    } catch (error) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
      console.error("Erro detalhado:", error);
    }
  };

  // Preenche o formulário com os dados do funcionário clicado
  const iniciarEdicao = (func) => {
    setMensagem({ texto: '', tipo: '' });
    setEditandoId(func.id);
    setNome(func.nome || func.name || ''); // Lida com possível variação de nome da chave no retorno
    setRole(func.role || 'OPERADOR');
    setStatusAtivo(func.status !== false && func.status !== 0);
  };

  // Limpa o formulário e sai do modo de edição
  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome('');
    setCpf('');
    setSenha('');
    setRole('OPERADOR');
    setStatusAtivo(true);
    setMensagem({ texto: '', tipo: '' });
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#fff', color: '#000' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      
      {/* LADO ESQUERDO: Formulário */}
      <div style={{ flex: '1 1 300px', backgroundColor: '#2a2a2a', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', alignSelf: 'flex-start' }}>
        <h3 style={{ marginTop: 0 }}>
          {editandoId ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
        </h3>
        
        {mensagem.texto && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: mensagem.tipo === 'sucesso' ? '#1e4620' : mensagem.tipo === 'erro' ? '#5c161b' : '#333', color: '#fff', border: `1px solid ${mensagem.tipo === 'sucesso' ? '#28a745' : mensagem.tipo === 'erro' ? '#dc3545' : '#555'}`}}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Nome Completo:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputStyle} />
          </div>

          {/* Só mostra CPF e Senha se NÃO estiver editando */}
          {!editandoId && (
            <>
              <div>
                <label>CPF (Apenas números):</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} required maxLength="11" style={inputStyle} />
              </div>
              <div>
                <label>Senha de Acesso:</label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={inputStyle} />
              </div>
            </>
          )}

          <div>
            <label>Cargo / Permissão:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="OPERADOR">Operador de Caixa (Vendas e Listagem)</option>
              <option value="COMPRADOR">Comprador (Cadastra e Visualiza Produtos)</option>
              <option value="GERENTE">Gerente (Acesso quase total)</option>
            </select>
          </div>

          {/* Só mostra o Status se ESTIVER editando */}
          {editandoId && (
            <div>
              <label>Status do Acesso:</label>
              <select value={statusAtivo} onChange={(e) => setStatusAtivo(e.target.value === 'true')} style={inputStyle}>
                <option value="true">Ativo (Pode acessar)</option>
                <option value="false">Inativo (Bloqueado)</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: editandoId ? '#007bff' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editandoId ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
            </button>
            
            {editandoId && (
              <button type="button" onClick={cancelarEdicao} style={{ padding: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
            )}
          </div>
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
                <th style={{ padding: '12px', borderBottom: '1px solid #555' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #555', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((func) => (
                <tr key={func.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px' }}>{func.nome || func.name}</td>
                  <td style={{ padding: '12px' }}>{func.cpf ? func.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '---'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: func.role === 'GERENTE' ? '#17a2b8' : func.role === 'COMPRADOR' ? '#ffc107' : '#6c757d', color: func.role === 'COMPRADOR' ? '#000' : '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {func.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      color: (func.status === false || func.status === 0) ? '#dc3545' : '#28a745', 
                      fontWeight: 'bold' 
                    }}>
                      {(func.status === false || func.status === 0) ? 'Inativo' : 'Ativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => iniciarEdicao(func)}
                      style={{ padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Editar
                    </button>
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