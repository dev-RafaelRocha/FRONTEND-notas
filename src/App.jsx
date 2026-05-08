import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Buscar todas as notas
  async function buscarNotas() {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/notas`);
      const data = await res.json();
      setNotas(data.notas || []);
    } catch {
      setErro('Erro ao conectar com a API.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarNotas();
  }, []);

  function mostrarMensagem(msg, isErro = false) {
    if (isErro) setErro(msg);
    else setMensagem(msg);
    setTimeout(() => { setMensagem(''); setErro(''); }, 3000);
  }

  // Criar ou atualizar nota
  async function salvarNota() {
    if (!titulo.trim() || !conteudo.trim()) {
      mostrarMensagem('Preencha o título e o conteúdo.', true);
      return;
    }

    const body = JSON.stringify({ titulo, conteudo });
    const headers = { 'Content-Type': 'application/json' };

    try {
      let res;
      if (editandoId) {
        res = await fetch(`${API_URL}/notas/${editandoId}`, { method: 'PUT', headers, body });
        mostrarMensagem('Nota atualizada com sucesso!');
      } else {
        res = await fetch(`${API_URL}/notas`, { method: 'POST', headers, body });
        mostrarMensagem('Nota criada com sucesso!');
      }

      if (!res.ok) throw new Error();
      setTitulo('');
      setConteudo('');
      setEditandoId(null);
      buscarNotas();
    } catch {
      mostrarMensagem('Erro ao salvar nota.', true);
    }
  }

  function iniciarEdicao(nota) {
    setEditandoId(nota.id);
    setTitulo(nota.titulo);
    setConteudo(nota.conteudo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setTitulo('');
    setConteudo('');
  }

  async function excluirNota(id) {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;
    try {
      const res = await fetch(`${API_URL}/notas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      mostrarMensagem('Nota excluída com sucesso!');
      buscarNotas();
    } catch {
      mostrarMensagem('Erro ao excluir nota.', true);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Gerenciador de Notas</h1>
        <p className="subtitle">Frontend React · API Express</p>
        <p className="api-url">API: {API_URL}</p>
      </header>

      <section className="form-section">
        <h2>{editandoId ? '✏️ Editar Nota' : '➕ Nova Nota'}</h2>
        <input
          type="text"
          placeholder="Título da nota"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          placeholder="Conteúdo da nota"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={4}
        />
        <div className="botoes-form">
          <button className="btn-salvar" onClick={salvarNota}>
            {editandoId ? 'Atualizar' : 'Criar Nota'}
          </button>
          {editandoId && (
            <button className="btn-cancelar" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </div>
        {mensagem && <p className="msg-sucesso">{mensagem}</p>}
        {erro && <p className="msg-erro">{erro}</p>}
      </section>

      <section className="lista-section">
        <h2>📋 Notas ({notas.length})</h2>
        {carregando && <p className="carregando">Carregando...</p>}
        {!carregando && notas.length === 0 && (
          <p className="vazio">Nenhuma nota encontrada. Crie a primeira!</p>
        )}
        <div className="grid-notas">
          {notas.map((nota) => (
            <div key={nota.id} className="card-nota">
              <h3>{nota.titulo}</h3>
              <p>{nota.conteudo}</p>
              <small>
                Criado em: {new Date(nota.criadoEm).toLocaleString('pt-BR')}
                {nota.atualizadoEm && (
                  <> · Editado em: {new Date(nota.atualizadoEm).toLocaleString('pt-BR')}</>
                )}
              </small>
              <div className="botoes-card">
                <button className="btn-editar" onClick={() => iniciarEdicao(nota)}>Editar</button>
                <button className="btn-excluir" onClick={() => excluirNota(nota.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
