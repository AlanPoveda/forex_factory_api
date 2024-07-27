const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    const url = 'https://www.forexfactory.com/'; // Substitua pelo URL real

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });

    const tableData = await page.evaluate(() => {
      const table = document.querySelector('.calendar__table');
      if (!table) return {};

      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const groupedData = {};
      let currentDate = '';

      rows.forEach(row => {
        const dateCell = row.querySelector('td.calendar__date');
        if (dateCell) {
          currentDate = dateCell.textContent.trim().replace(/.*\s/, ''); // Extrai somente a data (e.g., "Jul 26")
          if (!groupedData[currentDate]) {
            groupedData[currentDate] = {};
          }
        }

        const columns = Array.from(row.querySelectorAll('td'));
        const time = columns[1]?.textContent.trim();
        if (!time) return;

        const eventData = {
          currency: columns[3]?.textContent.trim(),
          impact: columns[4]?.querySelector('span')?.getAttribute('title') || '',
          event: columns[5]?.textContent.trim(),
          detail: columns[6]?.querySelector('a')?.title || '',
          actual: columns[7]?.textContent.trim(),
          forecast: columns[8]?.textContent.trim(),
          previous: columns[9]?.textContent.trim(),
          graph: columns[10]?.querySelector('a')?.title || ''
        };

        groupedData[currentDate][time] = eventData;
      });

      return Object.keys(groupedData).map(date => ({
        date,
        data: groupedData[date]
      }));
    });

    await browser.close();

    // Envia a resposta com o JSON estruturado
    res.status(200).json(tableData);
  } catch (error) {
    console.error('Request Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};