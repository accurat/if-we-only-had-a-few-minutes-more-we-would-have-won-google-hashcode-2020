import * as fs from 'fs'
import * as _ from 'lodash'

const INPUT_FILES = [
  'a_example.txt',
  'b_read_on.txt',
  'c_incunabula.txt',
  'd_tough_choices.txt',
  'e_so_many_books.txt',
  'f_libraries_of_the_world.txt',
]

function doEverything(inputFile) {
  const input = fs.readFileSync(`./input/${inputFile}`).toString()

  const lines = input.trim().split('\n')

  const [books, libraries, days] = lines[0].split(' ').map(Number)
  const allBooksScores = lines[1].split(' ').map(Number)
  const librariesRawData = _.chunk(lines.slice(2), 2).map(arr =>
    arr.map(str => str.split(' ').map(Number)),
  )

  interface Book {
    index: number
    score: number
  }

  interface LibraryData {
    index: number
    books: Array<Book>
    booksAmount: number
    signingDays: number
    booksPerDay: number
    isStarted: boolean
    isEnded: boolean
    readBookOrder: number[]
    isSigning: boolean
  }

  function booksScores(books): Array<Book> {
    return books.map(b => ({
      index: b,
      score: allBooksScores[b],
    }))
  }

  function parseData(input: number[][], index: number): LibraryData {
    const books = _.sortBy(booksScores(input[1]), 'score').reverse()
    const [booksAmount, signingDays, booksPerDay] = input[0]

    return {
      books,
      booksAmount,
      signingDays,
      booksPerDay,
      readBookOrder: [],
      isStarted: false,
      isSigning: false,
      isEnded: false,
      index,
    }
  }

  const librariesList = librariesRawData.map(parseData)

  function getLibraryWorth(libraryData: LibraryData): number {
    const { books, signingDays, booksPerDay } = libraryData
    const readableBooks = (daysLeft - signingDays) * booksPerDay
    const totalScore = _.sumBy(
      books.filter(b => !bookCache[b.index]).slice(0, readableBooks),
      'score',
    )
    return totalScore / signingDays
  }

  let daysLeft = days
  let signingDaysLeft = 0

  const output: LibraryData[] = []

  const bookCache: Record<string, Book> = {}

  function shipBooks(library: LibraryData) {
    const { books, booksPerDay } = library
    let booksLeft = booksPerDay
    while (booksLeft > 0) {
      const bestBookIdx = books.findIndex(b => !bookCache[b.index])
      const ivansBestBookIdx = bestBookIdx === -1 ? 0 : bestBookIdx
      const bestBook = books[ivansBestBookIdx]
      books.splice(ivansBestBookIdx, 1) // the doctor strikes again
      bookCache[ivansBestBookIdx] = bestBook
      library.readBookOrder.push(bestBook.index)
      booksLeft--
    }
  }

  function applySerenaIdea(library: LibraryData) {
    library.readBookOrder.push(...library.books.map(b => b.index))
    /** mattiaz-dissiociates */
    library.books.forEach(b => {
      bookCache[b.index] = b
    })
    /** \mattiaz-dissiociates */
    library.isStarted = true
    library.isEnded = true
  }

  hugeWhile: while (daysLeft > 0) {
    if (daysLeft % 1000 === 0) {
      console.log(inputFile, 'daysLeft', daysLeft)
    }
    for (const library of librariesList) {
      if (!library.isStarted || library.isEnded) continue
      if (library.signingDays > 0) {
        library.signingDays--
      } else {
        shipBooks(library)
      }
    }
    if (signingDaysLeft <= 0) {
      let nextLibrary: LibraryData
      let nextLibraryWorth = -Infinity
      for (const library of librariesList) {
        if (library.isStarted || library.isEnded) continue
        const value = getLibraryWorth(library)
        if (value < nextLibraryWorth) continue
        nextLibrary = library
        nextLibraryWorth = value
      }
      if (!nextLibrary) break hugeWhile
      const timeToScanRemainingBooks = Math.ceil(nextLibrary.books.length / nextLibrary.booksPerDay)
      if (timeToScanRemainingBooks <= daysLeft) {
        applySerenaIdea(nextLibrary)
      } else {
        nextLibrary.isStarted = true
        signingDaysLeft = nextLibrary.signingDays
      }
      signingDaysLeft = nextLibrary.signingDays
      output.push(nextLibrary)
    }
    daysLeft--
    signingDaysLeft--
  }

  function writeOutput() {
    const goodOutput = output.filter(l => l.readBookOrder.length)
    const outputName = `./output/output_${inputFile}`
    fs.writeFileSync(outputName, `${goodOutput.length}\n`)
    const stringed = goodOutput
      .map(l => {
        const libString = [`${l.index} ${l.readBookOrder.length}`, l.readBookOrder.join(' ')].join(
          '\n',
        )
        return libString
      })
      .join('\n')
    fs.appendFileSync(outputName, stringed)
  }
  writeOutput()
}

INPUT_FILES.map(doEverything)
