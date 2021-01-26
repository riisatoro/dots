/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Line, Circle } from 'react-konva';

function getCanvasGrid(amount, size) {
  const grid = [];
  for (let i = 0; i < amount; i += 1) {
    grid.push(<Line
      points={[i * size, 0, i * size, size * amount - size]}
      stroke="silver"
      strokeWidth={1}
    />);
    grid.push(<Line
      points={[0, i * size, amount * size - size, size * i]}
      stroke="silver"
      strokeWidth={1}
    />);
  }
  return grid;
}

function getCircleCoords(field, size, playerColors) {
  const circle = [];
  const colorTable = {
    O: 'orange', R: 'red', B: 'blue', Y: 'khaki', G: 'green',
  };
  for (let i = 1; i < field.length - 1; i += 1) {
    for (let j = 1; j < field[0].length - 1; j += 1) {
      if (field[i][j].owner != null) {
        circle.push(<Circle
          x={(j - 1) * size}
          y={(i - 1) * size}
          radius={6}
          fillRadialGradientStartPoint={{
            x: -1.5,
            y: -1.5,
          }}
          fillRadialGradientStartRadius={0.5}
          fillRadialGradientEndPoint={{
            x: 0,
            y: 0,
          }}
          fillRadialGradientEndRadius={5}
          fillRadialGradientColorStops={[0, 'white', 1, colorTable[playerColors[field[i][j].owner]]]}
        />);
      }
    }
  }
  return circle;
}

function createLoopFigure(field, loops, cellSize, playerColors) {
  if (loops == null) return [];

  const colorTable = {
    O: 'orange', R: 'red', B: 'blue', Y: 'yellow', G: 'green',
  };

  const jsxLoop = [];
  loops.forEach((loop) => {
    const { owner } = field[loop[0][1]][loop[0][0]];
    const color = colorTable[playerColors[owner]];
    const chainPoints = [];
    loop.forEach((point) => {
      chainPoints.push((point[0] - 1) * cellSize);
      chainPoints.push((point[1] - 1) * cellSize);
    });
    jsxLoop.push(<Line
      x={0}
      y={0}
      points={chainPoints}
      stroke={color}
      strokeWidth={2}
      closed
    />);
    jsxLoop.push(<Line
      x={0}
      y={0}
      opacity={0.2}
      fill={color}
      points={chainPoints}
      closed
    />);
  });

  return jsxLoop;
}

function createEmptyCircle(field, cellSize) {
  const circle = [];
  const gameField = field;
  for (let i = 1; i < gameField.length - 1; i += 1) {
    for (let j = 1; j < gameField[0].length - 1; j += 1) {
      if (gameField[i][j].owner === null) {
        circle.push(<Circle
          x={(j - 1) * cellSize}
          y={(i - 1) * cellSize}
          radius={4}
          strokeWidth={0.5}
          stroke="gray"
          fill="white"
        />);
      }
    }
  }
  return circle;
}

export {
  createLoopFigure,
  getCanvasGrid,
  getCircleCoords,
  createEmptyCircle,
};
