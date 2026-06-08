import { useState, useEffect } from 'react';
import '../App.css';

const EditarPerfil = ({ onUpdateSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const carregarDadosPerfil = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setMensagem('Você precisa estar logado para visualizar os dados.');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/user', {
          method: 'GET',
          headers: {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log("Resposta tratada do Flask:", data);

        if (response.ok) {
          // Agora lê direto as chaves tratadas que vêm do back-end
          setNome(data.nome || '');
          setEmail(data.email || '');
          setCelular(data.celular || '');
        } else {
          setMensagem(data.erro || data.mensagem || 'Erro ao carregar os dados do perfil.');
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setMensagem('Erro de conexão ao carregar dados do perfil.');
      }
    };

    carregarDadosPerfil();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa estar logado para atualizar os dados.');
      return;
    }

    const dadosParaAtualizar = {
      nome: nome,
      email: email,
      celular: celular
    };

    try {
      const response = await fetch('http://localhost:5000/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dadosParaAtualizar),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Perfil updated com sucesso!');
        if (nome) {
          localStorage.setItem('nome_usuario', nome);
          if (onUpdateSuccess) {
            onUpdateSuccess(nome);
          }
        }
      } else {
        setMensagem(data.erro || 'Erro ao atualizar o perfil.');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="auth-card" style={{ margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Atualizar Meus Dados</h2>
      <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
        Altere as informações desejadas abaixo e clique em salvar.
      </p>
      
      <form onSubmit={handleUpdate}>
        
        <div className="form-group">
          <label>Nome:</label>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Seu nome"
            className="dark-input"
            required // Garante que não envie em branco
          />
        </div>

        <div className="form-group">
          <label>E-mail:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="seu@email.com"
            className="dark-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Celular:</label>
          <input 
            type="text" 
            value={celular} 
            onChange={(e) => setCelular(e.target.value)} 
            placeholder="+5511999999999"
            className="dark-input"
            required
          />
        </div>

        <button type="submit" className="btn-success">
          Salvar Alterações
        </button>
      </form>

      {mensagem && (
        <p style={{ marginTop: '15px', textAlign: 'center', color: mensagem.includes('sucesso') ? '#28a745' : '#dc3545' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
};

export default EditarPerfil;