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

function getCircleCoords(field, size) {
  const circle = [];
  const colorTable = {
    O: 'orange', R: 'red', B: 'blue', Y: 'khaki', G: 'green',
  };
  for (let i = 0; i < field.length; i += 1) {
    for (let j = 0; j < field.length; j += 1) {
      if (colorTable[field[i][j][0]] !== undefined) {
        circle.push(<Circle
          x={j * size}
          y={i * size}
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
          fillRadialGradientColorStops={[0, 'white', 1, colorTable[field[i][j][0]]]}
        />);
      }
    }
  }
  return circle;
}

function createLoopFigure(loops, cellSize) {
  try {
    const colorTable = {
      O: 'orange', R: 'red', B: 'blue', Y: 'yellow', G: 'green',
    };
    const loop = loops.playerLoop;
    const linePoints = [];
    const jsxLoop = [];
    const color = colorTable[loops.color];

    loop.forEach((item) => {
      const coords = [];
      item.forEach((point) => point.forEach((coord) => coords.unshift(coord * cellSize)));
      linePoints.push(coords);
    });

    for (let i = 0; i < linePoints.length; i += 1) {
      jsxLoop.push(<Line
        x={0}
        y={0}
        points={linePoints[i]}
        stroke={color}
        strokeWidth={2}
        closed
      />);
      jsxLoop.push(<Line
        x={0}
        y={0}
        opacity={0.2}
        fill={color}
        points={linePoints[i]}
        closed
      />);
    }
    return jsxLoop;
  } catch (e) {
    return [];
  }
}

function createEmptyCircle(field, cellSize) {
  const circle = [];
  for (let i = 0; i < field.length; i += 1) {
    for (let j = 0; j < field.length; j += 1) {
      if (field[i][j] === 'E') {
        circle.push(<Circle
          x={j * cellSize}
          y={i * cellSize}
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
