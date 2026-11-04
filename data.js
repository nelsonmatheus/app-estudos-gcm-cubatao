const TOPICS = [
  {
    "name": "Constituição Federal",
    "sub": "Arts. 1º, 3º, 5º, 37 e 144"
  },
  {
    "name": "Estatuto Geral das Guardas Municipais",
    "sub": "Lei 13.022/2014"
  },
  {
    "name": "SUSP",
    "sub": "Lei 13.675/2018, arts. 9º e 10"
  },
  {
    "name": "Cooperação das Guardas Municipais",
    "sub": "Decreto 11.841/2023"
  },
  {
    "name": "Lei Orgânica de Cubatão",
    "sub": "Art. 13"
  },
  {
    "name": "GCMC",
    "sub": "Lei Complementar 112/2019"
  },
  {
    "name": "Fiscalização de posturas",
    "sub": "Lei Complementar 156/2026"
  },
  {
    "name": "Código Penal",
    "sub": "Arts. 23 a 25, 129, 146, 147, 147-A, 147-B, 148, 150, 155 a 157, 163, 312, 316, 317, 319, 325, 327 e 329 a 331"
  },
  {
    "name": "Prisão em flagrante",
    "sub": "CPP, arts. 301 a 303"
  },
  {
    "name": "Abuso de autoridade",
    "sub": "Lei 13.869/2019"
  },
  {
    "name": "Uso diferenciado da força",
    "sub": "Lei 13.060/2014 e Decreto 12.341/2024"
  },
  {
    "name": "Patrulhamento preventivo",
    "sub": "Proteção municipal"
  },
  {
    "name": "Atendimento de ocorrências",
    "sub": "Procedimentos operacionais"
  },
  {
    "name": "Atendimento humanizado",
    "sub": "Direitos e proteção de pessoas vulneráveis"
  },
  {
    "name": "Comunicação e documentação",
    "sub": "Comunicação operacional"
  },
  {
    "name": "Conduta funcional",
    "sub": "Segurança operacional"
  }
];

const CARDS = [
  {
    "topic": "Constituição Federal",
    "front": "Quais são os cinco fundamentos do art. 1º da CF?",
    "back": "Soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, pluralismo político."
  },
  {
    "topic": "Constituição Federal",
    "front": "Qual é a diferença entre os arts. 1º e 3º da CF?",
    "back": "Art. 1º traz fundamentos da República; art. 3º apresenta objetivos fundamentais, expressos por verbos."
  },
  {
    "topic": "Constituição Federal",
    "front": "No art. 3º, o que deve ser erradicado e o que deve ser reduzido?",
    "back": "Erradicar a pobreza e a marginalização; reduzir as desigualdades sociais e regionais."
  },
  {
    "topic": "Constituição Federal",
    "front": "Quais são os princípios do art. 37, caput?",
    "back": "Legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE)."
  },
  {
    "topic": "Constituição Federal",
    "front": "Quais dispositivos do art. 144 tratam diretamente das Guardas Municipais?",
    "back": "O § 8º prevê a criação de guardas pelos municípios para proteção de seus bens, serviços e instalações, conforme a lei."
  },
  {
    "topic": "Estatuto Geral das Guardas Municipais",
    "front": "Quais são os princípios mínimos de atuação da Guarda Municipal na Lei 13.022/2014?",
    "back": "Proteção dos direitos humanos; preservação da vida; patrulhamento preventivo; compromisso com a evolução social; uso progressivo da força."
  },
  {
    "topic": "SUSP",
    "front": "A Guarda Municipal integra o SUSP em qual categoria?",
    "back": "Como integrante operacional, conforme o enquadramento da Lei 13.675/2018."
  },
  {
    "topic": "Cooperação das Guardas Municipais",
    "front": "O que orienta a cooperação prevista no Decreto 11.841/2023?",
    "back": "Atuação cooperativa das Guardas com os órgãos de segurança pública, incluindo patrulhamento preventivo e apoio em ocorrências, nos limites legais."
  },
  {
    "topic": "Lei Orgânica de Cubatão",
    "front": "Qual é a finalidade da Guarda Municipal prevista no art. 13 da Lei Orgânica de Cubatão, segundo a apostila?",
    "back": "Proteger bens, serviços e instalações municipais; o material também destaca a vedação de reprimir manifestação popular."
  },
  {
    "topic": "GCMC",
    "front": "Qual é o estágio probatório indicado para a carreira da GCMC no resumo da apostila?",
    "back": "Três anos."
  },
  {
    "topic": "GCMC",
    "front": "Quais são os requisitos de ingresso destacados no resumo da LC 112/2019?",
    "back": "Ser brasileiro, ensino médio, CNH AB e idade mínima de 18 anos; a idade máxima de 40 anos foi removida pela LC 136/2023."
  },
  {
    "topic": "Fiscalização de posturas",
    "front": "Qual é a regra básica da GDAF na LC 156/2026?",
    "back": "R$ 1,00 por ponto, teto mensal de 300 pontos e gratificação não incorporável."
  },
  {
    "topic": "Fiscalização de posturas",
    "front": "Qual autoridade designa os guardas para fiscalização, conforme a questão-modelo da apostila?",
    "back": "O Comandante da Guarda Municipal, e não o Prefeito por decreto."
  },
  {
    "topic": "Código Penal",
    "front": "Qual é a diferença entre legítima defesa e estado de necessidade?",
    "back": "Na legítima defesa repele-se injusta agressão atual ou iminente; no estado de necessidade, pratica-se o fato para salvar direito próprio ou alheio de perigo atual, nos termos legais."
  },
  {
    "topic": "Código Penal",
    "front": "Quais são os três crimes funcionais que não devem ser confundidos: peculato, concussão e corrupção passiva?",
    "back": "Peculato: apropriar-se/desviar bem em razão do cargo; concussão: exigir vantagem indevida; corrupção passiva: solicitar ou receber, ou aceitar promessa de vantagem indevida."
  },
  {
    "topic": "Código Penal",
    "front": "O que caracteriza prevaricação?",
    "back": "Retardar ou deixar de praticar indevidamente ato de ofício, ou praticá-lo contra disposição expressa de lei, para satisfazer interesse ou sentimento pessoal."
  },
  {
    "topic": "Prisão em flagrante",
    "front": "Quais são as três modalidades clássicas de flagrante descritas no CPP?",
    "back": "Próprio, impróprio e presumido (ou ficto)."
  },
  {
    "topic": "Prisão em flagrante",
    "front": "Quando há flagrante próprio?",
    "back": "Quando a pessoa está cometendo a infração ou acaba de cometê-la."
  },
  {
    "topic": "Prisão em flagrante",
    "front": "Quando há flagrante impróprio?",
    "back": "Quando a pessoa é perseguida logo após a infração, em situação que faça presumir ser autora."
  },
  {
    "topic": "Prisão em flagrante",
    "front": "Quando há flagrante presumido?",
    "back": "Quando a pessoa é encontrada logo depois com instrumentos, armas, objetos ou papéis que façam presumir ser autora."
  },
  {
    "topic": "Abuso de autoridade",
    "front": "Qual elemento subjetivo especial a Lei 13.869/2019 exige para os crimes de abuso de autoridade?",
    "back": "Finalidade específica de prejudicar alguém, beneficiar a si ou terceiro, ou agir por mero capricho ou satisfação pessoal."
  },
  {
    "topic": "Abuso de autoridade",
    "front": "A divergência na interpretação da lei ou na avaliação de fatos configura, por si só, abuso de autoridade?",
    "back": "Não. A própria lei afasta essa conclusão automática."
  },
  {
    "topic": "Uso diferenciado da força",
    "front": "Quais princípios orientam o uso diferenciado da força?",
    "back": "Legalidade, necessidade, proporcionalidade, razoabilidade e precaução, conforme o conteúdo estudado."
  },
  {
    "topic": "Atendimento de ocorrências",
    "front": "Qual deve ser a prioridade no atendimento de uma ocorrência?",
    "back": "Preservar a vida e garantir a segurança; depois, controlar riscos, solicitar apoio, isolar/preservar o local e documentar."
  },
  {
    "topic": "Atendimento de ocorrências",
    "front": "O que estabelece a Súmula Vinculante 11 sobre algemas?",
    "back": "O uso é excepcional e exige justificativa por resistência, fundado receio de fuga ou perigo à integridade física própria ou alheia, com justificativa por escrito."
  },
  {
    "topic": "Comunicação e documentação",
    "front": "Como deve ser um relatório operacional?",
    "back": "Objetivo, claro e cronológico, distinguindo fatos observados das opiniões e registrando providências adotadas."
  },
  {
    "topic": "Comunicação e documentação",
    "front": "O que significam QAP e QSL no código Q usado no material?",
    "back": "QAP: na escuta; QSL: entendido/recebido."
  },
  {
    "topic": "Conduta funcional",
    "front": "Hierarquia funcional autoriza cumprir ordem manifestamente ilegal?",
    "back": "Não. A hierarquia deve respeitar a legalidade; ordem manifestamente ilegal não deve ser cumprida."
  }
];

const QUESTIONS = [
  {
    "topic": 0,
    "q": "Uma questão afirma que “pluralismo partidário” é fundamento expresso no art. 1º da Constituição. Qual avaliação corresponde à literalidade constitucional?",
    "opts": [
      "Correta, pois pluralismo partidário é a expressão do inciso V.",
      "Incorreta: o texto prevê pluralismo político, expressão mais ampla.",
      "Correta apenas para os municípios.",
      "Incorreta: pluralismo é objetivo do art. 3º."
    ],
    "a": 1,
    "why": "A apostila destaca a pegadinha: o art. 1º, V, utiliza “pluralismo político”, não “pluralismo partidário”."
  },
  {
    "topic": 0,
    "q": "A alternativa que reproduz corretamente o art. 3º, III, da CF é:",
    "opts": [
      "Erradicar as desigualdades sociais e regionais; reduzir a pobreza e a marginalização.",
      "Reduzir a pobreza e a marginalização; erradicar as desigualdades sociais e regionais.",
      "Erradicar a pobreza e a marginalização; reduzir as desigualdades sociais e regionais.",
      "Erradicar a pobreza e as desigualdades regionais; reduzir a marginalização social."
    ],
    "a": 2,
    "why": "A distinção entre os verbos é expressa no texto constitucional e destacada no material."
  },
  {
    "topic": 0,
    "q": "Em uma abordagem, o agente afirma que a dignidade da pessoa humana deixa de ser relevante quando há suspeita de crime. A afirmação é:",
    "opts": [
      "Correta: a suspeita de crime suspende os direitos fundamentais até a conclusão da abordagem.",
      "Correta somente durante a prisão em flagrante, pois a dignidade é objetivo, e não fundamento.",
      "Incorreta: a dignidade é fundamento da República e deve ser respeitada também em abordagens e prisões.",
      "Correta quando houver ordem superior, pois a hierarquia prevalece sobre os fundamentos da República."
    ],
    "a": 2,
    "why": "A apostila relaciona o art. 1º, III, à atuação da Guarda e à proteção da integridade física e moral."
  },
  {
    "topic": 0,
    "q": "Sobre o art. 37, caput, assinale a alternativa que contém apenas princípios expressos:",
    "opts": [
      "Legalidade, impessoalidade, moralidade, publicidade e eficiência.",
      "Legalidade, finalidade, razoabilidade, proporcionalidade e eficiência.",
      "Hierarquia, disciplina, publicidade, moralidade e eficiência.",
      "Legalidade, supremacia, autotutela, publicidade e eficiência."
    ],
    "a": 0,
    "why": "O macete LIMPE corresponde aos cinco princípios expressos no caput."
  },
  {
    "topic": 1,
    "q": "A Lei 13.022/2014 define a Guarda Municipal como instituição de caráter:",
    "opts": [
      "Militar, subordinada às Forças Armadas.",
      "Civil, uniformizada e armada, conforme previsto em lei.",
      "Judiciário, com poder de investigação irrestrito.",
      "Privado, com atuação mediante convênio."
    ],
    "a": 1,
    "why": "A natureza civil, uniformizada e armada é uma característica central do Estatuto Geral."
  },
  {
    "topic": 1,
    "q": "Qual alternativa NÃO corresponde a princípio mínimo de atuação das Guardas Municipais?",
    "opts": [
      "Proteção dos direitos humanos fundamentais.",
      "Preservação da vida.",
      "Patrulhamento preventivo.",
      "Repressão político-partidária de manifestações."
    ],
    "a": 3,
    "why": "Os princípios legais incluem direitos humanos, preservação da vida, patrulhamento preventivo, evolução social e uso progressivo da força."
  },
  {
    "topic": 1,
    "q": "A atuação da Guarda Municipal deve priorizar:",
    "opts": [
      "A proteção preventiva e comunitária, respeitados os limites legais.",
      "A substituição integral das polícias estaduais.",
      "A investigação criminal sem limites legais.",
      "A repressão de manifestações críticas à administração."
    ],
    "a": 0,
    "why": "O material enfatiza patrulhamento preventivo, proteção municipal e respeito aos direitos fundamentais."
  },
  {
    "topic": 2,
    "q": "No SUSP, a Guarda Municipal é classificada, no recorte estudado, como:",
    "opts": [
      "Integrante estratégico exclusivamente.",
      "Integrante operacional.",
      "Órgão do Poder Judiciário.",
      "Órgão de controle externo."
    ],
    "a": 1,
    "why": "A apostila identifica as Guardas Municipais como integrantes operacionais do sistema."
  },
  {
    "topic": 3,
    "q": "A cooperação entre Guarda Municipal e demais órgãos de segurança deve ser entendida como:",
    "opts": [
      "Subordinação automática da Guarda a qualquer agente externo.",
      "Atuação integrada e cooperativa, dentro das competências legais.",
      "Transferência de todas as atribuições municipais à Polícia Civil.",
      "Autorização para atuar sem planejamento ou registro."
    ],
    "a": 1,
    "why": "O Decreto 11.841/2023 trata da cooperação, sem apagar competências e limites legais."
  },
  {
    "topic": 4,
    "q": "Segundo o resumo da Lei Orgânica de Cubatão, a finalidade municipal da Guarda está relacionada à proteção de:",
    "opts": [
      "Bens, serviços e instalações do município.",
      "Qualquer interesse privado indicado pelo Prefeito.",
      "Atividades partidárias e manifestações populares.",
      "Somente prédios da administração direta."
    ],
    "a": 0,
    "why": "O art. 13 é apresentado no material como fundamento local da proteção de bens, serviços e instalações municipais."
  },
  {
    "topic": 5,
    "q": "Conforme o resumo da LC 112/2019 e suas alterações, qual afirmação sobre ingresso está correta?",
    "opts": [
      "A idade máxima de 40 anos permanece obrigatória.",
      "A CNH exigida é exclusivamente categoria A.",
      "A idade máxima de 40 anos foi removida pela LC 136/2023.",
      "O ensino médio foi dispensado."
    ],
    "a": 2,
    "why": "O resumo registra a remoção do limite máximo de 40 anos pela LC 136/2023."
  },
  {
    "topic": 5,
    "q": "O estágio probatório indicado para a carreira da GCMC no material é de:",
    "opts": [
      "Um ano.",
      "Dois anos.",
      "Três anos.",
      "Cinco anos."
    ],
    "a": 2,
    "why": "A apostila resume o estágio probatório em três anos."
  },
  {
    "topic": 6,
    "q": "Sobre a GDAF da LC 156/2026, assinale a correta:",
    "opts": [
      "Cada ponto vale R$ 2,00 e não há teto.",
      "Cada ponto vale R$ 1,00, com teto de 300 pontos mensais.",
      "A gratificação incorpora após dois anos.",
      "A designação é feita pelo Prefeito mediante decreto."
    ],
    "a": 1,
    "why": "O material informa R$ 1,00 por ponto, teto de 300 pontos e não incorporação. O Comandante designa."
  },
  {
    "topic": 6,
    "q": "Um guarda acumulou 335 pontos no mês. Considerando o teto descrito na apostila, qual valor máximo de GDAF corresponde à pontuação?",
    "opts": [
      "R$ 335,00.",
      "R$ 300,00.",
      "R$ 230,00.",
      "R$ 150,00."
    ],
    "a": 1,
    "why": "O teto remunerado é de 300 pontos por mês, a R$ 1,00 por ponto."
  },
  {
    "topic": 6,
    "q": "Qual afirmação sobre a GDAF está de acordo com o material?",
    "opts": [
      "Incorpora-se após recebimento contínuo.",
      "É paga sem limite mensal.",
      "Não se incorpora à remuneração.",
      "É devida automaticamente a todos os integrantes, sem designação."
    ],
    "a": 2,
    "why": "A apostila destaca expressamente que a GDAF não se incorpora."
  },
  {
    "topic": 7,
    "q": "O agente que exige vantagem indevida em razão da função, ainda que fora dela, mas em razão dela, pratica em tese:",
    "opts": [
      "Peculato.",
      "Concussão.",
      "Prevaricação.",
      "Desobediência."
    ],
    "a": 1,
    "why": "Concussão (art. 316 do CP) envolve exigir vantagem indevida em razão da função."
  },
  {
    "topic": 7,
    "q": "Apropriar-se o funcionário público de dinheiro, valor ou bem móvel de que tem posse em razão do cargo caracteriza, em tese:",
    "opts": [
      "Peculato.",
      "Corrupção passiva.",
      "Concussão.",
      "Desacato."
    ],
    "a": 0,
    "why": "O peculato está previsto no art. 312 do Código Penal."
  },
  {
    "topic": 7,
    "q": "Solicitar ou receber, para si ou para outrem, vantagem indevida em razão da função caracteriza, em tese:",
    "opts": [
      "Corrupção passiva.",
      "Concussão.",
      "Prevaricação.",
      "Resistência."
    ],
    "a": 0,
    "why": "A corrupção passiva está no art. 317; a concussão envolve exigir."
  },
  {
    "topic": 7,
    "q": "Retardar ou deixar de praticar indevidamente ato de ofício para satisfazer interesse ou sentimento pessoal corresponde a:",
    "opts": [
      "Peculato.",
      "Prevaricação.",
      "Desacato.",
      "Dano."
    ],
    "a": 1,
    "why": "Essa é a descrição central da prevaricação, art. 319 do CP."
  },
  {
    "topic": 8,
    "q": "A pessoa é perseguida logo após a infração, em situação que faça presumir ser autora. Trata-se de flagrante:",
    "opts": [
      "Próprio.",
      "Impróprio.",
      "Presumido.",
      "Preparado."
    ],
    "a": 1,
    "why": "O flagrante impróprio ocorre quando há perseguição logo após em circunstâncias indicativas de autoria."
  },
  {
    "topic": 8,
    "q": "A pessoa é encontrada logo depois com objetos que façam presumir ser autora da infração. Trata-se de flagrante:",
    "opts": [
      "Próprio.",
      "Impróprio.",
      "Presumido ou ficto.",
      "Esperado."
    ],
    "a": 2,
    "why": "O flagrante presumido está previsto no art. 302, IV, do CPP."
  },
  {
    "topic": 8,
    "q": "Nos termos do art. 301 do CPP, sobre a prisão em flagrante, é correto afirmar:",
    "opts": [
      "Qualquer do povo deverá e as autoridades policiais e seus agentes poderão prender quem seja encontrado em flagrante delito.",
      "Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem seja encontrado em flagrante delito.",
      "Somente as autoridades policiais e seus agentes poderão prender quem seja encontrado em flagrante delito, vedado ao povo.",
      "Qualquer do povo e as autoridades policiais e seus agentes deverão prender quem seja encontrado em flagrante delito."
    ],
    "a": 1,
    "why": "O art. 301 diferencia faculdade para qualquer pessoa e dever para autoridades policiais e seus agentes."
  },
  {
    "topic": 9,
    "q": "Para configurar crime de abuso de autoridade, a Lei 13.869/2019 exige:",
    "opts": [
      "Apenas erro administrativo do agente, ainda que sem finalidade específica prevista na lei.",
      "Finalidade específica prevista na lei, como prejudicar alguém ou agir por mero capricho.",
      "Dolo genérico ou culpa do agente, somados a dano patrimonial comprovado à vítima.",
      "Que o agente seja exclusivamente policial civil e aja por mero capricho pessoal."
    ],
    "a": 1,
    "why": "O art. 1º, § 1º, exige finalidade específica; mera divergência interpretativa não basta."
  },
  {
    "topic": 9,
    "q": "A divergência na interpretação de lei ou na avaliação de fatos e provas:",
    "opts": [
      "Configura sempre abuso de autoridade.",
      "Configura abuso quando houver reclamação do cidadão.",
      "Não configura abuso por si só.",
      "É irrelevante apenas se houver ordem judicial."
    ],
    "a": 2,
    "why": "A Lei 13.869/2019, art. 1º, § 2º, afasta a configuração automática por divergência interpretativa."
  },
  {
    "topic": 10,
    "q": "No uso diferenciado da força, a decisão operacional deve observar principalmente:",
    "opts": [
      "Legalidade, necessidade e proporcionalidade, entre outros princípios.",
      "A conveniência pessoal do agente, a legalidade e a pronta punição do suspeito.",
      "Legalidade e força máxima disponível em qualquer resistência, entre outros critérios.",
      "Hierarquia, disciplina e punição imediata do suspeito, entre outros princípios."
    ],
    "a": 0,
    "why": "O material reúne legalidade, necessidade, proporcionalidade, razoabilidade e precaução."
  },
  {
    "topic": 10,
    "q": "Uma pessoa desarmada foge sem ameaçar terceiros. A apostila chama atenção para a seguinte pegadinha:",
    "opts": [
      "A fuga, isoladamente, autoriza disparo de arma de fogo.",
      "A fuga desarmada não autoriza automaticamente o uso de arma de fogo.",
      "A arma de fogo deve ser usada para impedir qualquer evasão.",
      "A proporcionalidade não se aplica à fuga."
    ],
    "a": 1,
    "why": "O material destaca que fuga desarmada, por si só, não justifica disparo."
  },
  {
    "topic": 11,
    "q": "O patrulhamento preventivo tem como finalidade predominante:",
    "opts": [
      "Reagir apenas depois da consumação do crime, investigando sua autoria e materialidade.",
      "Prevenir ocorrências e proteger pessoas, bens, serviços e instalações.",
      "Substituir o atendimento de emergência e as polícias estaduais em todo o Município.",
      "Realizar investigação criminal em apoio à polícia judiciária, sem limites territoriais."
    ],
    "a": 1,
    "why": "O foco é prevenção, proteção municipal e presença ostensiva dentro das competências legais."
  },
  {
    "topic": 12,
    "q": "Ao chegar a uma ocorrência com risco ainda presente, a prioridade inicial é:",
    "opts": [
      "Preencher o relatório antes de agir.",
      "Preservar a vida e controlar riscos, solicitando apoio adequado.",
      "Permitir a circulação de curiosos para identificar testemunhas.",
      "Remover objetos do local para liberar a via, sem avaliação."
    ],
    "a": 1,
    "why": "A apostila coloca a preservação da vida como prioridade, seguida de segurança, isolamento e preservação do local."
  },
  {
    "topic": 12,
    "q": "O uso de algemas, conforme a Súmula Vinculante 11, exige:",
    "opts": [
      "Autorização verbal de qualquer superior, por resistência, fundado receio de fuga ou perigo, sem registro por escrito.",
      "Justificativa por resistência, fundado receio de fuga ou perigo à integridade física, com justificativa por escrito.",
      "Apenas a gravidade abstrata do crime, por resistência ou receio de fuga, com justificativa verbal ao delegado.",
      "Uso obrigatório em toda prisão, salvo resistência, fuga ou perigo à integridade física, com justificativa por escrito."
    ],
    "a": 1,
    "why": "A SV 11 limita o uso e exige justificativa escrita nas hipóteses previstas."
  },
  {
    "topic": 13,
    "q": "No atendimento humanizado, a conduta mais adequada é:",
    "opts": [
      "Repetir várias vezes o relato traumático, para confirmar os detalhes e registrar a dignidade da vítima.",
      "Evitar discriminação e revitimização, respeitando a dignidade e encaminhando adequadamente.",
      "Condicionar o atendimento à presença de familiar, respeitando a dignidade e encaminhando adequadamente.",
      "Divulgar a ocorrência para alertar a comunidade, evitando discriminação e encaminhando adequadamente."
    ],
    "a": 1,
    "why": "O material destaca respeito aos direitos humanos, não discriminação e prevenção da revitimização."
  },
  {
    "topic": 14,
    "q": "Um relatório operacional tecnicamente adequado deve:",
    "opts": [
      "Misturar fatos, impressões e conclusões, descrevendo sem distinção as providências.",
      "Ser objetivo, claro e cronológico, descrevendo fatos e providências.",
      "Ser objetivo e claro, omitindo horários para preservar a equipe e as providências.",
      "Usar adjetivos para caracterizar suspeitos, em ordem de gravidade dos fatos."
    ],
    "a": 1,
    "why": "A apostila recomenda registro objetivo e cronológico, sem opiniões pessoais."
  },
  {
    "topic": 15,
    "q": "Um superior determina o cumprimento de ordem manifestamente ilegal. À luz da conduta funcional estudada:",
    "opts": [
      "A hierarquia obriga o cumprimento em qualquer hipótese, respondendo apenas o superior hierárquico.",
      "A ordem deve ser cumprida e questionada depois, pelos canais adequados, ao Comando ou à Corregedoria.",
      "A hierarquia não afasta a legalidade; ordem manifestamente ilegal não deve ser cumprida.",
      "A ordem de superior transforma automaticamente a conduta em lícita, afastando a responsabilidade do guarda."
    ],
    "a": 2,
    "why": "Hierarquia e disciplina não autorizam descumprimento da lei nem execução de ordem manifestamente ilegal."
  }
];
