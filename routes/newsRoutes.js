const express = require('express')
const { fetchAndStoreOnce } = require('../services/newsFetcher')

const router = express.Router()

router.post('/fetch-now', async (req, res) => {
  try {
    const result = await fetchAndStoreOnce()
    res.json({ message: 'Fetch completed', ...result })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

module.exports = router


