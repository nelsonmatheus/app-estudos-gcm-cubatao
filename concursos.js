/* Central de Estudos · registro de concursos.
   Cada concurso é um pacote: matérias, banco, cartões, macetes, regras da prova e tema.
   Para incluir um concurso novo, carregue os dados dele no index.html e adicione um item aqui. */
"use strict";
(() => {
  const gcmQuestions = [
    ...QUESTIONS.map(x => ({ t: x.topic, art: "Geral", q: x.q, o: x.opts, w: x.why, a: x.a })),
    ...BANK.map(x => ({ ...x, a: x.a ?? 0 }))
  ];

  const parts = window.PMSP_PARTS || [];
  const pmspTopics = PMSP_TOPICS;
  const pmspQuestions = [
    ...PMSP_BANK.map(([t, art, q, o, w]) => ({ t, art, q, o, w, a: 0 })),
    ...parts.flatMap(p => p.bank.map(([art, q, o, w]) => ({ t: p.t, art, q, o, w, a: 0 })))
  ];
  const pmspCards = [...PMSP_CARDS, ...parts.flatMap(p => p.cards.map(c => ({ topic: pmspTopics[p.t].name, front: c.front, back: c.back })))];
  const pmspMacetes = [...parts.flatMap(p => p.macetes.map(m => ({ t: p.t, ...m }))), ...(window.PMSP_MACETES || [])];

  window.CONCURSOS = [
    {
      id: "gcm",
      name: "GCM Cubatão",
      full: "Guarda Civil Municipal de Cubatão",
      sub: "Conhecimentos Específicos · IBAM",
      banca: "IBAM",
      store: "gcm-cubatao-study-v2",         // mesma chave da v3: ninguém perde o progresso
      logo: "shield",
      themeColor: "#0a1424",
      examDate: new Date(2026, 11, 20),
      dateLabel: "20 dez 2026 · IBAM",
      status: "Prova em 20/12/2026",
      sim: { size: 15, minutes: 79, pts: 4, target: 12, safe: 13, opts: 4, weights: null },
      scopeLabel: "Edital · Conhecimentos Específicos",
      pointsLabel: "Pontos em Específicos",
      metaText: "Meta: 12 acertos (48 pontos). Com 13 (52), você passa da nota mínima.",
      source: "Material de treino baseado na apostila. Confira sempre a lei e o edital oficiais.",
      ranks: [[0,"Recruta"],[50,"Aluno"],[120,"Guarda nível I"],[220,"Guarda nível II"],[350,"Guarda nível III"],[500,"Guarda nível IV"],[700,"Guarda nível V"],[950,"Guarda nível VI"],[1300,"Subinspetor"],[1800,"Inspetor"]],
      verdict(ok, pts) {
        if (ok >= 13) return ["Acima da linha", `Com ${pts} pontos só em Específicos, você já passa dos 50 pontos da nota mínima.`];
        if (ok >= 12) return ["Na meta", `Faltou ${13 - ok === 1 ? "1 acerto" : (13 - ok) + " acertos"} para garantir os 50 pontos só com Específicos.`];
        return ["Abaixo da meta", "A meta é de 12 acertos ou mais. Os erros já estão no seu caderno."];
      },
      topics: TOPICS, cards: CARDS, macetes: MACETES, questions: gcmQuestions
    },
    {
      id: "pmsp",
      name: "PM-SP Soldado",
      full: "Polícia Militar do Estado de São Paulo · Soldado PM de 2ª Classe",
      sub: "Edital DP-4/321/26 · Vunesp",
      banca: "Vunesp",
      store: "pmsp-soldado-study-v1",
      logo: "badge",
      themeColor: "#121418",
      examDate: new Date(2027, 1, 28),         // Edital DP-4/321/26, Cap. VI, item 1 (tarde)
      dateLabel: "28 fev 2027 · Vunesp",
      status: "Prova em 28/02/2027",
      sim: { size: 60, minutes: 180, pts: 1, target: 30, safe: 42, opts: 5, weights: [20, 15, 15, 5, 5] }, // 5 h no total com a redação; 3 h para a objetiva deixa 2 h para o texto
      scopeLabel: "Edital DP-4/321/26 · Anexo B",
      pointsLabel: "Pontos na prova objetiva",
      metaText: "Mínimo na objetiva: 30 de 60 pontos. A redação vale 40 (mínimo 20). Para disputar vaga, mire em 42 ou mais na objetiva.",
      source: "Conteúdo alinhado ao Anexo B do Edital DP-4/321/26 (Vunesp). Material de treino: confira sempre o edital e a lei oficiais.",
      ranks: [[0,"Recruta"],[50,"Aluno-soldado"],[120,"Soldado 2ª classe"],[220,"Soldado 1ª classe"],[350,"Cabo"],[500,"3º Sargento"],[700,"2º Sargento"],[950,"1º Sargento"],[1300,"Subtenente"],[1800,"Aspirante a oficial"]],
      verdict(ok, pts) {
        if (ok >= 42) return ["Nota competitiva", `Com ${pts} pontos, você está bem acima do mínimo de 30. A classificação é por nota: mantenha o ritmo.`];
        if (ok >= 30) return ["Habilitado na objetiva", `Passou do mínimo de 30 pontos. Para disputar vaga com folga, mire em 42 ou mais, e garanta 20 na redação.`];
        return ["Abaixo do mínimo", "O mínimo é 30 pontos (metade da prova). Os erros já estão no seu caderno."];
      },
      topics: pmspTopics, cards: pmspCards, macetes: pmspMacetes, questions: pmspQuestions
    }
  ];
})();
