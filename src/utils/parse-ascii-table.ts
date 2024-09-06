function defaultResolver(value: string): string | undefined {
  return value.trim().length === 0 ? undefined : value.trimEnd().slice(1)
}

function parseAsciiTable<T>(
  asciiTable: string,
  customResolver: (value: string) => T = defaultResolver as (value: string) => T,
): Array<Array<T>> {
  if (asciiTable.length === 0) {
    return []
  }
  const asciiTableRows = asciiTable.split('\n').slice(1)
  const grid = asciiTableRows.reduce(
    (grid: Array<Array<T>>, row: string, currentIndex: number): Array<Array<T>> => {
      if (currentIndex % 2 === 0) {
        return grid
      }
      const rowCells = row.split('|').filter((columnValue) => columnValue !== '')
      const rowContent: Array<T> = rowCells.reduce((columns: Array<T>, columnValue: string) => {
        columns.push(customResolver(columnValue))
        return columns
      }, [] as Array<T>)

      grid.push(rowContent)

      return [...grid]
    },
    [] as Array<Array<T>>,
  )
  return grid
}
export default parseAsciiTable
