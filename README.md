# Ventana Dashboard Operacional

Painel operacional sincronizado automaticamente com o Notion.

## Como terminar a configuração (GitHub)

Siga estes passos após fazer o upload deste projeto para o seu repositório:

### 1. Configurar o Token do Notion
Para que a atualização automática funcione, o GitHub precisa do seu token:
1.  Vá em **Settings** (Configurações) do seu repositório no GitHub.
2.  No menu lateral, clique em **Secrets and variables** > **Actions**.
3.  Clique em **New repository secret**.
4.  Nome: `NOTION_TOKEN`
5.  Valor: Cole o seu token do Notion (aquele que começa com `ntn_`).
6.  Clique em **Add secret**.

### 2. Ativar o Site (GitHub Pages)
1.  Vá em **Settings** > **Pages**.
2.  Em **Build and deployment** > **Branch**, selecione `main` (ou `master`) e a pasta `/(root)`.
3.  Clique em **Save**.
4.  Aguarde alguns minutos e o link do seu dashboard aparecerá no topo dessa página.

### 3. Sincronização Automática
*   Os dados são atualizados automaticamente a cada 6 horas.
*   Se quiser forçar uma atualização manual: Vá na aba **Actions** > selecione **Sync Notion Data** > clique em **Run workflow**.

---
*Desenvolvido para Ventana Comunicação*
