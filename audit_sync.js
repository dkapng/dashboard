
const fs = require('fs');
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_IDS = {
    CLIENTES: 'b835b202-4fdb-4266-8f23-470acbc60a2c',
    AGENDA: '4c1337aa-c132-47d2-a165-65ba2147f964'
};
const TARGET_MONTH = { start: '2026-04-01', end: '2026-04-30' };
const BACKLOG_START = '2026-01-01';

async function notionFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`https://api.notion.com/v1${endpoint}`, options);
    return await response.json();
}

async function audit() {
    console.log("=== AUDITORIA DE SINCRONIZAÇÃO VENTANA ===");
    
    // 1. Carrega Clientes
    const clientData = await notionFetch(`/databases/${DATABASE_IDS.CLIENTES}/query`, 'POST', {});
    const clientIdMap = {};
    console.log(`- Clientes carregados da API: ${clientData.results.length}`);
    clientData.results.forEach(p => {
        const name = p.properties.Nome?.title[0]?.plain_text || "Sem Nome";
        clientIdMap[p.id] = name;
    });

    // 2. Busca Agenda com Filtros Atuais
    console.log(`- Buscando Agenda (Filtro: ${BACKLOG_START} até ${TARGET_MONTH.end})...`);
    const agendaData = await notionFetch(`/databases/${DATABASE_IDS.AGENDA}/query`, 'POST', {
        filter: {
            and: [
                { property: 'Data', date: { on_or_after: BACKLOG_START } },
                { property: 'Data', date: { on_or_before: TARGET_MONTH.end } }
            ]
        }
    });

    if (!agendaData.results) {
        console.error("ERRO: Resposta da Agenda inválida ou vazia.", agendaData);
        return;
    }

    console.log(`- Itens encontrados na Agenda (Bruto): ${agendaData.results.length}`);
    
    let stats = { skipped_client: 0, skipped_agenda_type: 0, skipped_finished: 0, SUCCESS: 0 };
    let successItems = [];
    let skippedAgendaDetails = [];

    agendaData.results.forEach((page, index) => {
        const title = page.properties.Nome.title[0]?.plain_text || 'Sem título';
        const categorias = page.properties['Categoria']?.multi_select?.map(c => c.name) || [];
        const gestContStatus = (page.properties['Gestão e conteúdo']?.status?.name || '').toLowerCase();
        const clientRelArray = page.properties['Cliente(s)']?.relation || page.properties['Cliente']?.relation;

        const isAgendaType = categorias.includes('Produção') || categorias.includes('Reunião') || categorias.includes('Reuniao') || categorias.includes('Evento');
        
        if (isAgendaType) {
            skippedAgendaDetails.push({ title, categorias });
            stats.skipped_agenda_type++;
            return;
        }
        
        // ... resta da lógica ...
        if (!clientRelArray || clientRelArray.length === 0) { stats.skipped_client++; return; }
        const clientName = clientIdMap[clientRelArray[0].id];
        if (!clientName) { stats.skipped_client++; return; }
        
        const isFinished = gestContStatus.includes('finalizado') || gestContStatus.includes('concluído') || gestContStatus.includes('pronto') || gestContStatus.includes('não é tarefa') || gestContStatus.includes('perdida') || gestContStatus.includes('arquivada');
        if (isFinished) { stats.skipped_finished++; return; }

        stats.SUCCESS++;
        successItems.push({ title, client: clientName, status: gestContStatus });
    });

    console.log("\n=== DETALHE DOS ITENS PULADOS (POR SEREM PRODUÇÃO/REUNIÃO/EVENTO) ===");
    console.log(JSON.stringify(skippedAgendaDetails.slice(0, 20), null, 2));

    console.log("\n=== RESUMO DO AUDIT ===");
    console.log(JSON.stringify(stats, null, 2));
    
    if (successItems.length > 0) {
        console.log("\n=== EXEMPLOS DE SUCESSO ===");
        console.log(successItems.slice(0, 5));
    }
}

audit();
