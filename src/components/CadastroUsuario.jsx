import { useState } from 'react';

function CadastroUsuario({ onCadastroSuccess }) {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const regexCnpj = /(^\d{14}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/;
    if (!regexCnpj.test(cnpj)) {
      alert('Erro: Formato de CNPJ inválido. Digite 14 números (ex: 12345678000199) ou use a máscara padrão.');
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.(com|br|com\.br)$/i;
    if (!regexEmail.test(email)) {
      alert('Erro: E-mail inválido. Certifique-se de usar "@" e terminar com ".com" ou ".br".');
      return;
    }

    const dadosUsuario = {
      nome: nome,
      cnpj: cnpj,
      email: email,
      celular: celular,
      senha: senha
    };

    try {
      const resposta = await fetch('http://localhost:5000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosUsuario),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem('cnpjAtivacao', cnpj);

        setTimeout(() => {
          alert(dados.mensagem);
          if (onCadastroSuccess) onCadastroSuccess();
          
          setNome('');
          setCnpj('');
          setEmail('');
          setCelular('');
          setSenha('');
        }, 200); 

      } else {
        alert(`Erro: ${dados.erro || 'Falha ao cadastrar'}`);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Nome Completo:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div>
          <label>CNPJ:</label>
          <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div>
          <label>E-mail:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div>
          <label>Celular (WhatsApp):</label>
          <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div>
          <label>Senha:</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          Cadastrar
        </button>
      </form>
    </div>
  );
}

export default CadastroUsuario;