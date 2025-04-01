const matrixContainer = document.getElementById("matrix") as HTMLDivElement;
const responseContainer = document.getElementById("response") as HTMLDivElement;
const complementMatrix = document.getElementById("complement-matrix") as HTMLElement;
let currentMatrix: number[][] = [];

declare var MathJax: any; // Declare MathJax globally

function loadMathJax(callback: any) {
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
        if (callback) callback();
    };

    document.head.appendChild(script);
}

function buttonTriangulateMatrix(): void {

    updateCurrentMatrix();
    var response = gaussianElimination();
    console.log(response);
    showLaTeXResponse(response[1]);

    loadMathJax(() => {
        MathJax.typesetPromise().then(() => console.log("MathJax updated!"))
            .catch((err: any) => console.error("MathJax processing error:", err));
    });
}

function updateMatrixInsertionDiv(matrixSize: number): void {
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

function updateCurrentMatrix(): void {
    const inputs = matrixContainer.getElementsByTagName("input");
    const size = Math.sqrt(inputs.length); // Descobrir o tamanho baseado na quantidade de inputs

    currentMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let input of inputs) {
        const row = parseInt(input.dataset.row || "0");
        const col = parseInt(input.dataset.col || "0");
        currentMatrix[row][col] = parseFloat(input.value) || 0; // Converte string para número
    }
}

function showLaTeXResponse(lines: string[]): void {
    responseContainer.innerHTML = "";

    lines.forEach(value => {
        const line = document.createElement("p");
        line.innerHTML = "\\[" + value + "\\]";
        responseContainer.appendChild(line)
    });
}

// Validação: verifica se a matriz não está vazia e se todas as linhas possuem o mesmo tamanho.
function validateMatrix(mat: number[][]): boolean {
    if (!mat || mat.length === 0) return false;
    const len = mat[0].length;
    return mat.every(row => row.length === len);
}

function gaussianElimination(): [number[][], string[]] {
    const matrix = currentMatrix;

    if (!validateMatrix(matrix))
        return [[], ["\\text{Matriz inválida}"]];

    const actions: string[] = [];
    const n = matrix.length;
    const m = matrix[0].length;
    // Define quantas colunas são de coeficientes (supondo sistema quadrado)
    const numCoeffs = n;
    // Cópia profunda da matriz
    let A = matrix.map(row => [...row]);
    // Inicializa as ações de cada linha (cada linha começa sem ter sido alterada)
    let rowActions: string[] = [];

    // Estado inicial
    actions.push(`\\text{Matriz inicial:} \\quad ${matrixToLatex(
        A.map(row => row.slice(0, numCoeffs)),
        (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []),
        []
    )}`);

    // Processo de eliminação
    for (let i = 0; i < n; i++) {
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
            actions.push(`\\text{Pivô próximo de zero em } (${i + 1},${i + 1}).`);
            continue;
        }

        // Troca de linhas, se necessário
        if (maxRow !== i) {
            [A[i], A[maxRow]] = [A[maxRow], A[i]];
            [rowActions[i], rowActions[maxRow]] = [rowActions[maxRow], rowActions[i]];
            // Atualiza a notação de ambas as linhas para refletir a troca
            rowActions[i] = `L_{${i + 1}} \\leftrightarrow L_{${maxRow + 1}}`;
            rowActions[maxRow] = `L_{${maxRow + 1}} \\leftrightarrow L_{${i + 1}}`;
            actions.push(`${matrixToLatex(
                A.map(row => row.slice(0, numCoeffs)),
                (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []),
                rowActions
            )}`);
        }

        // Eliminação: zera os elementos abaixo do pivô na coluna i
        for (let j = i + 1; j < n; j++) {
            for (let i = 0; i < n; i++) {
                rowActions[i] = ``;
            }
            const factor = A[j][i] / A[i][i];
            // Se o fator for insignificante, não realiza a operação
            if (Math.abs(factor) < 1e-10) continue;
            
            // Atualiza a ação para a linha j
            rowActions[j] = `L_{${j + 1}} \\leftarrow L_{${j + 1}} - (${factor.toFixed(2)}) L_{${i + 1}}`;
            // Mostra o estado da matriz após a eliminação
            actions.push(`${matrixToLatex(
                A.map(row => row.slice(0, numCoeffs)),
                (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []),
                rowActions
            )}`);
            
            // Aplica a operação em todas as colunas da linha j
            for (let k = i; k < m; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }

    actions.push(`${matrixToLatex(
        A.map(row => row.slice(0, numCoeffs)),
        (m > numCoeffs ? A.map(row => row.slice(numCoeffs)) : []),
        []
    )}`);

    return [A, actions];
}

// Função auxiliar para converter a matriz em LaTeX, exibindo os coeficientes, os termos independentes (se houver)
// e a notação das ações realizadas em cada linha.
function matrixToLatex(
    coeffMatrix: number[][],
    constMatrix: number[][],
    rowActions?: string[]
): string {
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
    let leftLatex = `\\begin{array}{|${'c'.repeat(m)}|c}\n`;
    for (let i = 0; i < n; i++) {
        leftLatex += coeffMatrix[i]
            .map(val => val.toFixed(2))
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
                .map(val => val.toFixed(2))
                .join(' & ') + " \\\\\n";
        }
        rightLatex += "\\end{array}";
    }

    // Junta as duas partes com uma seta entre elas
    return `\\begin{array}{c@{\\quad\\rightarrow\\quad}c}\n${leftLatex} & ${rightLatex}\n\\end{array}`;
}


updateMatrixInsertionDiv(2);

showLaTeXResponse(["\\text{Aperte o botão que quiser e calcule a matriz que você inseriu.}"])
// rodar o tsc main.ts e inser o script em .js no HTML