export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0") // months 0-11
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export const numberToWords = (num: number | string): string => {
    if (typeof num === "string") num = parseInt(num, 10);
    if (isNaN(num)) return "";

    if (num === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const format = (n: number, suffix: string): string => {
        if (n === 0) return "";
        return convertToWords(n) + " " + suffix + " ";
    };

    const convertToWords = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        return (
            ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 !== 0 ? " " + convertToWords(n % 100) : "")
        );
    };

    let result = "";

    result += format(Math.floor(num / 10000000), "Crore");
    num %= 10000000;

    result += format(Math.floor(num / 100000), "Lakh");
    num %= 100000;

    result += format(Math.floor(num / 1000), "Thousand");
    num %= 1000;

    result += format(Math.floor(num / 100), "Hundred");
    num %= 100;

    if (num > 0) {
        result += convertToWords(num);
    }

    return result.trim();
};