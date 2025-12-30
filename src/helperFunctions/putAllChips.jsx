function putAllChips(bankroll) {

    const chipValues = [500, 100, 50, 25, 10, 1]

    const result = [];
    let remaining = bankroll;

    for (const v of chipValues) {
        const count = Math.floor(remaining / v);
        if (count > 0) {
            result.push(...Array(count).fill(v));
            remaining -= count * v;
        }
    }

    return result;
}

export default putAllChips;