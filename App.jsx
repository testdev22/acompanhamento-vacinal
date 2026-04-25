import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// CONFIGURAÇÃO DO SUPABASE (usa .env.local)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const emptyForm = {
  nome: "",
  cpf: "",
  nascimento: "",
  bairro: "",
  vacina: "",
  dose: "",
  data_aplicacao: "",
  proxima_dose: "",
  status: "Pendente",
};

export default function App() {
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPeople();
  }, []);

  async function loadPeople() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vacinacao")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setError("Erro ao carregar dados");
    } else {
      setPeople(data);
    }

    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("vacinacao")
      .insert([form])
      .select();

    if (error) {
      setError("Erro ao salvar no banco");
    } else {
      setPeople([data[0], ...people]);
      setForm(emptyForm);
    }
  }

  async function deleteItem(id) {
    await supabase.from("vacinacao").delete().eq("id", id);
    setPeople(people.filter((p) => p.id !== id));
  }

  const stats = useMemo(() => {
    return {
      total: people.length,
      completos: people.filter((p) => p.status === "Completo").length,
      pendentes: people.filter((p) => p.status === "Pendente").length,
      atrasados: people.filter((p) => p.status === "Atrasado").length,
    };
  }, [people]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>💉 Sistema de Vacinação</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Novo Registro</h2>

      <form onSubmit={handleSubmit}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} /><br />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} /><br />
        <input name="nascimento" type="date" value={form.nascimento} onChange={handleChange} /><br />
        <input name="bairro" placeholder="Bairro" value={form.bairro} onChange={handleChange} /><br />
        <input name="vacina" placeholder="Vacina" value={form.vacina} onChange={handleChange} /><br />
        <input name="dose" placeholder="Dose" value={form.dose} onChange={handleChange} /><br />
        <input name="data_aplicacao" type="date" value={form.data_aplicacao} onChange={handleChange} /><br />
        <input name="proxima_dose" type="date" value={form.proxima_dose} onChange={handleChange} /><br />

        <select name="status" value={form.status} onChange={handleChange}>
          <option>Pendente</option>
          <option>Completo</option>
          <option>Atrasado</option>
        </select><br /><br />

        <button type="submit">Salvar</button>
      </form>

      <h2>Resumo</h2>
      <p>Total: {stats.total}</p>
      <p>Completos: {stats.completos}</p>
      <p>Pendentes: {stats.pendentes}</p>
      <p>Atrasados: {stats.atrasados}</p>

      <h2>Registros</h2>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Vacina</th>
              <th>Dose</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.vacina}</td>
                <td>{p.dose}</td>
                <td>{p.status}</td>
                <td>
                  <button onClick={() => deleteItem(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}