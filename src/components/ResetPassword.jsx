import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [validLink, setValidLink] = useState(false);

  // Supabase pone la sesión en la URL con hash — hay que esperar al evento
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidLink(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!password)              { setError('Ingresa tu nueva contraseña.'); return; }
    if (password.length < 6)    { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirm)   { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (e) {
      setError(e.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-bg">
        <div className="rp-card">

          {/* Logo */}
          <div className="rp-logo">
            <span className="rp-logo-mark">T</span>
            <span className="rp-logo-text" style={{ color:'#c8f000' }}>MUEVO</span>
          </div>

          {success ? (
            <>
              <div className="rp-icon rp-icon--ok">✓</div>
              <h2 className="rp-title">¡Contraseña actualizada!</h2>
              <p className="rp-sub">Tu contraseña fue cambiada correctamente. Serás redirigido en unos segundos...</p>
              <button className="rp-btn" onClick={() => navigate('/')}>Ir al inicio</button>
            </>
          ) : !validLink ? (
            <>
              <div className="rp-icon rp-icon--wait">⏳</div>
              <h2 className="rp-title">Verificando enlace...</h2>
              <p className="rp-sub">Si llegaste aquí desde el email de recuperación, espera un momento.</p>
              <p className="rp-sub" style={{ marginTop: 8 }}>Si el problema persiste, solicita un nuevo enlace.</p>
              <button className="rp-btn rp-btn--outline" onClick={() => navigate('/')}>Volver al inicio</button>
            </>
          ) : (
            <>
              <h2 className="rp-title">Nueva contraseña</h2>
              <p className="rp-sub">Elige una contraseña segura para tu cuenta</p>

              <div className="rp-fields">
                <div className="rp-field">
                  <label className="rp-label">Nueva contraseña</label>
                  <div className="rp-pwd-wrap">
                    <input
                      className="rp-input"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button className="rp-pwd-eye" onClick={() => setShowPwd(v => !v)} type="button">
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                <div className="rp-field">
                  <label className="rp-label">Confirmar contraseña</label>
                  <input
                    className="rp-input"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Repite la contraseña"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <div className="rp-error">{error}</div>}

              <button className="rp-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="rp-spinner"/> : 'Guardar nueva contraseña'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box}
  .rp-bg{min-height:100vh;background:#000;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:'DM Sans',sans-serif}
  .rp-card{background:#fff;border-radius:20px;padding:2.5rem 2rem;width:min(420px,100%);box-shadow:0 24px 80px rgba(0,0,0,.4)}

  .rp-logo{display:flex;align-items:center;gap:8px;margin-bottom:2rem}
  .rp-logo-mark{width:34px;height:34px;border-radius:8px;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:13px}
  .rp-logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.5px}

  .rp-icon{font-size:2.5rem;margin-bottom:1rem}
  .rp-icon--ok{color:#16a34a}
  .rp-icon--wait{color:#d97706}

  .rp-title{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:#000;margin-bottom:6px}
  .rp-sub{font-size:.87rem;color:#888;margin-bottom:1.5rem}

  .rp-fields{display:flex;flex-direction:column;gap:14px;margin-bottom:1.25rem}
  .rp-field{display:flex;flex-direction:column;gap:5px}
  .rp-label{font-size:.78rem;font-weight:600;color:#555;letter-spacing:.02em}
  .rp-pwd-wrap{position:relative}
  .rp-input{width:100%;padding:12px 14px;border:1.5px solid #e5e5e5;border-radius:10px;font-size:.93rem;font-family:'DM Sans',sans-serif;color:#000;background:#fafafa;outline:none;transition:border-color .2s}
  .rp-input:focus{border-color:#000;background:#fff}
  .rp-input::placeholder{color:#bbb}
  .rp-input:disabled{opacity:.5}
  .rp-pwd-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#aaa;cursor:pointer;padding:4px;display:flex;align-items:center}
  .rp-pwd-eye:hover{color:#000}

  .rp-error{padding:10px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#c0290e;font-size:.82rem;margin-bottom:1rem}

  .rp-btn{width:100%;padding:14px;background:#000;color:#fff;border:none;border-radius:10px;font-size:.95rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .rp-btn:hover:not(:disabled){background:#1a1a1a}
  .rp-btn:disabled{opacity:.5;cursor:not-allowed}
  .rp-btn--outline{background:transparent;color:#000;border:1.5px solid #000;margin-top:8px}
  .rp-btn--outline:hover{background:#000;color:#fff}

  .rp-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
  @keyframes spin{to{transform:rotate(360deg)}}
`;