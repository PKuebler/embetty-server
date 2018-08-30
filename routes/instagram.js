const {BadRequest, NotFound} = require('../lib/exceptions')
const express = require('express')

const router = express.Router()

router.param('id', async (req, res, next, id) => {
  try {
    if (!/^\w+$/.test(id)) throw BadRequest
    req.instagram = await req.app.get('embetty').loadInstagramPost(id)
    next()
  } catch (e) {
    next(e)
  }
})

router.get('/:id-poster-image', async (req, res, next) => {
  try {
    const image = await req.instagram.getImage()
    if (!image) return next(NotFound)
    res.type(image.type)
    res.send(image.data)
  } catch (e) {
    next(e)
  }
})

router.get('/:id.amp', (req, res) => {
  res.render('instagram.html', {post: req.instagram})
})

router.get('/:id', (req, res) => {
  res.send(req.instagram)
})

module.exports = router
