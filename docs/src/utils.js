export function reduce(numerator, denominator) {
    var _gcd = gcd(numerator, denominator);
    return [numerator / _gcd, denominator / _gcd];
}
export function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}
;
export function floatToFraction(value) {
    let numerator = Math.round(value * 1000000);
    let denominator = 1000000;
    let divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    // Return integer if denominator is 1, else return LaTeX fraction
    return denominator === 1 ? `${numerator}` : `\\frac{${numerator}}{${denominator}}`;
}
