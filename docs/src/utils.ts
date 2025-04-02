export function reduce(numerator : number, denominator : number) : number[]{
    var _gcd = gcd(numerator,denominator);
    return [numerator/_gcd, denominator/_gcd];
}

export function gcd(a: number,b: number): number{
    return b ? gcd(b, a%b) : a;
};

export function floatToFraction(value: number): string {
  let numerator = Math.round(value * 1_000_000);
  let denominator = 1_000_000;
  let divisor = gcd(numerator, denominator);

  numerator /= divisor;
  denominator /= divisor;

  // Return integer if denominator is 1, else return LaTeX fraction
  return denominator === 1 ? `${numerator}` : `\\frac{${numerator}}{${denominator}}`;
}