
const fs = require('fs');
const path = require('path');

// ======================
// CONFIGURATION
// ======================
// NOTA: No GitHub, o token será lido dos "Secrets". Localmente, ele usa o valor abaixo.
const NOTION_TOKEN = process.env.NOTION_TOKEN; // Use Secrets no GitHub ou defina localmente
const DATABASE_IDS = {
    CLIENTES: 'b835b202-4fdb-4266-8f23-470acbc60a2c',
    EDITORIAL: '9c0408a8-2d22-4919-a3e1-2f7b4fd1b1b9',
    AGENDA: '4c1337aa-c132-47d2-a165-65ba2147f964',
    ENTREGAS: 'd3e985a8-39f7-4a8c-82d8-64e8390804c8',
    SEASONAL: '5c29d923-b4ca-4b94-b5ae-c5daf6a8c4da'
};

// Metas de entrega por padrão e específicas
const DEFAULT_TARGETS = { designs: 12, videos: 4, stories: 4 };
const CLIENT_SPECIFIC_TARGETS = {
    'Jota Diesel': { designs: 8, videos: 4, stories: 4 }
};

// Cálculo Automático do Mês Vigente
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const TARGET_MONTH = { start: firstDay, end: lastDay };
const BACKLOG_START = '2026-01-01'; // Fixo para não perder tarefas pendentes históricas

// ======================
// NOTION API HELPERS
// ======================
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
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Notion API Error: ${data.message || response.statusText}`);
    }
    return data;
}

async function queryDatabase(databaseId, filter = null) {
    let results = [];
    let hasMore = true;
    let nextCursor = null;

    while (hasMore) {
        const body = { page_size: 100 };
        if (filter) body.filter = filter;
        if (nextCursor) body.start_cursor = nextCursor;

        const data = await notionFetch(`/databases/${databaseId}/query`, 'POST', body);
        results = results.concat(data.results);
        if (data.results.length > 0) console.log(`   (Carregados ${results.length} itens...)`);
        hasMore = data.has_more;
        nextCursor = data.next_cursor;
    }
    return results;
}

// ======================
// DATA PROCESSING
// ======================
async function sync() {
    console.log(`🚀 Sincronizando com reconhecimento flexível de status...`);

    try {
        // 1. Fetch Clientes
        console.log('--- Buscando Clientes...');
        const clientResults = await queryDatabase(DATABASE_IDS.CLIENTES);

        const GESTORAS = {};
        const NICHES = {};
        const clientIdMap = {};

        clientResults.forEach(page => {
            const name = page.properties.Nome.title[0]?.plain_text;
            const situacaoObj = page.properties['Situação']?.select || page.properties['Situação']?.status;
            const situacao = situacaoObj?.name || '';

            if (!name || situacao.includes('Arquivado') || situacao.includes('Pausado')) return;

            clientIdMap[page.id] = name;

            const gestora = page.properties['Gestor de conta']?.people[0]?.name || 'Sem Gestora';
            if (!GESTORAS[gestora]) GESTORAS[gestora] = [];
            GESTORAS[gestora].push(name);

            // Tenta pegar Nicho ou Segmento, senão Geral
            const nicho = page.properties['Nicho']?.select?.name || page.properties['Segmento']?.select?.name || 'Geral';
            NICHES[name] = nicho;
        });

        // 2. Fetch Linha Editorial
        console.log('--- Buscando Linha Editorial...');
        const editorialResults = await queryDatabase(DATABASE_IDS.EDITORIAL, {
            and: [
                { property: 'Agendamento', date: { on_or_after: TARGET_MONTH.start } },
                { property: 'Agendamento', date: { on_or_before: TARGET_MONTH.end } }
            ]
        });

        const FEED_DATA = {};
        const VIDEO_DATA = {};
        const STORIES_DATA = {};
        const LINHA_FEED_ITEMS = {};
        const LINHA_VIDEO_ITEMS = {};
        const LINHA_STORIES_ITEMS = {};
        const FORMAT_COUNTS = {};
        const LEGENDAS_DATA = {};
        const DATA_ALERTS = []; // Para auditoria de erros

        Object.values(clientIdMap).forEach(name => {
            const init = () => ({ total: 0, pronto: 0, postado: 0, agendado: 0, agendado_coord: 0, a_agendar: 0 });
            FEED_DATA[name] = init();
            VIDEO_DATA[name] = init();
            STORIES_DATA[name] = init();
            LINHA_FEED_ITEMS[name] = [];
            LINHA_VIDEO_ITEMS[name] = [];
            LINHA_STORIES_ITEMS[name] = [];
            FORMAT_COUNTS[name] = { post: 0, carrossel: 0, foto: 0, video: 0, story: 0 };
            LEGENDAS_DATA[name] = { prontas: 0, total: 0 };
        });

        editorialResults.forEach(page => {
            const clientRelArray = page.properties['Cliente(s)']?.relation || page.properties['Cliente']?.relation;
            if (!clientRelArray || clientRelArray.length === 0) return;

            // Auditoria: Detectar posts com múltiplos clientes
            if (clientRelArray.length > 1) {
                const multiClients = clientRelArray.map(r => clientIdMap[r.id] || 'Desconhecido').join(', ');
                DATA_ALERTS.push({
                    title: page.properties['Título']?.title[0]?.plain_text || 'Sem título',
                    error: `Post atribuído a múltiplos clientes (${multiClients})`,
                    notionUrl: page.url
                });
            }

            const clientName = clientIdMap[clientRelArray[0].id];
            if (!clientName || !FEED_DATA[clientName]) return;

            const title = page.properties['Título']?.title[0]?.plain_text || 'Sem título';
            const formato = page.properties['Formato']?.select?.name || '';
            const fmtLower = formato.toLowerCase();

            const isVideo = fmtLower.includes('vídeo') || fmtLower.includes('video') || fmtLower.includes('reels') || fmtLower.includes('edição');
            const isStory = fmtLower.includes('story');
            const isDesign = !isVideo && formato !== '';

            const allStatuses = [
                page.properties['Conteúdo']?.status?.name,
                page.properties['Design']?.status?.name,
                page.properties['Vídeo']?.status?.name,
                page.properties['Situação']?.status?.name
            ].filter(Boolean);

            const statusStr = allStatuses.join(' ').toLowerCase();

            // Padrões de "Concluído" — Ignorando números iniciais
            const isDone = allStatuses.some(s => {
                const sl = (s || '').toLowerCase();
                return sl.includes('agendado') || sl.includes('postado')
                    || sl.includes('perdido') || sl.includes('arquivado') || sl.includes('na gaveta')
                    || sl.includes('concluíd');
            });

            let dashboardStatus = 'a_agendar';
            const rawSit = (page.properties['Situação']?.status?.name || '').toLowerCase();

            if (rawSit.includes('perdido') || rawSit.includes('arquivado') || rawSit.includes('na gaveta')) {
                dashboardStatus = 'st-paused';
            } else if (rawSit.includes('postado')) {
                dashboardStatus = 'postado';
            } else if (statusStr.includes('aprovação') || statusStr.includes('aprovacao') || statusStr.includes('(coord.)')) {
                dashboardStatus = 'agendado_coord';
            } else if (statusStr.includes('agendado')) {
                dashboardStatus = 'agendado';
            }

            const rawAgend = page.properties['Agendamento']?.date?.start;
            let agendDate = '--/--';
            if (rawAgend) {
                const parts = rawAgend.split('-');
                if (parts.length >= 3) {
                    agendDate = `${parts[2].substring(0, 2)}/${parts[1]}`;
                }
            }

            // Metadados Brutos
            const rawDesign = page.properties['Design']?.status?.name || '';
            const rawLegenda = page.properties['Conteúdo']?.status?.name || '';
            const rawVideo = page.properties['Vídeo']?.status?.name || '';

            const checkDesign = s => s.toLowerCase().includes('exportado');
            const checkLegenda = s => {
                const sl = s.toLowerCase();
                return sl.includes('escrito') || sl.includes('aprovação') || sl.includes('aprovacao');
            };
            const checkVideo = s => s.toLowerCase().includes('finalizado');

            // Auditoria com Fallback Global
            const isDesignPronto = isDesign && (checkDesign(rawDesign) || isDone);
            const isVideoPronto = isVideo && (checkVideo(rawVideo) || isDone);
            const isStoryPronto = isStory && (checkDesign(rawDesign) || isDone);

            const missing = [];
            // Alertas Gated by isDone
            if (!isDone) {
                if (isDesign || isStory) {
                    if (rawDesign && !checkDesign(rawDesign)) missing.push('Design');
                    if (rawLegenda && !checkLegenda(rawLegenda) && !isStory) missing.push('Legenda');
                }
                if (isVideo) {
                    if (rawVideo && !checkVideo(rawVideo)) missing.push('Vídeo');
                    if (rawLegenda && !checkLegenda(rawLegenda)) missing.push('Legenda');
                }
            }

            // Donut de Legendas
            if (!isStory) {
                const legendaStatus = page.properties['Conteúdo']?.status?.name || '';
                if (legendaStatus && !legendaStatus.toLowerCase().includes('n/a')) {
                    LEGENDAS_DATA[clientName].total++;
                    if (checkLegenda(legendaStatus) || isDone) {
                        LEGENDAS_DATA[clientName].prontas++;
                    }
                }
            }

            const item = { title, status: dashboardStatus, formato, date: agendDate, missing, rawDesign, rawLegenda, rawVideo, notionUrl: page.url };

            if (isStory) {
                STORIES_DATA[clientName].total++;
                if (isStoryPronto) STORIES_DATA[clientName].pronto++;
                STORIES_DATA[clientName][dashboardStatus]++;
                FORMAT_COUNTS[clientName].story++;
                LINHA_STORIES_ITEMS[clientName].push(item);
            } else if (isVideo) {
                const vidLower = rawVideo.toLowerCase();
                if (rawVideo !== '' && !vidLower.includes('n/a')) {
                    VIDEO_DATA[clientName].total++;
                    if (checkVideo(rawVideo) || isDone) VIDEO_DATA[clientName].pronto++;
                }
                VIDEO_DATA[clientName][dashboardStatus]++;
                LINHA_VIDEO_ITEMS[clientName].push(item);
                FORMAT_COUNTS[clientName].video++;
            } else if (isDesign) {
                FEED_DATA[clientName].total++;
                if (isDesignPronto) FEED_DATA[clientName].pronto++;
                FEED_DATA[clientName][dashboardStatus]++;
                LINHA_FEED_ITEMS[clientName].push(item);
                if (fmtLower.includes('carrossel')) FORMAT_COUNTS[clientName].carrossel++;
                else if (fmtLower.includes('foto')) FORMAT_COUNTS[clientName].foto++;
                else FORMAT_COUNTS[clientName].post++;
            }
        });

        // Agenda
        console.log('--- Buscando Agenda...');
        const agendaResults = await queryDatabase(DATABASE_IDS.AGENDA, {
            and: [
                { property: 'Data', date: { on_or_after: BACKLOG_START } },
                { property: 'Data', date: { on_or_before: TARGET_MONTH.end } }
            ]
        });

        const CAPTACAO_DATA = {};
        const AGENDA_COUNTS = {};
        Object.values(clientIdMap).forEach(name => {
            AGENDA_COUNTS[name] = { reuniao: 0, producao: 0, evento: 0 };
        });

        agendaResults.forEach(page => {
            const clientRelArray = page.properties['Cliente(s)']?.relation || page.properties['Cliente']?.relation;
            if (!clientRelArray || clientRelArray.length === 0) return;
            const clientName = clientIdMap[clientRelArray[0].id];
            if (!clientName) return;

            const dateStr = page.properties.Data.date?.start;
            const itemDate = dateStr ? new Date(dateStr) : null;
            const isThisMonth = itemDate && itemDate >= new Date(TARGET_MONTH.start) && itemDate <= new Date(TARGET_MONTH.end);

            const categorias = page.properties['Categoria']?.multi_select?.map(c => c.name) || [];
            const vidCapStatus = (page.properties['Vídeo e captação']?.status?.name || '').toLowerCase();

            if (isThisMonth) {
                if (categorias.includes('Produção')) {
                    let prodStatus = 'marcada';
                    if (vidCapStatus.includes('editado') || vidCapStatus.includes('entregue')) prodStatus = 'realizada';
                    else if (vidCapStatus.includes('confirmada')) prodStatus = 'confirmada';
                    else if (vidCapStatus.includes('cancelada')) prodStatus = 'cancelada';
                    const priority = { realizada: 4, confirmada: 3, marcada: 2, cancelada: 1 };
                    if (!CAPTACAO_DATA[clientName] || (priority[prodStatus] > priority[CAPTACAO_DATA[clientName]])) {
                        CAPTACAO_DATA[clientName] = prodStatus;
                    }
                    if (AGENDA_COUNTS[clientName]) AGENDA_COUNTS[clientName].producao++;
                }
                if (categorias.some(c => c.toLowerCase().includes('reunião') || c.toLowerCase().includes('reuniao'))) {
                    if (AGENDA_COUNTS[clientName]) AGENDA_COUNTS[clientName].reuniao++;
                }
                if (categorias.includes('Evento')) {
                    if (AGENDA_COUNTS[clientName]) AGENDA_COUNTS[clientName].evento++;
                }
            }
        });

        // Entregas
        console.log('--- Buscando Demandas Extras (Entregas)...');
        const entregasResults = await queryDatabase(DATABASE_IDS.ENTREGAS, {
            and: [
                { property: 'Prazo', date: { on_or_after: BACKLOG_START } },
                { property: 'Prazo', date: { on_or_before: TARGET_MONTH.end } }
            ]
        });
        const DEMANDAS_EXTRAS = {};

        entregasResults.forEach(page => {
            const clientRelArray = page.properties['Cliente']?.relation;
            if (!clientRelArray || clientRelArray.length === 0) return;
            const clientName = clientIdMap[clientRelArray[0].id];
            if (!clientName) return;

            const title = page.properties.Demanda.title[0]?.plain_text || 'Sem título';
            const dateStr = page.properties.Prazo.date?.start;
            const rawStatus = (page.properties['Situação']?.status?.name || 'A fazer');
            const sl = rawStatus.toLowerCase();

            const isFinished = sl.includes('finalizada') || sl.includes('concluí') || sl.includes('perdida') || sl.includes('arquivada') || sl.includes('postado');
            if (dateStr && new Date(dateStr) < new Date(TARGET_MONTH.start) && isFinished) return;

            if (!isFinished) {
                if (!DEMANDAS_EXTRAS[clientName]) DEMANDAS_EXTRAS[clientName] = [];
                DEMANDAS_EXTRAS[clientName].push({
                    title,
                    priority: (page.properties['Prioridade']?.select?.name || 'ppp').toLowerCase(),
                    rawStatus,
                    notionUrl: page.url,
                    gestora: 'Equipe',
                    date: dateStr ? `${dateStr.split('-')[2]}/${dateStr.split('-')[1]}` : '--/--'
                });
            }
        });

        // Sazonais
        console.log('--- Buscando Datas Sazonais...');
        const seasonalResults = await queryDatabase(DATABASE_IDS.SEASONAL);
        const SEASONAL_DATES = seasonalResults.map(page => {
            const p = page.properties;
            const dateStr = p.Data?.date?.start || p.Date?.date?.start || p.Agendamento?.date?.start;
            const label = p.Nome?.title[0]?.plain_text || p.Name?.title[0]?.plain_text || p.Evento?.title[0]?.plain_text;
            let niches = p.Niches?.multi_select?.map(n => n.name) || p.Nichos?.multi_select?.map(n => n.name) || ['Geral'];
            return (dateStr && label) ? { date: `new Date('${dateStr}')`, label, niches } : null;
        }).filter(Boolean);

        // Generate JSON
        const nowStr = new Date().toLocaleString('pt-BR');
        let content = `/** AUTO-GENERATED DATA FROM NOTION - ${nowStr} **/\n\n`;
        content += `const LAST_UPDATE = '${nowStr}';\n\n`;
        content += `const GESTORAS = ${JSON.stringify(GESTORAS, null, 2)};\n\n`;
        content += `const NICHES = ${JSON.stringify(NICHES, null, 2)};\n\n`;
        content += `const FEED_DATA = ${JSON.stringify(FEED_DATA, null, 2)};\n\n`;
        content += `const VIDEO_DATA = ${JSON.stringify(VIDEO_DATA, null, 2)};\n\n`;
        content += `const STORIES_DATA = ${JSON.stringify(STORIES_DATA, null, 2)};\n\n`;
        content += `const LINHA_FEED_ITEMS = ${JSON.stringify(LINHA_FEED_ITEMS, null, 2)};\n\n`;
        content += `const LINHA_VIDEO_ITEMS = ${JSON.stringify(LINHA_VIDEO_ITEMS, null, 2)};\n\n`;
        content += `const LINHA_STORIES_ITEMS = ${JSON.stringify(LINHA_STORIES_ITEMS, null, 2)};\n\n`;
        content += `const DEMANDAS_EXTRAS = ${JSON.stringify(DEMANDAS_EXTRAS, null, 2)};\n\n`;
        content += `const CAPTACAO_DATA = ${JSON.stringify(CAPTACAO_DATA, null, 2)};\n\n`;
        content += `const APRESENTACAO_DATA = {};\n\n`;
        content += `const LEGENDAS_DATA = ${JSON.stringify(LEGENDAS_DATA, null, 2)};\n\n`;
        content += `const FORMAT_COUNTS = ${JSON.stringify(FORMAT_COUNTS, null, 2)};\n\n`;
        content += `const AGENDA_COUNTS = ${JSON.stringify(AGENDA_COUNTS, null, 2)};\n\n`;
        content += `const DATA_ALERTS = ${JSON.stringify(DATA_ALERTS, null, 2)};\n\n`;
        content += `const SEASONAL_DATES = [\n`;
        SEASONAL_DATES.forEach(d => content += `  { date: ${d.date}, label: '${d.label}', niches: ${JSON.stringify(d.niches)} },\n`);
        content += `];\n\n`;
        content += `function getTargets(client) {\n  const specific = ${JSON.stringify(CLIENT_SPECIFIC_TARGETS)};\n  return specific[client] || ${JSON.stringify(DEFAULT_TARGETS)};\n}\n`;

        fs.writeFileSync(path.join(__dirname, 'notion-data.js'), content);
        console.log('✅ notion-data.js gerado com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a sincronização:', error.message);
    }
}

sync();
