import React, { useState } from 'react';

function ValidacaoCodigo({ onValidationSuccess }) {
  const [codigo, setCodigo] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('Validando...');

    const cnpjSalvo = localStorage.getItem('cnpjAtivacao');

    if (!cnpjSalvo) {
      setMensagem('Erro: Nenhum CNPJ encontrado. Por favor, faça o cadastro primeiro.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:5000/user/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnpj: cnpjSalvo,
          activation_code: codigo
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem('Código validado com sucesso! Conta ativada.');
        setTimeout(() => {
          if (onValidationSuccess) onValidationSuccess();
        }, 3000);
      } else {
        setMensagem(`Erro: ${dados.erro || 'Código inválido. Tente novamente.'}`);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      setMensagem('Erro de conexão com o servidor. O backend está rodando?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Validar Código</h2>
      <p style={{ textAlign: 'center' }}>Digite o código enviado para o seu WhatsApp.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <input
            type="text"
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength="4"
            placeholder='9999'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', textAlign: 'center', fontSize: '20px', letterSpacing: '15px' }}
            required
          />
        </div>
        <button type="submit" style={{ padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          Validar Código
        </button>
      </form>

      {mensagem && (
        <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default ValidacaoCodigo;