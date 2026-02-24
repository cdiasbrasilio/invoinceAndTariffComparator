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

window.calcularSimulacao = function() {
    console.log("Botão clicado, a calcular...");
    const tipo = document.getElementById('tipo_contrato').value;
    const pot = document.getElementById('potencia_luz').value;
    const esc = parseInt(document.getElementById('escalao_gas').value);
    const raw = (id) => parseFloat(document.getElementById(id).value) || 0;
    
    const inputs = {
        l_c: (tipo !== 'gas') ? raw('in_luz_c') : 0,
        l_e: (tipo !== 'gas') ? raw('in_luz_e') : 0,
        l_f: (tipo !== 'gas') ? raw('in_luz_f') : 0,
        g_c: (tipo !== 'luz') ? raw('in_gas_c') : 0,
        g_e: (tipo !== 'luz') ? raw('in_gas_e') : 0,
        g_f: (tipo !== 'luz') ? raw('in_gas_f') : 0
    };

    const calcBase = (key) => {
        const p = DATA[key];
        const res = {
            l_f: (tipo !== 'gas') ? p.luz[pot] * 30 : 0,
            l_e: (tipo !== 'gas') ? inputs.l_c * p.luz.energia : 0,
            g_f: (tipo !== 'luz') ? p.gas[esc] * 30 : 0,
            g_e: (tipo !== 'luz') ? inputs.g_c * p.gas.energia[esc] : 0
        };
        if (key === 'gold' && tipo === 'dual') res.g_f = 0;
        return res;
    };

    renderizar(
        { l_f: inputs.l_f * 30, l_e: inputs.l_c * inputs.l_e, g_f: inputs.g_f * 30, g_e: inputs.g_c * inputs.g_e },
        calcBase('desconto_maximo'),
        calcBase('gold'),
        tipo,
        inputs
    );
};

function calcularDetalhamentoIVA(comp, consLuz, consGas) {
    const TAXAS_FIXAS = 2.85 + 0.07; 
    const IEC = (consLuz + consGas) * 0.001;
    const pLuz = comp.l_e / (consLuz || 1);
    const pGas = comp.g_e / (consGas || 1);
    
    const iva6 = ((Math.min(consLuz, 100) * pLuz) + (Math.min(consGas, 40) * pGas)) * 0.06;
    const base23 = (Math.max(0, consLuz - 100) * pLuz) + (Math.max(0, consGas - 40) * pGas) + comp.l_f + comp.g_f + TAXAS_FIXAS + IEC;
    const iva23 = base23 * 0.23;

    return { iva6, iva23, taxas: TAXAS_FIXAS + IEC, total: comp.l_f + comp.l_e + comp.g_f + comp.g_e + TAXAS_FIXAS + IEC + iva6 + iva23 };
}

function renderizar(at, max, gold, tipo, inputs) {
    document.getElementById('welcome_view').classList.add('hidden');
    document.getElementById('result_view').classList.remove('hidden');

    const f_at = calcularDetalhamentoIVA(at, inputs.l_c, inputs.g_c);
    const f_max = calcularDetalhamentoIVA(max, inputs.l_c, inputs.g_c);
    const f_gold = calcularDetalhamentoIVA(gold, inputs.l_c, inputs.g_c);

    const melhor = (f_max.total <= f_gold.total) ? 
        { nome: "Desconto Máximo", res: f_max, cor: "bg-orange-600" } : 
        { nome: "Plano Gold", res: f_gold, cor: "bg-blue-600" };

    const poupancaMensal = f_at.total - melhor.res.total;
    
    document.getElementById('res_tot_atual').innerText = f_at.total.toFixed(2) + "€";
    document.getElementById('val_recomendado').innerText = melhor.res.total.toFixed(2) + "€";
    document.getElementById('nome_recomendado').innerText = "OPÇÃO IDEAL: " + melhor.nome;
    document.getElementById('card_recomendado').className = `p-6 rounded-3xl shadow-xl text-white ${melhor.cor}`;
    document.getElementById('res_poup_anual').innerText = (poupancaMensal * 12).toFixed(2) + "€";

    const cardVerde = document.querySelector('.bg-green-600');
    let pMensal = document.getElementById('res_poup_mensal_label') || document.createElement('p');
    pMensal.id = 'res_poup_mensal_label';
    pMensal.className = 'text-xs font-medium opacity-90 mt-2 italic border-t border-green-500 pt-2 text-white';
    pMensal.innerText = `Poupança de ${poupancaMensal.toFixed(2)}€ / mês (c/ IVA)`;
    if (!document.getElementById('res_poup_mensal_label')) cardVerde.appendChild(pMensal);

    let html = "";
    const row = (label, vAt, vMax, vGold, cat) => {
        const vIdl = melhor.nome === "Desconto Máximo" ? vMax : vGold;
        const d = vIdl - vAt;
        return `<tr class="border-b text-sm"><td class="p-4 font-bold text-gray-400 text-[10px] uppercase">${label}</td><td class="p-4">${vAt.toFixed(2)}€</td><td class="p-4 text-orange-600">${vMax.toFixed(2)}€</td><td class="p-4 text-blue-600">${(vGold === 0 && cat === 'gas' && tipo === 'dual') ? 'GRÁTIS' : vGold.toFixed(2) + '€'}</td><td class="p-4 text-center font-black ${d <= 0 ? 'text-green-600' : 'text-red-500'}">${d <= 0 ? '↓' : '↑'} ${Math.abs(d).toFixed(2)}€</td></tr>`;
    };

    if(tipo !== 'gas') { html += row("Luz: Fixo", at.l_f, max.l_f, gold.l_f, 'luz') + row("Luz: Consumo", at.l_e, max.l_e, gold.l_e, 'luz'); }
    if(tipo !== 'luz') { html += row("Gás: Fixo", at.g_f, max.g_f, gold.g_f, 'gas') + row("Gás: Consumo", at.g_e, max.g_e, gold.g_e, 'gas'); }

    html += `
        <tr class="bg-slate-50 text-[10px] italic text-gray-400"><td>Taxas (IEC/CAV/TRFE)</td><td>${f_at.taxas.toFixed(2)}€</td><td>${f_max.taxas.toFixed(2)}€</td><td>${f_gold.taxas.toFixed(2)}€</td><td class="text-center">-</td></tr>
        <tr class="bg-blue-50/50 text-[10px] italic text-blue-600"><td>IVA 6%</td><td>${f_at.iva6.toFixed(2)}€</td><td>${f_max.iva6.toFixed(2)}€</td><td>${f_gold.iva6.toFixed(2)}€</td><td class="text-center">-</td></tr>
        <tr class="bg-slate-50 text-[10px] italic text-gray-400"><td>IVA 23%</td><td>${f_at.iva23.toFixed(2)}€</td><td>${f_max.iva23.toFixed(2)}€</td><td>${f_gold.iva23.toFixed(2)}€</td><td class="text-center">-</td></tr>
        <tr class="bg-slate-900 text-white font-black text-lg">
            <td class="p-5">TOTAL FATURA</td><td>${f_at.total.toFixed(2)}€</td><td class="text-orange-400">${f_max.total.toFixed(2)}€</td><td class="text-blue-400">${f_gold.total.toFixed(2)}€</td><td class="text-center text-yellow-400 font-black">↓ ${poupancaMensal.toFixed(2)}€</td>
        </tr>`;
    
    document.getElementById('header_row').innerHTML = `<th class="p-4">Componente</th><th class="p-4">Atual</th><th class="p-4">Max</th><th class="p-4">Gold</th><th class="p-4 text-center">Poupança</th>`;
    document.getElementById('table_body').innerHTML = html;
}