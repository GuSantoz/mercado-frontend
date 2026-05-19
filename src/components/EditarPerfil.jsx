import { useState } from 'react';
import '../App.css';

const EditarPerfil = ({ onUpdateSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa estar logado para atualizar os dados.');
      return;
    }

    const dadosParaAtualizar = {};
    if (nome) dadosParaAtualizar.nome = nome;
    if (email) dadosParaAtualizar.email = email;
    if (celular) dadosParaAtualizar.celular = celular;

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
        setMensagem('Perfil atualizado com sucesso!');
        if (nome) {
          localStorage.setItem('nome_usuario', nome);
          if (onUpdateSuccess) {
            onUpdateSuccess(nome);
          }
        }
        setNome('');
        setEmail('');
        setCelular('');
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
        Preencha apenas os campos que deseja alterar.
      </p>
      
      <form onSubmit={handleUpdate}>
        
        <div className="form-group">
          <label>Novo Nome:</label>
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Seu novo nome"
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Novo E-mail:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="novo@email.com"
            className="dark-input"
          />
        </div>

        <div className="form-group">
          <label>Novo Celular:</label>
          <input 
            type="text" 
            value={celular} 
            onChange={(e) => setCelular(e.target.value)} 
            placeholder="+5511999999999"
            className="dark-input"
          />
        </div>

        <button type="submit" className="btn-success">
          Atualizar Dados
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