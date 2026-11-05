# Lembrete diário por notificação (Web Push + Supabase)

O app pede permissão, guarda a inscrição do navegador no Supabase e, de hora em hora, uma função
verifica quem escolheu aquele horário. A notificação só sai se a pessoa ainda não estudou no dia,
com uma frase escolhida conforme a situação:

- sequência de dias em risco ("Sua sequência de 9 dias acaba hoje");
- dias sem estudar ("Faz 4 dias que você não estuda");
- marcos da prova (100, 60, 30, 15, 7 e 1 dia);
- ponto fraco ("Seu ponto fraco é Matemática");
- dias até a prova ou uma de 20 frases de incentivo, que mudam a cada dia.

Não há login nem dado pessoal: só a inscrição do navegador, o concurso, o horário, o fuso, a data da
prova, o último dia estudado, a sequência e o ponto fraco.

**Onde funciona:** Android (Chrome, Edge, Samsung Internet) e computador. **No iPhone**, só com o app
instalado na tela inicial e iOS 16.4 ou mais novo; o app avisa isso na tela de ajustes.

Enquanto `push-config.js` estiver vazio, a opção não aparece no app.

## Configuração (uma vez, cerca de 20 minutos)

Você vai precisar de uma conta gratuita no Supabase e do Node instalado no computador.

### 1. Criar o projeto
Em supabase.com, crie um projeto (região **South America (São Paulo)**). Anote a **referência do
projeto** (o código em `https://SEU_PROJETO.supabase.co`).

### 2. Gerar as chaves VAPID
No terminal:
```
npx web-push generate-vapid-keys
```
Guarde a **Public Key** e a **Private Key**. A privada nunca vai para o GitHub.

### 3. Criar a tabela
No painel do Supabase, abra **SQL Editor**, cole o conteúdo de
`supabase/migrations/20261105000000_push_subscriptions.sql` e rode.

### 4. Publicar as funções
Na pasta do projeto:
```
npx supabase login
npx supabase link --project-ref SEU_PROJETO
npx supabase secrets set VAPID_PUBLIC_KEY="..." VAPID_PRIVATE_KEY="..." VAPID_SUBJECT="mailto:seu-email@exemplo.com" CRON_SECRET="uma-senha-longa-qualquer" ALLOWED_ORIGINS="https://nelsonmatheus.github.io"
npx supabase functions deploy push-subscribe --no-verify-jwt
npx supabase functions deploy push-send --no-verify-jwt
```

### 5. Agendar o disparo
No **SQL Editor**, cole `supabase/cron.sql`, troque `SEU_PROJETO` e `SEU_SEGREDO` (o mesmo
`CRON_SECRET`) e rode. Isso chama a função `push-send` no minuto 0 de cada hora.

### 6. Ligar no app
Em `push-config.js`, preencha:
```js
endpoint: "https://SEU_PROJETO.supabase.co/functions/v1/push-subscribe",
vapidPublicKey: "a Public Key do passo 2"
```
Suba a versão de `CACHE` em `sw.js`, faça commit e push.

### 7. Testar
1. Abra o app publicado, vá em **Progresso › Ajustes › Lembrete diário** e toque em **Ativar**.
2. **Testar aviso** mostra uma notificação local, para conferir se o aparelho exibe avisos.
3. Para testar o envio pelo servidor na hora, sem esperar o horário:
   ```
   curl -X POST https://SEU_PROJETO.supabase.co/functions/v1/push-send -H "x-cron-secret: SEU_SEGREDO" -H "Content-Type: application/json" -d '{"teste": true}'
   ```
   A resposta mostra quantos avisos foram enviados.

## Arquivos

| Arquivo | Papel |
|---|---|
| `push-config.js` | Endereço da função e chave pública (no app) |
| `push.js` | Permissão, inscrição, troca de horário e sincronização do resumo (no app) |
| `sw.js` | Mostra a notificação e abre o app ao tocar |
| `supabase/functions/push-subscribe` | Recebe, atualiza e apaga inscrições; valida origem e endpoint |
| `supabase/functions/push-send` | Escolhe quem recebe e envia; apaga inscrições vencidas |
| `supabase/functions/push-send/messages.js` | Regras do horário e textos das mensagens |
| `supabase/migrations/…sql` | Tabela `push_subscriptions` com RLS ligada (só as funções acessam) |
| `supabase/cron.sql` | Agendamento de hora em hora |

## Custos
O plano gratuito do Supabase atende com folga um app pessoal (uma chamada por hora e poucas
inscrições). O serviço de push dos navegadores (Google, Apple, Microsoft, Mozilla) é gratuito.
