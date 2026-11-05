// Monta a notificação do dia. Sem dependências: roda no Deno (Supabase) e no Node (testes).

export const PHRASES = [
  "Constância vence talento. Bora fazer a sua parte hoje?",
  "Quinze questões por dia viram mais de mil até a prova.",
  "A farda começa a ser conquistada na mesa de estudo.",
  "Não precisa ser perfeito, precisa ser hoje.",
  "Cada erro de hoje é um acerto no dia da prova.",
  "Dez minutos já mantêm o ritmo. Comece pelo mais fácil.",
  "Quem estuda um pouco todo dia não precisa correr no fim.",
  "Disciplina é fazer mesmo sem vontade. Bora?",
  "Sua vaga está sendo disputada agora. Não deixe para amanhã.",
  "Revise o caderno de erros: é ali que estão os pontos mais fáceis.",
  "Um simulado por semana treina o tempo e a cabeça para a prova.",
  "Comece pela matéria que mais pesa na prova. É ali que estão mais pontos.",
  "Hoje é dia de bater a meta. Seu eu do futuro agradece.",
  "Cansado? Faça só a missão do dia. Pouco também conta.",
  "Leia a explicação de cada erro. É assim que a pegadinha deixa de pegar.",
  "Treino difícil, prova tranquila. Bora para as questões?",
  "Seu concorrente estudou hoje. E você?",
  "Mais uma página, mais uma questão, mais perto da aprovação.",
  "Pequenos passos todos os dias. É assim que se chega lá.",
  "A aprovação é feita de dias comuns bem aproveitados."
];

const MILESTONES = { 100: "Faltam 100 dias!", 60: "Faltam 60 dias.", 30: "Faltam 30 dias: reta final.", 15: "Faltam 15 dias.", 7: "Falta uma semana!", 1: "A prova é amanhã." };

/** Diferença em dias entre duas datas "AAAA-MM-DD". */
export function diffDays(a, b) {
  const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}

/** Data e hora locais no fuso da pessoa: { date: "AAAA-MM-DD", hour: 0..23 }. */
export function localNow(tz, now = new Date()) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now);
  } catch (e) {
    parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now);
  }
  const g = t => parts.find(p => p.type === t).value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, hour: Number(g("hour")) % 24 };
}

/** Deve enviar agora? Só no horário escolhido, uma vez por dia e se ainda não estudou hoje. */
export function shouldSend(sub, now = new Date()) {
  const { date, hour } = localNow(sub.tz, now);
  if (hour !== sub.hour) return false;
  if (sub.last_sent === date) return false;
  if (sub.last_study === date) return false;
  return true;
}

/** Escolhe a mensagem mais relevante do dia. */
export function buildMessage(sub, now = new Date()) {
  const { date } = localNow(sub.tz, now);
  const name = sub.concurso_name || "Central de Estudos";
  const title = `${name} · hora de estudar`;
  const left = sub.exam_date ? diffDays(date, sub.exam_date) : null;
  const sinceStudy = sub.last_study ? diffDays(sub.last_study, date) : null;
  const streakAlive = sinceStudy === 1 && (sub.streak || 0) >= 2;
  const dayIndex = Math.floor(Date.UTC(...date.split("-").map((n, i) => i === 1 ? n - 1 : +n)) / 864e5);
  const phrase = PHRASES[dayIndex % PHRASES.length];

  let body;
  if (left != null && MILESTONES[left]) body = `${MILESTONES[left]} ${phrase}`;
  else if (streakAlive) body = `🔥 Sua sequência de ${sub.streak} dias acaba hoje. Dez minutos já salvam.`;
  else if (sinceStudy != null && sinceStudy >= 3) body = `Faz ${sinceStudy} dias que você não estuda. Volte com a missão do dia: é rapidinho.`;
  else if (sub.weak && dayIndex % 3 === 0) body = `Seu ponto fraco é ${sub.weak}. Que tal 10 questões hoje?`;
  else if (left != null && left > 0 && dayIndex % 2 === 0) body = `Faltam ${left} dias para a prova. ${phrase}`;
  else body = phrase;

  return { title, body, url: "./#home" };
}
