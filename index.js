const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    const url = 'https://www.forexfactory.com/';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });

    const tableData = await page.evaluate(() => {
      const table = document.querySelector('.calendar__table');
      if (!table) return { headers: [], rows: [] };

      // Captura os cabeçalhos (th)
      const headers = Array.from(table.querySelectorAll('th')).map(header => header.textContent.trim());

      // Captura os dados (td) das linhas
      /*
      const rows = Array.from(table.querySelectorAll('tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim());
        return cells;
      });*/

      //return { headers, rows };
      return headers
    });

    await browser.close();

    res.status(200).json(tableData);
  } catch (error) {
    console.error('Request Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};