function createBoarder(borderChar: string, cellWidthPerColumn: Array<number>): string {
  return cellWidthPerColumn.reduce((borderString, width) => {
    return borderString.concat(borderChar.repeat(width + 2), '|')
  }, '|')
}

const defaultResolver = <T>(value: T): string =>
  value === undefined || value === null ? '' : `${value}`

function getLargestCharacterWidthPerColumn(grid: Array<Array<string>>): Array<number> {
  return grid.reduce((maxColumnWidths, currentRow) => {
    return currentRow.reduce((maxColumnWidths, cell, columnIndex) => {
      if (cell.length > maxColumnWidths[columnIndex]) {
        maxColumnWidths[columnIndex] = cell.length
      }
      return maxColumnWidths
    }, maxColumnWidths)
  }, Array(grid[0].length).fill(0))
}

function resolveGridCells<T>(
  grid: Array<Array<T>>,
  cellResolver: (value: T) => string = defaultResolver,
): Array<Array<string>> {
  return grid.map((row) => row.map((cell) => cellResolver(cell)))
}

function toAsciiTable<T>(
  grid: Array<Array<T>>,
  cellResolver: (value: T) => string = defaultResolver,
): string {
  if (grid.length === 0) {
    return ''
  }

  const resolvedGrid = resolveGridCells(grid, cellResolver)
  const largestCharacterWidthPerColumn = getLargestCharacterWidthPerColumn(resolvedGrid)
  const tableRows = resolvedGrid.reduce((tableRows, currentRow) => {
    tableRows.push(
      currentRow.reduce((tableRow, currentElement, currentElementIndex) => {
        return tableRow.concat(
          ` ${currentElement}${' '.repeat(largestCharacterWidthPerColumn[currentElementIndex] + 1 - currentElement.length)}|`,
        )
      }, '|'),
    )
    return tableRows
  }, [] as Array<string>)
  let border: string = createBoarder('-', largestCharacterWidthPerColumn)
  return ['', border, tableRows.join('\n' + border + '\n'), border].join('\n')
}

export default toAsciiTable
