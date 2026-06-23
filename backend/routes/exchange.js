const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

let cachedRate = null;
let cacheTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// GET /api/exchange
router.get('/', async (req, res) => {
  try {
    // Return cached if fresh
    if (cachedRate && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      return res.json({ ...cachedRate, cached: true });
    }

    let data = null;

    // Strategy 1: El Toque API (needs token in .env)
    const token = process.env.EL_TOQUE_TOKEN;
    if (token) {
      try {
        const response = await axios.get('https://tasas.eltoque.com/v1/trmi', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        if (response.data && response.data.tasas) {
          const t = response.data.tasas;
          data = {
            USD: t.USD || null,
            EUR: t.ECU || null,
            MLC: t.MLC || null,
            USDT: t.USDT_TRC20 || null,
            date: response.data.date || new Date().toISOString().split('T')[0],
            time: `${response.data.hour || '00'}:${String(response.data.minutes || '00').padStart(2, '0')}`,
            source: 'El Toque API'
          };
        }
      } catch (apiErr) {
        console.warn('El Toque API error, trying scraping:', apiErr.message);
      }
    }

    // Strategy 2: Scrape El Toque public page
    if (!data) {
      try {
        const html = await axios.get('https://eltoque.com/tasas-de-cambio-cuba', {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(html.data);
        const rates = {};
        let updateDate = '';

        $('.tasa-item, [class*="tasa"]').each((i, el) => {
          const text = $(el).text().trim();
          const match = text.match(/(USD|EUR|MLC|USDT|BTC|CAD|MXN)\s*[=:]\s*(\d+[\d.,]*)/i);
          if (match) {
            rates[match[1].toUpperCase()] = parseFloat(match[2].replace(/,/g, ''));
          }
        });

        // Try to find date
        $('time, .fecha, .date, .updated').each((i, el) => {
          const t = $(el).text().trim();
          if (t && !updateDate) updateDate = t;
        });

        if (Object.keys(rates).length > 0) {
          data = {
            USD: rates.USD || null,
            EUR: rates.EUR || null,
            MLC: rates.MLC || null,
            date: updateDate || new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }),
            source: 'El Toque (scraping)'
          };
        }
      } catch (scrapeErr) {
        console.warn('Scraping error:', scrapeErr.message);
      }
    }

    // Strategy 3: Fallback hardcoded rate
    if (!data) {
      data = {
        USD: 440,
        EUR: 480,
        MLC: 210,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }),
        source: 'Referencia (sin conexión)',
        fallback: true
      };
    }

    cachedRate = data;
    cacheTime = Date.now();

    res.json({ ...data, cached: false });
  } catch (err) {
    // Ultimate fallback
    res.json({
      USD: 440,
      EUR: 480,
      MLC: 210,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' }),
      source: 'Valor por defecto',
      fallback: true
    });
  }
});

module.exports = router;
