import { useState } from "react"
import { calculateCosineSimilarity } from "../lib/cosineSimiliarity"
import useSWR from "swr"

const fetcher = (url) => fetch(url).then((res) => res.json())

const KonjungsiInput = () => {
  const { data, error } = useSWR("/api/readTxt", fetcher)

  const [inpValSentence, setInpValSentence] = useState("")
  const [htmlData, setHtmlData] = useState("")
  const [htmlDataIteration, setHtmlDataIteration] = useState("")
  const [showIteration, setShowIteration] = useState(false)
  const [totalKonjungsi, setTotalKonjungsi] = useState(0)
  const [konjungsiTrue, setKonjungsiTrue] = useState(0)
  const [konjungsiFalse, setKonjungsiFalse] = useState(0)

  if (data) {
    let arrKonjungsiAntaraSatuKata = []
    let arrKonjungsiAwalanSatuKata = []

    const konjungsiAntaraSatuKata =
      data.konjungsiAntaraSatuKata.split(", ")

    const konjungsiAwalanSatuKata =
      data.konjungsiAwalanSatuKata.split(", ")

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

    const checkInput = () => {
      let konjungsiCount = 0
      let trueKonjungsi = 0
      let falseKonjungsi = 0

      let html = ""
      let htmlIteration = ""

      let index = []
      let sentenceKonjungsiType = []

      //tokenisasi kalimat
      const inpVal = inpValSentence.split(".")

      inpVal.map((sentence) => {
        index = [] //reset index kata konjungsi
        sentenceKonjungsiType = []

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

          if (maxSimiliar >= 1) {
            //apabila nilai cosine similiary diatas 0.9 maka index kata tersebut dicatat dan dianggap sebagai kata konjungsi
            index.push(i)
            sentenceKonjungsiType.push(konjungsiType)
            if (i === stringArr.length - 1) {
              htmlIteration = htmlIteration.concat(
                `<div style="color: green"><u>'${string}' ${maxSimiliar.toFixed(
                  4,
                )}</u></div> <div style="flex-basis:100%; width:0"></div>`,
              )
            } else {
              htmlIteration = htmlIteration.concat(
                `<div style="color: green"><u>'${string}' ${maxSimiliar.toFixed(
                  4,
                )}</u> | </div>`,
              )
            }
          } else {
            sentenceKonjungsiType.push("")

            if (i === stringArr.length - 1) {
              htmlIteration = htmlIteration.concat(
                `<div>'${string}' ${maxSimiliar.toFixed(
                  4,
                )}</div> <div style="flex-basis:100%; width:0"></div>`,
              )
            } else {
              htmlIteration = htmlIteration.concat(
                `<div>'${string}' ${maxSimiliar.toFixed(4)} | </div>`,
              )
            }
          }
        })

        for (let i = 0; i < stringArr.length; i++) {
          if (i === stringArr.length - 1) {
            //cek apabila index kata merupakan kata terakhir di kalimat
            if (index.find((x) => i === x)) {
              konjungsiCount += 1
              falseKonjungsi += 1
              //cek apabila index kata terdapat pada index kata konjungsi
              html = html.concat(
                `<span style="margin: 0 2px; color: red">${stringArr[i]}.</span><div style="flex-basis: 100%; height: 10px"></div>`, //salah dan beri tanda baca
              )
            } else {
              html = html.concat(
                `<span style="margin: 0 2px">${stringArr[i]}.</span><div style="flex-basis: 100%; height: 10px"></div>`, //beri tanda baca
              )
            }
          } else {
            if (index.find((x) => i === x) !== undefined) {
              konjungsiCount += 1
              //cek apabila index kata terdapat pada index kata konjungsi
              if (i === 0) {
                //cek apabila kata konjungsi terletak di depan
                if (sentenceKonjungsiType[i] === "awalan") {
                  trueKonjungsi += 1
                  html = html.concat(
                    `<span style="margin: 0 2px; color: green"><u>${stringArr[i]}</u></span>`, //benar
                  )
                } else {
                  falseKonjungsi += 1
                  html = html.concat(
                    `<span style="margin: 0 2px; color: red">${stringArr[i]}</span>`, //salah
                  )
                }
              } else {
                if (sentenceKonjungsiType[i] === "awalan") {
                  falseKonjungsi += 1
                  html = html.concat(
                    `<span style="margin: 0 2px; color: red">${stringArr[i]}</span>`, //salah
                  )
                } else {
                  trueKonjungsi += 1
                  html = html.concat(
                    `<span style="margin: 0 2px; color: green"><u>${stringArr[i]}</u></span>`, //benar
                  )
                }
              }
            } else {
              html = html.concat(
                `<span style="margin: 0 2px">${stringArr[i]}</span>`,
              )
            }
          }
        }
      })

      setTotalKonjungsi(konjungsiCount)
      setKonjungsiFalse(falseKonjungsi)
      setKonjungsiTrue(trueKonjungsi)

      setHtmlData(html)
      setHtmlDataIteration(htmlIteration)
    }

    return (
      <>
        <textarea
          type="text"
          value={inpValSentence}
          onChange={(e) => setInpValSentence(e.target.value)}
          rows={10}
          cols={50}
        ></textarea>
        <br />
        <button onClick={checkInput}>Cek!</button>
        <button onClick={() => window.location.reload()}>
          Ulangi!
        </button>

        {totalKonjungsi > 0 && (
          <>
            <div>
              <u>
                <b>Total Kata Konjungsi: {totalKonjungsi}</b>
              </u>
              <br />
              <u>Total Kata Konjungsi Benar: {konjungsiTrue}</u>
              <br />
              <u>Total Kata Konjungsi Salah: {konjungsiFalse}</u>
              <br />
            </div>
            <br />
          </>
        )}

        <div
          dangerouslySetInnerHTML={{ __html: htmlData }}
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
        />
        <br />
        {htmlData && (
          <>
            <button onClick={() => setShowIteration(!showIteration)}>
              {!showIteration ? "Tampilkan" : "Sembunyikan"}{" "}
              Perhitungan Cosine Similarity
            </button>
            <br />
          </>
        )}
        {showIteration && (
          <div
            dangerouslySetInnerHTML={{ __html: htmlDataIteration }}
            style={{
              display: "inline-flex",
              width: "1000px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          />
        )}
      </>
    )
  }
}

export default KonjungsiInput
