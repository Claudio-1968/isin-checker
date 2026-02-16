 const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();

app.get("/", async (req, res) => {
  const isin = req.query.isin;
  if (!isin) return res.send("ERRORE");

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(
      "https://live.euronext.com/en/product/structured-products/" + isin,
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    const content = await page.content();
    await browser.close();

    if (content.toLowerCase().includes("no longer active")) {
      return res.send("SCADUTO");
    }

    return res.send("ATTIVO");

  } catch (e) {
    return res.send("ERRORE");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server avviato sulla porta " + PORT));
