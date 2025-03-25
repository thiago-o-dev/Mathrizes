const matrixContainer = document.getElementById("matrix") as HTMLDivElement;
const responseContainer = document.getElementById("response") as HTMLDivElement;
const complementMatrix = document.getElementById("complement-matrix") as HTMLElement;
let currentMatrix : number[][] = [];

declare var MathJax: any; // Declare MathJax globally

function updateMatrixInsertionDiv(matrixSize: number): void{
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

function updateCurrentMatrix(): void{
    const inputs = matrixContainer.getElementsByTagName("input");
    const size = Math.sqrt(inputs.length); // Descobrir o tamanho baseado na quantidade de inputs

    currentMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let input of inputs) {
        const row = parseInt(input.dataset.row || "0");
        const col = parseInt(input.dataset.col || "0");
        currentMatrix[row][col] = parseFloat(input.value) || 0; // Converte string para número
    }
}

function showLaTeXResponse(lines: string[]): void{
    responseContainer.innerHTML = "";

    lines.forEach(value => {
        const line = document.createElement("p");
        line.innerHTML = "\\[" + value + "\\]";
        responseContainer.appendChild(line)
    });
}

function validateMatrix(matrix: number[][]): boolean{
    if (matrix.length <= 1) 
       return false;
    
    return true;
}

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
    var response = triangulateMatrix();
    console.log(response);
    showLaTeXResponse(response[1]);
    
    loadMathJax(() => {
        MathJax.typesetPromise().then(() => console.log("MathJax updated!"))
        .catch((err: any) => console.error("MathJax processing error:", err));
    });
}

function triangulateMatrix(): [number[][], string[]] {
    const matrix = currentMatrix;
    // Validate matrix
    if (!validateMatrix(matrix))
        return [[], ["\\text{Matriz inválida}"]];

    // LaTeX actions for step-by-step visualization
    const actions: string[] = [];
    
    const n = matrix.length;
    
    // Deep copy of the matrix
    const triangularMatrix = matrix.map(row => [...row]);

    // Initial matrix state
    actions.push(`\\text{Matriz inicial:} \\quad ${matrixToLatex(triangularMatrix)}`);

    for (let i = 0; i < n; i++) {
        // Partial pivoting: find the row with the largest absolute value in the current column
        let maxRowIndex = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(triangularMatrix[k][i]) > Math.abs(triangularMatrix[maxRowIndex][i])) {
                maxRowIndex = k;
            }
        }

        // Swap rows if necessary
        if (maxRowIndex !== i) {
            [triangularMatrix[i], triangularMatrix[maxRowIndex]] = [triangularMatrix[maxRowIndex], triangularMatrix[i]];
            actions.push(`\\text{Trocar } L_{${i+1}} \\text{ com } L_{${maxRowIndex+1}}: \\quad ${matrixToLatex(triangularMatrix)}`);
        }

        // Check for near-zero pivot (to avoid division by very small numbers)
        if (Math.abs(triangularMatrix[i][i]) < 1e-10) {
            actions.push(`\\text{Pivô próximo de zero em } (${i+1},${i+1})`);
            continue;
        }

        // Eliminate entries below the pivot
        for (let j = i + 1; j < n; j++) {
            // Calculate elimination factor
            const factor = triangularMatrix[j][i] / triangularMatrix[i][i];

            // Log the row operation
            actions.push(`L_{${j+1}} \\leftarrow L_{${j+1}} - (${factor.toFixed(4)}) L_{${i+1}}`);

            // Perform row elimination
            for (let k = i; k < n; k++) {
                triangularMatrix[j][k] -= factor * triangularMatrix[i][k];
            }

            // Show matrix state after elimination
            actions.push(`\\text{Após eliminação:} \\quad ${matrixToLatex(triangularMatrix)}`);
        }
    }

    // Helper function to convert matrix to LaTeX string
    function matrixToLatex(mat: number[][]): string {
        return `\\begin{bmatrix} ${
            mat.map(row => 
                row.map(val => val.toFixed(4)).join(' & ')
            ).join(' \\\\ ')
        } \\end{bmatrix}`;
    }

    // Validate matrix function
    function validateMatrix(mat: number[][]): boolean {
        return mat && 
               mat.length > 0 && 
               mat.every(row => row.length === mat.length);
    }

    return [triangularMatrix, actions];
}


updateMatrixInsertionDiv(2);

showLaTeXResponse(["\\text{Aperte o botão que quiser e calcule a matriz que você inseriu.}"])
// rodar o tsc main.ts e inser o script em .js no HTML