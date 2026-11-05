/* Configuração das notificações (lembrete diário).
   Enquanto os dois campos estiverem vazios, o app esconde a opção de lembrete.
   Preencha depois de criar o backend no Supabase (veja supabase/LEIA-ME-NOTIFICACOES.md):
   - endpoint: URL da função push-subscribe, ex.: https://abcd1234.supabase.co/functions/v1/push-subscribe
   - vapidPublicKey: a chave PÚBLICA VAPID (a privada fica só nos segredos do Supabase). */
window.PUSH_CONFIG = {
  endpoint: "https://rueeyibvueukgsvfttmn.supabase.co/functions/v1/push-subscribe",
  vapidPublicKey: "BIMlivFPUSFT94dQNyMxB-1kbCZQMbXYpKzH6pRiwCHnXkvIGCODjmRgLRKE_a1XX2r-cI5wMfuU_O1cBV2Nscc"
};
