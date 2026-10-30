import { useState, useEffect } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [documento, setDocumento] = useState(''); // Alterado de cnpj para documento
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const carregarDocumento = () => {
      // Mantido 'cnpjAtivacao' para não quebrar seu fluxo de registro/ativação atual
      const documentoSalvo = localStorage.getItem('cnpjAtivacao'); 
      if (documentoSalvo) {
        setDocumento(documentoSalvo);
      }
    };

    carregarDocumento();

    const intervalo = setInterval(carregarDocumento, 500);

    return () => clearInterval(intervalo);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento: documento, // Backend agora espera 'documento' (ou cnpj por retrocompatibilidade)
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Login realizado com sucesso!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role); // NOVO: Salva o papel (DONO, GERENTE, etc)
        
        localStorage.removeItem('cnpjAtivacao');
        
        // NOVO: Passa a role para o componente pai (App.jsx)
        if (onLoginSuccess) onLoginSuccess(data.nome, data.role); 
      } else {
        setMensagem(data.erro || 'Erro ao fazer login.');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor.');
      console.error("Erro detalhado:", error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto 50px', padding: '20px' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>CPF ou CNPJ:</label>
          <input 
            type="text" 
            value={documento}
            onChange={(e) => setDocumento(e.target.value)} 
            placeholder="Digite seu CPF ou CNPJ"
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Senha:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Senha"
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: '#FFF', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      {mensagem && <p style={{ marginTop: '15px', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}
    </div>
  );
};

export default Login;