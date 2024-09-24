import { Board, BoardCell, PlayerMove } from "@/game/types.d";

function getTargetCell(playerMove: PlayerMove) {
  const {
    position: { row, column },
  } = playerMove;
  return { row, column };
}

function isThereThreeInARow(
  requiredCellsToCheck: Array<BoardCell>,
  activePlayer: 1 | 2
): boolean {
  let count = 0;

  for (const cell of requiredCellsToCheck) {
    if (cell.occupyingPlayer === activePlayer) {
      count++;

      if (count === 3) break;
    } else {
      count = 0;
    }
  }
  return count === 3;
}

function getUpToThreeDisksHorizontallyToLeftOfTargetCell(
  board: Board,
  playerMove: PlayerMove
): Array<BoardCell> {
  const { column: columnIndex } = getTargetCell(playerMove);
  const leftStartIndex = Math.max(columnIndex - 3, 0);
  return board[playerMove.position.row].slice(leftStartIndex, columnIndex);
}

function getUpToThreeDisksHorizontallyToRightOfTargetCell(
  board: Board,
  playerMove: PlayerMove
): Array<BoardCell> {
  const { column: columnIndex } = getTargetCell(playerMove);
  const rightEndIndex = Math.min(board[0].length, columnIndex + 3);
  return board[playerMove.position.row].slice(
    columnIndex + 1,
    rightEndIndex + 1
  );
}

function isHorizontalWin(
  board: Board,
  playerMove: PlayerMove
): { isWin: boolean } {
  if (board[0].length < 4) {
    return { isWin: false };
  }
  const accumulatedCellsAroundTargetCell: Array<BoardCell> = [
    ...getUpToThreeDisksHorizontallyToLeftOfTargetCell(board, playerMove),
    ...getUpToThreeDisksHorizontallyToRightOfTargetCell(board, playerMove),
  ];
  const activePlayer = playerMove.player;
  const isWin = isThereThreeInARow(
    accumulatedCellsAroundTargetCell,
    activePlayer
  );
  return { isWin };
}

function getUpToThreeDisksUnderneathTargetCell(
  board: Board,
  playerMove: PlayerMove
): Array<BoardCell> {
  const { row: targetRow, column: targetColumn } = getTargetCell(playerMove);
  const depthToCheck = Math.max(targetRow - 3, 0) + targetRow;
  switch (depthToCheck) {
    case 0:
      return [];
    case 1:
      return [board[targetRow - 1][targetColumn]];
    case 2:
      return [
        board[targetRow - 1][targetColumn],
        board[targetRow - 2][targetColumn],
      ];
    default:
      return [
        board[targetRow - 1][targetColumn],
        board[targetRow - 2][targetColumn],
        board[targetRow - 3][targetColumn],
      ];
  }
}

function isVerticalWin(
  board: Board,
  playerMove: PlayerMove
): { isWin: boolean } {
  if (board.length < 4) {
    return { isWin: false };
  }
  const activePlayer = playerMove.player;
  const upToThreeDisksUnderneathTargetCell =
    getUpToThreeDisksUnderneathTargetCell(board, playerMove);
  if (upToThreeDisksUnderneathTargetCell.length < 3) {
    return { isWin: false };
  }
  return {
    isWin: isThereThreeInARow(upToThreeDisksUnderneathTargetCell, activePlayer),
  };
}

function getThreeDisksDiagonallyLeftDownFromTargetCell(
  board: Board,
  playerMove: PlayerMove
) {
  const { row: targetRow, column: targetColumn } = getTargetCell(playerMove);
  const horizontalDimension = Math.max(0, targetColumn - 3) + targetColumn;
  const verticalDimension = Math.max(0, targetRow - 3) + targetRow;
  const numberOfCellsBackFromTargetCell = Math.min(
    horizontalDimension,
    verticalDimension
  );
  switch (numberOfCellsBackFromTargetCell) {
    case 0:
      return [];
    case 1:
      return [board[targetRow - 1][targetColumn - 1]];
    case 2:
      return [
        board[targetRow - 1][targetColumn - 1],
        board[targetRow - 2][targetColumn - 2],
      ];
    default:
      return [
        board[targetRow - 1][targetColumn - 1],
        board[targetRow - 2][targetColumn - 2],
        board[targetRow - 3][targetColumn - 3],
      ];
  }
}

function getThreeDisksDiagonallyRightUpFromTargetCell(
  board: Board,
  playerMove: PlayerMove
) {
  const { row: targetRow, column: targetColumn } = getTargetCell(playerMove);
  const horizontalDimension =
    Math.min(board[0].length - 1, targetColumn + 3) - targetColumn;
  const verticalDimension =
    Math.min(board.length - 1, targetRow + 3) - targetRow;
  const numberOfCellsForwardFromTargetCell = Math.min(
    horizontalDimension,
    verticalDimension
  );
  switch (numberOfCellsForwardFromTargetCell) {
    case 0:
      return [];
    case 1:
      return [board[targetRow + 1][targetColumn + 1]];
    case 2:
      return [
        board[targetRow + 1][targetColumn + 1],
        board[targetRow + 2][targetColumn + 2],
      ];
    default:
      return [
        board[targetRow + 1][targetColumn + 1],
        board[targetRow + 2][targetColumn + 2],
        board[targetRow + 3][targetColumn + 3],
      ];
  }
}

function getThreeDisksDiagonallyLeftUpFromTargetCell(
  board: Board,
  playerMove: PlayerMove
) {
  const { row: targetRow, column: targetColumn } = getTargetCell(playerMove);
  const horizontalDimension = Math.max(0, targetColumn - 3) + targetColumn;
  const verticalDimension =
    Math.min(board.length - 1, targetRow + 3) - targetRow;
  const numberOfCellsBackFromTargetCell = Math.min(
    horizontalDimension,
    verticalDimension
  );

  switch (numberOfCellsBackFromTargetCell) {
    case 0:
      return [];
    case 1:
      return [board[targetRow + 1][targetColumn - 1]];
    case 2:
      return [
        board[targetRow + 1][targetColumn - 1],
        board[targetRow + 2][targetColumn - 2],
      ];
    default:
      return [
        board[targetRow + 1][targetColumn - 1],
        board[targetRow + 2][targetColumn - 2],
        board[targetRow + 3][targetColumn - 3],
      ];
  }
}

function getThreeDisksDiagonallyRightDownFromTargetCell(
  board: Board,
  playerMove: PlayerMove
) {
  const { row: targetRow, column: targetColumn } = getTargetCell(playerMove);
  const horizontalDimension =
    Math.min(board[0].length - 1, targetColumn + 3) - targetColumn;
  const verticalDimension = Math.max(0, targetRow - 3) + targetRow;
  const numberOfCellsForwardFromTargetCell = Math.min(
    horizontalDimension,
    verticalDimension
  );

  switch (numberOfCellsForwardFromTargetCell) {
    case 0:
      return [];
    case 1:
      return [board[targetRow - 1][targetColumn + 1]];
    case 2:
      return [
        board[targetRow - 1][targetColumn + 1],
        board[targetRow - 2][targetColumn + 2],
      ];
    default:
      return [
        board[targetRow - 1][targetColumn + 1],
        board[targetRow - 2][targetColumn + 2],
        board[targetRow - 3][targetColumn + 3],
      ];
  }
}

function isDiagonalBottomLeftTopRightWin(
  board: Board,
  playerMove: PlayerMove
): boolean {
  const activePlayer = playerMove.player;
  const threeDisksDiagonallyLeftDownFromTargetCell =
    getThreeDisksDiagonallyLeftDownFromTargetCell(board, playerMove);
  const threeDisksDiagonallyRightUpFromTargetCell =
    getThreeDisksDiagonallyRightUpFromTargetCell(board, playerMove);
  const bottomLeftTopRight = [
    ...threeDisksDiagonallyLeftDownFromTargetCell,
    ...threeDisksDiagonallyRightUpFromTargetCell,
  ];

  return isThereThreeInARow(bottomLeftTopRight, activePlayer);
}

function isDiagonalTopLeftBottomRightWin(
  board: Board,
  playerMove: PlayerMove
): boolean {
  const activePlayer = playerMove.player;
  const threeDisksDiagonallyLeftUpFromTargetCell =
    getThreeDisksDiagonallyLeftUpFromTargetCell(board, playerMove);
  const threeDisksDiagonallyRightDownFromTargetCell =
    getThreeDisksDiagonallyRightDownFromTargetCell(board, playerMove);

  const topLeftBottomRight = [
    ...threeDisksDiagonallyLeftUpFromTargetCell,
    ...threeDisksDiagonallyRightDownFromTargetCell,
  ];

  return isThereThreeInARow(topLeftBottomRight, activePlayer);
}

function isDiagonalWin(
  board: Board,
  playerMove: PlayerMove
): { isWin: boolean } {
  if (board.length < 4 || board[0].length < 4) {
    return { isWin: false };
  }
  return {
    isWin:
      isDiagonalBottomLeftTopRightWin(board, playerMove) ||
      isDiagonalTopLeftBottomRightWin(board, playerMove),
  };
}

function getIsWinningMove(
  board: Board,
  playerMove: PlayerMove
): { isWin: boolean } {
  return {
    isWin:
      isVerticalWin(board, playerMove).isWin ||
      isHorizontalWin(board, playerMove).isWin ||
      isDiagonalWin(board, playerMove).isWin,
  };
}

export default getIsWinningMove;
