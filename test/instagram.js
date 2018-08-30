const {start} = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')
const request = require('supertest')

start({ folder: path.join(__dirname, 'fixtures') })
const app = require('..')

const Posts = {
  s200: 'Bm21NK8APqG',
  s404: '999999999999999999999999999999999999999999999999',
  s400: 'abc'
}

describe('Instagram', () => {
  before(() => { process.env.URL_BASE = 'https://example.com/embetty-server' })
  after(() => { delete process.env.URL_BASE })

  it('/instagram/:id => 404', async () => {
    await request(app)
      .get(`/instagram/${Posts.s404}`)
      .expect(404)
  })

  it('/instagram/:id => 400', async () => {
    await request(app)
      .get(`/instagram/${Posts.s400}`)
      .expect(400)
  })

  it('/instagram/:id.amp => 200', async () => {
    const response = await request(app)
      .get(`/instagram/${Posts.s200}.amp`)
      .expect('Content-Type', /html/)
      .expect(200)
    const expected = '<embetty-instagram status="934029337019416579"></embetty-instagram>'
    assert.ok(response.text.includes(expected))
  })

  it('/instagram/:id => 200', async () => {
    const response = await request(app)
      .get(`/instagram/${Posts.s200}`)
      .expect('Content-Type', /json/)
      .expect(200)
    console.log(response.body);
    assert.equal(response.body.id_str, Posts.s200)
  })

  it('/instagram/:id-poster-image => 400', async () => {
    await request(app)
      .get(`/instagram/${Posts.s200}-poster-image`)
      .expect(400)
  })

  it('/instagram/:id-poster-image => 200', async () => {
    const response = await request(app)
      .get(`/instagram/${Posts.s200}-poster-image`)
      .expect('Content-Type', /jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    assert.equal(response.headers['content-length'], imageLength)
  })
})
