/**
 * TABELA DE PREÇOS OFICIAIS
 */
const DATA = {
    desconto_maximo: {
        luz: { "1.15": 0.1825, "2.3": 0.2054, "3.45": 0.2140, "4.6": 0.3148, "5.75": 0.4125, "6.9": 0.4119, "10.35": 0.5645, "13.8": 0.7083, "17.25": 0.9808, "20.7": 1.2680, energia: 0.1397 },
        gas: { "1": 0.1237, "2": 0.1628, "3": 0.3146, "4": 0.6819, energia: [0, 0.0973, 0.0956, 0.0947, 0.0930] }
    },
    gold: {
        luz: { "1.15": 0.2238, "2.3": 0.2394, "3.45": 0.2605, "4.6": 0.3828, "5.75": 0.4442, "6.9": 0.4949, "10.35": 0.6714, "13.8": 0.9078, "17.25": 1.2044, "20.7": 1.5536, energia: 0.1599 },
        gas: { "1": 0.0262, "2": 0.0573, "3": 0.0536, "4": 0.0454, energia: [0, 0.1270, 0.1146, 0.1116, 0.1054] }
    }
};

function calcularSimulacao() {
    const tipo = document.getElementById('tipo_contrato').value;
    const pot = document.getElementById('potencia_luz').value;
    const esc = parseInt(document.getElementById('escalao_gas').value);

    // Inputs Cliente - Captura bruta
    const raw_l_c = parseFloat(document.getElementById('in_luz_c').value) || 0;
    const raw_l_e = parseFloat(document.getElementById('in_luz_e').value) || 0;
    const raw_l_f = parseFloat(document.getElementById('in_luz_f').value) || 0;
    const raw_g_c = parseFloat(document.getElementById('in_gas_c').value) || 0;
    const raw_g_e = parseFloat(document.getElementById('in_gas_e').value) || 0;
    const raw_g_f = parseFloat(document.getElementById('in_gas_f').value) || 0;

    // LÓGICA DE FILTRAGEM: Zerar os valores que não pertencem ao contrato selecionado
    const inputs = {
        l_c: (tipo === 'dual' || tipo === 'luz') ? raw_l_c : 0,
        l_e: (tipo === 'dual' || tipo === 'luz') ? raw_l_e : 0,
        l_f: (tipo === 'dual' || tipo === 'luz') ? raw_l_f : 0,
        g_c: (tipo === 'dual' || tipo === 'gas') ? raw_g_c : 0,
        g_e: (tipo === 'dual' || tipo === 'gas') ? raw_g_e : 0,
        g_f: (tipo === 'dual' || tipo === 'gas') ? raw_g_f : 0
    };

    // Cálculos Planos Gold Energy
    const calcPlano = (tarifarioKey) => {
        const p = DATA[tarifarioKey];
        const res = {
            l_f: (tipo === 'dual' || tipo === 'luz') ? p.luz[pot] * 30 : 0,
            l_e: (tipo === 'dual' || tipo === 'luz') ? inputs.l_c * p.luz.energia : 0,
            g_f: (tipo === 'dual' || tipo === 'gas') ? p.gas[esc] * 30 : 0,
            g_e: (tipo === 'dual' || tipo === 'gas') ? inputs.g_c * p.gas.energia[esc] : 0
        };

        // Regra de Isenção Gold Dual
        if (tarifarioKey === 'gold' && tipo === 'dual') {
            res.g_f = 0;
        }

        res.total = res.l_f + res.l_e + res.g_f + res.g_e;
        return res;
    };

    const atual = {
        l_f: inputs.l_f * 30, 
        l_e: inputs.l_c * inputs.l_e,
        g_f: inputs.g_f * 30, 
        g_e: inputs.g_c * inputs.g_e,
        total: (inputs.l_f * 30) + (inputs.l_c * inputs.l_e) + (inputs.g_f * 30) + (inputs.g_c * inputs.g_e)
    };

    const d_max = calcPlano('desconto_maximo');
    const gold = calcPlano('gold');

    renderizar(atual, d_max, gold, tipo);
}

function renderizar(at, max, gold, tipo) {
    document.getElementById('welcome_view').classList.add('hidden');
    document.getElementById('result_view').classList.remove('hidden');

    // 1. Lógica de Recomendação
    const melhorObj = (max.total <= gold.total) ? 
        { nome: "Desconto Máximo", total: max.total, cor: "bg-orange-600", dados: max } : 
        { nome: "Plano Gold", total: gold.total, cor: "bg-blue-600", dados: gold };

    // Update Cards
    document.getElementById('res_tot_atual').innerText = at.total.toFixed(2) + "€";
    document.getElementById('val_recomendado').innerText = melhorObj.total.toFixed(2) + "€";
    document.getElementById('nome_recomendado').innerText = `Melhor Opção: ${melhorObj.nome}`;
    document.getElementById('card_recomendado').className = `p-6 rounded-3xl shadow-xl card-highlight text-white ${melhorObj.cor}`;

    const poupancaMensal = at.total - melhorObj.total;
    document.getElementById('res_poup_anual').innerText = (poupancaMensal * 12).toFixed(2) + "€";
    document.getElementById('res_poup_mensal').innerText = `Poupança de ${poupancaMensal.toFixed(2)}€ / mês`;

    // 2. Tabela com Coluna de Diferença
    document.getElementById('header_row').innerHTML = `
        <th class="p-5">Componente</th>
        <th class="p-5">O Seu Atual</th>
        <th class="p-5 text-orange-600">Desconto Máximo</th>
        <th class="p-5 text-blue-600">Plano Gold</th>
        <th class="p-5 text-gray-500">Diferença (Ideal)</th>
    `;

    // Mapeamento das linhas comparando sempre com o "melhorObj.dados"
    let rows = [
        { label: "Luz: Termo Fixo", vals: [at.l_f, max.l_f, gold.l_f], ideal: melhorObj.dados.l_f, atual: at.l_f, cat: 'luz' },
        { label: "Luz: Consumo", vals: [at.l_e, max.l_e, gold.l_e], ideal: melhorObj.dados.l_e, atual: at.l_e, cat: 'luz' },
        { label: "Gás: Termo Fixo", vals: [at.g_f, max.g_f, gold.g_f], ideal: melhorObj.dados.g_f, atual: at.g_f, cat: 'gas' },
        { label: "Gás: Consumo", vals: [at.g_e, max.g_e, gold.g_e], ideal: melhorObj.dados.g_e, atual: at.g_e, cat: 'gas' }
    ].filter(row => tipo === 'dual' || row.cat === tipo);

    document.getElementById('table_body').innerHTML = rows.map(r => {
        const diff = r.ideal - r.atual;
        const diffClass = diff <= 0 ? "text-green-600" : "text-red-600";
        const diffIcon = diff <= 0 ? "↓" : "↑";

        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">${r.label}</td>
            <td class="p-5 font-bold text-gray-700">${r.vals[0].toFixed(2)}€</td>
            <td class="p-5 font-bold text-orange-600">${r.vals[1].toFixed(2)}€</td>
            <td class="p-5 font-bold ${r.vals[2] === 0 && r.cat === 'gas' ? 'text-green-600 animate-pulse' : 'text-blue-600'}">
                ${(r.vals[2] === 0 && r.cat === 'gas' && tipo === 'dual') ? 'GRÁTIS' : r.vals[2].toFixed(2) + '€'}
            </td>
            <td class="p-5 font-black ${diffClass} bg-gray-50/50">
                ${diffIcon} ${Math.abs(diff).toFixed(2)}€
            </td>
        </tr>`;
    }).join('') + `
        <tr class="bg-gray-100 font-black text-lg">
            <td class="p-5 text-gray-600">TOTAL MENSAL</td>
            <td class="p-5 text-gray-700">${at.total.toFixed(2)}€</td>
            <td class="p-5 text-orange-600">${max.total.toFixed(2)}€</td>
            <td class="p-5 text-blue-600">${gold.total.toFixed(2)}€</td>
            <td class="p-5 ${poupancaMensal >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-200/50">
                ${poupancaMensal >= 0 ? '↓' : '↑'} ${Math.abs(poupancaMensal).toFixed(2)}€
            </td>
        </tr>
    `;
}