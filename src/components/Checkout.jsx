import { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

const API_BASE = 'http://localhost:5000';
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

let mpInicializado = false;

function Checkout({ itens, total, onPagamentoAprovado, onCancelar }) {
  const [status, setStatus] = useState('formulario'); // formulario | processando | aprovado | recusado
  const [mensagem, setMensagem] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!mpInicializado && MP_PUBLIC_KEY) {
      initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      mpInicializado = true;
    }
  }, []);

  useEffect(() => {
    const corOriginal = document.body.style.color;
    document.body.style.color = '#212529';
    return () => {
      document.body.style.color = corOriginal;
    };
  }, []);

  const handleSubmit = async (formData) => {
    setStatus('processando');
    setMensagem('');

    try {
      const respostaPagamento = await fetch(`${API_BASE}/pagamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const dadosPagamento = await respostaPagamento.json();

      if (!respostaPagamento.ok || dadosPagamento.status !== 'approved') {
        setStatus('recusado');
        setMensagem(
          dadosPagamento.erro ||
          `Pagamento não aprovado (${dadosPagamento.status_detail || dadosPagamento.status || 'motivo desconhecido'}).`
        );
        return;
      }

      try {
        await onPagamentoAprovado();
        setStatus('aprovado');
      } catch (erroVenda) {
        setStatus('recusado');
        setMensagem('Pagamento aprovado, mas houve um erro ao registrar a venda: ' + erroVenda.message);
      }
    } catch (erro) {
      console.error('Erro no pagamento:', erro);
      setStatus('recusado');
      setMensagem('Erro ao conectar com o servidor de pagamentos.');
    }
  };

  if (!MP_PUBLIC_KEY) {
    return (
      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '5px', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ margin: 0 }}>
          ⚠️ Chave pública do Mercado Pago não configurada. Crie um arquivo <code>.env</code> na raiz do frontend com <code>VITE_MP_PUBLIC_KEY=sua-chave-de-teste</code> e reinicie o servidor.
        </p>
        <button
          onClick={onCancelar}
          style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', color: '#333', maxWidth: '480px', margin: '0 auto' }}>
      <h3 style={{ color: '#212529', marginTop: 0, textAlign: 'center' }}>💳 Pagamento</h3>

      <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px', padding: '12px 15px', marginBottom: '20px' }}>
        {itens.map((item) => (
          <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0', color: '#000' }}>
            <span>{item.quantity}x {item.name}</span>
            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', marginTop: '8px', paddingTop: '8px', color: '#000' }}>
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {status === 'aprovado' ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#28a745' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>✅ Pagamento aprovado!</p>
          <p style={{ margin: '8px 0 0' }}>Venda registrada com sucesso.</p>
        </div>
      ) : (
        <>
          {status === 'recusado' && (
            <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px' }}>
              {mensagem}
            </div>
          )}

          {status === 'processando' && (
            <div style={{ textAlign: 'center', padding: '10px', color: '#555' }}>
              Processando pagamento...
            </div>
          )}

          <div style={{ display: status === 'recusado' ? 'none' : 'block' }}>
            <CardPayment
              key={tentativa}
              initialization={{ amount: total }}
              customization={{
                visual: {
                  style: {
                    theme: 'flat',
                    customVariables: {
                      textPrimaryColor: '#000000',
                      textSecondaryColor: '#333333',
                      inputBackgroundColor: '#ffffff',
                      formBackgroundColor: '#ffffff'
                    }
                  }
                }
              }}
              onSubmit={async (param) => {
                await handleSubmit(param?.formData ?? param);
              }}
              onReady={() => {}}
              onError={(erro) => console.error('Erro no formulário de pagamento:', erro)}
            />
          </div>

          {status === 'recusado' && (
            <button
              onClick={() => { setStatus('formulario'); setTentativa((t) => t + 1); }}
              style={{ width: '100%', padding: '10px', backgroundColor: '#f0ad4e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Tentar novamente
            </button>
          )}
        </>
      )}

      <button
        onClick={onCancelar}
        style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {status === 'aprovado' ? 'Fechar' : 'Cancelar e voltar ao carrinho'}
      </button>
    </div>
  );
}

export default Checkout;
