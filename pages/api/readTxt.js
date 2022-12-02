import path from "path"
import { promises as fs } from "fs"

export default async function handler(req, res) {
  //Find the absolute path of the json directory
  const txtDir = path.join(process.cwd(), "txt")
  //Read the json data file data.json
  const fileContentsKonjungsiAntara = await fs.readFile(
    txtDir + "/konjungsi_antara_satu_kata.txt",
    "utf8",
  )
  const fileContentsKonjungsiAwalan = await fs.readFile(
    txtDir + "/konjungsi_awalan_satu_kata.txt",
    "utf8",
  )
  //Return the content of the data file in json format

  res.status(200).send({
    konjungsiAntaraSatuKata: fileContentsKonjungsiAntara,
    konjungsiAwalanSatuKata: fileContentsKonjungsiAwalan,
  })
}
