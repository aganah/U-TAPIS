function termFreqMap(str) {
  let termFreq = {}
  str.forEach(function (w) {
    termFreq[w] = (termFreq[w] || 0) + 1
  })
  return termFreq
}

function addKeysToDict(map, dict) {
  for (let key in map) {
    dict[key] = true
  }
}

function termFreqMapToVector(map, dict) {
  let termFreqVector = []
  for (let term in dict) {
    termFreqVector.push(map[term] || 0)
  }
  return termFreqVector
}

function vecDotProduct(vecA, vecB) {
  let product = 0
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i]
  }
  return product
}

function vecMagnitude(vec) {
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i]
  }
  return Math.sqrt(sum)
}

function cosineSimilarity(vecA, vecB) {
  return (
    vecDotProduct(vecA, vecB) /
    (vecMagnitude(vecA) * vecMagnitude(vecB))
  )
}

export function calculateCosineSimilarity(a, b) {
  //iterasi perhitungan nilai cosine similiarity setiap kata dengan kosakata konjungsi
  const termFreqA = termFreqMap(a)
  const termFreqB = termFreqMap(b)

  let dict = {}
  addKeysToDict(termFreqA, dict)
  addKeysToDict(termFreqB, dict)

  const termFreqVecA = termFreqMapToVector(termFreqA, dict)
  const termFreqVecB = termFreqMapToVector(termFreqB, dict)

  return cosineSimilarity(termFreqVecA, termFreqVecB)
}
