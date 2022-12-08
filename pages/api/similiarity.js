import { calculateCosineSimilarity } from "../../lib/cosineSimiliarity"

const strip = (html) => {
  const regexTag = /(<([^>]+)>)/gi
  const regexEntity = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/gi

  const filterTag = html.replace(regexTag, "")
  const filterEntity = filterTag.replace(regexEntity, "")

  return filterEntity
}

export default async function (req, res) {
  const resTxt = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/readTxt`,
  ).then((res) => res.json())

  if (resTxt && req.body) {
    let arrKonjungsiAntaraSatuKata = []
    let arrKonjungsiAwalanSatuKata = []

    const konjungsiAntaraSatuKata =
      resTxt.konjungsiAntaraSatuKata.split(", ")

    const konjungsiAwalanSatuKata =
      resTxt.konjungsiAwalanSatuKata.split(", ")

    konjungsiAntaraSatuKata.map((kata) => {
      arrKonjungsiAntaraSatuKata.push(
        kata.toLowerCase().split(/(?!$)/),
      )
    })

    konjungsiAwalanSatuKata.map((kata) => {
      arrKonjungsiAwalanSatuKata.push(
        kata.toLowerCase().split(/(?!$)/),
      )
    })

    const inpValSentence = strip(req.body.string)
    const inpVal = inpValSentence.split(".").filter((val) => val)

    let index = []
    let sentenceKonjungsiType = []
    let wordIsValid = []

    let arrKonjungsiType = []

    inpVal.map((sentence) => {
      index = [] //reset index kata konjungsi
      sentenceKonjungsiType = []
      wordIsValid = []

      const stringArr = sentence
        .replace(/[\r\n]/gm, "")
        .split(" ")
        .filter((string) => string !== "") //tokenisasi kata

      let maxSimiliar //deklarasi variable sebagai penampung nilai cosine similiarity tertinggi

      stringArr.map((string, i) => {
        let konjungsiType = ""
        maxSimiliar = 0 //reset variable maxSimiliar
        const kataInput = string.toLowerCase().split(/(?!$)/)

        arrKonjungsiAwalanSatuKata.map((arr, i) => {
          const res = calculateCosineSimilarity(arr, kataInput)

          if (res > maxSimiliar) {
            //pencarian nilai cosine similiarity tertinggi
            maxSimiliar = res
            konjungsiType = "awalan"
          }
        })

        arrKonjungsiAntaraSatuKata.map((arr, i) => {
          const res = calculateCosineSimilarity(arr, kataInput)

          if (res > maxSimiliar) {
            //pencarian nilai cosine similiarity tertinggi
            maxSimiliar = res
            konjungsiType = "akhiran"
          }
        })

        if (maxSimiliar > 0.99) {
          //apabila nilai cosine similiary diatas 0.9 maka index kata tersebut dicatat dan dianggap sebagai kata konjungsi
          index.push(i)
          sentenceKonjungsiType.push({
            word: string,
            konjungsi_type: konjungsiType,
          })
        } else {
          sentenceKonjungsiType.push({
            word: string,
            konjungsi_type: "",
          })
        }
      })

      for (let i = 0; i < stringArr.length; i++) {
        if (i === stringArr.length - 1) {
          //cek apabila index kata merupakan kata terakhir di kalimat
          if (index.find((x) => i === x)) {
            wordIsValid.push(false)
          } else {
            wordIsValid.push(false)
          }
        } else {
          if (index.find((x) => i === x) !== undefined) {
            //cek apabila index kata terdapat pada index kata konjungsi
            if (i === 0) {
              //cek apabila kata konjungsi terletak di depan
              if (
                sentenceKonjungsiType[i].konjungsi_type === "awalan"
              ) {
                wordIsValid.push(true)
              } else {
                wordIsValid.push(false)
              }
            } else {
              if (
                sentenceKonjungsiType[i].konjungsi_type === "awalan"
              ) {
                wordIsValid.push(false)
              } else {
                wordIsValid.push(true)
              }
            }
          } else {
            wordIsValid.push(false)
          }
        }
      }

      arrKonjungsiType.push({
        words: sentenceKonjungsiType,
        validity: wordIsValid,
      })
    })

    res.status(200).json({
      res: arrKonjungsiType,
    })
  } else {
    res.status(400).end()
  }
}
