"use strict";
const matrixContainer = document.getElementById("matrix");
const responseContainer = document.getElementById("response");
const complementMatrix = document.getElementById("complement-matrix");
let currentMatrix = [];
function loadMathJax(callback) {
    if (window.MathJax) {
        callback();
        return;
    }
    const script = document.createElement("script");
    script.id = "MathJax-script";
    script.async = true;
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js";
    script.onload = () => {
        console.log("MathJax loaded!");
        if (callback)
            callback();
    };
    document.head.appendChild(script);
}
function buttonTriangulateMatrix() {
    updateCurrentMatrix();
    var response = gaussianElimination();
    console.log(response);
    showLaTeXResponse(response[1]);
    loadMathJax(() => {
        MathJax.typesetPromise().then(() => console.log("MathJax updated!"))
            .catch((err) => console.error("MathJax processing error:", err));
    });
}
function updateMatrixInsertionDiv(matrixSize) {
    matrixContainer.innerHTML = ""; // Limpa a matriz antiga
    complementMatrix.innerText = `x ${matrixSize}`;
    // Criar grid de inputs numéricos
    for (let i = 0; i < matrixSize; i++) {
        const row = document.createElement("div");
        row.classList.add("d-flex", "justify-content-center"); // Bootstrap classes para alinhamento
        for (let j = 0; j < matrixSize; j++) {
            const input = document.createElement("input");
            input.type = "number";
            input.classList.add("form-control", "m-1", "text-center"); // Bootstrap classes para estilo
            input.style.width = "60px"; // Mantém os inputs organizados
            input.dataset.row = i.toString();
            input.dataset.col = j.toString();
            input.value = "0";
            row.appendChild(input);
        }
        matrixContainer.appendChild(row);
    }
}
function gcd(a, b) {
    return b ? gcd(b, a % b) : Math.abs(a);
}
function floatToFraction(value, tolerance = 1e-6) {
    if (value === 0)
        return "0";
    // Keep track of the sign and work with absolute value
    let sign = value < 0 ? "-" : "";
    value = Math.abs(value);
    // Initialize continued fraction variables:
    let h0 = 0, h1 = 1;
    let k0 = 1, k1 = 0;
    let b = value;
    let a = Math.floor(b);
    // First convergent
    let h = a * h1 + h0;
    let k = a * k1 + k0;
    // Loop until the approximation is within tolerance or denominator is huge
    while (Math.abs(value - h / k) > tolerance) {
        b = 1 / (b - a);
        a = Math.floor(b);
        let tempH = h;
        h = a * h + h1;
        h1 = tempH;
        let tempK = k;
        k = a * k + k1;
        k1 = tempK;
        // Prevent denominators from growing too large
        if (k > 1e2)
            break;
    }
    // Simplify the fraction using GCD
    const divisor = gcd(h, k);
    h = h / divisor;
    k = k / divisor;
    // Return a simple integer if possible, else return a LaTeX fraction
    return k === 1 ? `${sign}${h}` : `${sign}\\frac{${h}}{${k}}`;
}
function updateCurrentMatrix() {
    const inputs = matrixContainer.getElementsByTagName("input");
    const size = Math.sqrt(inputs.length); // Descobrir o tamanho baseado na quantidade de inputs
    currentMatrix = Array.from({ length: size }, () => Array(size).fill(0));
    for (let input of inputs) {
        const row = parseInt(input.dataset.row || "0");
        const col = parseInt(input.dataset.col || "0");
        currentMatrix[row][col] = parseFloat(input.value) || 0; // Converte string para número
    }
}
function showLaTeXResponse(lines) {
    responseContainer.innerHTML = "";
    lines.forEach(value => {
        const line = document.createElement("p");
        line.innerHTML = "\\[" + value + "\\]";
        responseContainer.appendChild(line);
    });
}
// Validação: verifica se a matriz não está vazia e se todas as linhas possuem o mesmo tamanho.
function validateMatrix(mat) {
    if (!mat || mat.length === 0)
        return false;
    const len = mat[0].length;
    return mat.every(row => row.length === len);
}
function gaussianElimination() {
    const matrix = currentMatrix;
    if (!validateMatrix(matrix))
        return [[], ["\\text{Matriz inválida}"]];
    const actions = [];
    const n = matrix.length;
    const m = matrix[0].length;
    // Define quantas colunas são de coeficientes (supondo sistema quadrado)
    const numCoeffs = n;
    // Cópia profunda da matriz
    let A = matrix.map(row => [...row]);
    // Inicializa as ações de cada linha (cada linha começa sem ter sido alterada)
    let rowActions = [];
    // Estado inicial
    actions.push(`\\text{Matriz inicial:} \\quad ${matrixToLatex(A.map(row => row.slice(0, numCoeffs)), (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []), [])}`);
    // Processo de eliminação
    for (let i = 0; i < n - 1; i++) {
        for (let i = 0; i < n; i++) {
            rowActions[i] = ``;
        }
        // Pivoteamento parcial: busca a linha com o maior valor absoluto na coluna i
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }
        if (Math.abs(A[maxRow][i]) < 1e-10) {
            actions.push(`\\text{Pivô já zerado em } (${i + 1},${i + 1}).`);
            continue;
        }
        // Troca de linhas, se necessário
        if (A[i][i] == 0) {
            var matrixBeforeAction = A.map(row => row.slice(0, numCoeffs));
            [A[i], A[maxRow]] = [A[maxRow], A[i]];
            [rowActions[i], rowActions[maxRow]] = [rowActions[maxRow], rowActions[i]];
            // Atualiza a notação de ambas as linhas para refletir a troca
            rowActions[i] = `L_{${i + 1}} \\leftrightarrow L_{${maxRow + 1}}`;
            rowActions[maxRow] = `L_{${maxRow + 1}} \\leftrightarrow L_{${i + 1}}`;
            actions.push(`${matrixToLatex(matrixBeforeAction, A.map(row => row.slice(0, numCoeffs)), rowActions)}`);
        }
        var changeFlag = false;
        for (let i = 0; i < n; i++) {
            rowActions[i] = ``;
        }
        var matrixBeforeAction = A.map(row => row.slice(0, numCoeffs));
        // Eliminação: zera os elementos abaixo do pivô na coluna i
        for (let j = i + 1; j < n; j++) {
            const factor = A[j][i] / A[i][i];
            // Se o fator for insignificante, não realiza a operação
            if (Math.abs(factor) < 1e-10)
                continue;
            // Atualiza a ação para a linha j
            rowActions[j] = `L_{${j + 1}} \\leftarrow L_{${j + 1}} - (${floatToFraction(factor)}) L_{${i + 1}}`;
            // Aplica a operação em todas as colunas da linha j
            for (let k = i; k < m; k++) {
                A[j][k] -= factor * A[i][k];
            }
            changeFlag = true;
        }
        if (changeFlag)
            // Mostra o estado da matriz após as eliminações se foi encontrada mudanças
            actions.push(`${matrixToLatex(matrixBeforeAction, A.map(row => row.slice(0, numCoeffs)), rowActions)}`);
    }
    actions.push(`${matrixToLatex(A.map(row => row.slice(0, numCoeffs)), (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []), [])}`);
    return [A, actions];
}
// Função auxiliar para converter a matriz em LaTeX, exibindo os coeficientes, os termos independentes (se houver)
// e a notação das ações realizadas em cada linha.
function matrixToLatex(coeffMatrix, constMatrix, rowActions) {
    const n = coeffMatrix.length;
    const m = coeffMatrix[0].length;
    const actionsArr = rowActions ? rowActions.slice() : [];
    for (let i = 0; i < n; i++) {
        if (!actionsArr[i]) {
            // L_{${i + 1}} \\rightarrow L_{${i + 1}}
            actionsArr[i] = ``;
        }
    }
    // Cria a parte esquerda: matriz dos coeficientes com coluna das ações
    let leftLatex = `\\begin{array}{| ${'c'.repeat(m)}|l}\n`;
    for (let i = 0; i < n; i++) {
        leftLatex += coeffMatrix[i]
            .map(val => floatToFraction(val))
            .join(' & ');
        leftLatex += " & " + actionsArr[i] + " \\\\\n";
    }
    leftLatex += "\\end{array}";
    // Cria a parte direita: matriz dos termos independentes (se houver)
    let rightLatex = "";
    if (constMatrix && constMatrix.length > 0) {
        const p = constMatrix[0].length;
        rightLatex += `\\begin{array}{|${'c'.repeat(p)}|}\n`;
        for (let i = 0; i < constMatrix.length; i++) {
            rightLatex += constMatrix[i]
                .map(val => floatToFraction(val))
                .join(' & ') + " \\\\\n";
        }
        rightLatex += "\\end{array}";
    }
    // Junta as duas partes com uma seta entre elas
    if (rightLatex == "")
        return `\\begin{array}{ccc}\n${leftLatex} && \n${rightLatex}\n\\end{array}`;
    return `\\begin{array}{ccc}\n${leftLatex} &\\because& \n${rightLatex}\n\\end{array}`;
}
updateMatrixInsertionDiv(2);
showLaTeXResponse(["\\text{Aperte o botão que quiser e calcule a matriz que você inseriu.}"]);
// rodar o tsc main.ts e inser o script em .js no HTML
