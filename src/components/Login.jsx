import { useState, useEffect } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const carregarCnpj = () => {
      const cnpjSalvo = localStorage.getItem('cnpjAtivacao');
      if (cnpjSalvo) {
        setCnpj(cnpjSalvo);
      }
    };

    carregarCnpj();

    const intervalo = setInterval(carregarCnpj, 500);

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
          cnpj: cnpj,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Login realizado com sucesso!');
        localStorage.setItem('token', data.token);
        
        localStorage.removeItem('cnpjAtivacao');
        
        if (onLoginSuccess) onLoginSuccess(data.nome);
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
          <label>CNPJ:</label>
          <input 
            type="text" 
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)} 
            placeholder="CNPJ"
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