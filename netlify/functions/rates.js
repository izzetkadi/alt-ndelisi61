exports.handler = async function () {
  try {
    const res = await fetch("https://dunyakatilim.com.tr/gunluk-kurlar", {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    });
    const html = await res.text();
    const goldMatch   = html.match(/XAU[\s\S]*?<td[^>]*>\s*([\d.,]+)\s*<\/td>\s*<td[^>]*>\s*([\d.,]+)/);
    const silverMatch = html.match(/XAG[\s\S]*?<td[^>]*>\s*([\d.,]+)\s*<\/td>\s*<td[^>]*>\s*([\d.,]+)/);
    const timeMatch   = html.match(/Son Güncelleme\s*[:：]?\s*([0-9.:/ ]+)/i);
    const parse = (s) => {
  if (!s) return null;
  s = s.trim();
  if (s.includes(",") && s.includes(".")) {
    const lastComma = s.lastIndexOf(",");
    const lastDot   = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  return parseFloat(s);
};
    const goldBuy   = goldMatch   ? parse(goldMatch[1])   : null;
    const silverBuy = silverMatch ? parse(silverMatch[1]) : null;
    const time      = timeMatch   ? timeMatch[1].trim()   : new Date().toLocaleString("tr-TR");
    if (!goldBuy || !silverBuy) {
      const fallback = await fetch("https://finans.truncgil.com/v4/today.json");
      const fdata    = await fallback.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ goldBuy: fdata?.GRA?.Buying, silverBuy: fdata?.GUMUS?.Buying, time: fdata?.Update_Date, source: "truncgil-fallback" }),
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ goldBuy, silverBuy, time, source: "dunyakatilim" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
